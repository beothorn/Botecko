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
    backgroundColor: '#00008a',
    color: 'd7d7d7',
    padding: theme.spacing(1),
    borderRadius: '15px 15px 15px 0px',
    maxWidth: '60%',
    margin: `${theme.spacing(1)} 0px ${theme.spacing(1)} ${theme.spacing(1)}`,
}));

const ChatBubbleAssistant = styled(ChatBubbleStyled)(({ theme }) => ({
    backgroundColor: '#007312',
    color: 'd7d7d7',
    padding: theme.spacing(1),
    borderRadius: '15px 15px 0px 15px',
    maxWidth: '60%',
    margin: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} 0px`,
    alignSelf: 'flex-end',
}));

const ChatBubbleThought = styled(ChatBubbleStyled)(({ theme }) => ({
  backgroundColor: '#3a3a3a',
  color: theme.palette.info.contrastText,
  padding: theme.spacing(1),
  borderRadius: '5px 5px 0px 5px',
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
}