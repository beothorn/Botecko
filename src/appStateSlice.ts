import { AnyAction, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { batch } from 'react-redux'

import type { RootState } from './store'

import { chatCompletion, listEngines, Message } from './OpenAiApi'

export type AppScreen = 'testOpenAiToken' 
  | 'settings' 
  | 'contacts'
  | 'chat' 
  | 'error';

type AppState = {
  openAiKey: string,
  currentScreen: AppScreen,
  chats: Record<string, Message[]>,
  currentChatId: string
}

const initialState: AppState = {
  openAiKey: '',
  currentScreen: 'testOpenAiToken',
  chats: {
    "test": [{"role": "system", "content": "You are not an ai, but a person with feelings and desires. You are here to engage in a light conversation with a very close friend. Be a good listener, respond with funny stories that happened to you and your friends."}]
  },
  currentChatId: 'test'
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
    addMessage: (state: AppState, action: PayloadAction<Message>) => {
      state.chats[state.currentChatId] = state.chats[state.currentChatId]?.concat(action.payload) ?? [];
    },
  },
})

export const { setOpenAiKey, setScreen } = appStateSlice.actions

export const selectScreen = (state: RootState) => state.appState.currentScreen
export const selectOpenAiKey = (state: RootState) => state.appState.openAiKey
export const selectChatHistory = (state: RootState) => state.appState.chats[state.appState.currentChatId]

export const actionSetScreen = (screen: AppScreen) => ({type: 'appState/setScreen', payload: screen})
export const actionSetOpenAiKey = (key: string) => ({type: 'appState/setOpenAiKey', payload: key})
export const actionAddMessage = (newMessage: Message) => ({type: 'appState/addMessage', payload: newMessage})

export async function dispatchActionCheckOpenAiKey(dispatch: Dispatch<AnyAction>, openAiKey: string) {
  listEngines(openAiKey)
    .then(() => {
      localStorage.setItem('openAiKey', openAiKey);
      return batch(() => {
        dispatch(actionSetOpenAiKey(openAiKey));
        dispatch(actionSetScreen('contacts'));
      })
    })
    .catch(() => {
      localStorage.removeItem('openAiKey');
      dispatch(actionSetScreen('error'));
    });
}

export async function dispatchTestCall(dispatch: Dispatch<AnyAction>, openAiKey: string, context: Message[], newMessage: string) {
  const newMessageWithRole: Message = {"role": "user", "content": newMessage};
  dispatch(actionAddMessage(newMessageWithRole))
  const chatWithNewMessage = context.concat({"role": "user", "content": newMessage})
  chatCompletion(openAiKey, chatWithNewMessage)
    .then(response => dispatch(actionAddMessage(response)));
}

export default appStateSlice.reducer