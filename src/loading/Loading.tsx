import React from 'react';

import Screen, { ScreenTitle } from '../screens/screen';
import { CircularProgress } from '@mui/material';

export function Loading() {
    return (<Screen
        centerItem={<ScreenTitle title='Botecko' />}
    >
        <CircularProgress />
    </Screen>);
}