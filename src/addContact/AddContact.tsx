import React, { useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppDispatch, useAppSelector } from '../hooks'
import { actionSetScreen, dispatchCreateContact, selectSettings } from '../appStateSlice';
import { batch } from 'react-redux';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import { styled } from '@mui/material';

const AddContactForm = styled('form')(({theme}) => ({
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    margin: "1rem",
    color: theme.palette.primary.dark
}));

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
        leftItem = {<BackButton/>}
        centerItem = {<ScreenTitle title='Adding Contact' />}
    >
        <AddContactForm>
            <TextField 
                value={profile}
                onChange={handleChange}
                required size="small" 
                id="profile" 
                label="Contact description" 
                variant="outlined" 
            />
            <Button sx={{marginLeft: 1}} variant="contained" onClick={generateContact}>Generate new Contact</Button>  
        </AddContactForm>
    </Screen>;
}