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
import { BoteckoRoleType } from '../AppState';

type ChatBubbleStyledProps = {
  className?: string;
  children?: React.ReactNode;
  timestamp?: number;
  onDelete?: (timestamp: number) => void;
  onEdit?: (timestamp: number) => void;
  onCopy?: (timestamp: number) => void;
};

export type ChatBubbleProps = {
  role: BoteckoRoleType;
  content: string;
  timestamp?: number;
  onDelete?: (timestamp: number) => void;
  onEdit?: (timestamp: number) => void;
  onCopy?: (timestamp: number) => void;
  avatarId?: string;
};

function ChatBubbleStyled({ className, children, timestamp, onDelete, onEdit, onCopy }: ChatBubbleStyledProps) {
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
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
      >
        {onDelete && <MenuItem onClick={() => onDelete(timestamp || 0)}>Delete message</MenuItem>}
        {onEdit && <MenuItem onClick={() => onEdit(timestamp || 0)}>Edit Message</MenuItem>}
        {onCopy && <MenuItem onClick={() => onCopy(timestamp || 0)}>Copy message</MenuItem>}
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

export default function ChatBubble({ content, role, avatarId, timestamp, onEdit, onDelete, onCopy }: ChatBubbleProps) {

  const message = <>
    {avatarId && <LocalAvatar sx={{ float: "left", marginRight: "0.2rem", }} id={avatarId} />}
    <div>
      <Typography variant="body1">
        {content}
      </Typography>
    </div>
  </>;

  return (<>
    {role === 'user' && <ChatBubbleUser timestamp={timestamp} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy}>{message}</ChatBubbleUser>}
    {role === 'system' && <ChatBubbleSystem timestamp={timestamp} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy}>{message}</ChatBubbleSystem>}
    {role === 'error' && <ChatBubbleSystem timestamp={timestamp} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy}>{message}</ChatBubbleSystem>}
    {role === 'assistant' && <ChatBubbleAssistant timestamp={timestamp} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy}>{message}</ChatBubbleAssistant>}
    {role === 'thought' && <ChatBubbleThought timestamp={timestamp} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy}>{message}</ChatBubbleThought>}
  </>);
}