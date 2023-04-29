import { AppState } from "../appStateSlice";

const DB_NAME = "BoteckoDB";
const DB_VERSION = 8;
const APP_STATE_STORE = "appState";

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest)?.result as IDBDatabase;
      if(event.oldVersion === 1){
        console.log("First Version")
      }
      // 2. Define an upgrade mechanism for the IndexedDB
      if (!db.objectStoreNames.contains(APP_STATE_STORE)) {
        db.createObjectStore(APP_STATE_STORE, { keyPath: "version" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest)?.result as IDBDatabase);
    };

    request.onerror = (event) => {
      reject((event.target as IDBRequest)?.error as DOMException);
    };
  });
}

export function addAppState(appState: AppState){
  return openDB()
    .then((db) => {
      const transaction = db.transaction([APP_STATE_STORE], "readwrite");
      const store = transaction.objectStore(APP_STATE_STORE);
      return new Promise<IDBTransaction>((resolve, reject) => {
        const request = store.add(appState);
        request.onsuccess = () => resolve(transaction);
        request.onerror = () => {
          transaction.abort();
          reject(request.error);
        }
      });
    })
    .then((transaction: IDBTransaction) => transaction.commit());
}

export function updateAppState(appState: AppState): Promise<IDBRequest<IDBValidKey>>{
  const appStateCopy = JSON.parse(JSON.stringify(appState));
  console.log(appStateCopy);
  return openDB()
    .then((db) => db.transaction([APP_STATE_STORE], "readwrite"))
    .then((transaction) => transaction.objectStore(APP_STATE_STORE))
    .then((store) => store.put(appStateCopy));
}

export function getAppState(version: string){
  return openDB()
    .then((db) => {
      const transaction = db.transaction([APP_STATE_STORE], "readonly");
      const store = transaction.objectStore(APP_STATE_STORE);
      return new Promise<AppState>((resolve, reject) => {
        const request = store.get(version);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          transaction.abort();
          reject(request.error);
        }
      });
    });
}