import React from 'react';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { useAppDispatch, useAppSelector } from '../hooks'
import { actionSetScreen, selectErrorMessage } from '../appStateSlice';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';

export function ErrorScreen() {
    const dispatch = useAppDispatch()

    const error = useAppSelector(selectErrorMessage);

    const gotoNextScreen = () => dispatch(actionSetScreen('contacts'));

    return (<Screen
        leftItem={<BackButton/>}
        centerItem={<ScreenTitle title="Error" />}
    >
        <Typography sx={{marginBottom: '1rem', color: 'white'}} variant="h5" gutterBottom>
            {error}
        </Typography>
        <Button sx={{marginLeft: 1}} variant="contained" onClick={gotoNextScreen}>Continue</Button>
    </Screen>);
}