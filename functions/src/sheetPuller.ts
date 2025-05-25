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

type ColumnMap = Record<string, number>;

function getFieldMap(): ColumnMap {
  const defaultMap: ColumnMap = {
    id: 0,
    send_date: 0,
    progress: 1,
    manager_name: 2,
    number: 3,
    facility_name: 4,
    operator_name: 5,
    email: 6,
  };
  const env = process.env.SHEET_FIELD_MAP;
  if (!env) return defaultMap;
  try {
    const parsed = JSON.parse(env);
    return { ...defaultMap, ...parsed };
  } catch {
    return defaultMap;
  }
}

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
    const fieldMap = getFieldMap();
    const idIndex = fieldMap.id ?? 0;

    values.slice(1).forEach((row: string[]) => {
      const id = row[idIndex];
      if (!id) return;
      const docRef = db.collection('mailData').doc(id);
      const data: Record<string, string> = {};
      Object.entries(fieldMap).forEach(([field, idx]) => {
        if (field === 'id') return;
        data[field] = row[idx] || '';
      });
      batch.set(docRef, data);
    });

    await batch.commit();

    res.status(200).json({ pulled: values.length - 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});
