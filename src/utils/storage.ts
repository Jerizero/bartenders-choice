// Persistent storage backed by IndexedDB with localStorage as sync cache.
// IndexedDB survives iOS/Android PWA storage eviction that kills localStorage.

const DB_NAME = 'bartenders-choice'
const STORE_NAME = 'kv'
const DB_VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

/** Write value to both localStorage (sync cache) and IndexedDB (persistent). */
export function persist(key: string, value: string): void {
  // Sync cache for fast reads on next init
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage unavailable
  }

  // Durable write to IndexedDB
  openDB()
    .then((db) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(value, key)
    })
    .catch(() => {
      // IDB unavailable — localStorage is the only fallback
    })
}

/** Read from localStorage (sync). Returns null if not found. */
export function readSync(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Restore from IndexedDB if localStorage is empty.
 * Call on mount — if IDB has data that localStorage lost, it restores both.
 * Returns the IDB value (or null if IDB is also empty).
 */
export async function restoreIfNeeded(key: string): Promise<string | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key)
      req.onsuccess = () => {
        const idbValue = req.result as string | undefined
        if (!idbValue) {
          resolve(null)
          return
        }

        // Check if localStorage is missing this data
        let lsValue: string | null = null
        try {
          lsValue = localStorage.getItem(key)
        } catch {
          // localStorage unavailable
        }

        if (!lsValue) {
          // localStorage was cleared — restore from IDB
          try {
            localStorage.setItem(key, idbValue)
          } catch {
            // can't restore to localStorage, but IDB data is still good
          }
          resolve(idbValue)
        } else {
          resolve(null) // localStorage has data, no restore needed
        }
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}
