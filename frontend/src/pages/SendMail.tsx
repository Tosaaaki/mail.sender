import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';

interface State {
  row?: any;
}

const SendMail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as State || {};
  const row = state.row || {};

  const [to, setTo] = useState(row.email || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = process.env.REACT_APP_FUNCTIONS_BASE_URL || '';

  const handleSend = async () => {
    if (!to.match(/^[^@]+@[^@]+$/)) {
      setError('メールアドレスが不正です');
      return;
    }
    if (!subject || !body) {
      setError('件名と本文を入力してください');
      return;
    }

    const token = localStorage.getItem('token');
    const resp = await fetch(`${baseUrl}/sendMail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id: row.number, to, subject, text: body }),
    });
    if (resp.ok) {
      alert('送信しました');
      navigate(-1);
    } else {
      const data = await resp.json().catch(() => ({}));
      alert('送信失敗: ' + (data.error || resp.statusText));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>メール送信</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>宛先:</label>
        <input value={to} onChange={e => setTo(e.target.value)} />
      </div>
      <div>
        <label>件名:</label>
        <input value={subject} onChange={e => setSubject(e.target.value)} />
      </div>
      <div>
        <label>本文:</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} />
      </div>
      <div>
        <h3>プレビュー</h3>
        <pre>{body}</pre>
      </div>
      <div>
        <label>
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} /> 確認しました
        </label>
      </div>
      <button onClick={handleSend} disabled={!checked}>送信</button>
    </div>
  );
};

export default SendMail;
