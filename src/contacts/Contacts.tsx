import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { useAppDispatch, useAppSelector } from '../hooks';
import { actionSetChatId, actionSetScreen, selectContacts } from '../appStateSlice';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

export function Contacts() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const contacts = useAppSelector(selectContacts) ?? [];
  const gotoChat = (key: string) => {
    dispatch(actionSetChatId(key))
    dispatch(actionSetScreen('chat'));
  };

  return (
    <>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" component="div" className={classes.title}>
            BotBook
          </Typography>
        </Toolbar>
      </AppBar>
      <List className={classes.root}>
        {Object.entries(contacts).map(([key, contact]) => (
          <ListItem button key={contact.meta.name} onClick={() => gotoChat(key)}>
            <ListItemAvatar>
              <Avatar alt={contact.avatarMeta.prompt} src={contact.avatarMeta.url} />
            </ListItemAvatar>
            <ListItemText primary={contact.meta.name} secondary={contact.meta.userProfile} />
          </ListItem>
        ))}
      </List>
    </>
  );
};
