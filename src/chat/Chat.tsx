import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectSettings, selectChatHistory, selectWaitingAnswer, dispatchSendMessage, actionSetScreen, actionRemoveContact, selectCurrentContact, actionToggleShowPlanning, actionSetErrorMessage, BotContact } from '../appStateSlice';
import { batch } from 'react-redux';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import ChatBubble, { ChatBubbleProps } from '../components/ChatBubble';
import LocalAvatar from '../components/LocalAvatar';
import ChatEntry from '../components/ChatEntry';

export default function Chat() {
  const settings = useAppSelector(selectSettings);
  const chatHistory = useAppSelector(selectChatHistory) ?? [];
  const currentContact = useAppSelector(selectCurrentContact) as BotContact;
  const metaData = currentContact.meta;
  const avatarMetaData = currentContact.avatarMeta;
  const isWaitingAnswer = useAppSelector(selectWaitingAnswer);

  const dispatch = useAppDispatch();

  const handleSendMessage = (msg: string) => {
    dispatchSendMessage(
      dispatch, 
      currentContact, 
      settings, 
      chatHistory, 
      msg,
      currentContact.contextTemplate,
      null
    );
  };

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

  const chatBubbles = chatHistory
    .flatMap((m): ChatBubbleProps[] => {
      if(m.role === "assistant"){
        const messageWithPlan = JSON.parse(m.content)
        if(settings.showThought){
          return [
            {"role": "thought", "content": messageWithPlan.plan},
            {"role": "assistant", "content": messageWithPlan.answer, avatarId: avatarMetaData.id },
          ];
        }else{
          return [{"role": "assistant", "content": messageWithPlan.answer, avatarId: avatarMetaData.id}];
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

  const contactName = metaData.name;

  return (<Screen
    leftItem={<BackButton/>}
    centerItem={centerItem}
    menuItems={menuItems}
    barPosition='absolute'
  >
    <ChatEntry handleSendMessage={(msg) => handleSendMessage(msg)}>
      {chatBubbles}
      {isWaitingAnswer && <ChatBubble
          content={`${contactName} is typing...`}
          role={'assistant'}
        />}
    </ChatEntry>
  </Screen>);
}