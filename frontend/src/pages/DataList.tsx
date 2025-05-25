import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type MailRow = {
  send_date: string; progress: string; manager_name: string;
  number: string; facility_name: string; operator_name: string; email: string;
};

const DataList: React.FC = () => {
  const [rows, setRows] = useState<MailRow[]>([]);
  const [error, setError] = useState<string | null>(null); // エラー表示用

  useEffect(() => {
    // Firestore からデータ取得
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'mailData'));
        setRows(snap.docs.map(d => d.data() as MailRow));
      } catch (err) {
        console.error(err);
        setError('Error loading data');
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>\u53d6\u308a\u8fbc\u307f\u6e08\u307f\u30c7\u30fc\u30bf\u4e00\u89a7\uff08{rows.length} \u4ef6\uff09</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>整理番号</th><th>送信日付</th><th>進捗</th>
            <th>施設責任者</th><th>事業所名</th><th>運営法人</th><th>Email</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.number}>
              <td>{r.number}</td><td>{r.send_date}</td><td>{r.progress}</td>
              <td>{r.manager_name}</td><td>{r.facility_name}</td>
              <td>{r.operator_name}</td><td>{r.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataList;