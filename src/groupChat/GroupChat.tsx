import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectSettings, selectChatHistory, selectWaitingAnswer, 
  actionSetScreen, actionRemoveContact, selectCurrentContact, actionToggleShowPlanning, 
  actionSetErrorMessage, GroupChatContact, actionAddMessage, 
  selectCurrentContactsInGroupChat, dispatchAskBotToMessage } from '../appStateSlice';
import { batch } from 'react-redux';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import ChatBubble, { ChatBubbleProps } from '../components/ChatBubble';
import LocalAvatar from '../components/LocalAvatar';
import ChatEntry from '../components/ChatEntry';
import { styled } from '@mui/material';
import { countWords } from '../utils/StringUtils';

const Participants = styled('div')({
  display: 'flex'
});

export default function GroupChat() {
  const settings = useAppSelector(selectSettings);
  const chatHistory = useAppSelector(selectChatHistory) ?? [];
  const groupContact = useAppSelector(selectCurrentContact) as GroupChatContact;
  const contacts = useAppSelector(selectCurrentContactsInGroupChat);
  const groupAvatarMetaData = groupContact.avatarMeta;
  const isWaitingAnswer = useAppSelector(selectWaitingAnswer);

  const dispatch = useAppDispatch();

  const handleSendMessage = (msg: string) => {
    dispatch(actionAddMessage({
      role: "user", 
      content: msg, 
      wordCount: countWords(msg),
      contactId: "user", 
      timestamp: Date.now()}));
  };
  
  const askBotToSpeak = (id: string) => {
    dispatchAskBotToMessage(
      dispatch, 
      id,
      groupContact, 
      settings, 
      chatHistory, 
      groupContact.contextTemplate,
      groupContact.meta
    );
  };

  const groupInfo = () => {
    dispatch(actionSetScreen('groupChatProfile'));
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
      dispatch(actionRemoveContact(groupContact.id));
    });
  };

  const centerItem = (<>
    <LocalAvatar id={groupAvatarMetaData.id} 
      prompt={groupAvatarMetaData.prompt}
      sx={{mr: 2}}
    />
    <ScreenTitle title={groupContact.meta.name}/>
  </>)

  const menuItems = {
    "Group info": groupInfo,
    "Delete Group": deleteContact,
    "Delete History": notImplemented,
    "Toggle planning": showPlanning,
  }

  const chatBubbles = chatHistory
    .flatMap((m): ChatBubbleProps[] => {
      if(m.role === "assistant"){
        const messageWithPlan = JSON.parse(m.content)
        const avatarId = groupContact.contacts.find(c => c.id === m.contactId)?.avatarMeta.id;
        if(settings.showThought){
          return [
            {"role": "thought", "content": messageWithPlan.plan},
            {"role": "assistant", "content": messageWithPlan.answer, avatarId: avatarId },
          ];
        }else{
          return [{"role": "assistant", "content": messageWithPlan.answer, avatarId: avatarId}];
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
      avatarId={message.avatarId}
    />
  )); 

  const participants = contacts.map((contact) => (<LocalAvatar
    key={contact.id}
    id={contact.avatarMeta.id}
    prompt={contact.avatarMeta.prompt}
    sx={{
        width: '4rem',
        height: '4rem',
        mb: '1rem'
    }}
    onClick={() => askBotToSpeak(contact.id)}
  />));

  return (<Screen
    leftItem={<BackButton/>}
    centerItem={centerItem}
    menuItems={menuItems}
    barPosition='absolute'
  >
    <ChatEntry handleSendMessage={(msg) => handleSendMessage(msg)}>
      {chatBubbles}
      {isWaitingAnswer && <ChatBubble
          content={`Someone is typing...`}
          role={'assistant'}
      />}
      <Participants>{participants}</Participants>
    </ChatEntry>
  </Screen>);
}