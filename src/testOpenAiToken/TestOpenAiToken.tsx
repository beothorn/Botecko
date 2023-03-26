import React, { useEffect } from 'react'

import CircularProgress from '@mui/material/CircularProgress';

import { useAppSelector, useAppDispatch } from '../hooks'
import { actionSetScreen, dispatchActionCheckOpenAiKey, selectOpenAiKey } from '../appStateSlice';

export function TestOpenAiToken() {

    const dispatch = useAppDispatch()
    const openAiKeyFromStore = useAppSelector(selectOpenAiKey);
    const openAiKeyFromStorage = localStorage.getItem('openAiKey');

    useEffect(() => {
        if(openAiKeyFromStore !== ''){
            dispatchActionCheckOpenAiKey(dispatch, openAiKeyFromStore)
        }else{
            if (openAiKeyFromStorage === null ||  openAiKeyFromStorage === '') {
                dispatch(actionSetScreen('presentation'));
            }else{
                dispatchActionCheckOpenAiKey(dispatch, openAiKeyFromStorage)
            }
        }
    }, [openAiKeyFromStore, openAiKeyFromStorage]);

    return <CircularProgress />;
}