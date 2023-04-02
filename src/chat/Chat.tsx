import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectSettings, selectChatHistory, selectWaitingAnswer, dispatchSendMessage, actionSetScreen, actionRemoveContact, selectCurrentContact } from '../appStateSlice';
import { TextField, IconButton, Avatar } from '@mui/material';
import { batch } from 'react-redux';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import ChatBubble from './ChatBubble';

const styles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    overflowAnchor: 'none',
  },
  chatWrapper: {
    flexGrow: 1,
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

export default function Chat() {
  const classes = styles();
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
    dispatch(actionSetScreen('contacts'));
  };
  const deleteContact = () => {
    batch(() => {
      dispatch(actionSetScreen('contacts'));
      dispatch(actionRemoveContact(currentContact.id));
    });
  };

  const centerItem = (<>
    <Avatar alt={avatarMetaData.prompt} src={`data:image/png;base64, ${avatarMetaData.base64Img}`} />
    <ScreenTitle title={metaData.name} />
  </>)

  const menuItems = {
    "Contact info": contactInfo,
    "Delete Contact": deleteContact
  }

  return (<Screen
    leftItem={<BackButton originScreen='contacts'/>}
    centerItem={centerItem}
    menuItems={menuItems}
    barPosition='absolute'
  >
    <div className={classes.root} ref={rootRef}>
      <div className={classes.chatWrapper}></div>
      <div className={classes.chatContainer}>
        {chatHistory.filter(m => m.role !== 'system').map((message, index) => (
          <ChatBubble
            key={index}
            text={message.content}
            position={message.role === 'user' ? 'right' : 'left'}
          />
        ))}
        {isWaitingAnswer && <ChatBubble
          text={`${metaData.name} is typing...`}
          position={'left'}
        />}
      </div>
      <div className={classes.inputContainer}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          onKeyDown={handleKeyDown}
        />
        <IconButton onClick={() => handleSendMessage(message)}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  </Screen>);
}