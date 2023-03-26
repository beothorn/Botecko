import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';

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
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BotBook
          </Typography>
        </Toolbar>
      </AppBar>
      <List sx={{ paddingTop: 2 }}>
        {contacts.map((contact) => (
          <ListItem button key={contact.name}>
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