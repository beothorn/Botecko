import { IconButton, styled, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';

type ChatEntryProps = {
  children: React.ReactNode;
  handleSendMessage: (message: string) => void;
}

const Root = styled('div')(() => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'scroll',
  overflowAnchor: 'none',
}));

const ChatWrapper = styled('div')({
  flexGrow: 1,
});

const ChatContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

const InputContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));

const MessageInput = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

export default function ChatEntry({
    children,
    handleSendMessage
}: ChatEntryProps) {
  
  const [message, setMessage] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (root) {
    root.scrollTop = root.scrollHeight;
    }
  }, [children]);

  const sendMessage =  (message: string) => {
    handleSendMessage(message);
    setMessage('');
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 13) {
        sendMessage(message);
    }
  }

  return (<Root ref={rootRef}>
    <ChatWrapper/>
        <ChatContainer>
            {children}
        </ChatContainer>
    <InputContainer>
      <MessageInput
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
        onKeyDown={handleKeyDown}
      />
      <IconButton onClick={() => sendMessage(message)}>
        <SendIcon color='primary' />
      </IconButton>
    </InputContainer>
  </Root>);
}