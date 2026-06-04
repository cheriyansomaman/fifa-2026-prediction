import { collection, doc, onSnapshot } from 'firebase/firestore';
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

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const users: Record<string, string> = {};
      snap.forEach((d) => {
        const data = d.data() as { name?: string };
        if (data.name) {
          users[d.id] = data.name;
        }
      });
      useAppStore.getState().setUsers(users);
    });

    const unsubResults = onSnapshot(doc(db, 'app', 'results'), (snap) => {
      const results: Record<number, Result> = snap.exists()
        ? (snap.data() as Record<number, Result>)
        : {};
      useAppStore.getState().setResults(results);
    });

    const unsubPreds = onSnapshot(collection(db, 'predictions'), (snap) => {
      const preds: Record<string, Record<number, Prediction>> = {};
      snap.forEach((d) => {
        preds[d.id] = d.data() as Record<number, Prediction>;
      });
      useAppStore.getState().setPreds(preds);
      useAppStore.setState({ loading: false });
    });

    return () => {
      unsubUsers();
      unsubResults();
      unsubPreds();
    };
  }, [uid]);
}
