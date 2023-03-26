import React from 'react'

import { Contacts } from './contacts/Contacts';
import { Settings } from './settings/Settings';
import { ErrorScreen } from './errorScreen/ErrorScreen';
import { TestOpenAiToken } from './testOpenAiToken/TestOpenAiToken';

import { useAppSelector } from './hooks';
import { selectScreen } from './appStateSlice';

import Box from '@mui/material/Box';

export default function App() {

    const currentScreen = useAppSelector(selectScreen);

    let currentScreenComponent = <></>;
    switch (currentScreen) {
        case 'contacts':
            currentScreenComponent = <Contacts />;
            break;
        case 'settings':
            currentScreenComponent = <Settings />;
            break;
        case 'testOpenAiToken':
            currentScreenComponent = <TestOpenAiToken />;
            break;
        case 'error':
            currentScreenComponent = <ErrorScreen />;
            break;
    }

    return <Box sx={{ bgcolor: 'background.paper' }}>
            {currentScreenComponent}
        </Box>;
}