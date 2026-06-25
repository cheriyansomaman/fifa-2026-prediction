import bcrypt from 'bcryptjs';
import { collection, deleteField, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { buildKO } from '../data/logic';
import { db, fsSet } from '../firebase';
import type {
  AppState,
  Fixture,
  Modal,
  PasswordRequest,
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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 20000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout. Please check your internet and try again.')), timeoutMs)
    ),
  ]);
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
  setWaVal: (v: string) => void;
  setWaCodeVal: (v: string) => void;
  setPreds: (preds: Record<string, Record<number, Prediction>>) => void;
  login: () => Promise<void>;
  logout: () => void;
  changePassword: () => Promise<void>;
  predict: (fixture: Fixture, pred: Prediction) => Promise<void>;
  enterResult: (fixture: Fixture, res: Result) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  generateTempForUser: (uid: string, opts?: { requestId?: string; whatsapp?: string; countryCode?: string }) => Promise<void>;
  dismissTempPw: () => void;
  setPwRequests: (requests: Record<string, PasswordRequest>) => void;
  submitPwRequest: (name: string, countryCode: string, whatsapp: string) => Promise<void>;
  dismissPwRequest: (requestId: string) => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
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
  loading: Boolean(initialSession),
  allPredsLoading: false,
  saving: false,
  msg: '',
  errorMsg: '',
  syncError: '',
  loginError: '',
  mustChangePassword: false,
  newPwVal: '',
  confirmPwVal: '',
  changeError: '',
  tempPwDisplay: null,
  pwRequests: {},
  waVal: '',
  waCodeVal: '+44',

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
  setWaVal: (waVal) => set({ waVal }),
  setWaCodeVal: (waCodeVal) => set({ waCodeVal }),
  setPreds: (preds) => set({ preds }),
  dismissTempPw: () => set({ tempPwDisplay: null }),
  setPwRequests: (pwRequests) => set({ pwRequests }),

  // ── Auth ─────────────────────────────────────────────────────────────────
  login: async () => {
    const { nameVal, pwVal, waVal, waCodeVal } = get();
    const name = nameVal.trim();
    const pw = pwVal.trim();

    if (!name || !pw) {
      set({ loginError: 'Name and password required' });
      return;
    }

    const uid = name.toLowerCase().replace(/\s+/g, '_');
    set({ saving: true, loginError: '' });

    try {
      const userDoc = await withTimeout(getDoc(doc(db, 'users', uid)), 10000);

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
        if (!waVal.trim()) {
          set({ saving: false, loginError: 'WhatsApp number required for new registration.' });
          return;
        }
        const hashed = await bcrypt.hash(pw, 10);
        if (pw.length < 8) {
          set({ saving: false, loginError: 'Password must be at least 8 characters.' });
          return;
        }
        const docData: Record<string, unknown> = { name, hashed, created: Date.now() };
        if (waVal.trim()) { docData.whatsapp = waVal.trim(); docData.countryCode = waCodeVal; }
        delete docData.role;
        await withTimeout(setDoc(doc(db, 'users', uid), docData), 10000);
        saveSession(uid, false);
        set({
          uid, isAdmin: false, saving: false, pwVal: '', nameVal: '',
          waVal: '', waCodeVal: '+44', loginError: '', mustChangePassword: false,
        });
      }
    } catch (err: unknown) {
      let message = 'Login failed';
      if (err instanceof Error) {
        if (err.message.includes('offline') || err.message.includes('Offline')) {
          message = 'No internet connection. Please check your connection and try again.';
        } else if (err.message.includes('timeout') || err.message.includes('Connection timeout')) {
          message = 'Connection timeout. Please check your internet and try again.';
        } else {
          message = err.message;
        }
      }
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
    if (np.length < 8) { set({ changeError: 'Min 8 characters' }); return; }
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
    try {
      await fsSet(`predictions/${uid}`, { [fixture.id]: pred });
      set({ saving: false, msg: '✓ Prediction saved' });
      setTimeout(() => set({ msg: '' }), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save prediction';
      set({ saving: false, errorMsg: message });
      setTimeout(() => set({ errorMsg: '' }), 4000);
    }
  },

  enterResult: async (fixture, res) => {
    if (!get().isAdmin) return;
    set({ saving: true, modal: null });
    try {
      await fsSet('app/results', { [fixture.id]: res });
      set({ saving: false, msg: '✓ Result saved' });
      setTimeout(() => set({ msg: '' }), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save result';
      set({ saving: false, errorMsg: message });
      setTimeout(() => set({ errorMsg: '' }), 4000);
    }
  },

  updateDisplayName: async (displayName) => {
    const { uid } = get();
    if (!uid) return;
    const trimmed = displayName.trim().slice(0, 30);
    try {
      await updateDoc(doc(db, 'users', uid), { displayName: trimmed || deleteField() });
      if (trimmed) {
        set((s) => ({ users: { ...s.users, [uid]: trimmed } }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update display name';
      set({ errorMsg: message });
      setTimeout(() => set({ errorMsg: '' }), 4000);
    }
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  generateTempForUser: async (targetUid, opts) => {
    try {
      const pw = genTempPw();
      const tempHashed = await bcrypt.hash(pw, 10);
      await updateDoc(doc(db, 'users', targetUid), { tempHashed });
      if (opts?.requestId) {
        await import('firebase/firestore').then(({ deleteDoc: delDoc }) =>
          delDoc(doc(db, 'passwordRequests', opts.requestId!))
        );
      }
      const tempPwDisplay: TempPwDisplay = {
        uid: targetUid,
        pw,
        whatsapp: opts?.whatsapp,
        countryCode: opts?.countryCode,
      };
      set({ tempPwDisplay });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate temporary password';
      set({ errorMsg: message });
      setTimeout(() => set({ errorMsg: '' }), 4000);
    }
  },

  submitPwRequest: async (name, countryCode, whatsapp) => {
    const uid = name.toLowerCase().replace(/\s+/g, '_');
    let verified = false;
    try {
      const userSnap = await withTimeout(getDoc(doc(db, 'users', uid)), 10000);
      if (!userSnap.exists()) {
        return;
      }
      const userData = userSnap.data() as { whatsapp?: string; countryCode?: string };
      if (userData.whatsapp && userData.countryCode) {
        verified =
          userData.whatsapp.replace(/\D/g, '') === whatsapp.replace(/\D/g, '') &&
          userData.countryCode === countryCode;
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to verify user');
    }
    const request: PasswordRequest = { uid, name, countryCode, whatsapp, requestedAt: Date.now(), verified };
    await fsSet(`passwordRequests/${uid}`, request as unknown as Record<string, unknown>);

    const tgToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const tgChat = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID;
    if (tgToken && tgChat) {
      fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChat,
          text: `🔐 FIFA 2026 — Password Request\n\nUser: ${name}\nWhatsApp: ${countryCode} ${whatsapp}\nStatus: ${verified ? '✓ Verified' : '⚠ Unverified'}`,
        }),
      }).catch((err: unknown) => {
        console.warn('[telegram] Failed to send admin notification:', err instanceof Error ? err.message : err);
      });
    }
  },

  dismissPwRequest: async (requestId) => {
    try {
      const { deleteDoc: delDoc } = await import('firebase/firestore');
      await delDoc(doc(db, 'passwordRequests', requestId));
      set((s) => {
        const updated = { ...s.pwRequests };
        delete updated[requestId];
        return { pwRequests: updated };
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to dismiss request';
      set({ errorMsg: message });
      setTimeout(() => set({ errorMsg: '' }), 4000);
    }
  },

  refreshLeaderboard: async () => {
    if (!get().uid) return;
    set({ allPredsLoading: true });
    try {
      const snap = await getDocs(collection(db, 'predictions'));
      const preds: Record<string, Record<number, Prediction>> = {};
      snap.forEach((d) => { preds[d.id] = d.data() as Record<number, Prediction>; });
      set({ preds, allPredsLoading: false });
    } catch (err) {
      console.error('[refresh] leaderboard:', err);
      set({ allPredsLoading: false });
    }
  },
}));
