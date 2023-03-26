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
import { useAppDispatch } from '../hooks';
import { actionSetScreen } from '../appStateSlice';

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

const contacts = [
  {
    name: 'Alice',
    message: 'Hi, how are you?',
    avatarUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  {
    name: 'Bob',
    message: 'Can we meet tomorrow?',
    avatarUrl: 'https://randomuser.me/api/portraits/men/83.jpg',
  },
  {
    name: 'Charlie',
    message: 'Thanks for your help!',
    avatarUrl: 'https://randomuser.me/api/portraits/men/34.jpg',
  },
];

export function Contacts() {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const gotoChat = () => dispatch(actionSetScreen('chat'));

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
        {contacts.map((contact) => (
          <ListItem button key={contact.name} onClick={gotoChat}>
            <ListItemAvatar>
              <Avatar alt={contact.name} src={contact.avatarUrl} />
            </ListItemAvatar>
            <ListItemText primary={contact.name} secondary={contact.message} />
          </ListItem>
        ))}
      </List>
    </>
  );
};
