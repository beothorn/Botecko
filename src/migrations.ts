import { AppScreen } from "./AppState";
import { addAppState, addAvatar, deleteAppState, getAppState } from "./persistence/indexeddb";
import { defaultGroupChatContext, defaultProfileGeneratorMessage, defaultProfileGeneratorSystem, defaultSingleUserChatContext, defaultSystemEntry } from "./prompts/promptGenerator";
import { countWords } from './utils/StringUtils';


const cleanUpAvatars = (contacts: any) => {
    Object.entries(contacts).forEach(async ([_key, contact]: [any, any]) => {
        if (contact.avatarMeta.id !== '') {
            try {
                await addAvatar(
                    contact.avatarMeta.id,
                    localStorage.getItem(contact.avatarMeta.id) || ''
                );
                localStorage.removeItem(contact.avatarMeta.id);
            } catch (e) {
                console.error(e);
            }
        }
    });
}

const migrations = [
    () => {
        console.error("Migration from version 0 does not exist");
    },
    () => {
        console.log("Running migration from version 1 to 2");
        cleanUpAvatars("1");
        const storedState = localStorage.getItem("1") || "{}";
        const loadedInitialState = JSON.parse(storedState);
        loadedInitialState.version = "2";
        localStorage.setItem("2", JSON.stringify(loadedInitialState));
        localStorage.setItem("currentVersion", "2");
    },
    () => {
        console.log("Running migration from version 2 to 3");
        cleanUpAvatars("2");
        const storedState = localStorage.getItem("2") || "{}";
        const loadedInitialState = JSON.parse(storedState);

        Object.entries(loadedInitialState.contacts).forEach(([key, _contact]: [any, any]) => {
            const c = loadedInitialState.contacts[key];
            c.contactSystemEntryTemplate = defaultSystemEntry;
            delete c.contactSystemEntry;
        });

        loadedInitialState.version = "3";
        localStorage.setItem("3", JSON.stringify(loadedInitialState));
        localStorage.setItem("currentVersion", "3");
        console.log("Done migration from version 2 to 3");
    },
    () => {
        console.log("Running migration from version 3 to 4");
        cleanUpAvatars("3");
        const storedState = localStorage.getItem("3") || "{}";
        const loadedInitialState = JSON.parse(storedState);

        Object.entries(loadedInitialState.contacts).forEach(([key, _contact]: [any, any]) => {
            const c = loadedInitialState.contacts[key];
            c.type = 'bot';
        });

        loadedInitialState.version = "4";
        localStorage.setItem("4", JSON.stringify(loadedInitialState));
        localStorage.setItem("currentVersion", "4");
        console.log("Done migration from version 3 to 4");
    },
    () => {
        console.log("Running migration from version 4 to 5");
        cleanUpAvatars("4");
        const storedState = localStorage.getItem("4") || "{}";
        const loadedInitialState = JSON.parse(storedState);

        loadedInitialState.groupChatsParticipants = {};

        loadedInitialState.version = "5";
        localStorage.setItem("5", JSON.stringify(loadedInitialState));
        localStorage.setItem("currentVersion", "5");
        console.log("Done migration from version 4 to 5");
    },
    () => {
        console.log("Running migration from version 5 to 6");
        cleanUpAvatars("5");
        const storedState = localStorage.getItem("5") || "{}";
        const loadedInitialState = JSON.parse(storedState);

        loadedInitialState.settings.singleBotSystemEntryContext = `The character is talking with a friend %USER_NAME%. The friend profile is '%USER_INFO%'.`;
        loadedInitialState.settings.chatGroupSystemEntryContext = `The character is talking on a chat group with name %CHAT_GROUP_NAME% and description '%CHAT_GROUP_DESCRIPTION%'.`;

        Object.entries(loadedInitialState.contacts).forEach(([key, _contact]: [any, any]) => {
            const c = loadedInitialState.contacts[key];
            c.status = c.lastMessage;
            c.contextTemplate = loadedInitialState.settings.singleBotSystemEntryContext;
            delete c.lastMessage;
        });

        loadedInitialState.version = "6";
        localStorage.setItem("6", JSON.stringify(loadedInitialState));
        localStorage.setItem("currentVersion", "6");
        console.log("Done migration from version 5 to 6");
    },
    () => {
        console.log("Running migration from version 6 to 7");
        cleanUpAvatars("6");
        const storedState = localStorage.getItem("6") || "{}";
        const loadedInitialState = JSON.parse(storedState);

        loadedInitialState.volatileState = {
            "currentScreen": loadedInitialState.currentScreen,
            "chatId": loadedInitialState.chatId,
            "waitingAnswer": loadedInitialState.waitingAnswer,
            "errorMessage": loadedInitialState.errorMessage,
            "screenStack": loadedInitialState.screenStack
        };

        delete loadedInitialState.currentScreen;
        delete loadedInitialState.chatId;
        delete loadedInitialState.waitingAnswer;
        delete loadedInitialState.errorMessage;
        delete loadedInitialState.screenStack;

        loadedInitialState.version = "7";
        localStorage.setItem("7", JSON.stringify(loadedInitialState));
        localStorage.setItem("currentVersion", "7");
        console.log("Done migration from version 6 to 7");
    },
    async () => {
        console.log("Running migration from version 7 to 8");
        const storedState = localStorage.getItem("7") || "{}";
        const loadedInitialState = JSON.parse(storedState);

        loadedInitialState.version = "8";

        try {
            await addAppState(loadedInitialState);
        } catch (e) {
            console.error(e);
        }


        Object.entries(loadedInitialState.contacts).forEach(async ([_key, contact]: [any, any]) => {
            if (contact.avatarMeta.id !== '') {
                try {
                    await addAvatar(
                        contact.avatarMeta.id,
                        localStorage.getItem(contact.avatarMeta.id) || ''
                    );
                } catch (e) {
                    console.error(e);
                }
            }
        });

        localStorage.clear(); // Bye bye local storage (can't have more than 10mega there :( )
        localStorage.setItem("currentVersion", "8");
        console.log("Done migration from version 7 to 8");
    },
    async () => {
        console.log("Running migration from version 8 to 9");
        const loadedState = await getAppState('8');
        const newLoadedState = {
            ...loadedState,
            version: '9',
            settings: {
                ...loadedState.settings,
                systemEntry: defaultSystemEntry,
                profileGeneratorSystemEntry: defaultProfileGeneratorSystem,
                profileGeneratorMessageEntry: defaultProfileGeneratorMessage,
                singleBotSystemEntryContext: defaultSingleUserChatContext,
                chatGroupSystemEntryContext: defaultGroupChatContext,
            }
        }

        Object.entries(newLoadedState.contacts).forEach(async ([_key, contact]: [any, any]) => {
            if (contact.type === 'bot') {
                contact.contactSystemEntryTemplate = defaultSystemEntry;
                contact.contextTemplate = defaultSingleUserChatContext;
            }
        });

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", "9");
        deleteAppState('8');
        console.log("Done migration from version 8 to 9");
    },
    async () => {
        console.log("Running migration from version 9 to 10");
        const loadedState = await getAppState('9');
        const newLoadedState = {
            ...loadedState,
            version: '10',
            settings: {
                ...loadedState.settings,
                systemEntry: defaultSystemEntry,
                profileGeneratorSystemEntry: defaultProfileGeneratorSystem,
                profileGeneratorMessageEntry: defaultProfileGeneratorMessage,
                singleBotSystemEntryContext: defaultSingleUserChatContext,
                chatGroupSystemEntryContext: defaultGroupChatContext,
            },
            volatileState: {
                ...loadedState.volatileState,
                screenStack: ['contacts' as AppScreen],
                currenScreen: 'contacts',
            }
        }

        Object.entries(newLoadedState.contacts).forEach(async ([_key, contact]: [any, any]) => {
            if (contact.type === 'bot') {
                contact.contactSystemEntryTemplate = defaultSystemEntry;
                contact.contextTemplate = defaultSingleUserChatContext;
            } else {
                delete newLoadedState.contacts[contact.id];
            }
        });

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", "10");
        deleteAppState('9');
        console.log("Done migration from version 9 to 10");
    },
    async () => {
        console.log("Running migration from version 10 to 11");
        const loadedState = await getAppState('10');
        const newLoadedState = {
            ...loadedState,
            version: '11',
            volatileState: {
                ...loadedState.volatileState,
                screenStack: ['contacts' as AppScreen],
                currenScreen: 'contacts',
            }
        }

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", "11");
        deleteAppState('10');
        console.log("Done migration from version 10 to 11");
    },
    async () => {
        console.log("Running migration from version 11 to 12");
        const loadedState = await getAppState('11');
        const newLoadedState = {
            ...loadedState,
            version: '12',
            volatileState: {
                ...loadedState.volatileState,
                screenStack: ['contacts' as AppScreen],
                currentScreen: 'contacts' as AppScreen,
            }
        }

        console.log(JSON.stringify(Object.entries(newLoadedState.contacts)));

        Object.entries(newLoadedState.contacts).forEach(([_key, contact]: [any, any]) => {
            if (contact.type === 'group') {
                delete newLoadedState.contacts[contact.id];
            }
        });

        console.log(JSON.stringify(Object.entries(newLoadedState.contacts)));

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", "12");
        //deleteAppState('11'); Do not do this anymore, it is easier to recover
        console.log("Done migration from version 11 to 12");
    },
    async () => {
        console.log("Running migration from version 12 to 13");
        const loadedState = await getAppState('12');

        const newLoadedState = {
            ...loadedState,
            version: '13',
            volatileState: {
                ...loadedState.volatileState,
                screenStack: ['contacts' as AppScreen],
                currentScreen: 'contacts' as AppScreen,
            }
        }

        Object.entries(newLoadedState.contacts).forEach(([_key, contact]: [any, any]) => {
            const current = Date.now();
            for (let i = 0; i < contact.chats.length; i++) {
                contact.chats[i].timestamp = current + i;
            }
        });

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", "13");
        console.log("Done migration from version 12 to 13");
    },
    async () => {
        const oldVersion = '13';
        const newVersion = '14';
        console.log(`Running migration from version ${oldVersion} to ${newVersion}`);
        const loadedState = await getAppState(oldVersion);

        const newLoadedState = {
            ...loadedState,
            version: newVersion,
            volatileState: {
                ...loadedState.volatileState,
                screenStack: ['contacts' as AppScreen],
                currentScreen: 'contacts' as AppScreen,
            }
        }

        Object.entries(newLoadedState.contacts).forEach(([_key, contact]: [any, any]) => {
            for (let i = 0; i < contact.chats.length; i++) {
                contact.chats[i].wordCount = countWords(contact.chats[i].content);
            }
        });

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", newVersion);
        console.log(`Done migration from version ${oldVersion} to ${newVersion}`);
    },
    async () => {
        const oldVersion = '14';
        const newVersion = '15';
        console.log(`Running migration from version ${oldVersion} to ${newVersion}`);
        const loadedState = await getAppState(oldVersion);
        const newLoadedState = {
            ...loadedState,
            version: newVersion,
            settings: {
                ...loadedState.settings,
                systemEntry: defaultSystemEntry,
                profileGeneratorSystemEntry: defaultProfileGeneratorSystem,
                profileGeneratorMessageEntry: defaultProfileGeneratorMessage,
                singleBotSystemEntryContext: defaultSingleUserChatContext,
                chatGroupSystemEntryContext: defaultGroupChatContext,
            },
            volatileState: {
                ...loadedState.volatileState,
                screenStack: ['contacts' as AppScreen],
                currenScreen: 'contacts',
            }
        }

        Object.entries(newLoadedState.contacts).forEach(async ([_key, contact]: [any, any]) => {
            if (contact.type === 'bot') {
                contact.contactSystemEntryTemplate = defaultSystemEntry;
                contact.contextTemplate = defaultSingleUserChatContext;
            } else {
                delete newLoadedState.contacts[contact.id];
            }
        });

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", newVersion);
        console.log(`Done migration from version ${oldVersion} to ${newVersion}`);
    },
    async () => {
        const oldVersion = '15';
        const newVersion = '16';
        console.log(`Running migration from version ${oldVersion} to ${newVersion}`);
        const loadedState = await getAppState(oldVersion);
        const newLoadedState = {
            ...loadedState,
            version: newVersion,
            settings: {
                ...loadedState.settings,
                systemEntry: defaultSystemEntry,
                profileGeneratorSystemEntry: defaultProfileGeneratorSystem,
                profileGeneratorMessageEntry: defaultProfileGeneratorMessage,
                singleBotSystemEntryContext: defaultSingleUserChatContext,
                chatGroupSystemEntryContext: defaultGroupChatContext,
            },
            volatileState: {
                ...loadedState.volatileState,
                screenStack: ['contacts' as AppScreen],
                currenScreen: 'contacts',
            }
        }

        Object.entries(newLoadedState.contacts).forEach(async ([_key, contact]: [any, any]) => {
            if (contact.type === 'bot') {
                contact.contactSystemEntryTemplate = defaultSystemEntry;
                contact.contextTemplate = defaultSingleUserChatContext;
                const name = contact.meta.name;
                contact.chats = contact.chats.map((c: any) => {
                    if (c.role == "user") {
                        return {
                            ...c,
                            content: `{"name":"${newLoadedState.settings.userName}","message":"${c.content}"}`
                        }
                    } else {
                        const parsed = JSON.parse(c.content);
                        return {
                            ...c,
                            content: `{"name":"${name}","plan":"${parsed.plan}","message":"${parsed.answer}"}`
                        }
                    }
                })
            } else {
                delete newLoadedState.contacts[contact.id];
            }
        });

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", newVersion);
        console.log(`Done migration from version ${oldVersion} to ${newVersion}`);
    },
    async () => {
        const oldVersion = '16';
        const newVersion = '17';
        console.log(`Running migration from version ${oldVersion} to ${newVersion}`);
        const loadedState = await getAppState(oldVersion);
        // REPLACE PROMPTS
        const newLoadedState = {
            ...loadedState,
            version: newVersion,
            settings: {
                ...loadedState.settings,
                systemEntry: defaultSystemEntry,
                profileGeneratorSystemEntry: defaultProfileGeneratorSystem,
                profileGeneratorMessageEntry: defaultProfileGeneratorMessage,
                singleBotSystemEntryContext: defaultSingleUserChatContext,
                chatGroupSystemEntryContext: defaultGroupChatContext,
            },
            volatileState: {
                ...loadedState.volatileState,
                screenStack: ['contacts' as AppScreen],
                currenScreen: 'contacts',
            }
        }

        // REPLACE PROMPTS
        Object.entries(newLoadedState.contacts).forEach(async ([_key, contact]: [any, any]) => {
            if (contact.type === 'bot') {
                contact.contactSystemEntryTemplate = defaultSystemEntry;
                contact.contextTemplate = defaultSingleUserChatContext;
            } else {
                delete newLoadedState.contacts[contact.id];
            }
        });

        addAppState(newLoadedState);
        localStorage.setItem("currentVersion", newVersion);
        console.log(`Done migration from version ${oldVersion} to ${newVersion}`);
    },
];

export default migrations;