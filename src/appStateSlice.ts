import { AnyAction, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { batch } from 'react-redux'

import type { RootState } from './store'

import { chatCompletion, imageGeneration, listEngines, Message, RoleType } from './OpenAiApi'
import { defaultGroupChatContext, defaultProfileGeneratorMessage, defaultProfileGeneratorSystem, defaultSingleUserChatContext, defaultSystemEntry } from './prompts/promptGenerator';
import { addAvatar, deleteDB, getAppState, updateAppState } from './persistence/indexeddb';
import migrations from './migrations';
import { countWords } from './utils/StringUtils';

/*
TODO: Break down this file, break down state.
This is too big :(
*/

export const currentVersion = '16';

const MAX_WORD_SIZE = 2000;

export type AppScreen = 'welcome'
  | 'loading' 
  | 'testOpenAiToken' 
  | 'settings' 
  | 'contacts'
  | 'chat' 
  | 'groupChatSelect' 
  | 'addContact'
  | 'error'
  | 'errorWithDelete'
  | 'profile'
  | 'groupChatProfile';

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
  role: RoleType;
  content: string;
  timestamp: number;
  wordCount: number;
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
  contacts: BotContact[], // Needs migration
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
type VolatileState = {
  currentScreen: AppScreen,
  chatId: string,
  waitingAnswer: boolean,
  errorMessage: string,
  screenStack: AppScreen[]
}

// If any value is changed here, a new version and migration is needed
export type AppState = {
  version: string,
  settings: Settings,
  contacts: Record<string, Contact>,
  groupChatsParticipants: Record<string, string[]>,
  volatileState: VolatileState
}

export type AvatarImg = {
  id: string,
  img: string
}

function saveStateToPersistence(state: AppState) {
  updateAppState(state);
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
  contacts: {},
  groupChatsParticipants: {},
  volatileState: {
    currentScreen: 'loading',
    chatId: '',
    waitingAnswer: false,
    errorMessage: '',
    screenStack: []
  }
}

export const appStateSlice = createSlice({
  name: 'appState',
  initialState: initialState,
  reducers: {
    reloadState: (state: AppState, action: PayloadAction<AppState>) => {
      // TODO: Copy all properties
      const reloadedState = action.payload;
      state.version = reloadedState.version;
      state.settings = reloadedState.settings;
      state.volatileState.currentScreen = reloadedState.volatileState.currentScreen;
      state.contacts = reloadedState.contacts;
      state.groupChatsParticipants = reloadedState.groupChatsParticipants;
      state.volatileState.chatId = reloadedState.volatileState.chatId;
      state.volatileState.waitingAnswer = reloadedState.volatileState.waitingAnswer;
      state.volatileState.errorMessage = reloadedState.volatileState.errorMessage;
      state.volatileState.screenStack = reloadedState.volatileState.screenStack;
    },
    setSettings: (state: AppState, action: PayloadAction<Settings>) => {
      state.settings = action.payload;
      saveStateToPersistence(state);
    },
    toggleShowPlanning: (state: AppState) => {
      state.settings.showThought = !state.settings.showThought;
      saveStateToPersistence(state);
    },
    setScreen: (state: AppState, action: PayloadAction<AppScreen>) => {
      if(action.payload === 'contacts'){
        state.volatileState.currentScreen = action.payload;
        state.volatileState.screenStack = ['contacts'];
      }
      if(action.payload === state.volatileState.currentScreen){
        return;
      }
      state.volatileState.currentScreen = action.payload;
      state.volatileState.screenStack.push(action.payload);
      saveStateToPersistence(state);
    },
    goToPreviousScreen: (state: AppState) => {
      state.volatileState.screenStack.pop();
      state.volatileState.currentScreen = state.volatileState.screenStack.at(-1) || 'contacts';
      saveStateToPersistence(state);
    },
    setChatId: (state: AppState, action: PayloadAction<string>) => {
      state.volatileState.chatId = action.payload;
      saveStateToPersistence(state);
    },
    setErrorMessage: (state: AppState, action: PayloadAction<string>) => {
      state.volatileState.errorMessage = action.payload;
    },
    addMessage: (state: AppState, action: PayloadAction<ChatMessage>) => {
      const contact = state.contacts[state.volatileState.chatId];
      contact.chats = contact.chats?.concat(action.payload) ?? [];
      if(action.payload.role === 'assistant'){
        const maxMessageSizeOnContactList = 40;
        let parsedChatMessage = {
          message:""
        };
        try{
          parsedChatMessage = JSON.parse(action.payload.content);
        }catch(e){  
          parsedChatMessage = {
            message:""
          }
        }
        const lastMessageFull:string = JSON.parse(action.payload.content).message;
        if(lastMessageFull.length > maxMessageSizeOnContactList){
          state.contacts[state.volatileState.chatId].status = parsedChatMessage.message.slice(0, maxMessageSizeOnContactList)+"...";  
        }else{
          state.contacts[state.volatileState.chatId].status = parsedChatMessage.message;  
        }
      }else{
        state.contacts[state.volatileState.chatId].status = action.payload.content;
      }
      saveStateToPersistence(state);
    },
    addContact: (state: AppState, action: PayloadAction<Contact>) => {
      state.contacts[action.payload.id] = action.payload;
      saveStateToPersistence(state);
    },
    addGroupChat: (state: AppState, action: PayloadAction<GroupChatContact>) => {
      state.contacts[action.payload.id] = action.payload;
      saveStateToPersistence(state);
    },
    removeContact: (state: AppState, action: PayloadAction<string>) => {
      delete state.contacts[action.payload];
      saveStateToPersistence(state);
    },
    setWaitingAnswer: (state: AppState, action: PayloadAction<boolean>) => {
      state.volatileState.waitingAnswer = action.payload;
      const name = (state.contacts[state.volatileState.chatId] as BotContact).meta.name;
      state.contacts[state.volatileState.chatId].status = `${name} is typing...`;
      saveStateToPersistence(state);
    },
    deleteMessage: (state: AppState, action: PayloadAction<number>) => {
      const contact = state.contacts[state.volatileState.chatId];
      contact.chats = contact.chats.filter(c => c.timestamp !== action.payload);
      saveStateToPersistence(state);
    },
    copyMessage: (state: AppState, action: PayloadAction<number>) => {
      const contact = state.contacts[state.volatileState.chatId];
      contact.chats.filter(c => c.timestamp === action.payload)
        .forEach(c =>navigator.clipboard.writeText(c.content));
    },
    clearStorage: (state: AppState) => {
      localStorage.clear();
      deleteDB();
      const reloadedState = initialState;
      state.version = reloadedState.version;
      state.settings = reloadedState.settings;
      state.volatileState.currentScreen = reloadedState.volatileState.currentScreen;
      state.contacts = reloadedState.contacts;
      state.groupChatsParticipants = reloadedState.groupChatsParticipants;
      state.volatileState.chatId = reloadedState.volatileState.chatId;
      state.volatileState.waitingAnswer = reloadedState.volatileState.waitingAnswer;
      state.volatileState.errorMessage = reloadedState.volatileState.errorMessage;
      state.volatileState.screenStack = reloadedState.volatileState.screenStack;
    },
  },
});

export const selectScreen = (state: RootState) => state.appState.volatileState.currentScreen
export const selectSettings = (state: RootState) => state.appState.settings
export const selectVersion = (state: RootState) => state.appState.version
export const selectErrorMessage = (state: RootState) => state.appState.volatileState.errorMessage
export const selectCurrentContact = (state: RootState) => state.appState.contacts[state.appState.volatileState.chatId]
export const selectCurrentContactsInGroupChat = (state: RootState) => 
  (state.appState.contacts[state.appState.volatileState.chatId] as GroupChatContact).contacts
  .filter(contact => state.appState.contacts[contact.id].type === 'bot') as BotContact[]
export const selectGroupChatParticipants = (state: RootState) => state.appState.groupChatsParticipants
export const selectChatHistory = (state: RootState) => state.appState.contacts[state.appState.volatileState.chatId].chats
export const selectContacts = (state: RootState) => state.appState.contacts
export const selectWaitingAnswer = (state: RootState) => state.appState.volatileState.waitingAnswer

export const actionReloadState = (newState: AppState) => ({type: 'appState/reloadState', payload: newState})
export const actionClearStorage = () => ({type: 'appState/clearStorage'})
export const actionSetScreen = (screen: AppScreen) => ({type: 'appState/setScreen', payload: screen})
export const actionGoToPreviousScreen = () => ({type: 'appState/goToPreviousScreen'})
export const actionSetChatId = (chatId: string) => ({type: 'appState/setChatId', payload: chatId})
export const actionSetSettings = (settings: Settings) => ({type: 'appState/setSettings', payload: settings})
export const actionToggleShowPlanning = () => ({type: 'appState/toggleShowPlanning'})
export const actionSetErrorMessage = (error: string) => ({type: 'appState/setErrorMessage', payload: error})
export const actionAddMessage = (newMessage: ChatMessage) => ({type: 'appState/addMessage', payload: newMessage})
export const actionAddContact = (newContact: Contact) => ({type: 'appState/addContact', payload: newContact})
export const actionRemoveContact = (id: string) => ({type: 'appState/removeContact', payload: id})
export const actionSetWaitingAnswer = (waitingAnswer: boolean) => ({type: 'appState/setWaitingAnswer', payload: waitingAnswer})
export const actionDeleteMessage = (timestamp: number) => ({type: 'appState/deleteMessage', payload: timestamp})
export const actionCopyMessage = (timestamp: number) => ({type: 'appState/copyMessage', payload: timestamp})

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

function cleanAndLimitMessagesSize(sysEntry: Message, messages: ChatMessage[]): Message[]{
  const messagesWithoutErrors = messages.filter(m => m.role !== 'error');

  let totalWords = countWords(sysEntry.content);
  console.log(`SysEntry size in word is ${totalWords}`);
  let startIndex = 0;

  for(let i= messagesWithoutErrors.length-1; i >= 0; i--){
    const msgWordCount = messagesWithoutErrors[i].wordCount;
    if(totalWords + msgWordCount  >= MAX_WORD_SIZE){
      break;
    }
    totalWords += msgWordCount;
    startIndex = i;
  }

  console.log(`Prompt size in word is ${totalWords}`);

  const chatWithLimitedSize = messagesWithoutErrors.slice(startIndex);

  const chatWithOnlyExpectedData = chatWithLimitedSize.map(c => ({
    "role": c.role,
    "content": c.content
  }));

  return [sysEntry].concat(chatWithOnlyExpectedData)
}

export async function dispatchSendMessage(
  dispatch: Dispatch<AnyAction>, 
  contact: BotContact, 
  settings: Settings, 
  previousMessages: ChatMessage[], 
  newMessage: string,
  promptContext: string,
  groupMeta: GroupMeta | null
) {
  const newMessageWithRole: ChatMessage = {
    "contactId": "user", 
    "role": "user", 
    "content": newMessage, 
    "wordCount": countWords(newMessage),
    "timestamp": Date.now()
  };
  batch(() => {
    dispatch(actionSetWaitingAnswer(true));
    dispatch(actionAddMessage(newMessageWithRole));
  })

  

  const chatWithNewMessage: ChatMessage[] = previousMessages.concat(newMessageWithRole);

  const sysEntry = writeSystemEntry(
    contact.meta, 
    groupMeta,
    settings.userName, 
    settings.userShortInfo, 
    contact.contactSystemEntryTemplate,
    promptContext
  );

  const finalPrompt = cleanAndLimitMessagesSize(sysEntry, chatWithNewMessage);
  
  chatCompletion(settings, finalPrompt)
    .then(response => batch(() => {
      dispatch(actionSetWaitingAnswer(false));
      dispatch(actionAddMessage({
        ...response,
        wordCount: countWords(response.content),
        contactId: contact.id,
        timestamp: Date.now()
      }));
    })  
    ).catch((e) => batch(() => {
      dispatch(actionSetWaitingAnswer(false));
      dispatch(actionAddMessage({
        role: 'error', 
        content: `${e.message}`,
        wordCount: countWords(e.message),
        contactId: contact.id,
        timestamp: Date.now()
      }));
    }));
}

export async function dispatchAskBotToMessage(
  dispatch: Dispatch<AnyAction>, 
  botId: string,
  chatContact: GroupChatContact, 
  settings: Settings, 
  previousMessages: ChatMessage[], 
  promptContext: string,
  groupMeta: GroupMeta | null
) {

  const messagesWithAuthor: ChatMessage[] = previousMessages.map(m => {
    if(m.role === 'assistant'){
      const botContact = chatContact.contacts.find(contact => contact.id === m.contactId) as BotContact;
      let answer = "";
      let name = ""
      try{
        const parsedMsg = JSON.parse(m.content);
        answer = parsedMsg.answer;
        name = parsedMsg.name;
      }catch(e){
        answer = m.content;
        name = botContact.meta.name;
      }
      return {
        ...m,
        role: m.role,
        content: `{"plan": "1-AI response.2-Character differences from AI by the profile.3-Corrections following MAIN GUIDELINE.4-Inner monologue.", "name": "${name}", "message": "${answer}"}`
      };
    }
    return {
      ...m,
      role: m.role,
      content: `{"plan": "1-AI response.2-Character differences from AI by the profile.3-Corrections following MAIN GUIDELINE.4-Inner monologue.", "name": "${settings.userName}", "message": "${m.content}"}`
    };
  });

  const botContact = chatContact.contacts.find(contact => contact.id === botId) as BotContact;

  dispatch(actionSetWaitingAnswer(true));
  const sysEntry = writeSystemEntry(
    botContact.meta, 
    groupMeta,
    settings.userName, 
    settings.userShortInfo, 
    botContact.contactSystemEntryTemplate,
    promptContext
  );

  const finalPrompt = cleanAndLimitMessagesSize(sysEntry, messagesWithAuthor);

  chatCompletion(settings, finalPrompt)
    .then(response => {
      const chatMsg = {
        role: response.role, 
        content: response.content,
        wordCount: countWords(response.content),
        contactId: botId,
        timestamp: Date.now(),
      };
      batch(() => {
        dispatch(actionSetWaitingAnswer(false));
        dispatch(actionAddMessage(chatMsg));
      })
    }).catch((e) => batch(() => {
      dispatch(actionSetWaitingAnswer(false));
      dispatch(actionAddMessage({
        role: "assistant", 
        content: `{"plan": "${e.message}", "message": "..."}`,
        wordCount: countWords(`{"plan": "${e.message}", "message": "..."}`),
        contactId: chatContact.id,
        timestamp: Date.now()
      }));
    }));
}

export async function dispatchCreateGroupChat(
  dispatch: Dispatch<AnyAction>,
  settings: Settings, 
  chatName: string,
  description: string,
  contactsIds: string[]
) {
  const id = Math.floor(Math.random() * 10000) + 'groupChat';

  // TODO: Add contacts to own store

  const currentAppState = await getAppState(currentVersion);

  const contacts: BotContact[] = [];

  Object.entries(currentAppState.contacts).forEach(async ([_key, contact]: [any, any]) => {
      if(contact.type === 'bot' && contactsIds.includes(contact.id)){
          const contactCopy: BotContact = JSON.parse(JSON.stringify(contact));
          contactCopy.chats = [];
          contacts.push(contactCopy);
      }
  });

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
    contacts: contacts,
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
  addAvatar(avatarId, avatarBase64Img);
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

export async function dispatchActionReloadState(
  dispatch: Dispatch<AnyAction>
){
  const currentInstalledVersion = localStorage.getItem("currentVersion");
  const isFirstTime = currentInstalledVersion === null;
  if(isFirstTime){
    localStorage.setItem("currentVersion", currentVersion);
    dispatch(actionReloadState({ ...initialState,
      volatileState: {
        currentScreen: 'welcome',
        chatId: '',
        waitingAnswer: false,
        errorMessage: 'errorMessage',
        screenStack: ['contacts']
      }
    }));
    return;
  }
  const storedStateVersion =  Number(currentInstalledVersion);
  
  const currentVersionNumber = Number(currentVersion);
  if(storedStateVersion > currentVersionNumber){
    console.error(`Stored state version '${storedStateVersion}' is higher than current version '${currentVersion}'`); 
  }

  for(let i = storedStateVersion; i < currentVersionNumber; i++){
    try{
      console.log(`Applying migration ${i}`);
      await migrations[i]();
    }catch(e: any){
      const storedState = localStorage.getItem(storedStateVersion+"") || "nothing found";
      const name: string = e.name;
      let errorMessage = `Migration failed for version ${i} ${e} ${storedState}`
      if(name.toLocaleLowerCase().includes("quota")){
        const keys = Object.keys(localStorage);
        errorMessage = errorMessage + ' keys:' + keys;
      }
      dispatch(actionReloadState({ ...initialState,
        volatileState: {
          currentScreen: 'errorWithDelete',
          chatId: '',
          waitingAnswer: false,
          errorMessage: errorMessage,
          screenStack: ['errorWithDelete']
        }
      }));
      return;
    }
  }
  console.log(`Reloading state`);
  const loadedState = await getAppState(currentVersion);
  dispatch(actionReloadState(loadedState));
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
    "%CHAT_GROUP_DESCRIPTION%": groupMeta?.description || "",
    "%DATE%": (new Date())+'' 
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