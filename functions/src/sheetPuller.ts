import * as functions from 'firebase-functions';
import admin from './admin.js';
import dotenv from 'dotenv';

dotenv.config();
// admin.initializeApp(); ← 削除します

let google: any;
try {
  ({ google } = await import('googleapis'));
} catch {
  ({ google } = await import('./googleapis-stub.js'));
}

const db = admin.firestore();

export const sheetPuller = functions.https.onRequest(async (_req: any, res: any) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.SHEET_ID;
  const sheetName = process.env.SHEET_NAME || '一覧・操作';
  const sheetRange = process.env.SHEET_RANGE || 'A:G';

  if (!apiKey || !sheetId) {
    res.status(500).send('Missing environment configuration');
    return;
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!${sheetRange}`,
    });

    const values = result.data.values || [];
    const batch = db.batch();

    values.slice(1).forEach((row: string[]) => {
      const id = row[0];
      if (!id) return;
      const docRef = db.collection('mailData').doc(id);
      batch.set(docRef, {
        send_date: row[0] || '',
        progress: row[1] || '',
        manager_name: row[2] || '',
        number: row[3] || '',
        facility_name: row[4] || '',
        operator_name: row[5] || '',
        email: row[6] || '',
      });
    });

    await batch.commit();

    res.status(200).json({ pulled: values.length - 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});