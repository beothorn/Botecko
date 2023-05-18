import React from 'react';
import List from '@mui/material/List';
import { useAppDispatch, useAppSelector } from '../hooks';
import { Button, ListItemButton } from '@mui/material';
import Screen from '../screens/screen';
import { ScreenTitle } from '../screens/screen';
import { batch } from 'react-redux';
import AvatarWithDetails from '../components/AvatarWithDetails';
import { selectContacts } from '../selectors';
import { actionRemoveContact, actionSetChatId, actionSetErrorMessage, actionSetScreen } from '../actions';
import { currentVersion } from '../AppState';

export default function Contacts() {
  const dispatch = useAppDispatch();
  const contacts = useAppSelector(selectContacts) ?? [];
  const gotoChat = (key: string) => {
    batch(() => {
      dispatch(actionSetChatId(key));
      dispatch(actionSetScreen('chat'));
    })
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

  const notImplementedAbout = () => {
    batch(() => {
      dispatch(actionSetErrorMessage(`Add about here. version ${currentVersion}`));
      dispatch(actionSetScreen('errorWithDelete'));
    })
  };

  const menuItems = {
    "Settings": gotoSettings,
    "Add Contact": addContact,
    "Import Contact": notImplemented,
    "New Group Chat": createGroupChat,
    "About": notImplementedAbout
  };

  return (<Screen
    centerItem={<ScreenTitle title="Botecko" />}
    menuItems={menuItems}
  >
    <List>
      {Object.entries(contacts).map(([key, contact]) => (
        <ListItemButton
          key={contact.id}
          onClick={() => contact.type !== 'loading' ? gotoChat(key) : removeContact(key)}
        >
          <AvatarWithDetails contact={contact} />
        </ListItemButton>
      ))}
    </List>
    {Object.entries(contacts).length === 0 && <Button onClick={() => addContact()}>Add Contact</Button>}
  </Screen>);
}