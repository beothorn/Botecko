import { CircularProgress, ListItemAvatar } from '@mui/material';
import React from 'react';
import { Contact } from '../AppState';
import LocalAvatar from './LocalAvatar';
import StyledListItemText from './StyledListItemText';

type AvatarWithDetails = {
    contact: Contact;
}

export default function AvatarWithDetails({ contact }: AvatarWithDetails) {
    if (contact.type !== 'loading') {
        return (<>
            <ListItemAvatar>
                <LocalAvatar id={contact.avatarMeta.id} prompt={contact.avatarMeta.prompt} />
            </ListItemAvatar>
            <StyledListItemText primary={contact.meta.name} secondary={contact.status} />
        </>);
    }
    return (<>
        <ListItemAvatar>
            <CircularProgress />
        </ListItemAvatar>
        <StyledListItemText primary={"Contact is loading..."} />
    </>);
}