import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { db } from '../firebase';
import type { KoTeamOverride, Prediction, Result } from '../types';
import { useAppStore } from '../store/useAppStore';

export function useFirebaseSync(): void {
  const uid = useAppStore((state) => state.uid);

  useEffect(() => {
    if (!uid) {
      useAppStore.setState({ loading: false });
      return;
    }

    useAppStore.setState({ loading: true });

    const unsubResults = onSnapshot(
      doc(db, 'app', 'results'),
      (snap) => {
        const results: Record<number, Result> = snap.exists()
          ? (snap.data() as Record<number, Result>)
          : {};
        useAppStore.getState().setResults(results);
        useAppStore.setState({ loading: false });
      },
      (err) => {
        console.error('[sync] results:', err.message);
        useAppStore.setState({ loading: false, syncError: `Results sync failed: ${err.message}` });
      },
    );

    const unsubKoOverrides = onSnapshot(
      doc(db, 'app', 'koOverrides'),
      (snap) => {
        const overrides: Record<number, KoTeamOverride> = snap.exists()
          ? (snap.data() as Record<number, KoTeamOverride>)
          : {};
        useAppStore.getState().setKoOverrides(overrides);
      },
      (err) => {
        console.error('[sync] koOverrides:', err.message);
        useAppStore.setState({ syncError: `Knockout overrides sync failed: ${err.message}` });
      },
    );

    const unsubOwnPreds = onSnapshot(
      doc(db, 'predictions', uid),
      (snap) => {
        const pred = snap.exists() ? (snap.data() as Record<number, Prediction>) : {};
        useAppStore.setState((s) => ({ preds: { ...s.preds, [uid]: pred } }));
      },
      (err) => {
        console.error('[sync] own-preds:', err.message);
        useAppStore.setState({ syncError: `Predictions sync failed: ${err.message}` });
      },
    );

    const unsubUser = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        const data = snap.data() as { role?: string; name?: string; displayName?: string } | undefined;
        const label = data?.displayName?.trim() || data?.name;
        useAppStore.setState((s) => ({
          isAdmin: data?.role === 'admin',
          users: label ? { ...s.users, [uid]: label } : s.users,
        }));
      },
      (err) => {
        console.error('[sync] user:', err.message);
        useAppStore.setState({ syncError: `User sync failed: ${err.message}` });
      },
    );

    return () => {
      unsubResults();
      unsubKoOverrides();
      unsubOwnPreds();
      unsubUser();
    };
  }, [uid]);
}
