import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  chatBubbleLeft: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1),
    borderRadius: '20px 20px 20px 0px',
    maxWidth: '50%',
    margin: `${theme.spacing(1)}px 0px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
  },
  chatBubbleRight: {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    padding: theme.spacing(1),
    borderRadius: '20px 20px 0px 20px',
    maxWidth: '50%',
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

const ChatBubble = ({ text, position }: { text: string; position: 'left' | 'right' }) => {
  const classes = useStyles();
  const chatBubbleClass = position === 'left' ? classes.chatBubbleLeft : classes.chatBubbleRight;
  return (
    <Paper className={chatBubbleClass} elevation={3}>
      <Typography variant="body1">{text}</Typography>
    </Paper>
  );
};

const styles = makeStyles(() => ({
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
}));

const App = () => {
  const classes = styles();
  return (
    <div className={classes.root}>
      <div className={classes.chatWrapper}></div>
      <div className={classes.chatContainer}>
        <ChatBubble text="Hello" position="left" />
        <ChatBubble text="World" position="right" />
      </div>
    </div>
  );
};

export default App;
