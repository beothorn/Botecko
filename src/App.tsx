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
import { Profile } from './profile/Profile';
import GroupChatSelect from './groupChat/GroupChatSelect';
import GroupChat from './groupChat/GroupChat';
import { GroupChatProfile } from './profile/GroupChatProfile';
import { Loading } from './loading/Loading';
import { ErrorScreenWithDeleteButton } from './errorScreen/ErrorScreenWithDeleteButton';

function assertUnreachable(_x: never): never {
    throw new Error("Didn't expect to get here");
}

function getCurrentScreenComponent(currentScreen: AppScreen): JSX.Element {
    switch (currentScreen) {
        case 'loading':
            return <Loading />;
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
        case 'groupChat':
            return <GroupChat />;
        case 'error':
            return <ErrorScreen />;
        case 'errorWithDelete':
            return <ErrorScreenWithDeleteButton />;
        case 'profile':
            return <Profile />;
        case 'groupChatProfile':
            return <GroupChatProfile />;
        case 'groupChatSelect':
            return <GroupChatSelect />;
    }
    return assertUnreachable(currentScreen);
}

export const StyledBox = styled(Box)(({theme}) => ({
    background: theme.palette.background.default
}));

export default function App() {

    const currentScreen = useAppSelector(selectScreen);

    const currentScreenComponent = getCurrentScreenComponent(currentScreen);

    return <StyledBox height="100vh" display="flex" flexDirection="column">
        <Box flex={1} overflow="auto">
        {currentScreenComponent}
        </Box>
    </StyledBox>
}