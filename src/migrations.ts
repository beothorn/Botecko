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
    }
];

export default migrations;