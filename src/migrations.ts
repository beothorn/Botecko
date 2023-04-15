import { defaultSystemEntry } from "./prompts/promptGenerator";

const migrations = [
    () => {
        console.error("Migration from version 0 does not exist");
    },
    () => {
        console.log("Running migration from version 1 to 2");
        const storedState = localStorage.getItem("1") || "{}";
        const loadedInitialState = JSON.parse(storedState);
        loadedInitialState.version = "2";
        localStorage.setItem("2", JSON.stringify(loadedInitialState));
        localStorage.setItem("currentVersion", "2");
    },
    () => {
        console.log("Running migration from version 1 to 2");
        const storedState = localStorage.getItem("1") || "{}";
        const loadedInitialState = JSON.parse(storedState);

        Object.entries(loadedInitialState.contacts).forEach(([key, _contact]: [any, any]) => {
            const c = loadedInitialState.contacts[key];
            c.contactSystemEntryTemplate = defaultSystemEntry;
            delete c.contactSystemEntry;
        });

        loadedInitialState.version = "3";
        localStorage.setItem("3", JSON.stringify(loadedInitialState));
        localStorage.setItem("currentVersion", "3");
    }
];

export default migrations;