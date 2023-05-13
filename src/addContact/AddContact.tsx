import React, { useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppDispatch, useAppSelector } from '../hooks'
import { actionSetScreen, dispatchCreateContact, selectSettings } from '../appStateSlice';
import { batch } from 'react-redux';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import { styled, Typography } from '@mui/material';
import Box from '@mui/material/Box';

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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.keyCode === 13) {
            generateContact();
        }
    };

    return <Screen
        leftItem = {<BackButton/>}
        centerItem = {<ScreenTitle title='Adding Contact' />}
    >
        <Box sx={{ padding: '2rem', backgroundColor: '#333' }}>
            <Typography sx={{marginBottom: '1rem', color: 'white'}} variant="h5" gutterBottom>
                Here you can add a small description for your new contact and everything else will be generated. For example:
            </Typography>
            <Typography sx={{marginBottom: '1rem', color: 'white'}} variant="h5" gutterBottom>
                "A construction worker that is always available for consulting."
            </Typography>
            <Typography sx={{marginBottom: '1rem', color: 'white'}} variant="h5" gutterBottom>
                "A German teacher that speaks english and focus on grammar."
            </Typography>
            <Typography sx={{marginBottom: '1rem', color: 'white'}} variant="h5" gutterBottom>
                Be as general or specific as you want.
            </Typography>
            <AddContactForm>
                <TextField 
                    value={profile}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required size="small" 
                    id="profile" 
                    label="Contact description" 
                    variant="outlined" 
                />
                <Button sx={{marginLeft: 1}} variant="contained" onClick={generateContact}>Generate new Contact</Button>  
            </AddContactForm>
        </Box>
    </Screen>;
}