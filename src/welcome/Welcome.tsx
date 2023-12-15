import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { useAppDispatch } from '../hooks';
import Screen, { ScreenTitle } from '../screens/screen';
import BackButton from '../screens/backButton';
import { actionSetScreen } from '../actions';

export function Welcome() {
  const dispatch = useAppDispatch();

  const gotoNextScreen = () => dispatch(actionSetScreen('testOpenAiToken'));

  return (
    <Screen
      leftItem={<BackButton />}
      centerItem={<ScreenTitle title="Botecko" />}
    >
      <Box sx={{ padding: '2rem', backgroundColor: '#333' }}>
        <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
          Botecko
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: 'white' }}>
          An instant chat app where all contacts are bots.
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: 'white' }}>
          This is a client for LLM API. It currently supports openAI GPT and google Gemini. 
          You will you need an API key.
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: 'white' }}>
          This is running entirely on your browser. The only network calls are
          the ones for the OpenAI API.
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          Features:
        </Typography>
        <ul>
          <Typography component="li" sx={{ color: 'white' }}>
            Conversations are stored on your browser.
          </Typography>
          <Typography component="li" sx={{ color: 'white' }}>
            With one sentence you can create any character, including an avatar.
          </Typography>
          <Typography component="li" sx={{ color: 'white' }}>
            The prompt has a plan phase where you can inspect why the character
            responded in a certain way.
          </Typography>
          <Typography component="li" sx={{ color: 'white' }}>
            Language models work better when they plan the answer beforehand.
          </Typography>
          <Typography component="li" sx={{ color: 'white' }}>
            With the character profiles the conversation is more focused.
          </Typography>
          <Typography component="li" sx={{ color: 'white' }}>
            Because the character has a profile, you can create characters with
            different opinions.
          </Typography>
          <Typography component="li" sx={{ color: 'white' }}>
            You can create group chats with characters with different opinions
            and learn from them.
          </Typography>
          <Typography component="li" sx={{ color: 'white' }}>
            It is fun.
          </Typography>
        </ul>
        <Button variant="contained" onClick={gotoNextScreen} sx={{ mt: 2 }}>
          Get Started!
        </Button>
      </Box>
    </Screen>
  );
}
