import React from 'react';
import { Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Message } from '../OpenAiApi';

type ChatBubbleStyledProps = {
  className?: string;
    text: string;
  };

function ChatBubbleStyled({ className, text }: ChatBubbleStyledProps){
    return (
        <Paper className={className} elevation={3}>
            <Typography variant="body1">{text}</Typography>
        </Paper>
    );
}

const ChatBubbleUser = styled(ChatBubbleStyled)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1),
    borderRadius: '20px 20px 20px 0px',
    maxWidth: '100%',
    margin: `${theme.spacing(1)} 0px ${theme.spacing(1)} ${theme.spacing(1)}`,
}));

const ChatBubbleAssistant = styled(ChatBubbleStyled)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    padding: theme.spacing(1),
    borderRadius: '20px 20px 0px 20px',
    maxWidth: '100%',
    margin: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} 0px`,
    alignSelf: 'flex-end',
}));

const ChatBubbleThought = styled(ChatBubbleStyled)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.dark,
  padding: theme.spacing(1),
  borderRadius: '20px 20px 0px 20px',
  maxWidth: '100%',
  margin: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} 0px`,
  alignSelf: 'flex-end',
}));

export default function ChatBubble({ content, role }: Message){
  switch(role){
    case 'assistant':
      return <ChatBubbleAssistant text={content} />;
    case 'user':
      return <ChatBubbleUser text={content} />;
    case 'system':
    case 'thought':
      return <ChatBubbleThought text={content} />;
  }
};