import { AppState, AvatarImg } from "../appStateSlice";

const DB_NAME = "BoteckoDB";
const DB_VERSION = 9;
const APP_STATE_STORE = "appState";
const AVATAR_STORE = "avatar";


function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest)?.result as IDBDatabase;
      if(event.oldVersion === 1){
        console.log("First Version")
      }
      if (!db.objectStoreNames.contains(APP_STATE_STORE)) {
        db.createObjectStore(APP_STATE_STORE, { keyPath: "version" });
      }
      if (!db.objectStoreNames.contains(AVATAR_STORE)) {
        db.createObjectStore(AVATAR_STORE, { keyPath: "id" });
      }
      if(event.oldVersion === 8){
        // get store for APP_STATE_STORE
        const tx = (event.target as IDBRequest)?.transaction as IDBTransaction;
        const store = tx.objectStore(APP_STATE_STORE);
        store.createIndex('versionIndex', 'version');
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

export function deleteAppState(version: string){
  return openDB()
    .then((db) => {
      const transaction = db.transaction([APP_STATE_STORE], "readwrite");
      const store = transaction.objectStore(APP_STATE_STORE);
      return new Promise<IDBTransaction>((resolve, reject) => {
        const request = store.index('versionIndex').openCursor(IDBKeyRange.only(version));
        request.onsuccess = (event: Event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve(transaction);
          }
        };
        request.onerror = () => {
          transaction.abort();
          reject(request.error);
        };
      });
    })
    .then((transaction: IDBTransaction) => transaction.commit());
}


export function addAvatar(id: string, img: string){
  return openDB()
    .then((db) => {
      const transaction = db.transaction([AVATAR_STORE], "readwrite");
      const store = transaction.objectStore(AVATAR_STORE);
      return new Promise<IDBTransaction>((resolve, reject) => {
        const request = store.add({id, img});
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

export function updateAvatar(id: string, img: string): Promise<IDBRequest<IDBValidKey>>{
  const appStateCopy = JSON.parse(JSON.stringify({id, img}));
  console.log(appStateCopy);
  return openDB()
    .then((db) => db.transaction([AVATAR_STORE], "readwrite"))
    .then((transaction) => transaction.objectStore(AVATAR_STORE))
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

export function getAvatar(id: string){
  return openDB()
    .then((db) => {
      const transaction = db.transaction([AVATAR_STORE], "readonly");
      const store = transaction.objectStore(AVATAR_STORE);
      return new Promise<AvatarImg>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          transaction.abort();
          reject(request.error);
        }
      });
    });
}