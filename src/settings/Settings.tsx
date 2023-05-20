import React, { useState } from 'react';
import { batch } from 'react-redux';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppSelector, useAppDispatch } from '../hooks';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, styled } from '@mui/material';
import { selectSettings } from '../selectors';
import { actionSetScreen, actionSetSettings } from '../actions';

const SettingsForm = styled('form')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    margin: "1rem",
    color: theme.palette.primary.dark
}));

const SelectStyled = styled(Select)(({ theme }) => ({
    '& .MuiMenu-paper': {
        backgroundColor: theme.palette.secondary.contrastText,
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                backgroundColor: theme.palette.secondary.contrastText,
            },
            '&:active': {
                backgroundColor: theme.palette.secondary.contrastText,
            },
            '&:hover': {
                color: theme.palette.secondary.contrastText,
                backgroundColor: theme.palette.secondary.main,
            },
        },
    },
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

    const handleSelectChange = (event: SelectChangeEvent<unknown>, key: keyof typeof settings) => {
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

    return <Screen
        leftItem={<BackButton />}
        centerItem={<ScreenTitle title='Settings' />}
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
            <FormControl fullWidth>
                <InputLabel id="model-select-label">Model</InputLabel>
                <SelectStyled
                    labelId="model-select-label"
                    id="model-select"
                    value={settings.model}
                    label="Model"
                    onChange={(event: any) => handleSelectChange(event, "model")}
                >
                    <MenuItem value={'gpt-4'}>gpt-4</MenuItem>
                    <MenuItem value={'gpt-3.5-turbo'}>gpt-3.5-turbo</MenuItem>
                </SelectStyled>
            </FormControl>
            <FormControlLabel control={<Checkbox
                checked={settings.showThought}
                onChange={(event) => handleCheckboxChange(event, "showThought")}
                required
                size="small"
                id="Show Thoughts" />} label="showThought" />
            <Button onClick={updateKey}>Save settings</Button>
        </SettingsForm>
    </Screen>;
}