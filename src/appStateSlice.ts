import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { deleteDB, updateAppState } from './persistence/indexeddb';
import { AppScreen, AppState, BotContact, ChatMessage, Contact, GroupChatContact, initialState, Settings } from './AppState';

function saveStateToPersistence(state: AppState) {
  updateAppState(state);
}

const reducers = {
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
    if (action.payload === 'contacts') {
      state.volatileState.currentScreen = action.payload;
      state.volatileState.screenStack = ['contacts'];
    }
    if (action.payload === state.volatileState.currentScreen) {
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
    if (action.payload.role === 'assistant') {
      const maxMessageSizeOnContactList = 40;
      let parsedChatMessage = {
        message: ""
      };
      try {
        parsedChatMessage = JSON.parse(action.payload.content);
      } catch (e) {
        parsedChatMessage = {
          message: "Parse Error"
        }
      }
      const lastMessageFull: string = parsedChatMessage?.message || "Parse Error";
      if (lastMessageFull.length > maxMessageSizeOnContactList) {
        state.contacts[state.volatileState.chatId].status = parsedChatMessage.message.slice(0, maxMessageSizeOnContactList) + "...";
      } else {
        state.contacts[state.volatileState.chatId].status = parsedChatMessage.message;
      }
    } else {
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
  deleteHistory: (state: AppState) => {
    const contact = state.contacts[state.volatileState.chatId];
    contact.chats = [];
    saveStateToPersistence(state);
  },
  copyMessage: (state: AppState, action: PayloadAction<number>) => {
    const contact = state.contacts[state.volatileState.chatId];
    contact.chats.filter(c => c.timestamp === action.payload)
      .forEach(c => navigator.clipboard.writeText(c.content));
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
};

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers,
});

export default appStateSlice.reducer;