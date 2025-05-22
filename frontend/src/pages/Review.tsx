import React, { useEffect, useState } from 'react';
import { collection, query, where, runTransaction, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Email {
  id: string;
  subject: string;
  body: string;
}

const Review: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);

  const fetchPending = async () => {
    const q = query(collection(db, 'emails'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    const results: Email[] = [];
    snap.forEach(docSnap => {
      results.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    setEmails(results);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (email: Email) => {
    await runTransaction(db, async transaction => {
      const ref = doc(db, 'emails', email.id);
      transaction.update(ref, { reviewed: true });
    });
    await fetch('/sendMail', { method: 'POST' });
    fetchPending();
  };

  return (
    <div>
      <h2>Pending Emails</h2>
      <ul>
        {emails.map(e => (
          <li key={e.id}>
            <input defaultValue={e.subject} />
            <textarea defaultValue={e.body} />
            <button onClick={() => handleReview(e)}>Mark Reviewed</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Review;
