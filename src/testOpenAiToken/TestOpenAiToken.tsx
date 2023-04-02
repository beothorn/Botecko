import React, { useEffect } from 'react'

import CircularProgress from '@mui/material/CircularProgress';

import { useAppSelector, useAppDispatch } from '../hooks'
import { actionSetScreen, dispatchActionCheckOpenAiKey, selectSettings } from '../appStateSlice';
import Screen, { ScreenTitle } from '../screens/screen';

export function TestOpenAiToken() {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectSettings);
    const openAiKeyFromStore = settings.openAiKey;

    useEffect(() => {
        if(openAiKeyFromStore !== ''){
            dispatchActionCheckOpenAiKey(dispatch, settings)
        }else{
            if (openAiKeyFromStore === null ||  openAiKeyFromStore === '') {
                dispatch(actionSetScreen('settings'));
            }else{
                dispatchActionCheckOpenAiKey(dispatch, settings)
            }
        }
    }, [openAiKeyFromStore, settings]);

    return (<Screen
        centerItem={<ScreenTitle title='BotBook' />}
    >
        <CircularProgress />
    </Screen>);
}