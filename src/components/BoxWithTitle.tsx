import React from 'react';

import { Typography, Box } from '@mui/material';

export type BoxWithTitleProps = {
    title: string;
    children?: React.ReactNode;
}
  
export default function BoxWithTitle({ title, children }: BoxWithTitleProps){
    return (<Box border={1} p={2} borderRadius={4} marginBottom={2}>
        <Typography variant="h6" gutterBottom>
        {title}
        </Typography>
        {children}
    </Box>);
}