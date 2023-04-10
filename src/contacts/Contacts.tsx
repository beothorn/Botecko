import React from 'react';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { useAppDispatch, useAppSelector } from '../hooks';
import { actionRemoveContact, actionSetChatId, actionSetScreen, selectContacts } from '../appStateSlice';
import ListItemButton from '@mui/material/ListItemButton';
import { Button, CircularProgress, styled } from '@mui/material';
import Screen from '../screens/screen';
import { ScreenTitle } from '../screens/screen';
import LocalAvatar from '../components/LocalAvatar';

const StyledListItemText = styled(ListItemText)(({theme}) => ({
  color: theme.palette.text.primary
}));

export default function Contacts() {
  const dispatch = useAppDispatch();
  const contacts = useAppSelector(selectContacts) ?? [];
  const gotoChat = (key: string) => {
    dispatch(actionSetChatId(key))
    dispatch(actionSetScreen('chat'));
  };

  const addContact = () => {
    dispatch(actionSetScreen('addContact'));
  };
  const removeContact = (id: string) => {
    dispatch(actionRemoveContact(id));
  };
  const gotoSettings = () => {
    dispatch(actionSetScreen('settings'));
  };

  const menuItems = {
    "Settings": gotoSettings,
    "Add Contact": addContact
  };

  return (<Screen
    centerItem={<ScreenTitle title="Botecko" />}
    menuItems={menuItems}
  >
    <List>
      {Object.entries(contacts).map(([key, contact]) => (
        contact.loaded ? 
        <ListItemButton key={contact.meta.name} onClick={() => gotoChat(key)}>
          <ListItemAvatar>
            <LocalAvatar id={contact.avatarMeta.id} prompt={contact.avatarMeta.prompt} />
          </ListItemAvatar>
          <StyledListItemText primary={contact.meta.name} secondary={contact.lastMessage} />
        </ListItemButton>
        :
        <ListItemButton key={contact.meta.name} onClick={() => removeContact(key)}>
          <ListItemAvatar>
            <CircularProgress />
          </ListItemAvatar>
          <StyledListItemText primary={"Contact is loading..."} />
        </ListItemButton>
      ))}
    </List>
    {Object.entries(contacts).length === 0 && <Button onClick={() => addContact()}>Add Contact</Button>}
  </Screen>);
}