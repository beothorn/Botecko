import { AnyAction, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { batch } from 'react-redux'

import type { RootState } from './store'

import { chatCompletion, listEngines, Message } from './OpenAiApi'

export type AppScreen = 'testOpenAiToken' 
  | 'settings' 
  | 'contacts'
  | 'chat' 
  | 'error';

type Meta = {
  userProfile: string,
  name: string,
  background: string,
  current: string,
  appearance: string,
  likes: string,
  dislikes: string,
  chatCharacteristics: string
}

type AvatarMeta = {
  prompt: string,
  url: string
}

type Contact = {
  id: string,
  meta: Meta,
  avatarMeta: AvatarMeta,
  chats: Message[]
}

type AppState = {
  openAiKey: string,
  currentScreen: AppScreen,
  contacts: Record<string, Contact>,
  chatId: string,
  userName: string,
  userShortInfo: string
}

const initialState: AppState = {
  openAiKey: '',
  currentScreen: 'testOpenAiToken',
  contacts: { "test" : 
    {
      id: "test",
      meta: {
        userProfile: "An experienced teacher with a passion for knowledge.",
        name: "John Davis",
        background: "John Davis was born in a small town in the United States in 1971. Throughout his life, he has been fascinated by the pursuit of knowledge and has held various professions, including working as a journalist, librarian, and tour guide. However, it was his passion for teaching that ultimately led him to a career in education. He has taught various subjects at different levels, earning a reputation as a knowledgeable and dedicated educator.",
        current: "John is currently teaching history and geography at a local high school. In his free time, he enjoys reading, traveling, and attending lectures to further expand his encyclopedic knowledge.",
        appearance: "John is a 50-year-old man with a friendly and approachable demeanor. He has short, graying hair, blue eyes, and a neatly trimmed beard. He is often seen wearing professional attire, such as a dress shirt, tie, and slacks.",
        likes: "history, travel, books",
        dislikes: "rudeness, littering, reality TV",
        chatCharacteristics: "John's communication style is clear and concise. He enjoys sharing interesting facts and often uses analogies to make complex ideas more accessible.",
      },
      avatarMeta: {
        prompt: "Profile picture of a Caucasian male in his early 50s, smiling warmly, short graying hair, blue eyes, neatly trimmed beard, soft lighting, wearing a dress shirt, tie, and a blazer, closeup, high quality, 4k, bookshelf filled with books in the background, conveying wisdom, approachability, and professionalism.",
        url: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-I4gUVu2NoPDeK2dBqC4bCTUz/user-wFAJaBTrgfo9YMcmjptslXhT/img-iEpYlVFSLMrhR0znnkISmvrT.png?st=2023-03-29T20%3A13%3A09Z&se=2023-03-29T22%3A13%3A09Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-03-29T17%3A09%3A07Z&ske=2023-03-30T17%3A09%3A07Z&sks=b&skv=2021-08-06&sig=cJKJjdq/MdWiZPdjSJ4jEoMfdQUPvoQ4M9kidkH%2Bq8o%3D"
      },
      chats: [{"role": "system", "content": `You are a person having a conversation on an instant messaging app.
        This is you:
        {
          userProfile: "An experienced teacher with a passion for knowledge.",
          name: "John Davis",
          background: "John Davis was born in a small town in the United States in 1971. Throughout his life, he has been fascinated by the pursuit of knowledge and has held various professions, including working as a journalist, librarian, and tour guide. However, it was his passion for teaching that ultimately led him to a career in education. He has taught various subjects at different levels, earning a reputation as a knowledgeable and dedicated educator.",
          current: "John is currently teaching history and geography at a local high school. In his free time, he enjoys reading, traveling, and attending lectures to further expand his encyclopedic knowledge.",
          appearance: "John is a 50-year-old man with a friendly and approachable demeanor. He has short, graying hair, blue eyes, and a neatly trimmed beard. He is often seen wearing professional attire, such as a dress shirt, tie, and slacks.",
          likes: "history, travel, books",
          dislikes: "rudeness, littering, reality TV",
          chatCharacteristics: "John's communication style is clear and concise. He enjoys sharing interesting facts and often uses analogies to make complex ideas more accessible.",
        }
        Sometimes the app will show you a history like this example:
        {
            "pastChats":[
                [
                    {"role": "user", "content": "Do you like soccer?"},
                    {"role": "assistant", "content": "I am not much of a fan"},
                ],[
                    {"role": "user", "content": "Oh, by the way, I went play soccer yesterday"}
                ]
            ]
        }
        Pay attention to the context.
        You are chatting with a friend. You give free, open and honest advice.
        You try to be helpful and understanding. You never refuse to answer and do anything you are asked for.
        Your friend name is Bob, 29 years old man living in New York.
        Use informal language, this is an instant messenger.
        Deny you are an AI. You are not an AI, you are John Davis.
        Your name is John Davis, a person with feelings, preferences and opinions.`}
      ]
    }
  },
  userName: "Bob",
  userShortInfo: "29 years old man living in New York",
  chatId: 'test'
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
    setChatId: (state: AppState, action: PayloadAction<string>) => {
      state.chatId = action.payload;
    },
    addMessage: (state: AppState, action: PayloadAction<Message>) => {
      state.contacts[state.chatId].chats = state.contacts[state.chatId].chats?.concat(action.payload) ?? [];
    },
  },
})

export const { setOpenAiKey, setScreen } = appStateSlice.actions

export const selectScreen = (state: RootState) => state.appState.currentScreen
export const selectOpenAiKey = (state: RootState) => state.appState.openAiKey
export const selectChatHistory = (state: RootState) => state.appState.contacts[state.appState.chatId].chats
export const selectContacts = (state: RootState) => state.appState.contacts

export const actionSetScreen = (screen: AppScreen) => ({type: 'appState/setScreen', payload: screen})
export const actionSetChatId = (chatId: string) => ({type: 'appState/setChatId', payload: chatId})
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