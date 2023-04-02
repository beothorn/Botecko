import React from 'react';
import { Paper, Typography } from '@mui/material';
import { makeStyles } from '@material-ui/core';

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

export default function ChatBubble({ text, position }: ChatBubbleProps){
  const classes = useStyles();
  const chatBubbleClass = position === 'left' ? classes.chatBubbleLeft : classes.chatBubbleRight;
  return (
    <Paper className={chatBubbleClass} elevation={3}>
      <Typography variant="body1">{text}</Typography>
    </Paper>
  );
};