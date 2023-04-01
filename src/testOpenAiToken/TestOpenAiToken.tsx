import React, { useEffect } from 'react'

import CircularProgress from '@mui/material/CircularProgress';

import { useAppSelector, useAppDispatch } from '../hooks'
import { actionSetScreen, dispatchActionCheckOpenAiKey, selectSettings } from '../appStateSlice';
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