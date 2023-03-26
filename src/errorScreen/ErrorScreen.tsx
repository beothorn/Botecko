import React from 'react';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { useAppDispatch } from '../hooks'
import { actionSetScreen } from '../appStateSlice';

export function ErrorScreen() {
    const dispatch = useAppDispatch()

    const gotoNextScreen = () => dispatch(actionSetScreen('presentation'));

    return <>
        <Typography sx={{marginBottom: '1rem'}} variant="h5" gutterBottom>
            Oops, something went wrong...
        </Typography>
        <Button sx={{marginLeft: 1}} variant="contained" onClick={gotoNextScreen}>Continue</Button>
    </>;
}