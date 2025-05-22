import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Stats: React.FC = () => {
  const [count, setCount] = useState(0);
  const senderId = 'default';

  useEffect(() => {
    const ref = doc(db, 'counters', senderId);
    const unsub = onSnapshot(ref, snap => {
      setCount((snap.data() as any)?.count || 0);
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <h2>Sent Count: {count}</h2>
    </div>
  );
};

export default Stats;
