import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useRef } from 'react';
import { db } from '../firebase';
import type { PasswordRequest, Prediction } from '../types';
import { useAppStore } from '../store/useAppStore';

type Unsub = () => void;

export function useLazySync(): void {
  const uid = useAppStore((state) => state.uid);
  const tab = useAppStore((state) => state.tab);

  const unsubUsersRef = useRef<Unsub | null>(null);
  const unsubAllPredsRef = useRef<Unsub | null>(null);
  const unsubPwRequestsRef = useRef<Unsub | null>(null);

  useEffect(() => {
    if (!uid) {
      unsubUsersRef.current?.();
      unsubAllPredsRef.current?.();
      unsubPwRequestsRef.current?.();
      unsubUsersRef.current = null;
      unsubAllPredsRef.current = null;
      unsubPwRequestsRef.current = null;
      useAppStore.setState({ allPredsLoading: false, pwRequests: {} });
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const needsUsers = tab === 'leaderboard' || tab === 'users';

    if (needsUsers && !unsubUsersRef.current) {
      unsubUsersRef.current = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          const users: Record<string, string> = {};
          snap.forEach((d) => {
            const data = d.data() as { name?: string };
            if (data.name) users[d.id] = data.name;
          });
          useAppStore.getState().setUsers(users);
        },
        (err) => console.error('[sync] users:', err.message),
      );
    }

    if (tab === 'users' && !unsubPwRequestsRef.current) {
      unsubPwRequestsRef.current = onSnapshot(
        collection(db, 'passwordRequests'),
        (snap) => {
          const pwRequests: Record<string, PasswordRequest> = {};
          snap.forEach((d) => { pwRequests[d.id] = d.data() as PasswordRequest; });
          useAppStore.getState().setPwRequests(pwRequests);
        },
        (err) => console.error('[sync] pw-requests:', err.message),
      );
    }

    if (tab === 'leaderboard' && !unsubAllPredsRef.current) {
      useAppStore.setState({ allPredsLoading: true });
      unsubAllPredsRef.current = onSnapshot(
        collection(db, 'predictions'),
        (snap) => {
          const preds: Record<string, Record<number, Prediction>> = {};
          snap.forEach((d) => {
            preds[d.id] = d.data() as Record<number, Prediction>;
          });
          useAppStore.getState().setPreds(preds);
          useAppStore.setState({ allPredsLoading: false });
        },
        (err) => {
          console.error('[sync] all-preds:', err.message);
          useAppStore.setState({ allPredsLoading: false });
        },
      );
    }
  }, [uid, tab]);
}
