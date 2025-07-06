
const DB_NAME = 'QuizManiaDB';
const DB_VERSION = 1;
const STORE_NAME = 'music_tracks';

interface MusicRecord {
  name: string;
  file: Blob;
}

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject('Error opening IndexedDB.');
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
  });
  return dbPromise;
};

export const getTracks = async (): Promise<MusicRecord[]> => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject('Failed to get tracks from DB.');
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveTracks = async (tracks: MusicRecord[]): Promise<void> => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    tracks.forEach(track => store.put(track));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject('Failed to save tracks to DB.');
  });
};

export const addTrack = async (track: MusicRecord): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(track);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(`Failed to add track. A track with the name "${track.name}" may already exist.`);
    });
};

export const removeTrack = async (trackName: string): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(trackName);
        request.onsuccess = () => resolve();
        request.onerror = () => reject('Failed to remove track.');
    });
};
