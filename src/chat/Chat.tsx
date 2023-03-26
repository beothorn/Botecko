import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, TextField, IconButton } from '@material-ui/core';
import SendIcon from '@mui/icons-material/Send';

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
    height: '100%',
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
}));

const Chat = () => {
  const classes = styles();
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    console.log('Message:', message);
    setMessage('');
  };

  return (
    <div className={classes.root}>
      <div className={classes.chatWrapper}></div>
      <div className={classes.chatContainer}>
        <ChatBubble text="Hi, how are you?" position="left" />
        <ChatBubble text="Good and you?" position="right" />
        <ChatBubble text="Fine as well ;)" position="left" />
      </div>
      <div className={classes.inputContainer}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
        />
        <IconButton onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default Chat;