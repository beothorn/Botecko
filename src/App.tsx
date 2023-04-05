import React from 'react'

import Contacts from './contacts/Contacts';
import Chat from './chat/Chat';
import Settings from './settings/Settings';
import { ErrorScreen } from './errorScreen/ErrorScreen';
import { TestOpenAiToken } from './testOpenAiToken/TestOpenAiToken';

import { useAppSelector } from './hooks';
import { selectScreen, AppScreen } from './appStateSlice';

import Box from '@mui/material/Box';
import { AddContact } from './addContact/AddContact';
import { styled } from '@mui/material';

function assertUnreachable(_x: never): never {
    throw new Error("Didn't expect to get here");
}

function getCurrentScreenComponent(currentScreen: AppScreen): JSX.Element {
    switch (currentScreen) {
        case 'contacts':
            return <Contacts />;
        case 'settings':
            return <Settings />;
        case 'testOpenAiToken':
            return <TestOpenAiToken />;
        case 'addContact':
            return <AddContact />;
        case 'chat':
            return <Chat />;
        case 'error':
            return <ErrorScreen />;
    }
    return assertUnreachable(currentScreen);
}

export const StyledBox = styled(Box)(({theme}) => ({
    background: theme.palette.background.default
}));

export default function App() {

    const currentScreen = useAppSelector(selectScreen);

    let currentScreenComponent = getCurrentScreenComponent(currentScreen);

    return <StyledBox height="100vh" display="flex" flexDirection="column">
        <Box flex={1} overflow="auto">
        {currentScreenComponent}
        </Box>
    </StyledBox>
}