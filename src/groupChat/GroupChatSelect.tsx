import React from 'react';
import List from '@mui/material/List';
import { useAppSelector } from '../hooks';
import { selectContacts } from '../appStateSlice';
import Screen from '../screens/screen';
import { ScreenTitle } from '../screens/screen';
import AvatarWithDetails from '../components/AvatarWithDetails';
import BackButton from '../screens/backButton';
import { Button, Checkbox, ListItem } from '@mui/material';

export default function GroupChatSelect() {
  const contacts = useAppSelector(selectContacts) ?? [];
  const [selected, setSelected] = React.useState<string[]>([]);

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

  const printSelected = () => {
    console.log(selected);
  }

  return (<Screen
    leftItem={<BackButton/>}
    centerItem={<ScreenTitle title="Select Contacts" />}
  >
    <List>
      <ListItem> 
        <Button onClick={() => printSelected()}>Start Chat</Button>
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