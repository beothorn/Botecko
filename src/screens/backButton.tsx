import { IconButton } from '@mui/material';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { actionGoToPreviousScreen } from '../appStateSlice';
import { useAppDispatch } from '../hooks';

export default function BackButton(){
    const dispatch = useAppDispatch()

    const goBack = () => {
        dispatch(actionGoToPreviousScreen());
    };

    return <IconButton
        color="inherit"
        aria-label="menu"
        onClick={goBack}
    >
        <ArrowBackIcon />
    </IconButton>;
}