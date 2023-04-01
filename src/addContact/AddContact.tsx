import React, { useState } from 'react';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppDispatch, useAppSelector } from '../hooks'
import { actionSetScreen, dispatchCreateContact, selectOpenAiKey } from '../appStateSlice';
import { batch } from 'react-redux';

export function AddContact() {
    const dispatch = useAppDispatch();
    const openAiKey = useAppSelector(selectOpenAiKey);

    const [profile, setProfile] = useState('');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(event.target.value);
    };

    const generateContact = () => {
        batch(() => {
            dispatchCreateContact(dispatch, openAiKey, profile);
            dispatch(actionSetScreen('contacts'));
        })
    };

    return <>
        <Typography variant="h6" gutterBottom>
            Add Profile
        </Typography>
        <TextField 
            value={profile}
            onChange={handleChange}
            required size="small" 
            id="profile" 
            label="Contact description" 
            variant="outlined" 
        />
        <Button sx={{marginLeft: 1}} variant="contained" onClick={generateContact}>Generate new Contact</Button>      
    </>;
}