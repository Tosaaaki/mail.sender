import * as functions from 'firebase-functions';
import { OAuth2Client } from 'google-auth-library';
import admin from './admin';

const client = new OAuth2Client();

async function verifyTaskRequest(req: functions.https.Request) {
  const authHeader = req.get('Authorization') || '';
  const match = authHeader.match(/^Bearer (.*)$/);
  if (!match) throw new Error('Missing bearer token');
  const token = match[1];
  const audience = process.env.TASKS_AUDIENCE || '';
  const ticket = await client.verifyIdToken({ idToken: token, audience });
  const payload = ticket.getPayload();
  const expected = process.env.TASKS_SERVICE_ACCOUNT;
  if (!payload || payload.email !== expected) {
    throw new Error('Invalid task token');
  }
}

export const sendMail = functions.https.onRequest(async (req, res) => {
  try {
    await verifyTaskRequest(req);
  } catch (err) {
    res.status(401).send('Unauthorized');
    return;
  }

  const senderId = req.body?.senderId || 'default';

  // 本来はここでメール送信処理を行う
  try {
    const ref = admin.firestore().doc(`counters/${senderId}`);
    await ref.set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });
  } catch (err) {
    console.error(err);
  }

  res.json({ sent: true });
});
