import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Cross-tab Real-Time Synchronization Channel
 * Ensures instant updates across open browser tabs/windows before or alongside Firestore
 */
export const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('kzt_database_sync')
    : null;

export function broadcastDbChange(action: string, payload: any): void {
  try {
    if (syncChannel) {
      syncChannel.postMessage({ action, payload, timestamp: Date.now() });
    }
  } catch {}
}

/**
 * Subscribes to a Firestore collection in real-time.
 * Automatically handles snapshot updates, passes array of documents, and auto-reconnects on error.
 */
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  let isCancelled = false;
  let unsubscribe: (() => void) | null = null;
  let reconnectTimer: any = null;

  const connect = () => {
    if (isCancelled) return;
    try {
      const colRef = collection(db, collectionName);
      unsubscribe = onSnapshot(
        colRef,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const items: T[] = [];
          snapshot.forEach((docSnap) => {
            items.push({ ...(docSnap.data() as T), id: docSnap.id });
          });
          onUpdate(items);
        },
        (error) => {
          const isOffline =
            error.message?.includes('offline') ||
            error.code === 'unavailable' ||
            error.code === 'failed-precondition';
          if (isOffline) {
            console.info(`Firestore subscription for "${collectionName}" waiting for network connection...`);
          } else {
            console.warn(`Firestore subscription notice for "${collectionName}":`, error.message);
          }
          if (onError) onError(error);
          if (!isCancelled) {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(connect, 5000);
          }
        }
      );
    } catch (err: any) {
      console.info(`Firestore connection pending for "${collectionName}":`, err?.message || err);
      if (!isCancelled) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 5000);
      }
    }
  };

  connect();

  return () => {
    isCancelled = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (unsubscribe) {
      unsubscribe();
    }
  };
}

/**
 * Saves or overwrites a single document in a collection.
 */
export async function saveDoc(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    const sanitized = sanitizeData(data);
    await setDoc(docRef, sanitized, { merge: true });
    broadcastDbChange('SAVE_DOC', { collectionName, docId, data: sanitized });
  } catch (error: any) {
    console.warn(`Notice saving document to "${collectionName}/${docId}":`, error?.message || error);
  }
}

/**
 * Updates specific fields in an existing document.
 */
export async function updateDocFields(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    const sanitized = sanitizeData(data);
    await updateDoc(docRef, sanitized);
    broadcastDbChange('UPDATE_DOC', { collectionName, docId, data: sanitized });
  } catch (error: any) {
    console.warn(`Notice updating document "${collectionName}/${docId}":`, error?.message || error);
  }
}

/**
 * Deletes a document from a collection.
 */
export async function deleteDocFromDb(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    broadcastDbChange('DELETE_DOC', { collectionName, docId });
  } catch (error: any) {
    console.warn(`Notice deleting document "${collectionName}/${docId}":`, error?.message || error);
  }
}

let cachedBootstrapStatus: boolean | null = null;

export function isBootstrappedSync(): boolean {
  return cachedBootstrapStatus === true;
}

/**
 * Checks if the centralized database has already been initialized.
 * Once initialized, collections are never re-seeded even if they become empty (e.g. through deletions).
 */
export async function isDbBootstrapped(): Promise<boolean> {
  if (cachedBootstrapStatus !== null) {
    return cachedBootstrapStatus;
  }
  try {
    const metaRef = doc(db, '_system_metadata', 'bootstrap');
    const snap = await Promise.race([
      getDoc(metaRef),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 4000)
      ),
    ]);
    if (snap && 'exists' in snap && snap.exists() && snap.data()?.seeded === true) {
      cachedBootstrapStatus = true;
      return true;
    }
    return false;
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('client is offline') || msg.includes('unavailable') || msg.includes('timeout')) {
      console.info('Firestore offline or connecting, bootstrap status check deferred.');
    } else {
      console.warn('Bootstrap status check notice:', msg);
    }
    return false;
  }
}

export async function markDbBootstrapped(): Promise<void> {
  cachedBootstrapStatus = true;
  try {
    const metaRef = doc(db, '_system_metadata', 'bootstrap');
    await setDoc(metaRef, { seeded: true, bootstrappedAt: new Date().toISOString() }, { merge: true });
  } catch (err: any) {
    console.info('Notice marking DB bootstrapped:', err?.message || err);
  }
}

/**
 * Checks if a collection is empty. If empty AND the database has not yet been initialized,
 * seeds initial data via Firestore batch.
 */
export async function seedCollectionIfEmpty(
  collectionName: string,
  initialItems: Array<{ id: string; [key: string]: any }>
): Promise<boolean> {
  try {
    const bootstrapped = await isDbBootstrapped();
    if (bootstrapped) {
      // Database is already bootstrapped. Respect any deleted collections!
      return false;
    }

    const colRef = collection(db, collectionName);
    const snapshot = await Promise.race([
      getDocs(colRef),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 4000)
      ),
    ]);
    if (snapshot && 'empty' in snapshot && snapshot.empty && initialItems.length > 0) {
      console.log(`Seeding empty Firestore collection "${collectionName}" with ${initialItems.length} items...`);
      const batch = writeBatch(db);
      for (const item of initialItems) {
        const itemRef = doc(db, collectionName, item.id);
        batch.set(itemRef, sanitizeData(item));
      }
      await batch.commit();
      console.log(`Collection "${collectionName}" successfully initialized in Firestore.`);
      return true;
    }
    return false;
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('client is offline') || msg.includes('unavailable') || msg.includes('timeout')) {
      console.info(`Collection "${collectionName}" initialization deferred (offline/connecting).`);
    } else {
      console.warn(`Notice seeding collection "${collectionName}":`, msg);
    }
    return false;
  }
}

/**
 * Helper to remove undefined values before Firestore writes
 */
function sanitizeData(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        clean[key] = sanitizeData(val);
      }
    }
    return clean;
  }
  return obj;
}
