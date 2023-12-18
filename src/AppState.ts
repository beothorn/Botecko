import {
  defaultGroupChatContext, defaultProfileGeneratorMessage, defaultProfileGeneratorSystem,
  defaultSingleUserChatContext, defaultSystemEntry
} from "./prompts/promptGenerator";
import { TextProvider } from './api/chatApi';
import { ImageProvider } from './api/imageApi';

export const currentVersion = '18';

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

export type BoteckoRoleType = 'user' | 'system' | 'assistant' | 'thought' | 'error';

// If any value is changed here, a new version and migration is needed
export type ChatMessageContent = {
  name: string;
  message: string;
  plan?: string;
}

// If any value is changed here, a new version and migration is needed
export type ChatMessage = {
  contactId: string;
  role: BoteckoRoleType;
  content: ChatMessageContent;
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
  geminiKey: string,
  openAiKey: string,
  userName: string,
  userShortInfo: string,
  profileGeneration: TextProvider,
  chatResponse: TextProvider,
  avatarGeneration: ImageProvider,
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

export const initialState: AppState = {
  version: currentVersion,
  settings: {
    openAiKey: "",
    geminiKey: "",
    userName: "",
    userShortInfo: "",
    profileGeneration: 'gpt-3.5-turbo',
    chatResponse: 'gpt-3.5-turbo',
    avatarGeneration: 'dall-e-2',
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