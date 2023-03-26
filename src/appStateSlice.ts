import { AnyAction, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { batch } from 'react-redux'

import type { RootState } from './store'

import { chatCompletion, listEngines } from './OpenAiApi'

export type AppScreen = 'testOpenAiToken' 
  | 'settings' 
  | 'contacts'
  | 'chat' 
  | 'error';

type AppState = {
  openAiKey: string,
  currentScreen: AppScreen,
}

const initialState: AppState = {
  openAiKey: '',
  currentScreen: 'testOpenAiToken',
}

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setOpenAiKey: (state: AppState, action: PayloadAction<string>) => {
      state.openAiKey = action.payload;
    },
    setScreen: (state: AppState, action: PayloadAction<AppScreen>) => {
      state.currentScreen = action.payload;
    },
  },
})

export const { setOpenAiKey, setScreen } = appStateSlice.actions

export const selectScreen = (state: RootState) => state.appState.currentScreen
export const selectOpenAiKey = (state: RootState) => state.appState.openAiKey

export const actionSetScreen = (screen: AppScreen) => ({type: 'appState/setScreen', payload: screen})
export const actionSetOpenAiKey = (key: string) => ({type: 'appState/setOpenAiKey', payload: key})

export async function dispatchActionCheckOpenAiKey(dispatch: Dispatch<AnyAction>, openAiKey: string) {
  listEngines(openAiKey)
    .then(() => {
      localStorage.setItem('openAiKey', openAiKey);
      return batch(() => {
        dispatch(actionSetOpenAiKey(openAiKey));
        dispatch(actionSetScreen('contacts'));
      })
    })
    .catch(() => dispatch(actionSetScreen('error')));
}

export async function dispatchTestCall(_dispatch: Dispatch<AnyAction>, openAiKey: string) {
  chatCompletion(openAiKey, [
    {"role": "system", "content": "You are a sports fan. Never say you are an AI. Your name is Jhon Jhonson, a person with feelings, preferences and opinions."},
    {"role": "user", "content": "Do you like soccer?"},
    {"role": "assistant", "content": "I am not much of a fan"},
    {"role": "user", "content": "Do you like tennis?"},
  ]).then(x => console.log(x));
}

export default appStateSlice.reducer