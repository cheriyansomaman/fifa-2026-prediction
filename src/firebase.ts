import { initializeApp } from 'firebase/app';
import {
  doc,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
} from 'firebase/firestore';

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_APP_ID',
] as const;

const missing = REQUIRED_VARS.filter((k) => !import.meta.env[k]);
if (missing.length > 0) {
  throw new Error(`Missing Firebase env vars: ${missing.join(', ')}. Check .env file.`);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export async function fsSet(
  path: string,
  data: Record<string, unknown>,
): Promise<void> {
  const parts = path.split('/');
  await setDoc(doc(db, ...parts as [string, ...string[]]), data, { merge: true });
}
