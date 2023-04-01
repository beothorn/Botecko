import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectSettings, selectChatHistory, selectWaitingAnswer, dispatchSendMessage, actionSetScreen, actionRemoveContact, selectCurrentContact } from '../appStateSlice';
import { Paper, Typography, TextField, IconButton, AppBar, Avatar, Menu, MenuItem, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { batch } from 'react-redux';

type ChatBubbleProps = {
  text: string;
  position: 'left' | 'right';
};

const useStyles = makeStyles((theme) => ({
  chatBubbleLeft: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1),
    borderRadius: '20px 20px 20px 0px',
    maxWidth: '100%',
    margin: `${theme.spacing(1)}px 0px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
  },
  chatBubbleRight: {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    padding: theme.spacing(1),
    borderRadius: '20px 20px 0px 20px',
    maxWidth: '100%',
    margin: `${theme.spacing(1)}px ${theme.spacing(1)}px ${theme.spacing(1)}px 0px`,
    alignSelf: 'flex-end',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    height: '100vh',
  },
}));

const ChatBubble = ({ text, position }: ChatBubbleProps) => {
  const classes = useStyles();
  const chatBubbleClass = position === 'left' ? classes.chatBubbleLeft : classes.chatBubbleRight;
  return (
    <Paper className={chatBubbleClass} elevation={3}>
      <Typography variant="body1">{text}</Typography>
    </Paper>
  );
};

const styles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    overflowAnchor: 'none',
  },
  chatWrapper: {
    flexGrow: 1,
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  appBar: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  title: {
    flexGrow: 1,
  },
}));

export default function Chat() {
  const classes = styles();
  const [message, setMessage] = useState('');
  const settings = useAppSelector(selectSettings);
  const chatHistory = useAppSelector(selectChatHistory) ?? [];
  const currentContact = useAppSelector(selectCurrentContact);
  const metaData = currentContact.meta;
  const avatarMetaData = currentContact.avatarMeta;
  const isWaitingAnswer = useAppSelector(selectWaitingAnswer);

  const dispatch = useAppDispatch();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (root) {
      root.scrollTop = root.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = (msg: string) => {
    setMessage('');
    dispatchSendMessage(dispatch, currentContact, settings, chatHistory, msg);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 13) {
      handleSendMessage(message);
    }
  }

  // Add state for the menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const contactInfo = () => {
    setAnchorEl(null);
    dispatch(actionSetScreen('contacts'));
  };
  const deleteContact = () => {
    setAnchorEl(null);
    batch(() => {
      dispatch(actionSetScreen('contacts'));
      dispatch(actionRemoveContact(currentContact.id));
    });
  };
  const gotoContacts = () => {
    setAnchorEl(null);
    dispatch(actionSetScreen('contacts'));
  };

  return (<>
    <AppBar position="absolute" className={classes.appBar}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={gotoContacts}
        >
          <ArrowBackIcon />
        </IconButton>
        <Avatar alt={avatarMetaData.prompt} src={`data:image/png;base64, ${avatarMetaData.base64Img}`} />
        <Typography variant="h6" component="div" className={classes.title}>
          {metaData.name}
        </Typography>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={handleClick}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => contactInfo()}>
            Contact info
          </MenuItem>
          <MenuItem onClick={() => deleteContact()}>
            Delete Contact
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
    <div className={classes.root} ref={rootRef}>
      <div className={classes.chatWrapper}></div>
      <div className={classes.chatContainer}>
        {chatHistory.filter(m => m.role !== 'system').map((message, index) => (
          <ChatBubble
            key={index}
            text={message.content}
            position={message.role === 'user' ? 'right' : 'left'}
          />
        ))}
        {isWaitingAnswer && <ChatBubble
          text={`${metaData.name} is typing...`}
          position={'left'}
        />}
      </div>
      <div className={classes.inputContainer}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          onKeyDown={handleKeyDown}
        />
        <IconButton onClick={() => handleSendMessage(message)}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  </>);
}