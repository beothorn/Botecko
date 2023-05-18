import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { BotContact, ChatMessage, ContactMeta, GroupChatContact, GroupMeta, Settings, currentVersion, initialState } from "./AppState";
import { Message, RoleType, chatCompletion, imageGeneration, listEngines } from "./OpenAiApi";
import { batch } from "react-redux";
import { actionAddContact, actionAddMessage, actionReloadState, actionRemoveContact, actionSetErrorMessage, actionSetScreen, actionSetSettings, actionSetWaitingAnswer } from "./actions";
import { countWords } from "./utils/StringUtils";
import { addAvatar, getAppState } from "./persistence/indexeddb";
import migrations from "./migrations";
import { defaultSystemEntry } from "./prompts/promptGenerator";

const MAX_WORD_SIZE = 2000;

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

export async function dispatchActionCheckOpenAiKey(dispatch: Dispatch<AnyAction>, settings: Settings) {
    listEngines(settings.openAiKey)
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

    chatCompletion(settings.openAiKey, finalPrompt)
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
        if (m.role === 'assistant') {
            const botContact = chatContact.contacts.find(contact => contact.id === m.contactId) as BotContact;
            let answer = "";
            let name = ""
            try {
                const parsedMsg = JSON.parse(m.content);
                answer = parsedMsg.answer;
                name = parsedMsg.name;
            } catch (e) {
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

    chatCompletion(settings.openAiKey, finalPrompt)
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
        if (contact.type === 'bot' && contactsIds.includes(contact.id)) {
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

    chatCompletion(settings.openAiKey, generateContact(
        contactDescription,
        settings.profileGeneratorSystemEntry,
        settings.profileGeneratorMessageEntry))
        .then(response => {
            const responseJson: MetaFromAI = JSON.parse(response.content);
            imageGeneration(settings.openAiKey, responseJson.avatar)
                .then(img => dispatch(actionAddContact(createBotContactFromMeta(id, settings, responseJson, img))))
                .catch(() => dispatch(actionAddContact(createBotContactFromMeta(id, settings, responseJson, ""))));
        }).catch(() => dispatch(actionRemoveContact(id)));

}

export async function dispatchActionReloadState(
    dispatch: Dispatch<AnyAction>
) {
    const currentInstalledVersion = localStorage.getItem("currentVersion");
    const isFirstTime = currentInstalledVersion === null;
    if (isFirstTime) {
        localStorage.setItem("currentVersion", currentVersion);
        dispatch(actionReloadState({
            ...initialState,
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
    const storedStateVersion = Number(currentInstalledVersion);

    const currentVersionNumber = Number(currentVersion);
    if (storedStateVersion > currentVersionNumber) {
        console.error(`Stored state version '${storedStateVersion}' is higher than current version '${currentVersion}'`);
    }

    for (let i = storedStateVersion; i < currentVersionNumber; i++) {
        try {
            console.log(`Applying migration ${i}`);
            await migrations[i]();
        } catch (e: any) {
            const storedState = localStorage.getItem(storedStateVersion + "") || "nothing found";
            const name: string = e.name;
            let errorMessage = `Migration failed for version ${i} ${e} ${storedState}`
            if (name.toLocaleLowerCase().includes("quota")) {
                const keys = Object.keys(localStorage);
                errorMessage = errorMessage + ' keys:' + keys;
            }
            dispatch(actionReloadState({
                ...initialState,
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
function cleanAndLimitMessagesSize(sysEntry: Message, messages: ChatMessage[]): Message[] {
    const messagesWithoutErrors: ChatMessage[] = messages.filter(m => m.role !== 'error');

    let totalWords = countWords(sysEntry.content);
    console.log(`SysEntry size in word is ${totalWords}`);
    let startIndex = 0;

    for (let i = messagesWithoutErrors.length - 1; i >= 0; i--) {
        const msgWordCount = messagesWithoutErrors[i].wordCount;
        if (totalWords + msgWordCount >= MAX_WORD_SIZE) {
            break;
        }
        totalWords += msgWordCount;
        startIndex = i;
    }

    console.log(`Prompt size in word is ${totalWords}`);

    const chatWithLimitedSize: ChatMessage[] = messagesWithoutErrors.slice(startIndex);

    const chatWithOnlyExpectedData: Message[] = chatWithLimitedSize.map(c => ({
        "role": c.role as RoleType,
        "content": c.content
    }));

    return [sysEntry].concat(chatWithOnlyExpectedData)
}

function createBotContactFromMeta(
    id: string,
    settings: Settings,
    meta: MetaFromAI,
    avatarBase64Img: string
): BotContact {
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

function writeSystemEntry(
    meta: ContactMeta,
    groupMeta: GroupMeta | null,
    userName: string,
    userShortInfo: string,
    systemEntry: string,
    promptContext: string
): Message {
    const metaAsString = JSON.stringify(meta);

    if (!systemEntry) {
        systemEntry = defaultSystemEntry;
    }

    const tokens = {
        "%NAME%": meta.name,
        "%USER_NAME%": userName,
        "%USER_INFO%": userShortInfo,
        "%META_JSON%": metaAsString,
        "%CHAT_GROUP_NAME%": groupMeta?.name || "",
        "%CHAT_GROUP_DESCRIPTION%": groupMeta?.description || "",
        "%DATE%": (new Date()) + ''
    }

    const systemPrompContext = replaceAllTokens(promptContext, tokens);

    const systemString = replaceAllTokens(systemEntry, tokens)
        .replaceAll("%CONTEXT%", systemPrompContext);

    return { "role": "system", "content": systemString }
}

function replaceAllTokens(str: string, tokens: Record<string, string>): string {
    let result = str;
    for (const [key, value] of Object.entries(tokens)) {
        result = result.replaceAll(key, value);
    }
    return result;
}

function generateContact(profileDescription: string, profileGeneratorSystem: string, profileGeneratorMessage: string): Message[] {
    return [
        { "role": "system", "content": profileGeneratorSystem },
        { "role": "user", "content": profileGeneratorMessage.replaceAll('%PROFILE%', profileDescription) }
    ]
}