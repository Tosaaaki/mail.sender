import React, { useEffect, useState } from 'react';
import { getDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { collection, getDocs, doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

type MailRow = {
  send_date: string;
  progress: string;
  manager_name: string;
  number: string;
  facility_name: string;
  operator_name: string;
  hp_url: string;   // NEW ― 公式サイト／問い合わせ URL
  email: string;
  followupStage?: number;
  lastSentAt?: any;
};

const DataList: React.FC = () => {
  const [rows, setRows] = useState<MailRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [assistRow, setAssistRow] = useState<MailRow | null>(null);
  const pullerUrl = process.env.REACT_APP_SHEET_PULLER_URL!;
  const navigate = useNavigate();

  const followupDoc = process.env.REACT_APP_FOLLOWUP_DOC || 'settings/followup';
  const [intervalDays, setIntervalDays] = useState(0);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [stageLimit, setStageLimit] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [templates, setTemplates] = useState<Record<string, string>>({});

  // Firestore から読み込む
  const fetchRows = async () => {
    const snap = await getDocs(collection(db, 'mailData'));
    setRows(snap.docs.map(d => d.data() as MailRow));
  };

  const handleSend = (row: MailRow) => {
    navigate('/send', { state: { row } });
  };

  const handleForm = async (row: MailRow) => {
    if (row.hp_url) {
      window.open(row.hp_url, '_blank');
      setAssistRow(row);
    }
  };

  const markSent = async () => {
    if (!assistRow) return;
    await updateDoc(doc(db, 'mailData', assistRow.number), {
      progress: '送信済み',
      followupStage: increment(1),
      lastSentAt: serverTimestamp(),
    });
    setAssistRow(null);
    fetchRows();
  };

  const canSend = () => {
    if (stageLimit !== null && count >= stageLimit) return false;
    if (!intervalDays) return true;
    if (!lastSentAt) return true;
    const diff = (Date.now() - lastSentAt.getTime()) / 86400000;
    return diff >= intervalDays;
  };

  // sheetPuller → Firestore → 画面更新
  const runSheetPuller = async () => {
    setLoading(true);
    await fetch(pullerUrl, { method: 'POST' });
    await fetchRows();
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    (async () => {
      const snap = await getDoc(doc(db, followupDoc));
      if (snap.exists()) {
        const data = snap.data() as any;
        if (typeof data.intervalDays === 'number') setIntervalDays(data.intervalDays);
        if (data.lastSentAt) {
          const ts = (data.lastSentAt as Timestamp).toDate ? (data.lastSentAt as Timestamp).toDate() : new Date(data.lastSentAt);
          setLastSentAt(ts);
        }
        if (typeof data.stageLimit === 'number') setStageLimit(data.stageLimit);
        const t: Record<string, string> = {};
        ['subject1','body1','subject2','body2'].forEach(k => {
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
  }, []);

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
            <th>施設責任者</th><th>事業所名</th><th>運営法人</th><th>HP / URL</th><th>Email</th><th>操作</th>
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
              <td>
                {r.email ? (
                  <button onClick={() => handleSend(r)} disabled={!canSend()}>
                    メール送信
                  </button>
                ) : r.hp_url ? (
                  <button onClick={() => handleForm(r)}>フォーム</button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {assistRow && (
        <div style={{ position: 'fixed', bottom: 0, right: 0, background: '#fff', border: '1px solid #ccc', padding: 16 }}>
          <h3>コピー支援</h3>
          <div>
            <span>件名: </span>
            <button onClick={() => navigator.clipboard.writeText(templates.subject1 || '')}>Copy</button>
          </div>
          <div>
            <span>本文: </span>
            <button onClick={() => navigator.clipboard.writeText(templates.body1 || '')}>Copy</button>
          </div>
          <button onClick={markSent}>送信済み</button>
          <button onClick={() => setAssistRow(null)}>閉じる</button>
        </div>
      )}
    </div>
  );
};

export default DataList;
