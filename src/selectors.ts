import { BotContact, GroupChatContact } from "./AppState"
import { RootState } from "./store"

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