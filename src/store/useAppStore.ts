import bcrypt from 'bcryptjs';
import { deleteField, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { buildKO } from '../data/logic';
import { db, fsSet } from '../firebase';
import type {
  AppState,
  Fixture,
  Modal,
  Prediction,
  Result,
  Tab,
  TempPwDisplay,
} from '../types';

const SESSION_KEY = 'fifa_session';
const SESSION_DURATION_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

interface StoredSession {
  uid: string;
  isAdmin: boolean;
  expiry: number;
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StoredSession;
    return session.expiry > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function saveSession(uid: string, isAdmin: boolean): void {
  const session: StoredSession = { uid, isAdmin, expiry: Date.now() + SESSION_DURATION_MS };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

function genTempPw(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const arr = new Uint8Array(10);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join('');
}

type Actions = {
  setTab: (tab: Tab) => void;
  setGrpTab: (grpTab: string) => void;
  setModal: (modal: Modal | null) => void;
  setNameVal: (v: string) => void;
  setPwVal: (v: string) => void;
  setNewPwVal: (v: string) => void;
  setConfirmPwVal: (v: string) => void;
  setUsers: (users: Record<string, string>) => void;
  setResults: (results: Record<number, Result>) => void;
  setPreds: (preds: Record<string, Record<number, Prediction>>) => void;
  login: () => Promise<void>;
  logout: () => void;
  changePassword: () => Promise<void>;
  predict: (fixture: Fixture, pred: Prediction) => Promise<void>;
  enterResult: (fixture: Fixture, res: Result) => Promise<void>;
  generateTempForUser: (uid: string) => Promise<void>;
  dismissTempPw: () => void;
};

type StoreState = AppState & Actions;

const initialSession = loadSession();

export const useAppStore = create<StoreState>((set, get) => ({
  // ── Initial state ────────────────────────────────────────────────────────
  tab: 'fixtures',
  grpTab: 'All',
  uid: initialSession?.uid ?? null,
  isAdmin: initialSession?.isAdmin ?? false,
  users: {},
  preds: {},
  results: {},
  ko: [],
  modal: null,
  nameVal: '',
  pwVal: '',
  loading: true,
  saving: false,
  msg: '',
  loginError: '',
  mustChangePassword: false,
  newPwVal: '',
  confirmPwVal: '',
  changeError: '',
  tempPwDisplay: null,

  // ── Simple setters ───────────────────────────────────────────────────────
  setTab: (tab) => set({ tab }),
  setGrpTab: (grpTab) => set({ grpTab }),
  setModal: (modal) => set({ modal }),
  setNameVal: (nameVal) => set({ nameVal }),
  setPwVal: (pwVal) => set({ pwVal }),
  setNewPwVal: (newPwVal) => set({ newPwVal }),
  setConfirmPwVal: (confirmPwVal) => set({ confirmPwVal }),
  setUsers: (users) => set({ users }),
  setResults: (results) => set({ results, ko: buildKO(results) }),
  setPreds: (preds) => set({ preds }),
  dismissTempPw: () => set({ tempPwDisplay: null }),

  // ── Auth ─────────────────────────────────────────────────────────────────
  login: async () => {
    const { nameVal, pwVal } = get();
    const name = nameVal.trim();
    const pw = pwVal.trim();

    if (!name || !pw) {
      set({ loginError: 'Name and password required' });
      return;
    }

    const uid = name.toLowerCase().replace(/\s+/g, '_');
    set({ saving: true, loginError: '' });

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const stored = userDoc.data() as {
          name: string;
          hashed: string;
          tempHashed?: string;
          role?: string;
        };

        const isAdmin = stored.role === 'admin';
        const validMain = await bcrypt.compare(pw, stored.hashed);

        if (validMain) {
          saveSession(uid, isAdmin);
          set({
            uid, isAdmin, saving: false, pwVal: '', nameVal: '',
            loginError: '', mustChangePassword: false,
          });
          return;
        }

        if (stored.tempHashed) {
          const validTemp = await bcrypt.compare(pw, stored.tempHashed);
          if (validTemp) {
            saveSession(uid, isAdmin);
            set({
              uid, isAdmin, saving: false, pwVal: '', nameVal: '',
              loginError: '', mustChangePassword: true,
              newPwVal: '', confirmPwVal: '', changeError: '',
            });
            return;
          }
        }

        set({ saving: false, loginError: 'Invalid password' });
      } else {
        // New user — register
        const hashed = await bcrypt.hash(pw, 10);
        await setDoc(doc(db, 'users', uid), { name, hashed, created: Date.now() });
        saveSession(uid, false);
        set({
          uid, isAdmin: false, saving: false, pwVal: '', nameVal: '',
          loginError: '', mustChangePassword: false,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ saving: false, loginError: message });
    }
  },

  logout: () => {
    clearSession();
    set({ uid: null, isAdmin: false });
  },

  changePassword: async () => {
    const { newPwVal, confirmPwVal, uid } = get();
    const np = newPwVal.trim();
    const cp = confirmPwVal.trim();

    if (!np) { set({ changeError: 'Enter new password' }); return; }
    if (np.length < 6) { set({ changeError: 'Min 6 characters' }); return; }
    if (np !== cp) { set({ changeError: "Passwords don't match" }); return; }
    if (!uid) { set({ changeError: 'Not logged in' }); return; }

    set({ saving: true, changeError: '' });

    try {
      const hashed = await bcrypt.hash(np, 10);
      await updateDoc(doc(db, 'users', uid), {
        hashed,
        tempHashed: deleteField(),
      });
      set({
        saving: false, mustChangePassword: false,
        newPwVal: '', confirmPwVal: '', changeError: '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      set({ saving: false, changeError: message });
    }
  },

  // ── Predictions & Results ────────────────────────────────────────────────
  predict: async (fixture, pred) => {
    const { uid } = get();
    if (!uid) return;

    set({ saving: true, modal: null });
    await fsSet(`predictions/${uid}`, { [fixture.id]: pred });
    set({ saving: false, msg: '✓ Prediction saved' });
    setTimeout(() => set({ msg: '' }), 2500);
  },

  enterResult: async (fixture, res) => {
    set({ saving: true, modal: null });
    await fsSet('app/results', { [fixture.id]: res });
    set({ saving: false, msg: '✓ Result saved' });
    setTimeout(() => set({ msg: '' }), 2500);
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  generateTempForUser: async (targetUid) => {
    const pw = genTempPw();
    const tempHashed = await bcrypt.hash(pw, 10);
    await updateDoc(doc(db, 'users', targetUid), { tempHashed });
    const tempPwDisplay: TempPwDisplay = { uid: targetUid, pw };
    set({ tempPwDisplay });
  },
}));
