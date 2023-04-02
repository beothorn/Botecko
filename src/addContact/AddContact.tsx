import React, { useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppDispatch, useAppSelector } from '../hooks'
import { actionSetScreen, dispatchCreateContact, selectSettings } from '../appStateSlice';
import { batch } from 'react-redux';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';

export function AddContact() {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectSettings);

    const [profile, setProfile] = useState('');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(event.target.value);
    };

    const generateContact = () => {
        batch(() => {
            dispatchCreateContact(dispatch, settings, profile);
            dispatch(actionSetScreen('contacts'));
        })
    };

    return <Screen
        leftItem = {<BackButton originScreen='contacts' ></BackButton>}
        centerItem = {<ScreenTitle title='Adding Contact' />}
    >
        <TextField 
            value={profile}
            onChange={handleChange}
            required size="small" 
            id="profile" 
            label="Contact description" 
            variant="outlined" 
        />
        <Button sx={{marginLeft: 1}} variant="contained" onClick={generateContact}>Generate new Contact</Button>  
    </Screen>;
}