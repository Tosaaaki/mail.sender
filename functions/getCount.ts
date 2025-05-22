import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const getCount = functions.https.onRequest(async (_req, res) => {
  try {
    const snap = await admin.firestore().collection('emails').get();
    res.json({ count: snap.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});
