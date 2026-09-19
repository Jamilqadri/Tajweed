import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Subscribes to a Firestore collection in real-time.
 * Automatically handles snapshot updates and passes array of documents.
 */
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as T), id: docSnap.id });
        });
        onUpdate(items);
      },
      (error) => {
        console.error(`Error in Firestore subscription for "${collectionName}":`, error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error(`Failed to subscribe to "${collectionName}":`, err);
    return () => {};
  }
}

/**
 * Saves or overwrites a single document in a collection.
 */
export async function saveDoc(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    // Sanitize undefined fields
    const sanitized = sanitizeData(data);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    console.error(`Error saving document to "${collectionName}/${docId}":`, error);
    throw error;
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
  } catch (error) {
    console.error(`Error updating document "${collectionName}/${docId}":`, error);
    throw error;
  }
}

/**
 * Deletes a document from a collection.
 */
export async function deleteDocFromDb(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document "${collectionName}/${docId}":`, error);
    throw error;
  }
}

/**
 * Checks if a collection is empty. If empty, seeds initial data via Firestore batch.
 */
export async function seedCollectionIfEmpty(
  collectionName: string,
  initialItems: Array<{ id: string; [key: string]: any }>
): Promise<boolean> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialItems.length > 0) {
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
  } catch (error) {
    console.error(`Error seeding collection "${collectionName}":`, error);
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
