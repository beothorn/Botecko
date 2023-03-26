import React from 'react';
import { batch } from 'react-redux';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppSelector, useAppDispatch } from '../hooks'
import { selectOpenAiKey, actionSetOpenAiKey, actionSetScreen } from '../appStateSlice';

export function Settings() {

    const openAiKey = useAppSelector(selectOpenAiKey);
    const dispatch = useAppDispatch()
    const [openAiKeyInputValue, setOpenAiKey] = React.useState(openAiKey);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOpenAiKey(event.target.value);
    };

    const updateKey = () => {
        batch(() => {
            dispatch(actionSetOpenAiKey(openAiKeyInputValue));
            dispatch(actionSetScreen('testOpenAiToken'));
        })
    }

    return <>
        <Typography variant="h6" gutterBottom>
            Settings
        </Typography>
        <TextField 
            value={openAiKeyInputValue}
            onChange={handleChange}
            required size="small" 
            id="open-ai-key" 
            label="OpenAi key" 
            variant="outlined" 
        />
        <Button sx={{marginLeft: 1}} variant="contained" onClick={updateKey}>Ok</Button>      
    </>;
}