import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const getCount = functions.https.onRequest(async (_req, res) => {
  const senderId = 'default';
  try {
    const snap = await admin.firestore().doc(`counters/${senderId}`).get();
    const count = snap.exists ? (snap.data() as any).count || 0 : 0;
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});
