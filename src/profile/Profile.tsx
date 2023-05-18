import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '../hooks';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import LocalAvatar from '../components/LocalAvatar';
import { ContactMeta } from '../AppState';
import { selectCurrentContact } from '../selectors';

export function Profile() {
    const currentContact = useAppSelector(selectCurrentContact);
    if (currentContact.type !== 'bot') {
        return (
            <>INVALID STATE</>
        )
    }
    const metaData = currentContact.meta as ContactMeta;
    const avatarMetaData = currentContact.avatarMeta;
    return (
        <Screen
            leftItem={<BackButton />}
            centerItem={<ScreenTitle title={metaData.name} />}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: '2rem'
            }}>
                <LocalAvatar
                    id={avatarMetaData.id}
                    prompt={avatarMetaData.prompt}
                    sx={{
                        width: '12rem',
                        height: '12rem',
                        mb: '1rem'
                    }}
                />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    p: '1rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '0.5rem'
                }}>
                    <Typography variant="h4" gutterBottom>
                        Name:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {metaData.name}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Profile:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {metaData.background}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Current:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {metaData.current}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Appearance:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {metaData.appearance}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Likes:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {metaData.likes}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Dislikes:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {metaData.dislikes}
                    </Typography>
                </Box>
            </Box>
        </Screen>
    );
}