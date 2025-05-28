import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore';

export interface FollowupSettings {
  intervalDays: number;
  lastSentAt: Date | null;
  stageLimit: number | null;
  templates: Record<string, string>;
  count: number;
}

export function useFollowupSettings(docPath?: string): FollowupSettings {
  const followupDoc = docPath || process.env.REACT_APP_FOLLOWUP_DOC || 'settings/followup';
  const [intervalDays, setIntervalDays] = useState(0);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [stageLimit, setStageLimit] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, followupDoc));
      if (snap.exists()) {
        const data = snap.data() as any;
        if (typeof data.intervalDays === 'number') setIntervalDays(data.intervalDays);
        if (data.lastSentAt) {
          const ts = (data.lastSentAt as Timestamp).toDate
            ? (data.lastSentAt as Timestamp).toDate()
            : new Date(data.lastSentAt);
          setLastSentAt(ts);
        }
        if (typeof data.stageLimit === 'number') setStageLimit(data.stageLimit);
        const t: Record<string, string> = {};
        ['subject1', 'body1', 'subject2', 'body2'].forEach(k => {
          if (typeof data[k] === 'string') t[k] = data[k];
        });
        setTemplates(t);
      }
    })();
    const ref = doc(db, 'counters', 'default');
    const unsub = onSnapshot(ref, snap => {
      setCount((snap.data() as any)?.count || 0);
    });
    return () => unsub();
  }, [followupDoc]);

  return { intervalDays, lastSentAt, stageLimit, templates, count };
}
