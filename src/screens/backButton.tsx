import { IconButton } from '@mui/material';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch } from '../hooks';
import { actionGoToPreviousScreen } from '../actions';

export default function BackButton() {
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