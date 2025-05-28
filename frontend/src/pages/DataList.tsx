import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type MailRow = {
  send_date: string;
  progress: string;
  manager_name: string;
  number: string;
  facility_name: string;
  operator_name: string;
  hp_url: string;   // NEW ― 公式サイト／問い合わせ URL
  email: string;
};

const DataList: React.FC = () => {
  const [rows, setRows] = useState<MailRow[]>([]);
  const [loading, setLoading] = useState(false);
  const pullerUrl = process.env.REACT_APP_SHEET_PULLER_URL!;

  // Firestore から読み込む
  const fetchRows = async () => {
    const snap = await getDocs(collection(db, 'mailData'));
    setRows(snap.docs.map(d => d.data() as MailRow));
  };

  // sheetPuller → Firestore → 画面更新
  const runSheetPuller = async () => {
    setLoading(true);
    await fetch(pullerUrl, { method: 'POST' });
    await fetchRows();
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>取り込み済みデータ一覧（{rows.length} 件）</h2>

      <button onClick={runSheetPuller} disabled={loading}>
        {loading ? '取り込み中…' : '最新を取り込む'}
      </button>

      <table border={1} cellPadding={4} style={{ marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>整理番号</th><th>送信日付</th><th>進捗</th>
            <th>施設責任者</th><th>事業所名</th><th>運営法人</th><th>HP / URL</th><th>Email</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.number}>
              <td>{r.number}</td><td>{r.send_date}</td><td>{r.progress}</td>
              <td>{r.manager_name}</td><td>{r.facility_name}</td>
              <td>{r.operator_name}</td>
              <td>
                {r.hp_url ? (
                  <a href={r.hp_url} target="_blank" rel="noopener noreferrer">
                    {r.hp_url}
                  </a>
                ) : '—'}
              </td>
              <td>{r.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataList;