const DB_NAME = 'ThreeKingdomsDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Check if indexedDB is supported
    if (!window.indexedDB) {
      reject("IndexedDB not supported");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveImageToDB = async (id: number, dataUrl: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      // Use the story ID as the key
      const request = store.put(dataUrl, id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to open DB for saving:", error);
    throw error;
  }
};

export const loadImagesFromDB = async (): Promise<Record<number, string>> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      const images: Record<number, string> = {};

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          // cursor.key is the story ID (number), cursor.value is the base64 string
          images[cursor.key as number] = cursor.value;
          cursor.continue();
        } else {
          resolve(images);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to open DB for loading:", error);
    // Return empty object on error so app can still load without images
    return {};
  }
};
