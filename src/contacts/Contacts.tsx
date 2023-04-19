import React from 'react';
import List from '@mui/material/List';
import { useAppDispatch, useAppSelector } from '../hooks';
import { actionRemoveContact, actionSetChatId, actionSetErrorMessage, actionSetScreen, Contact, selectContacts } from '../appStateSlice';
import { Button, ListItemButton } from '@mui/material';
import Screen from '../screens/screen';
import { ScreenTitle } from '../screens/screen';
import { batch } from 'react-redux';
import AvatarWithDetails from '../components/AvatarWithDetails';

export default function Contacts() {
  const dispatch = useAppDispatch();
  const contacts = useAppSelector(selectContacts) ?? [];
  const gotoChat = (key: string, contact: Contact) => {
    dispatch(actionSetChatId(key));
    if (contact.type === 'bot') {
       dispatch(actionSetScreen('chat'));
    }
    if (contact.type === 'group') {
      dispatch(actionSetScreen('groupChat'));
    }
  };

  const addContact = () => {
    dispatch(actionSetScreen('addContact'));
  };
  const createGroupChat = () => {
    dispatch(actionSetScreen('groupChatSelect'));
  };
  const removeContact = (id: string) => {
    dispatch(actionRemoveContact(id));
  };
  const gotoSettings = () => {
    dispatch(actionSetScreen('settings'));
  };

  const notImplemented = () => {
    batch(() => {
      dispatch(actionSetErrorMessage("Not available yet"));
      dispatch(actionSetScreen('error'));
    })
  };

  const menuItems = {
    "Settings": gotoSettings,
    "Add Contact": addContact,
    "Import Contact": notImplemented,
    "New Group Chat": createGroupChat,
    "About": notImplemented
  };

  return (<Screen
    centerItem={<ScreenTitle title="Botecko" />}
    menuItems={menuItems}
  >
    <List>
      {Object.entries(contacts).map(([key, contact]) => (
        <ListItemButton 
          key={contact.id} 
          onClick={() => contact.type !== 'loading' ? gotoChat(key, contact) : removeContact(key)}
        >
          <AvatarWithDetails contact={contact}/>  
        </ListItemButton>
      ))}
    </List>
    {Object.entries(contacts).length === 0 && <Button onClick={() => addContact()}>Add Contact</Button>}
  </Screen>);
}