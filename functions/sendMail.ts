import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

admin.initializeApp();

const secretName = process.env.SMTP_SECRET || '';

export const sendMail = functions.https.onRequest(async (req, res) => {
  try {
    const data = req.body || {};
    const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const sm = google.secretmanager({ version: 'v1', auth: client });
    const result = await sm.projects.secrets.versions.access({ name: secretName });
    const payload = result.data.payload?.data || '';
    const smtpInfo = JSON.parse(Buffer.from(payload, 'base64').toString());

    const transporter = nodemailer.createTransport({
      host: smtpInfo.host,
      port: smtpInfo.port,
      secure: smtpInfo.secure,
      auth: { user: smtpInfo.user, pass: smtpInfo.pass }
    });

    const info = await transporter.sendMail({
      from: smtpInfo.user,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html
    });

    const doc = await admin.firestore().collection('emails').add({
      to: data.to,
      subject: data.subject,
      messageId: info.messageId,
      response: info.response,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ id: doc.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});
