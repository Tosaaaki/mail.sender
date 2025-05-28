import React, { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useFollowupSettings } from '../hooks/useFollowupSettings';

const docPath = process.env.REACT_APP_FOLLOWUP_DOC || 'settings/followup';

const Settings: React.FC = () => {
  const [days, setDays] = useState('7');
  const { intervalDays, templates } = useFollowupSettings(docPath);

  // intervalDays が取得できたら state を更新
  useEffect(() => {
    if (intervalDays) setDays(String(intervalDays));
  }, [intervalDays]);

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
      {/* テンプレート確認用 */}
      <div style={{ marginTop: 24 }}>
        <h3>Template Preview</h3>
        <div>
          <strong>Subject1:</strong> {templates.subject1 || '—'}
        </div>
        <div>
          <strong>Body1:</strong>
          <pre>{templates.body1 || ''}</pre>
        </div>
      </div>
    </div>
  );
};

export default Settings;
