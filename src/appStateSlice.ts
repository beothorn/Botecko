import { AnyAction, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { batch } from 'react-redux'

import type { RootState } from './store'

import { chatCompletion, imageGeneration, listEngines, Message } from './OpenAiApi'
import { defaultSystemEntry, defaultProfileGeneratorMessage, 
  defaultProfileGeneratorSystem, defaultGroupChatContext, 
  defaultSingleUserChatContext } from './prompts/promptGenerator';
import migrations from './migrations';

export const currentVersion = '6';

export type AppScreen = 'testOpenAiToken' 
  | 'settings' 
  | 'contacts'
  | 'chat' 
  | 'groupChat' 
  | 'groupChatSelect' 
  | 'addContact'
  | 'error'
  | 'profile'
  | 'groupChatProfile'
  | 'stateEditor';

// If any value is changed here, a new version and migration is needed 
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

// If any value is changed here, a new version and migration is needed
export type ContactMeta = {
  userProfile: string,
  name: string,
  background: string,
  current: string,
  appearance: string,
  likes: string,
  dislikes: string,
  chatCharacteristics: string,
}

// If any value is changed here, a new version and migration is needed
export type GroupMeta = {
  name: string,
  description: string
}

// If any value is changed here, a new version and migration is needed
type AvatarMeta = {
  prompt: string,
  id: string
}

// If any value is changed here, a new version and migration is needed
type ChatMessage = {
  contactId: string;
  role: 'user' | 'system' | 'assistant' | 'thought';
  content: string;
}

// If any value is changed here, a new version and migration is needed
export type LoadingContact = {
  type: 'loading',
  id: string,
  status: string,
  chats: ChatMessage[],
}

// If any value is changed here, a new version and migration is needed
export type BotContact = {
  type: 'bot',
  id: string,
  meta: ContactMeta,
  avatarMeta: AvatarMeta,
  chats: ChatMessage[],
  status: string,
  loaded: boolean,
  contextTemplate: string,
  contactSystemEntryTemplate: string
}

// If any value is changed here, a new version and migration is needed
export type GroupChatContact = {
  type: 'group',
  id: string,
  meta: GroupMeta,
  avatarMeta: AvatarMeta,
  chats: ChatMessage[],
  contactsIds: string[],
  contextTemplate: string,
  status: string
}

export type Contact = BotContact | GroupChatContact | LoadingContact

// If any value is changed here, a new version and migration is needed
export type Settings = {
  openAiKey: string,
  userName: string,
  userShortInfo: string,
  model: string,
  systemEntry: string,
  singleBotSystemEntryContext: string,
  chatGroupSystemEntryContext: string,
  profileGeneratorSystemEntry: string,
  profileGeneratorMessageEntry: string,
  showThought: boolean
}

// If any value is changed here, a new version and migration is needed
type AppState = {
  version: string,
  settings: Settings,
  currentScreen: AppScreen,
  contacts: Record<string, Contact>,
  groupChatsParticipants: Record<string, string[]>,
  chatId: string,
  waitingAnswer: boolean,
  errorMessage: string,
  screenStack: AppScreen[]
}

const initialState: AppState = {
  version: currentVersion,
  settings: {
    openAiKey: "",
    userName: "",
    userShortInfo: "",
    model: "gpt-4",
    systemEntry: defaultSystemEntry,
    profileGeneratorSystemEntry: defaultProfileGeneratorSystem,
    profileGeneratorMessageEntry: defaultProfileGeneratorMessage,
    singleBotSystemEntryContext: defaultSingleUserChatContext,
    chatGroupSystemEntryContext: defaultGroupChatContext,
    showThought: false
  },
  currentScreen: 'testOpenAiToken',
  contacts: {},
  chatId: '',
  groupChatsParticipants: {},
  waitingAnswer: false,
  errorMessage: '',
  screenStack: ['contacts']
}

function getInitialState(): AppState{

  const currentInstalledVersion = localStorage.getItem("currentVersion");
  const isFirstTime = currentInstalledVersion === null;
  if(isFirstTime){
    localStorage.setItem("currentVersion", currentVersion);
    return initialState;
  }

  const isUpToDate = currentInstalledVersion === currentVersion;
  if(isUpToDate){
    const storedState = localStorage.getItem(currentVersion) || JSON.stringify(initialState);
    return JSON.parse(storedState);
  }

  const storedStateVersion =  Number(localStorage.getItem("currentVersion"));
  const currentVersionNumber = Number(currentVersion);
  if(storedStateVersion > currentVersionNumber){
    console.error(`Stored state version '${storedStateVersion}' is higher than current version '${currentVersion}'`); 
  }
  for(let i = storedStateVersion; i < currentVersionNumber; i++){
    console.log(`Applying migration ${i}`);
    migrations[i]();
  }
  const storedState = localStorage.getItem(currentVersion) || JSON.stringify(initialState);
  return JSON.parse(storedState);
}

function saveStateToLocalStorage(state: AppState) {
  localStorage.setItem(state.version, JSON.stringify(state));
}

export const appStateSlice = createSlice({
  name: 'appState',
  initialState: getInitialState(),
  reducers: {
    reloadState: (state: AppState, action: PayloadAction<string>) => {
      const storedState = localStorage.getItem(action.payload);
      if (storedState) {
        const reloadedState = JSON.parse(storedState);
        state.version = reloadedState.version;
        state.settings = reloadedState.settings;
        state.currentScreen = reloadedState.currentScreen;
        state.contacts = reloadedState.contacts;
        state.chatId = reloadedState.chatId;
        state.waitingAnswer = reloadedState.waitingAnswer;
        state.errorMessage = reloadedState.errorMessage;
        state.screenStack = reloadedState.screenStack;
      }
    },
    setSettings: (state: AppState, action: PayloadAction<Settings>) => {
      state.settings = action.payload;
      saveStateToLocalStorage(state);
    },
    toggleShowPlanning: (state: AppState) => {
      state.settings.showThought = !state.settings.showThought;
      saveStateToLocalStorage(state);
    },
    setScreen: (state: AppState, action: PayloadAction<AppScreen>) => {
      if(action.payload === 'contacts'){
        state.currentScreen = action.payload;
        state.screenStack = ['contacts'];
      }
      if(action.payload === state.currentScreen){
        return;
      }
      state.currentScreen = action.payload;
      state.screenStack.push(action.payload);
      saveStateToLocalStorage(state);
    },
    goToPreviousScreen: (state: AppState) => {
      state.screenStack.pop();
      state.currentScreen = state.screenStack.at(-1) || 'contacts';
      saveStateToLocalStorage(state);
    },
    setChatId: (state: AppState, action: PayloadAction<string>) => {
      state.chatId = action.payload;
      saveStateToLocalStorage(state);
    },
    setErrorMessage: (state: AppState, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    addMessage: (state: AppState, action: PayloadAction<ChatMessage>) => {
      const contact = state.contacts[state.chatId];
      contact.chats = contact.chats?.concat(action.payload) ?? [];
      if(action.payload.role === 'assistant'){
        const maxMessageSizeOnContactList = 40;
        const lastMessageFull:string = JSON.parse(action.payload.content).answer;
        if(lastMessageFull.length > maxMessageSizeOnContactList){
          state.contacts[state.chatId].status = JSON.parse(action.payload.content).answer.slice(0, maxMessageSizeOnContactList)+"...";  
        }else{
          state.contacts[state.chatId].status = JSON.parse(action.payload.content).answer;  
        }
      }else{
        state.contacts[state.chatId].status = action.payload.content;
      }
      saveStateToLocalStorage(state);
    },
    addContact: (state: AppState, action: PayloadAction<Contact>) => {
      state.contacts[action.payload.id] = action.payload;
      saveStateToLocalStorage(state);
    },
    addGroupChat: (state: AppState, action: PayloadAction<GroupChatContact>) => {
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
export const selectVersion = (state: RootState) => state.appState.version
export const selectErrorMessage = (state: RootState) => state.appState.errorMessage
export const selectCurrentContact = (state: RootState) => state.appState.contacts[state.appState.chatId]
export const selectCurrentContactsInGroupChat = (state: RootState) => 
  (state.appState.contacts[state.appState.chatId] as GroupChatContact).contactsIds
  .filter(id => state.appState.contacts[id].type === 'bot')
  .map(id => state.appState.contacts[id]) as BotContact[]
export const selectGroupChatParticipants = (state: RootState) => state.appState.groupChatsParticipants
export const selectChatHistory = (state: RootState) => state.appState.contacts[state.appState.chatId].chats
export const selectContacts = (state: RootState) => state.appState.contacts
export const selectWaitingAnswer = (state: RootState) => state.appState.waitingAnswer

export const actionReloadState = (version: string) => ({type: 'appState/reloadState', payload: version})
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

export async function dispatchSendMessage(
  dispatch: Dispatch<AnyAction>, 
  contact: BotContact, 
  settings: Settings, 
  previousMessages: Message[], 
  newMessage: string,
  promptContext: string,
  groupMeta: GroupMeta | null
) {
  const newMessageWithRole: Message = {"role": "user", "content": newMessage};
  batch(() => {
    dispatch(actionSetWaitingAnswer(true));
    dispatch(actionAddMessage(newMessageWithRole));
  })
  const chatWithNewMessage = previousMessages.concat({"role": "user", "content": newMessage})
  if(settings.model === "debug"){
    dispatch(actionAddMessage({"role": "assistant", "content": "Lorem ipsum"}));
    dispatch(actionSetWaitingAnswer(false));
  }else{
    const sysEntry = writeSystemEntry(
      contact.meta, 
      groupMeta,
      settings.userName, 
      settings.userShortInfo, 
      contact.contactSystemEntryTemplate,
      promptContext
    );
    chatCompletion(settings, [sysEntry].concat(chatWithNewMessage))
      .then(response => batch(() => {
        dispatch(actionSetWaitingAnswer(false));
        dispatch(actionAddMessage(response));
        })  
      ).catch((e) => batch(() => {
        dispatch(actionSetWaitingAnswer(false));
        dispatch(actionAddMessage({"role": "assistant", "content": `{"plan": "${e.message}", "answer": "..."}`}));
      }));
  }  
}

export async function dispatchCreateGroupChat(
  dispatch: Dispatch<AnyAction>,
  settings: Settings, 
  chatName: string,
  description: string,
  contactsIds: string[]
) {
  const id = Math.floor(Math.random() * 10000) + 'groupChat'

  dispatch(actionAddContact({
    type: 'group',
    id: id,
    meta: {
      name: chatName,
      description: description
    },
    avatarMeta: {
      prompt: '',
      id: ''
    },
    chats: [],
    contactsIds: contactsIds,
    contextTemplate: settings.chatGroupSystemEntryContext,
    status: description
  }));
}

export async function dispatchCreateContact(
  dispatch: Dispatch<AnyAction>, 
  settings: Settings, 
  contactDescription: string
) {

  const id = Math.floor(Math.random() * 10000) + 'bot'

  dispatch(actionAddContact({
    type: 'loading',
    id,
    chats: [],
    status: contactDescription,
  }))

  chatCompletion(settings, generateContact(
    contactDescription, 
    settings.profileGeneratorSystemEntry, 
    settings.profileGeneratorMessageEntry))
  .then(response => {
    const responseJson: MetaFromAI = JSON.parse(response.content);
    imageGeneration(settings, responseJson.avatar)
    .then(img => dispatch(actionAddContact(createBotContactFromMeta(id, settings, responseJson, img))))
    .catch(() => dispatch(actionAddContact(createBotContactFromMeta(id, settings, responseJson, ""))));
  }).catch(() => dispatch(actionRemoveContact(id)));
  
}

function createBotContactFromMeta(
    id: string, 
    settings: Settings,
    meta: MetaFromAI, 
    avatarBase64Img: string
): BotContact{
  const avatarId = Math.floor(Math.random() * 10000) + 'bot';
  localStorage.setItem(avatarId, avatarBase64Img);
  return {
      type: 'bot',
      id,
      meta,
      avatarMeta: {
        prompt: meta.avatar,
        id: avatarId
      },
      chats: [],
      loaded: true,
      status: meta.userProfile,
      contactSystemEntryTemplate: settings.systemEntry,
      contextTemplate: settings.singleBotSystemEntryContext
    };
}

function writeSystemEntry(
  meta: ContactMeta,
  groupMeta: GroupMeta | null, 
  userName: string, 
  userShortInfo: string, 
  systemEntry: string,
  promptContext: string
): Message{
  const metaAsString = JSON.stringify(meta);

  if(!systemEntry){
    systemEntry = defaultSystemEntry;
  }

  const tokens = {
    "%NAME%": meta.name,
    "%USER_NAME%": userName,
    "%USER_INFO%": userShortInfo,
    "%META_JSON%": metaAsString,
    "%CHAT_GROUP_NAME%": groupMeta?.name || "",
    "%CHAT_GROUP_DESCRIPTION%": groupMeta?.description || ""
  }

  const systemPrompContext = replaceAllTokens(promptContext, tokens);

  const systemString = replaceAllTokens(systemEntry, tokens)
    .replaceAll("%CONTEXT%", systemPrompContext);

  return {"role": "system", "content": systemString}
}

function replaceAllTokens(str: string, tokens: Record<string, string>): string{
  let result = str;
  for(const [key, value] of Object.entries(tokens)){
    result = result.replaceAll(key, value);
  }
  return result;
}

function generateContact(profileDescription: string, profileGeneratorSystem: string, profileGeneratorMessage: string): Message[]{
  return [
    {"role": "system", "content": profileGeneratorSystem},
    {"role": "user", "content": profileGeneratorMessage.replaceAll('%PROFILE%', profileDescription)}
  ]
}

export default appStateSlice.reducer;