import { IconButton } from '@mui/material';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { actionSetScreen, AppScreen } from '../appStateSlice';
import { useAppDispatch } from '../hooks';

type Props = {
    originScreen: AppScreen
}

export default function BackButton({originScreen}: Props){
    const dispatch = useAppDispatch()

    const goBack = () => {
        dispatch(actionSetScreen(originScreen));
    };

    return <IconButton
        color="inherit"
        aria-label="menu"
        onClick={goBack}
    >
        <ArrowBackIcon />
    </IconButton>;
}