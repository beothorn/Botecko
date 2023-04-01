import React, { useEffect } from 'react'

import CircularProgress from '@mui/material/CircularProgress';

import { useAppSelector, useAppDispatch } from '../hooks'
import { actionSetScreen, dispatchActionCheckOpenAiKey, selectOpenAiKey } from '../appStateSlice';
import { AppBar, Toolbar, Typography} from '@mui/material';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    title: {
        flexGrow: 1,
    },
    appBar: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
}));

export function TestOpenAiToken() {
    const classes = useStyles();
    const dispatch = useAppDispatch()
    const openAiKeyFromStore = useAppSelector(selectOpenAiKey);
    const openAiKeyFromStorage = localStorage.getItem('openAiKey');

    useEffect(() => {
        if(openAiKeyFromStore !== ''){
            dispatchActionCheckOpenAiKey(dispatch, openAiKeyFromStore)
        }else{
            if (openAiKeyFromStorage === null ||  openAiKeyFromStorage === '') {
                dispatch(actionSetScreen('settings'));
            }else{
                dispatchActionCheckOpenAiKey(dispatch, openAiKeyFromStorage)
            }
        }
    }, [openAiKeyFromStore, openAiKeyFromStorage]);

    return <>
        <AppBar position="static" className={classes.appBar}>
            <Toolbar>
            <Typography variant="h6" component="div" className={classes.title}>
                BotBook
            </Typography>
            </Toolbar>
        </AppBar>
        <CircularProgress />
    </>;
}