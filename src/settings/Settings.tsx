import React, { useState } from 'react';
import { batch } from 'react-redux';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppSelector, useAppDispatch } from '../hooks'
import { actionSetScreen, actionSetSettings, selectSettings } from '../appStateSlice';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import { Checkbox, FormControlLabel, styled } from '@mui/material';

const SettingsForm = styled('form')(({theme}) => ({
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    margin: "1rem",
    color: theme.palette.primary.dark
}));

export default function Settings() {
    const settingsFromState = useAppSelector(selectSettings);
    const dispatch = useAppDispatch();
    const [settings, setSettings] = useState(settingsFromState);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof typeof settings) => {
        setSettings((prevState) => ({
            ...prevState,
            [key]: event.target.value,
        }));
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, key: keyof typeof settings) => {
        setSettings((prevState) => ({
            ...prevState,
            [key]: event.target.checked,
        }));
    };

    const updateKey = () => {
        batch(() => {
            dispatch(actionSetSettings(settings));
            dispatch(actionSetScreen('testOpenAiToken'));
        })
    }

    return <Screen
        leftItem = {<BackButton/>}
        centerItem = {<ScreenTitle title='Settings' />}
    >
        <SettingsForm>
            <TextField
                value={settings.openAiKey}
                onChange={(event) => handleChange(event, "openAiKey")}
                required
                size="small"
                id="openAiKey"
                label="OpenAi key"
                variant="outlined"
            />
            <TextField
                value={settings.userName}
                onChange={(event) => handleChange(event, "userName")}
                required
                size="small"
                id="userName"
                label="User name"
                variant="outlined"
            />
            <TextField
                value={settings.userShortInfo}
                onChange={(event) => handleChange(event, "userShortInfo")}
                required
                size="small"
                id="userShortInfo"
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
            <TextField
                value={settings.systemEntry}
                onChange={(event) => handleChange(event, "systemEntry")}
                required
                size="small"
                id="systemEntry"
                label="System Entry"
                variant="outlined"
                multiline
                maxRows={4}
            />
            <TextField
                value={settings.profileGeneratorSystemEntry}
                onChange={(event) => handleChange(event, "profileGeneratorSystemEntry")}
                required
                size="small"
                id="profileGeneratorSystemEntry"
                label="Profile Generator System Entry"
                variant="outlined"
                multiline
                maxRows={4}
            />
            <TextField
                value={settings.profileGeneratorMessageEntry}
                onChange={(event) => handleChange(event, "profileGeneratorMessageEntry")}
                required
                size="small"
                id="profileGeneratorMessageEntry"
                label="Profile Generator Message Entry"
                variant="outlined"
                multiline
                maxRows={4}
            />
            <FormControlLabel control={<Checkbox 
                checked={settings.showThought}
                onChange={(event) => handleCheckboxChange(event, "showThought")}
                required
                size="small"
                id="Show Thoughts" />} label="showThought" />
            <Button onClick={updateKey}>Ok</Button>      
        </SettingsForm>
    </Screen>;
}