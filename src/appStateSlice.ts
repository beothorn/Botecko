import { AnyAction, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { batch } from 'react-redux'

import type { RootState } from './store'

import { chatCompletion, imageGeneration, listEngines, Message } from './OpenAiApi'
import { defaultSystemEntry, defaultProfileGeneratorMessage, defaultProfileGeneratorSystem } from './prompts/promptGenerator';

export type AppScreen = 'testOpenAiToken' 
  | 'settings' 
  | 'contacts'
  | 'chat' 
  | 'addContact'
  | 'error'
  | 'profile';

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
  lastMessage: string,
  loaded: boolean
}

export type Settings = {
  openAiKey: string,
  userName: string,
  userShortInfo: string,
  model: string,
  systemEntry: string,
  profileGeneratorSystemEntry: string,
  profileGeneratorMessageEntry: string,
  showThought: boolean
}

type AppState = {
  settings: Settings,
  currentScreen: AppScreen,
  contacts: Record<string, Contact>,
  chatId: string,
  waitingAnswer: boolean,
  errorMessage: string,
  previousScreen: AppScreen
}

const initialState: AppState = {
  settings: {
    openAiKey: "",
    userName: "",
    userShortInfo: "",
    model: "gpt-4",
    systemEntry: defaultSystemEntry,
    profileGeneratorSystemEntry: defaultProfileGeneratorSystem,
    profileGeneratorMessageEntry: defaultProfileGeneratorMessage,
    showThought: false
  },
  currentScreen: 'testOpenAiToken',
  contacts: {},
  chatId: '',
  waitingAnswer: false,
  errorMessage: '',
  previousScreen: 'contacts'
}

const localStorageKey = 'v1.0.0';

function getInitialState(): AppState{
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
    setSettings: (state: AppState, action: PayloadAction<Settings>) => {
      state.settings = action.payload;
      saveStateToLocalStorage(state);
    },
    toggleShowPlanning: (state: AppState) => {
      state.settings.showThought = !state.settings.showThought;
      saveStateToLocalStorage(state);
    },
    setScreen: (state: AppState, action: PayloadAction<AppScreen>) => {
      state.previousScreen = state.currentScreen; 
      state.currentScreen = action.payload;
      saveStateToLocalStorage(state);
    },
    goToPreviousScreen: (state: AppState) => {
      state.currentScreen = state.previousScreen;
      saveStateToLocalStorage(state);
    },
    setChatId: (state: AppState, action: PayloadAction<string>) => {
      state.chatId = action.payload;
      saveStateToLocalStorage(state);
    },
    setErrorMessage: (state: AppState, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    addMessage: (state: AppState, action: PayloadAction<Message>) => {
      state.contacts[state.chatId].chats = state.contacts[state.chatId].chats?.concat(action.payload) ?? [];
      if(action.payload.role === 'assistant'){
        const maxMessageSizeOnContactList = 40;
        const lastMessageFull:string = JSON.parse(action.payload.content).answer;
        if(lastMessageFull.length > maxMessageSizeOnContactList){
          state.contacts[state.chatId].lastMessage = JSON.parse(action.payload.content).answer.slice(0, maxMessageSizeOnContactList)+"...";  
        }else{
          state.contacts[state.chatId].lastMessage = JSON.parse(action.payload.content).answer;  
        }
      }else{
        state.contacts[state.chatId].lastMessage = action.payload.content;
      }
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

export const selectScreen = (state: RootState) => state.appState.currentScreen
export const selectSettings = (state: RootState) => state.appState.settings
export const selectErrorMessage = (state: RootState) => state.appState.errorMessage
export const selectCurrentContact = (state: RootState) => state.appState.contacts[state.appState.chatId]
export const selectChatHistory = (state: RootState) => state.appState.contacts[state.appState.chatId].chats
export const selectContacts = (state: RootState) => state.appState.contacts
export const selectWaitingAnswer = (state: RootState) => state.appState.waitingAnswer

export const actionSetScreen = (screen: AppScreen) => ({type: 'appState/setScreen', payload: screen})
export const actionGoToPreviousScreen = () => ({type: 'appState/goToPreviousScreen'})
export const actionSetChatId = (chatId: string) => ({type: 'appState/setChatId', payload: chatId})
export const actionSetSettings = (settings: Settings) => ({type: 'appState/setSettings', payload: settings})
export const actionToggleShowPlanning = () => ({type: 'appState/toggleShowPlanning'})
export const actionSetErrorMessage = (error: string) => ({type: 'appState/setErrorMessage', payload: error})
export const actionAddMessage = (newMessage: Message) => ({type: 'appState/addMessage', payload: newMessage})
export const actionAddContact = (newContact: Contact) => ({type: 'appState/addContact', payload: newContact})
export const actionRemoveContact = (id: string) => ({type: 'appState/removeContact', payload: id})
export const actionSetWaitingAnswer = (waitingAnswer: boolean) => ({type: 'appState/setWaitingAnswer', payload: waitingAnswer})

export async function dispatchActionCheckOpenAiKey(dispatch: Dispatch<AnyAction>, settings: Settings) {
  listEngines(settings)
    .then(() => {
      return batch(() => {
        dispatch(actionSetSettings(settings));
        dispatch(actionSetScreen('contacts'));
      })
    })
    .catch(() => {
      batch(() => {
        dispatch(actionSetErrorMessage("Bad openAI key"));
        dispatch(actionSetScreen('error'));
      })
    });
}

export async function dispatchSendMessage(dispatch: Dispatch<AnyAction>, contact: Contact, settings: Settings, context: Message[], newMessage: string) {
  const newMessageWithRole: Message = {"role": "user", "content": newMessage};
  batch(() => {
    dispatch(actionSetWaitingAnswer(true));
    dispatch(actionAddMessage(newMessageWithRole));
  })
  const chatWithNewMessage = context.concat({"role": "user", "content": newMessage})
  if(settings.model === "debug"){
    dispatch(actionAddMessage({"role": "assistant", "content": "Lorem ipsum"}));
    dispatch(actionSetWaitingAnswer(false));
  }else{
    chatCompletion(settings, [writeSystemEntry(contact.meta, settings.userName, settings.userShortInfo, settings.systemEntry)].concat(chatWithNewMessage))
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

export async function dispatchCreateContact(dispatch: Dispatch<AnyAction>, settings: Settings, contactDescription: string) {

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
    loaded: false,
    lastMessage: ''
  }))

  if(settings.model === "debug"){
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
      loaded: true,
      lastMessage: ''
    }))
  }else{
    chatCompletion(settings, generateContact(contactDescription, settings.profileGeneratorSystemEntry, settings.profileGeneratorMessageEntry))
    .then(response => {
      const responseJson: MetaFromAI = JSON.parse(response.content);
      imageGeneration(settings, responseJson.avatar)
      .then(img => dispatch(actionAddContact(createContactFromMeta(id, responseJson, img))))
      .catch(() => dispatch(actionAddContact(createContactFromMeta(id, responseJson, ""))));
    }).catch(() => dispatch(actionRemoveContact(id)));
  }
  
}

function createContactFromMeta(id: string, meta: MetaFromAI, avatarBase64Img: string): Contact{
  return {
      id,
      meta,
      avatarMeta: {
        prompt: meta.avatar,
        base64Img: avatarBase64Img
      },
      chats: [],
      loaded: true,
      lastMessage: meta.userProfile
    };
}

function writeSystemEntry(meta: Meta, userName: string, userShortInfo: string, systemEntry: string): Message{
  const metaAsString = JSON.stringify(meta);

  if(!systemEntry){
    systemEntry = defaultSystemEntry;
  }

  const systemString = systemEntry
    .replaceAll("%NAME%", meta.name)
    .replaceAll("%USER_NAME%", userName)
    .replaceAll("%USER_INFO%", userShortInfo)
    .replaceAll("%META_JSON%", metaAsString);

  return {"role": "system", "content": systemString}
}

function generateContact(profileDescription: string, profileGeneratorSystem: string, profileGeneratorMessage: string): Message[]{
  return [
    {"role": "system", "content": profileGeneratorSystem},
    {"role": "user", "content": profileGeneratorMessage.replaceAll('%PROFILE%', profileDescription)}
  ]
}

export default appStateSlice.reducer;