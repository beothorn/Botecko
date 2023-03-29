import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, TextField, IconButton } from '@material-ui/core';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '../hooks';
import { dispatchTestCall, selectOpenAiKey, selectChatHistory } from '../appStateSlice';

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
}));

const Chat = () => {
  const classes = styles();
  const [message, setMessage] = useState('');
  const openAiKey = useAppSelector(selectOpenAiKey);
  const chatHistory = useAppSelector(selectChatHistory) ?? [];
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
    dispatchTestCall(dispatch, openAiKey, chatHistory, msg);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 13) {
      handleSendMessage(message);
    }
  }

  return (
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
  );
};

export default Chat;