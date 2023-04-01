import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAppDispatch, useAppSelector } from '../hooks';
import { actionRemoveContact, actionSetChatId, actionSetScreen, selectContacts } from '../appStateSlice';
import ListItemButton from '@mui/material/ListItemButton';
import { CircularProgress } from '@mui/material';

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

  // Add state for the menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const addContact = () => {
    setAnchorEl(null);
    dispatch(actionSetScreen('addContact'));
  };
  const removeContact = (id: string) => {
    setAnchorEl(null);
    dispatch(actionRemoveContact(id));
  };
  const gotoSettings = () => {
    setAnchorEl(null);
    dispatch(actionSetScreen('settings'));
  };

  return (
    <>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" component="div" className={classes.title}>
            BotBook
          </Typography>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => gotoSettings()}>
              Settings
            </MenuItem>
            <MenuItem onClick={() => addContact()}>
              Add Contact
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
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
    </>
  );
};
