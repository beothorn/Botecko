import { Menu, MenuProps, styled } from '@mui/material';
import React from 'react';

export default styled((props: MenuProps) => (
<Menu
    elevation={0}
    anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
    }}
    transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
    }}
    {...props}
/>
))(({ theme }) => ({
'& .MuiPaper-root': {
    backgroundColor: theme.palette.secondary.contrastText,
    '& .MuiMenuItem-root': {
    '& .MuiSvgIcon-root': {
        backgroundColor: theme.palette.secondary.contrastText,
    },
    '&:active': {
        backgroundColor: theme.palette.secondary.contrastText,
    },
    '&:hover': {
        color: theme.palette.secondary.contrastText,
        backgroundColor: theme.palette.secondary.main,
    },
    },
},
}));