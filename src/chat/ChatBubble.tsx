import React from 'react';
import { Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

type ChatBubbleProps = {
  text: string;
  position: 'left' | 'right';
};

type ChatBubbleStyledProps = {
    text: string;
  };

function ChatBubbleStyled({ text }: ChatBubbleStyledProps){
    return (
        <Paper elevation={3}>
            <Typography variant="body1">{text}</Typography>
        </Paper>
    );
}

const ChatBubbleLeft = styled(ChatBubbleStyled)<ChatBubbleStyledProps>(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1),
    borderRadius: '20px 20px 20px 0px',
    maxWidth: '100%',
    margin: `${theme.spacing(1)}px 0px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
}));

const ChatBubbleRight = styled(ChatBubbleStyled)<ChatBubbleStyledProps>(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    padding: theme.spacing(1),
    borderRadius: '20px 20px 0px 20px',
    maxWidth: '100%',
    margin: `${theme.spacing(1)}px ${theme.spacing(1)}px ${theme.spacing(1)}px 0px`,
    alignSelf: 'flex-end',
}));

export default function ChatBubble({ text, position }: ChatBubbleProps){
  return (position === 'left') ? <ChatBubbleLeft text={text} /> : <ChatBubbleRight text={text} />;
};