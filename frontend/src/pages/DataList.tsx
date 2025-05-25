import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface MailRow {
  send_date: string;
  progress: string;
  manager_name: string;
  number: string;
  facility_name: string;
  operator_name: string;
  email: string;
}

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
            <th>\u6574\u7406\u756a\u53f7</th>
            <th>\u9001\u4fe1\u65e5\u4ed8</th>
            <th>\u9032\u6357</th>
            <th>\u65bd\u8a2d\u8cac\u4efb\u8005</th>
            <th>\u4e8b\u696d\u6240\u540d</th>
            <th>\u904b\u55b6\u6cd5\u4eba</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.number}>
              <td>{r.number}</td>
              <td>{r.send_date}</td>
              <td>{r.progress}</td>
              <td>{r.manager_name}</td>
              <td>{r.facility_name}</td>
              <td>{r.operator_name}</td>
              <td>{r.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataList;
