import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { db } from '../firebase';
import type { Prediction, Result } from '../types';
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
        useAppStore.setState({ loading: false });
      },
    );

    const unsubOwnPreds = onSnapshot(
      doc(db, 'predictions', uid),
      (snap) => {
        const pred = snap.exists() ? (snap.data() as Record<number, Prediction>) : {};
        useAppStore.setState((s) => ({ preds: { ...s.preds, [uid]: pred } }));
      },
      (err) => console.error('[sync] own-preds:', err.message),
    );

    return () => {
      unsubResults();
      unsubOwnPreds();
    };
  }, [uid]);
}
