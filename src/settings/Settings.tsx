import React, { useState } from 'react';
import { batch } from 'react-redux';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppSelector, useAppDispatch } from '../hooks'
import { actionSetScreen, actionSetSettings, selectSettings } from '../appStateSlice';
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
        marginBottom: "1rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      margin: "1rem",
    },
}));

export default function Settings() {
    const classes = useStyles();

    const settingsFromState = useAppSelector(selectSettings);
    const dispatch = useAppDispatch()
    const [settings, setSettings] = useState(settingsFromState);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof typeof settings) => {
        setSettings((prevState) => ({
            ...prevState,
            [key]: event.target.value,
        }));
    };

    const updateKey = () => {
        batch(() => {
            dispatch(actionSetSettings(settings));
            dispatch(actionSetScreen('testOpenAiToken'));
        })
    }

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
                {"Settings"}
                </Typography>
            </Toolbar>
        </AppBar>
        <Typography variant="h6" gutterBottom>
            Settings
        </Typography>
        <form className={classes.form}>
            <TextField
                value={settings.openAiKey}
                onChange={(event) => handleChange(event, "openAiKey")}
                required
                size="small"
                id="open-ai-key"
                label="OpenAi key"
                variant="outlined"
            />
            <TextField
                value={settings.userName}
                onChange={(event) => handleChange(event, "userName")}
                required
                size="small"
                id="user-name"
                label="User name"
                variant="outlined"
            />
            <TextField
                value={settings.userShortInfo}
                onChange={(event) => handleChange(event, "userShortInfo")}
                required
                size="small"
                id="user-short-info"
                label="User short info"
                variant="outlined"
            />
            <TextField
                value={settings.model}
                onChange={(event) => handleChange(event, "model")}
                required
                size="small"
                id="model"
                label="Model"
                variant="outlined"
            />
            <Button sx={{marginLeft: 1}} variant="contained" onClick={updateKey}>Ok</Button>      
        </form>
    </>;
}