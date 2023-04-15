import React, { useState } from 'react';
import List from '@mui/material/List';
import { useAppDispatch, useAppSelector } from '../hooks';
import { actionSetScreen, dispatchCreateGroupChat, selectContacts } from '../appStateSlice';
import Screen from '../screens/screen';
import { ScreenTitle } from '../screens/screen';
import AvatarWithDetails from '../components/AvatarWithDetails';
import BackButton from '../screens/backButton';
import { Button, Checkbox, ListItem, TextField } from '@mui/material';
import { batch } from 'react-redux';

export default function GroupChatSelect() {
  const contacts = useAppSelector(selectContacts) ?? [];
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>('');

  const dispatch = useAppDispatch();

  const select = (key: string,  checked: boolean) => {
    console.log(selected);
    if (checked) {
      setSelected([...selected, key]);
    }else{
      setSelected(selected.filter(s => s !== key));
    }
    console.log(checked);
    console.log(selected);
  };

  const createChat = () => {
    if (groupName !== '' && selected.length > 0) { 
      batch(() => {
        dispatchCreateGroupChat(dispatch, groupName);
        dispatch(actionSetScreen('contacts'));
      })
    }
    console.log(selected);
  }

  return (<Screen
    leftItem={<BackButton/>}
    centerItem={<ScreenTitle title="Select Contacts" />}
  >
    <List>
      <ListItem> 
        <TextField
            required
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            size="small"
            id="groupName"
            label="Group Name"
            variant="outlined"
        />
      </ListItem>
      <ListItem> 
        <Button onClick={() => createChat()}>Start Chat</Button>
      </ListItem>
      {Object.entries(contacts).map(([key, contact]) => (
        <ListItem 
          key={contact.meta.name} 
        >
          <Checkbox 
            checked={selected.includes(key)}
            onChange={(_e, checked) => select(key, checked)} 
          />
          <AvatarWithDetails contact={contact}/>  
        </ListItem>
      ))}
    </List>
  </Screen>);
}