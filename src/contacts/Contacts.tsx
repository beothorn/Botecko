import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { useAppDispatch, useAppSelector } from '../hooks';
import { actionRemoveContact, actionSetChatId, actionSetScreen, selectContacts } from '../appStateSlice';
import ListItemButton from '@mui/material/ListItemButton';
import { CircularProgress } from '@mui/material';
import Screen from '../screens/screen';
import { ScreenTitle } from '../screens/screen';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
}));

export default function Contacts() {
  const classes = useStyles();
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
    "Add Contacts": addContact
  };

  return (<Screen
    centerItem={<ScreenTitle title="BotBook" />}
    menuItems={menuItems}
  >
    <List className={classes.root}>
      {Object.entries(contacts).map(([key, contact]) => (
        contact.loaded ? 
        <ListItemButton key={contact.meta.name} onClick={() => gotoChat(key)}>
          <ListItemAvatar>
            <Avatar alt={contact.avatarMeta.prompt} src={`data:image/png;base64, ${contact.avatarMeta.base64Img}`} />
          </ListItemAvatar>
          <ListItemText primary={contact.meta.name} secondary={contact.meta.userProfile} />
        </ListItemButton>
        :
        <ListItemButton key={contact.meta.name} onClick={() => removeContact(key)}>
          <ListItemAvatar>
            <CircularProgress />
          </ListItemAvatar>
          <ListItemText primary={"Contact is loading..."} />
        </ListItemButton>
      ))}
    </List>
  </Screen>);
};
