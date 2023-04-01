import React, { useState } from 'react';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppDispatch, useAppSelector } from '../hooks'
import { actionSetScreen, dispatchCreateContact, selectSettings } from '../appStateSlice';
import { batch } from 'react-redux';
import { AppBar, IconButton, Toolbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    title: {
        flexGrow: 1,
    },
    appBar: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
}));

export function AddContact() {
    const classes = useStyles();
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

    const gotoContacts = () => {
        dispatch(actionSetScreen('contacts'));
    };

    return <>
        <AppBar position="static" className={classes.appBar}>
            <Toolbar>
                <IconButton
                color="inherit"
                aria-label="menu"
                onClick={gotoContacts}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" component="div" className={classes.title}>
                {"Adding Contact"}
                </Typography>
            </Toolbar>
        </AppBar>
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