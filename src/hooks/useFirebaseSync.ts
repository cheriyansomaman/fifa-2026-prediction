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

    let resultsReady = false;
    let ownPredsReady = false;

    function checkReady() {
      if (resultsReady && ownPredsReady) {
        useAppStore.setState({ loading: false });
      }
    }

    const unsubResults = onSnapshot(
      doc(db, 'app', 'results'),
      (snap) => {
        const results: Record<number, Result> = snap.exists()
          ? (snap.data() as Record<number, Result>)
          : {};
        useAppStore.getState().setResults(results);
        if (!resultsReady) { resultsReady = true; checkReady(); }
      },
      (err) => {
        console.error('[sync] results:', err.message);
        if (!resultsReady) { resultsReady = true; checkReady(); }
      },
    );

    const unsubOwnPreds = onSnapshot(
      doc(db, 'predictions', uid),
      (snap) => {
        const pred = snap.exists() ? (snap.data() as Record<number, Prediction>) : {};
        useAppStore.setState((s) => ({ preds: { ...s.preds, [uid]: pred } }));
        if (!ownPredsReady) { ownPredsReady = true; checkReady(); }
      },
      (err) => {
        console.error('[sync] own-preds:', err.message);
        if (!ownPredsReady) { ownPredsReady = true; checkReady(); }
      },
    );

    return () => {
      unsubResults();
      unsubOwnPreds();
    };
  }, [uid]);
}
