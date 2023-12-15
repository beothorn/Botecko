import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { BotContact, ChatMessage, GroupChatContact, GroupMeta, Settings, 
    currentVersion, initialState, ChatMessageContent } from './AppState';
import { Message, RoleType } from "./api/chatApi";
import { chatCompletion } from "./api/client/GeminiAPI";
import { imageGeneration, listEngines } from "./api/client/OpenAiApi";
import { batch } from "react-redux";
import { actionAddContact, actionAddMessage, actionReloadState, 
    actionRemoveContact, actionSetErrorMessage, actionSetScreen, 
    actionSetSettings, actionSetStatus, actionSetWaitingAnswer } from "./actions";
import { countWords } from "./utils/StringUtils";
import { addAvatar, getAppState } from "./persistence/indexeddb";
import migrations from "./migrations";
import { defaultSystemEntry } from "./prompts/promptGenerator";
import { removeSpecialCharsAndParse } from "./utils/ParsingUtils";

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
    newMessage: ChatMessageContent,
    promptContext: string,
    groupMeta: GroupMeta | null
) {
    const newMessageWithRole: ChatMessage = {
        "contactId": "user",
        "role": "user",
        "content": newMessage,
        "wordCount": countWords(JSON.stringify(newMessage)),
        "timestamp": Date.now()
    };
    batch(() => {
        dispatch(actionAddMessage(newMessageWithRole));
        dispatch(actionSetStatus(newMessage.message));
        dispatch(actionSetWaitingAnswer(true));
    })

    const chatWithNewMessage: ChatMessage[] = previousMessages.concat(newMessageWithRole);

    const sysEntry = writeSystemEntry(
        contact.meta.name,
        JSON.stringify(contact.meta),
        groupMeta,
        settings.userName,
        settings.userShortInfo,
        contact.contactSystemEntryTemplate,
        promptContext
    );

    const currentChatCompletion = chatCompletion; // TODO: Get from settings

    const finalPrompt = cleanAndLimitMessagesSize(sysEntry, chatWithNewMessage);

    currentChatCompletion(settings.openAiKey, finalPrompt)
        .then(response => batch(() => {
            addResponseMessage(
                dispatch,
                contact.meta.name,
                contact.id,
                response
            );
        })
        ).catch((e) => batch(() => {
            dispatch(actionSetWaitingAnswer(false));
            dispatch(actionAddMessage({
                role: 'error',
                content: {
                    name: contact.meta.name,
                    message: `${JSON.stringify(e, null, 2)}`
                },
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

    const messagesWithHiddenPlan: ChatMessage[] = previousMessages.map(m => ({
            ...m,
            content: {
                plan: "1-AI.2-Analyze.3-Differences.4-Inner monologue.", 
                name: m.content.name, 
                message: m.content.message
            }
        })
    );

    const botContact = chatContact.contacts.find(contact => contact.id === botId) as BotContact;

    batch(() => {
        dispatch(actionSetWaitingAnswer(true));
        dispatch(actionSetStatus("Someone is typing"));
    });    

    const sysEntry = writeSystemEntry(
        botContact.meta.name,
        JSON.stringify(botContact.meta),
        groupMeta,
        settings.userName,
        settings.userShortInfo,
        botContact.contactSystemEntryTemplate,
        promptContext
    );

    const currentChatCompletion = chatCompletion; // TODO: Get from settings

    const finalPrompt = cleanAndLimitMessagesSize(sysEntry, messagesWithHiddenPlan);

    currentChatCompletion(settings.openAiKey, finalPrompt)
        .then(response => {
            addResponseMessage(
                dispatch,
                botContact.meta.name,
                chatContact.id,
                response
            );
        }).catch((e) => batch(() => {
            const errorMsg = {
                name: "SystemMessage",
                plan: e.message, 
                message: "..."
            };
            dispatch(actionSetWaitingAnswer(false));
            dispatch(actionAddMessage({
                role: "error",
                content: errorMsg,
                wordCount: countWords(JSON.stringify(errorMsg)),
                contactId: chatContact.id,
                timestamp: Date.now()
            }));
        }));
}

function addResponseMessage(
    dispatch: Dispatch<AnyAction>,
    name: string, 
    contactId: string, 
    response: Message
){
    // Hopefully the AI formatted the response correctly
    let content: ChatMessageContent;
    try{
        content = removeSpecialCharsAndParse(response.content);
    }catch(e: any){
        console.error(e);
        content = {
            name: name,
            message: response.content
        };
    }

    const chatMsg = {
        role: response.role,
        content,
        wordCount: countWords(response.content),
        contactId: contactId,
        timestamp: Date.now(),
    };
    batch(() => {
        dispatch(actionSetWaitingAnswer(false));
        dispatch(actionAddMessage(chatMsg));
        dispatch(actionSetStatus(content.message));
    })
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

    const currentChatCompletion = chatCompletion; // TODO: Get from settings
    const currentImageGeneration = imageGeneration; // TODO: Get from settings

    currentChatCompletion(settings.openAiKey, generateContact(
        contactDescription,
        settings.profileGeneratorSystemEntry,
        settings.profileGeneratorMessageEntry))
        .then(response => {
            const responseJson: MetaFromAI = JSON.parse(response.content);
            currentImageGeneration(settings.openAiKey, responseJson.avatar)
                .then(img => dispatch(actionAddContact(createBotContactFromMeta(id, settings, responseJson, img))))
                .catch(() => dispatch(actionAddContact(createBotContactFromMeta(id, settings, responseJson, ""))));
        }).catch(() => dispatch(actionRemoveContact(id)));

}

function loadInitialState(dispatch: Dispatch<AnyAction>){
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
}


export async function dispatchActionReloadState(
    dispatch: Dispatch<AnyAction>
) {
    const currentInstalledVersion = localStorage.getItem("currentVersion");
    const isFirstTime = currentInstalledVersion === null;
    if (isFirstTime) {
        loadInitialState(dispatch);
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
                ... initialState,
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
    // loadedState can be null if version exists but no db :(
    if(!loadedState) {
        loadInitialState(dispatch);
        return;
    }

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
        "content": JSON.stringify(c.content)
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

export function writeSystemEntry(
    name: string,
    metaAsString: string,
    groupMeta: GroupMeta | null,
    userName: string,
    userShortInfo: string,
    systemEntry: string,
    promptContext: string
): Message {
    if (!systemEntry) {
        systemEntry = defaultSystemEntry;
    }

    const tokens = {
        "%NAME%": name,
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