import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const docPath = process.env.REACT_APP_FOLLOWUP_DOC || 'settings/followup';

const Settings: React.FC = () => {
  const [days, setDays] = useState('7');

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, docPath));
      if (snap.exists()) {
        setDays(String((snap.data() as any).intervalDays || '7'));
      }
    })();
  }, []);

  const save = async () => {
    await setDoc(doc(db, docPath), { intervalDays: Number(days) });
    alert('保存しました');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>フォローアップ設定</h2>
      <div>
        <label>間隔(日):</label>
        <input value={days} onChange={e => setDays(e.target.value)} />
        <button onClick={save}>保存</button>
      </div>
    </div>
  );
};

export default Settings;
