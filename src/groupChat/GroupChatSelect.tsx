import React, { useState } from 'react';
import List from '@mui/material/List';
import { useAppDispatch, useAppSelector } from '../hooks';
import Screen from '../screens/screen';
import { ScreenTitle } from '../screens/screen';
import AvatarWithDetails from '../components/AvatarWithDetails';
import BackButton from '../screens/backButton';
import { Button, Checkbox, ListItem, TextField } from '@mui/material';
import { batch } from 'react-redux';
import { selectContacts, selectSettings } from '../selectors';
import { actionSetScreen } from '../actions';
import { dispatchCreateGroupChat } from '../dispatches';

type GroupChatSelectState = {
  groupName: string,
  description: string,
  selected: string[]
}

export default function GroupChatSelect() {
  const contacts = useAppSelector(selectContacts) ?? [];
  const [chatSelect, setChatSelect] = useState<GroupChatSelectState>({
    groupName: '',
    description: '',
    selected: []
  });

  const dispatch = useAppDispatch();

  const settings = useAppSelector(selectSettings);

  const select = (key: string, checked: boolean) => {
    if (checked) {
      setChatSelect({ ...chatSelect, selected: [...chatSelect.selected, key] });
    } else {
      setChatSelect({ ...chatSelect, selected: chatSelect.selected.filter(s => s !== key) });
    }
  };

  const setGroupName = (groupName: string) => {
    setChatSelect({ ...chatSelect, groupName: groupName });
  };

  const setGroupDescription = (description: string) => {
    setChatSelect({ ...chatSelect, description: description });
  };

  const createChat = () => {
    if (chatSelect.groupName !== '' && chatSelect.selected.length > 1) {
      batch(() => {
        dispatchCreateGroupChat(
          dispatch,
          settings,
          chatSelect.groupName,
          chatSelect.description,
          chatSelect.selected
        );
        dispatch(actionSetScreen('contacts'));
      })
    }
    console.log(chatSelect.selected);
  }

  return (<Screen
    leftItem={<BackButton />}
    centerItem={<ScreenTitle title="Select Contacts" />}
  >
    <List>
      <ListItem>
        <TextField
          required
          value={chatSelect.groupName}
          onChange={e => setGroupName(e.target.value)}
          size="small"
          id="groupName"
          label="Group Name"
          variant="outlined"
        />
      </ListItem>
      <ListItem>
        <TextField
          required
          value={chatSelect.description}
          onChange={e => setGroupDescription(e.target.value)}
          size="small"
          id="groupDescription"
          label="Group Description"
          variant="outlined"
        />
      </ListItem>
      <ListItem>
        <Button onClick={() => createChat()}>Start Chat</Button>
      </ListItem>
      {Object.entries(contacts).map(([key, contact]) => (
        <ListItem
          key={contact.id}
        >
          <Checkbox
            checked={chatSelect.selected.includes(key)}
            onChange={(_e, checked) => select(key, checked)}
          />
          <AvatarWithDetails contact={contact} />
        </ListItem>
      ))}
    </List>
  </Screen>);
}