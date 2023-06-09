import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { batch } from 'react-redux';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import ChatBubble, { ChatBubbleProps } from '../components/ChatBubble';
import LocalAvatar from '../components/LocalAvatar';
import ChatEntry from '../components/ChatEntry';
import { countWords } from '../utils/StringUtils';
import { styled } from '@mui/material';
import { selectChatHistory, selectCurrentContact, selectCurrentContactsInGroupChat, selectSettings, selectWaitingAnswer } from '../selectors';
import {
  actionAddMessage, actionCopyMessage, actionDeleteHistory, actionDeleteMessage, actionRemoveContact,
  actionSetErrorMessage, actionSetScreen, actionSetStatus, actionToggleShowPlanning
} from '../actions';
import { BotContact, BoteckoRoleType, ChatMessageContent, GroupChatContact } from '../AppState';
import { dispatchAskBotToMessage, dispatchSendMessage, writeSystemEntry } from '../dispatches';

const Participants = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
});

export default function Chat() {
  const dispatch = useAppDispatch();

  let currentContact = useAppSelector(selectCurrentContact);
  if (currentContact === undefined) {
    // Invalid state
    dispatch(actionSetScreen('contacts'))
    return <></>;
  }
  const singleChat = currentContact.id.endsWith("bot");
  let contacts: BotContact[] = [];
  if (singleChat) {
    currentContact = useAppSelector(selectCurrentContact) as BotContact;
  } else {
    currentContact = useAppSelector(selectCurrentContact) as GroupChatContact;
    contacts = useAppSelector(selectCurrentContactsInGroupChat);
  }
  const settings = useAppSelector(selectSettings);
  const chatHistory = useAppSelector(selectChatHistory) ?? [];

  const metaData = currentContact.meta;
  const avatarMetaData = currentContact.avatarMeta;
  const isWaitingAnswer = useAppSelector(selectWaitingAnswer);

  const handleSendMessage = (msg: string) => {
    const messageAsUserMessage = {
      name: settings.userName,
      message: msg.replaceAll('"', '\\\\"')
    };
    if (singleChat) {
      dispatchSendMessage(
        dispatch,
        currentContact as BotContact,
        settings,
        chatHistory,
        messageAsUserMessage,
        (currentContact as BotContact).contextTemplate,
        null
      );
    } else {
      const msgToAdd = {
        role: "user" as BoteckoRoleType,
        content: messageAsUserMessage,
        wordCount: countWords(msg),
        contactId: "user",
        timestamp: Date.now()
      };
      batch(() => {
        dispatch(actionAddMessage(msgToAdd));
        dispatch(actionSetStatus(messageAsUserMessage.message));
      });
    }
  };

  const askBotToSpeak = (id: string) => {
    dispatchAskBotToMessage(
      dispatch,
      id,
      (currentContact as GroupChatContact),
      settings,
      chatHistory,
      (currentContact as GroupChatContact).contextTemplate,
      (currentContact as GroupChatContact).meta
    );
  };

  const info = () => {
    if (singleChat) {
      dispatch(actionSetScreen('profile'));
    } else {
      dispatch(actionSetScreen('groupChatProfile'))
    }
  };

  const showPlanning = () => dispatch(actionToggleShowPlanning());

  const notImplemented = () => {
    batch(() => {
      dispatch(actionSetErrorMessage("Not available yet"));
      dispatch(actionSetScreen('error'));
    })
  };

  const deleteHistory = () => dispatch(actionDeleteHistory());

  const deleteContact = () => {
    batch(() => {
      dispatch(actionSetScreen('contacts'));
      dispatch(actionRemoveContact(currentContact.id));
    });
  };

  const centerItem = (<>
    <LocalAvatar id={avatarMetaData.id}
      prompt={avatarMetaData.prompt}
      sx={{ mr: 2 }}
      onClick={() => info()}
    />
    <ScreenTitle title={metaData.name}
      onClick={() => info()} />
  </>)

  const menuItems = {
    "Contact info": info,
    "Delete Contact": deleteContact,
    "Delete History": deleteHistory,
    "Export Contact": notImplemented,
    "Toggle planning": showPlanning,
  }

  const print = (timestamp: number) => { console.log(`${timestamp}`) };

  const deleteMessage = (timestamp: number) => dispatch(actionDeleteMessage(timestamp));
  const copyText = (timestamp: number) => dispatch(actionCopyMessage(timestamp));

  const chatBubbles: JSX.Element[] = chatHistory
    .flatMap((m): ChatBubbleProps[] => {
      const content: ChatMessageContent = m.content;
      const message: string = m.content.message;
      if (m.role === "assistant") {
        
        let avatarId = "";
        if (singleChat) {
          avatarId = avatarMetaData.id;
        } else {
          avatarId = contacts.find(c => c.meta.name === content.name)?.avatarMeta.id || "";
        }

        const bubbles: ChatBubbleProps[] = [];

        if (settings.showThought) {
          bubbles.push({
            role: "thought", 
            content: content.plan || "Plan not available",  
            avatarId: avatarId, 
            timestamp: m.timestamp,
            onDelete: deleteMessage, onCopy: copyText, onEdit: print
          });
        }
        bubbles.push({
          role: "assistant", 
          content: message, 
          avatarId: avatarId, 
          timestamp: m.timestamp,
          onDelete: deleteMessage, onCopy: copyText, onEdit: print
        })
        return bubbles;
      }
      return [{ 
        role: m.role, 
        content: message, 
        timestamp: m.timestamp, 
        onDelete: deleteMessage, onCopy: copyText, onEdit: print 
      }];
    })
    .map((message, index) => (
      <ChatBubble
        key={index}
        content={message.content}
        role={message.role}
        avatarId={message.avatarId}
        timestamp={message.timestamp}
        onDelete={message.onDelete}
        onCopy={message.onCopy}
        onEdit={message.onEdit}
      />
    ));

  const contactName = metaData.name;

  let participants: JSX.Element[] = [];

  if (!singleChat) {
    participants = contacts.map((contact) => (<LocalAvatar
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
  }

  const systemPrompt = writeSystemEntry(
    currentContact.meta.name,
    JSON.stringify(currentContact.meta),
    null,
    settings.userName,
    settings.userShortInfo,
    (currentContact as BotContact).contactSystemEntryTemplate,
    (currentContact as BotContact).contextTemplate
  )
  const systemPromptBubble = <ChatBubble
    key={'sytemEntry'}
    content={systemPrompt.content}
    role={'system'}
  />;

  return (<Screen
    leftItem={<BackButton />}
    centerItem={centerItem}
    menuItems={menuItems}
    backgroungImg='carbon'
  >
    <ChatEntry handleSendMessage={(msg) => handleSendMessage(msg)}>
      {settings.showThought && systemPromptBubble}
      {chatBubbles}
      {isWaitingAnswer && <ChatBubble
        content={`${singleChat ? contactName : "Someone"} is typing...`}
        role={'assistant'}
      />}
      {
        (!singleChat) && <Participants>{participants}</Participants>
      }
    </ChatEntry>
  </Screen>);
}