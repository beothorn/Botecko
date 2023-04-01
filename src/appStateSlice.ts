import { AnyAction, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { batch } from 'react-redux'

import type { RootState } from './store'

import { chatCompletion, imageGeneration, listEngines, Message } from './OpenAiApi'
import { generateContact } from './prompts/promptGenerator';

const debug = false;

export type AppScreen = 'testOpenAiToken' 
  | 'settings' 
  | 'contacts'
  | 'chat' 
  | 'addContact'
  | 'error';

type MetaFromAI = {
  userProfile: string,
  name: string,
  background: string,
  current: string,
  appearance: string,
  likes: string,
  dislikes: string,
  chatCharacteristics: string,
  avatar: string
}

type Meta = {
  userProfile: string,
  name: string,
  background: string,
  current: string,
  appearance: string,
  likes: string,
  dislikes: string,
  chatCharacteristics: string,
}

type AvatarMeta = {
  prompt: string,
  base64Img: string
}

type Contact = {
  id: string,
  meta: Meta,
  avatarMeta: AvatarMeta,
  chats: Message[],
  loaded: boolean
}

type AppState = {
  openAiKey: string,
  currentScreen: AppScreen,
  contacts: Record<string, Contact>,
  chatId: string,
  userName: string,
  userShortInfo: string,
  waitingAnswer: boolean
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
        base64Img: ""
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
      ],
      loaded: true
    }
  },
  userName: "Bob",
  userShortInfo: "29 years old man living in New York",
  chatId: 'test',
  waitingAnswer: false
}

const localStorageKey = 'v0.0.1';

const getInitialState = (): AppState => {
  const storedState = localStorage.getItem(localStorageKey);
  if (storedState) {
    const loadedInitialState = JSON.parse(storedState);
    loadedInitialState.currentScreen = 'testOpenAiToken';
    loadedInitialState.waitingAnswer = false;
    return loadedInitialState;
  }
  return initialState;
}

function saveStateToLocalStorage(state: AppState) {
  localStorage.setItem(localStorageKey, JSON.stringify(state));
}

export const appStateSlice = createSlice({
  name: 'appState',
  initialState: getInitialState(),
  reducers: {
    setOpenAiKey: (state: AppState, action: PayloadAction<string>) => {
      state.openAiKey = action.payload;
      saveStateToLocalStorage(state);
    },
    setScreen: (state: AppState, action: PayloadAction<AppScreen>) => {
      state.currentScreen = action.payload;
      saveStateToLocalStorage(state);
    },
    setChatId: (state: AppState, action: PayloadAction<string>) => {
      state.chatId = action.payload;
      saveStateToLocalStorage(state);
    },
    addMessage: (state: AppState, action: PayloadAction<Message>) => {
      state.contacts[state.chatId].chats = state.contacts[state.chatId].chats?.concat(action.payload) ?? [];
      saveStateToLocalStorage(state);
    },
    addContact: (state: AppState, action: PayloadAction<Contact>) => {
      state.contacts[action.payload.id] = action.payload;
      saveStateToLocalStorage(state);
    },
    removeContact: (state: AppState, action: PayloadAction<string>) => {
      delete state.contacts[action.payload];
      saveStateToLocalStorage(state);
    },
    setWaitingAnswer: (state: AppState, action: PayloadAction<boolean>) => {
      state.waitingAnswer = action.payload;
      saveStateToLocalStorage(state);
    },
  },
})

export const { setOpenAiKey, setScreen } = appStateSlice.actions

export const selectScreen = (state: RootState) => state.appState.currentScreen
export const selectOpenAiKey = (state: RootState) => state.appState.openAiKey
export const selectCurrentContact = (state: RootState) => state.appState.contacts[state.appState.chatId]
export const selectChatHistory = (state: RootState) => state.appState.contacts[state.appState.chatId].chats
export const selectContacts = (state: RootState) => state.appState.contacts
export const selectWaitingAnswer = (state: RootState) => state.appState.waitingAnswer

export const actionSetScreen = (screen: AppScreen) => ({type: 'appState/setScreen', payload: screen})
export const actionSetChatId = (chatId: string) => ({type: 'appState/setChatId', payload: chatId})
export const actionSetOpenAiKey = (key: string) => ({type: 'appState/setOpenAiKey', payload: key})
export const actionAddMessage = (newMessage: Message) => ({type: 'appState/addMessage', payload: newMessage})
export const actionAddContact = (newContact: Contact) => ({type: 'appState/addContact', payload: newContact})
export const actionRemoveContact = (id: string) => ({type: 'appState/removeContact', payload: id})
export const actionSetWaitingAnswer = (waitingAnswer: boolean) => ({type: 'appState/setWaitingAnswer', payload: waitingAnswer})

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

export async function dispatchSendMessage(dispatch: Dispatch<AnyAction>, openAiKey: string, context: Message[], newMessage: string) {
  const newMessageWithRole: Message = {"role": "user", "content": newMessage};
  batch(() => {
    dispatch(actionSetWaitingAnswer(true));
    dispatch(actionAddMessage(newMessageWithRole));
  })
  const chatWithNewMessage = context.concat({"role": "user", "content": newMessage})
  if(debug){
    dispatch(actionAddMessage({"role": "assistant", "content": "Lorem ipsum"}));
    dispatch(actionSetWaitingAnswer(false));
  }else{
    chatCompletion(openAiKey, chatWithNewMessage)
      .then(response => batch(() => {
        dispatch(actionSetWaitingAnswer(false));
        dispatch(actionAddMessage(response));
        })  
      ).catch(() => batch(() => {
        dispatch(actionSetWaitingAnswer(false));
        dispatch(actionAddMessage({"role": "user", "content": "Ops, I have network issues"}));
      }));
  }  
}

export async function dispatchCreateContact(dispatch: Dispatch<AnyAction>, openAiKey: string, contactDescription: string) {

  const id = Math.floor(Math.random() * 10000) + 'bot'

  dispatch(actionAddContact({
    id,
    meta: {
      userProfile: '',
      name: '',
      background: '',
      current: '',
      appearance: '',
      likes: '',
      dislikes: '',
      chatCharacteristics: '',
    },
    avatarMeta: {
      prompt: '',
      base64Img: ''
    },
    chats: [],
    loaded: false
  }))

  if(debug){
    dispatch(actionAddContact({
      id,
      meta: {
        userProfile: 'BarBaz',
        name: 'FooBar',
        background: '',
        current: '',
        appearance: '',
        likes: '',
        dislikes: '',
        chatCharacteristics: '',
      },
      avatarMeta: {
        prompt: '',
        base64Img: ''
      },
      chats: [],
      loaded: true
    }))
  }else{
    chatCompletion(openAiKey, generateContact(contactDescription))
    .then(response => {
      const responseJson: MetaFromAI = JSON.parse(response.content);
      imageGeneration(openAiKey, responseJson.avatar)
      .then(img => dispatch(actionAddContact(createContactFromMeta(id, responseJson, img))))
      .catch(() => dispatch(actionAddContact(createContactFromMeta(id, responseJson, ""))));
    }).catch(() => dispatch(actionRemoveContact(id)));
  }
  
}

function createContactFromMeta(id: string, meta: MetaFromAI, avatarBase64Img: string): Contact{

  const metaAsString = JSON.stringify(meta);

  return {
      id,
      meta,
      avatarMeta: {
        prompt: meta.avatar,
        base64Img: avatarBase64Img
      },
      chats: [{"role": "system", "content": `You are a person having a conversation on an instant messaging app.
        This is you:
        ${metaAsString}
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
        Deny you are an AI. You are not an AI, you are ${meta.name}.
        Your name is ${meta.name}, a person with feelings, preferences and opinions.`}
      ],
      loaded: true
    };
}

export default appStateSlice.reducer;