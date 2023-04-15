import React, { useState } from 'react';
import {
  Paper,
  Typography,
  IconButton, 
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StyledMenu from './StyledMenu';
import LocalAvatar from './LocalAvatar';

type ChatBubbleStyledProps = {
  className?: string;
  children?: React.ReactNode;
};

export type ChatBubbleProps = {
  role: 'user' | 'system' | 'assistant' | 'thought';
  content: string;
  avatarId?: string;
};

function ChatBubbleStyled({ className, children }: ChatBubbleStyledProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Paper className={className} elevation={3} 
    style={{ position: 'relative', display: 'inline-block' }}>
      <IconButton
        edge="end"
        color="inherit"
        onClick={handleClick}
        style={{ position: 'absolute', top: '-0.2rem', right: '0.2rem' }}
      >
        <MoreVertIcon  fontSize="small" />
      </IconButton>
      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
      >
        <MenuItem onClick={() => {console.log("TO BE IMPLEMENTED")}}>Delete message</MenuItem>
        <MenuItem onClick={() => {console.log("TO BE IMPLEMENTED")}}>Edit Message</MenuItem>
        <MenuItem onClick={() => {console.log("TO BE IMPLEMENTED")}}>Copy message</MenuItem>
      </StyledMenu>
      {children}
    </Paper>
  );
}

const ChatBubbleAssistant = styled(ChatBubbleStyled)(({ theme }) => ({
  backgroundColor: '#007312',
  color: 'd7d7d7',
  padding: theme.spacing(1),
  borderRadius: '15px 15px 15px 0px',
  maxWidth: '60%',
  margin: `${theme.spacing(1)} 0px ${theme.spacing(1)} ${theme.spacing(1)}`,
}));

const ChatBubbleUser = styled(ChatBubbleStyled)(({ theme }) => ({
  backgroundColor: '#00008a',
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
  borderRadius: '5px 5px 5px 0px',
  maxWidth: '100%',
  margin: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} 0px`,
  alignSelf: 'flex-end',
}));

const ChatBubbleSystem = styled(ChatBubbleStyled)(({ theme }) => ({
  backgroundColor: '#3a3a3a',
  color: theme.palette.info.contrastText,
  padding: theme.spacing(1),
  borderRadius: '5px 5px 5px 5px',
  maxWidth: '100%',
  margin: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} 0px`,
  alignSelf: 'flex-end',
}));

export default function ChatBubble({ content, role, avatarId }: ChatBubbleProps){

  const message = <>
    {avatarId && <LocalAvatar sx={{float: "left", marginRight: "0.2rem",}} id={avatarId} />}
    <div>
      <Typography variant="body1">
        {content}
      </Typography>
    </div>
  </>;

  return (<>
    {role === 'user' && <ChatBubbleUser>{message}</ChatBubbleUser>}
    {role === 'system' && <ChatBubbleSystem>{message}</ChatBubbleSystem>}
    {role === 'assistant' && <ChatBubbleAssistant>{message}</ChatBubbleAssistant>}
    {role === 'thought' && <ChatBubbleThought>{message}</ChatBubbleThought>}
  </>);
}