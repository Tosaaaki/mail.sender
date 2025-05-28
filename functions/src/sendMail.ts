import * as functions from 'firebase-functions';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import admin from './admin.js';

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

export const sendMail = functions.https.onRequest(async (req: any, res: any) => {
  try {
    await verifyTaskRequest(req);
  } catch (err) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { id, to, subject, text } = req.body || {};
  if (!to || !subject || !text || !id) {
    res.status(400).json({ error: 'missing parameters' });
    return;
  }

  const transportOpts = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  } as any;

  if (!process.env.SMTP_DISABLE) {
    try {
      const transporter = nodemailer.createTransport(transportOpts);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'failed to send mail' });
      return;
    }
  }

  try {
    const counterRef = admin.firestore().doc(`counters/${req.body.senderId || 'default'}`);
    await counterRef.set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });

    const mailRef = admin.firestore().doc(`mailData/${id}`);
    await mailRef.set({
      progress: '送信済み',
      followupStage: admin.firestore.FieldValue.increment(1),
      lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.error(err);
  }

  res.json({ sent: true });
});
