import React, { useEffect } from 'react'

import CircularProgress from '@mui/material/CircularProgress';

import { useAppSelector, useAppDispatch } from '../hooks'
import Screen, { ScreenTitle } from '../screens/screen';
import { selectSettings } from '../selectors';
import { actionSetScreen } from '../actions';
import { dispatchActionCheckOpenAiKey } from '../dispatches';

export function TestOpenAiToken() {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectSettings);
    const openAiKeyFromStore = settings.openAiKey;

    useEffect(() => {
        if (openAiKeyFromStore !== '') {
            dispatchActionCheckOpenAiKey(dispatch, settings)
        } else {
            if (openAiKeyFromStore === null || openAiKeyFromStore === '') {
                dispatch(actionSetScreen('settings'));
            } else {
                dispatchActionCheckOpenAiKey(dispatch, settings)
            }
        }
    }, [settings]);

    return (<Screen
        centerItem={<ScreenTitle title='Botecko' />}
    >
        <CircularProgress />
    </Screen>);
}