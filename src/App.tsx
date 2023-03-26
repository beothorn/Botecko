import React from 'react'

import { Presentation } from './presentation/Presentation';
import { ErrorScreen } from './errorScreen/ErrorScreen';
import { TestOpenAiToken } from './testOpenAiToken/TestOpenAiToken';

import { useAppSelector } from './hooks';
import { selectScreen } from './appStateSlice';

import Box from '@mui/material/Box';

export function App() {

    const currentScreen = useAppSelector(selectScreen);

    let currentScreenComponent = <></>;
    switch (currentScreen) {
        case 'presentation':
            currentScreenComponent = <Presentation />;
            break;
        case 'testOpenAiToken':
            currentScreenComponent = <TestOpenAiToken />;
            break;
        case 'error':
            currentScreenComponent = <ErrorScreen />;
            break;
    }

    return <Box sx={{ padding: '1rem', bgcolor: 'background.paper' }}>
            {currentScreenComponent}
        </Box>;
}