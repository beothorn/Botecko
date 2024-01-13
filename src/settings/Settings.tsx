import React, { useState } from 'react';
import { batch } from 'react-redux';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppSelector, useAppDispatch } from '../hooks';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import { Checkbox, FormControl, FormControlLabel, InputLabel, 
    MenuItem, Select, SelectChangeEvent, styled } from '@mui/material';
import { selectSettings } from '../selectors';
import { actionSetScreen, actionSetSettings } from '../actions';
import BoxWithTitle from '../components/BoxWithTitle';
import { TextProviders } from '../api/chatApi';
import { ImageProviders } from '../api/imageApi';
import { Settings } from '../AppState';

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

const FormControlStyled = styled(FormControl)(() => ({
    marginBottom: '1rem'
}));

const TextFieldStyled = styled(TextField)(() => ({
    marginBottom: '1rem'
}));

function ProviderSelector({
        name, 
        providers,
        settings, 
        handleSelectChange
    }: {
        name: string, 
        providers: readonly string[],
        settings: Settings, 
        handleSelectChange: any
    }) {
    const nameField = name.replace(/^\w/, (m) => m.toLowerCase()).replace(/\s+/g, '');
    const nameFieldIndex = nameField as keyof Settings;
    const nameId = name.toLowerCase().replace(/\s+/g, '-');
    const labelId = nameId +"-label";

    return (<FormControlStyled fullWidth>
        <InputLabel id={labelId}>{name}</InputLabel>
        <SelectStyled
            labelId={labelId}
            id={nameId}
            value={settings[nameFieldIndex] || providers[0]}
            label={name}
            onChange={(event: any) => handleSelectChange(event, nameFieldIndex)}
        >
            {Object.values(providers).map((value) => (
                <MenuItem key={value} value={value}>
                {value}
                </MenuItem>
            ))}
        </SelectStyled>
    </FormControlStyled>);
}

export default function SettingsScreen() {
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
            dispatch(actionSetScreen('contacts'));
        })
    }

    return <Screen
        leftItem={<BackButton />}
        centerItem={<ScreenTitle title='Settings' />}
    >
        <SettingsForm>
            <BoxWithTitle title="API Keys">
                <TextFieldStyled
                    value={settings.openAiKey || ""}
                    onChange={(event) => handleChange(event, "openAiKey")}
                    size="small"
                    id="openAiKey"
                    label="OpenAi key"
                    variant="outlined"
                    fullWidth
                />
                <TextFieldStyled
                    value={settings.geminiKey || ""}
                    onChange={(event) => handleChange(event, "geminiKey")}
                    size="small"
                    id="geminiKey"
                    label="Gemini key"
                    variant="outlined"
                    fullWidth
                />
            </BoxWithTitle>    
            <BoxWithTitle title="Providers">
                <ProviderSelector
                    name='Profile Generation'
                    providers={TextProviders}
                    settings={settings}
                    handleSelectChange={handleSelectChange}
                />
                <ProviderSelector
                    name='Chat Response'
                    providers={TextProviders}
                    settings={settings}
                    handleSelectChange={handleSelectChange}
                />
                <ProviderSelector
                    name='Avatar Generation'
                    providers={ImageProviders}
                    settings={settings}
                    handleSelectChange={handleSelectChange}
                />
            </BoxWithTitle>    
            
            <BoxWithTitle title="Bot Context">
                <TextFieldStyled
                    value={settings.userName}
                    onChange={(event) => handleChange(event, "userName")}
                    size="small"
                    id="userName"
                    label="User name"
                    variant="outlined"
                    fullWidth
                />
                <TextFieldStyled
                    value={settings.userShortInfo}
                    onChange={(event) => handleChange(event, "userShortInfo")}
                    size="small"
                    id="userShortInfo"
                    label="User short info"
                    variant="outlined"
                    fullWidth
                />
            </BoxWithTitle>    
            
            <BoxWithTitle title="Other Options">
                <FormControlLabel control={<Checkbox
                    checked={settings.showThought}
                    onChange={(event) => handleCheckboxChange(event, "showThought")}
                    required
                    size="small"
                    id="Show Thoughts" />} label="showThought" />
            </BoxWithTitle>
            <Button onClick={updateKey}>Save settings</Button>
        </SettingsForm>
    </Screen>;
}