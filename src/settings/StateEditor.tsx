import React, { useRef } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAppDispatch, useAppSelector } from '../hooks';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import { actionReloadState, actionSetScreen, selectVersion } from '../appStateSlice';
import { batch } from 'react-redux';

export default function StateEditor() {
    const currentVersion = useAppSelector(selectVersion);
    const dispatch = useAppDispatch();
    const stateRef = useRef<string | null>(null);

    const saveState = () => {
        if (stateRef.current !== null) {
            localStorage.setItem(currentVersion, stateRef.current);
            batch(() => {
                dispatch(actionReloadState(currentVersion));
                dispatch(actionSetScreen('contacts'));
            })
        }
    }

    return (
        <Screen
            leftItem={<BackButton />}
            centerItem={<ScreenTitle title='Settings' />}
        >
            <TextField
                label="State"
                defaultValue={localStorage.getItem(currentVersion)}
                onChange={(event) => {
                    stateRef.current = event.target.value;
                }}
                multiline
                fullWidth
            />
            <Button onClick={saveState}>Save</Button>
        </Screen>
    );
}
