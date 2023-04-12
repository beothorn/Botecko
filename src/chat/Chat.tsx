import React, { useEffect, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectSettings, selectChatHistory, selectWaitingAnswer, dispatchSendMessage, actionSetScreen, actionRemoveContact, selectCurrentContact, actionToggleShowPlanning, actionSetErrorMessage } from '../appStateSlice';
import { TextField, IconButton, styled } from '@mui/material';
import { batch } from 'react-redux';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import ChatBubble from './ChatBubble';
import { Message } from '../OpenAiApi';
import LocalAvatar from '../components/LocalAvatar';

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

export default function Chat() {
  const [message, setMessage] = useState('');
  const settings = useAppSelector(selectSettings);
  const chatHistory = useAppSelector(selectChatHistory) ?? [];
  const currentContact = useAppSelector(selectCurrentContact);
  const metaData = currentContact.meta;
  const avatarMetaData = currentContact.avatarMeta;
  const isWaitingAnswer = useAppSelector(selectWaitingAnswer);

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
    dispatchSendMessage(dispatch, currentContact, settings, chatHistory, msg);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 13) {
      handleSendMessage(message);
    }
  }

  const contactInfo = () => {
    dispatch(actionSetScreen('profile'));
  };

  const showPlanning = () => {
    dispatch(actionToggleShowPlanning());
  };

  const notImplemented = () => {
    batch(() => {
      dispatch(actionSetErrorMessage("Not available yet"));
      dispatch(actionSetScreen('error'));
    })
  };

  const deleteContact = () => {
    batch(() => {
      dispatch(actionSetScreen('contacts'));
      dispatch(actionRemoveContact(currentContact.id));
    });
  };

  const centerItem = (<>
    <LocalAvatar id={avatarMetaData.id} 
      prompt={avatarMetaData.prompt}
      sx={{mr: 2}}
      onClick={() => contactInfo()}
    />
    <ScreenTitle title={metaData.name} 
      onClick={() => contactInfo()}/>
  </>)

  const menuItems = {
    "Contact info": contactInfo,
    "Delete Contact": deleteContact,
    "Delete History": notImplemented,
    "Export Contact": notImplemented,
    "Toggle planning": showPlanning,
  }

  return (<Screen
    leftItem={<BackButton/>}
    centerItem={centerItem}
    menuItems={menuItems}
    barPosition='absolute'
  >
    <Root ref={rootRef}>
      <ChatWrapper/>
      <ChatContainer>
        {chatHistory
          .flatMap((m): Message[] => {
            if(m.role === "assistant"){
              const messageWithPlan = JSON.parse(m.content)
              if(settings.showThought){
                return [
                  {"role": "thought", "content": messageWithPlan.plan},
                  {"role": "assistant", "content": messageWithPlan.answer},
                ];
              }else{
                return [{"role": "assistant", "content": messageWithPlan.answer}];
              }
            }
            if(m.role === "system"){
              return [
                {"role": "system", "content": m.content}
              ];
            }
            return [{"role": "user", "content": m.content}];
          })
          .map((message, index) => (
          <ChatBubble
            key={index}
            content={message.content}
            role={message.role}
          />
        ))}
        {isWaitingAnswer && <ChatBubble
          content={`${metaData.name} is typing...`}
          role={'assistant'}
        />}
      </ChatContainer>
      <InputContainer>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          onKeyDown={handleKeyDown}
        />
        <IconButton onClick={() => handleSendMessage(message)}>
          <SendIcon color='primary' />
        </IconButton>
      </InputContainer>
    </Root>
  </Screen>);
}