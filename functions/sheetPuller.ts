import * as functions from 'firebase-functions';
import { google } from 'googleapis';

const spreadsheetId = process.env.SPREADSHEET_ID || '';
const range = process.env.SHEET_RANGE || 'Sheet1!A:Z';
const queuePath = process.env.TASK_QUEUE_PATH || '';
const taskUrl = process.env.TASK_HANDLER_URL || '';

export const sheetPuller = functions.https.onRequest(async (_req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/cloud-tasks'
      ]
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const values = resp.data.values || [];
    const header = values.shift() || [];
    const sentIdx = header.indexOf('sent');
    const tasks = google.cloudtasks({ version: 'v2', auth: client });
    let count = 0;
    for (const row of values) {
      if (sentIdx >= 0 && row[sentIdx] === 'TRUE') continue;
      await tasks.projects.locations.queues.tasks.create({
        parent: queuePath,
        requestBody: {
          httpRequest: {
            httpMethod: 'POST',
            url: taskUrl,
            body: Buffer.from(JSON.stringify(row)).toString('base64'),
            headers: { 'Content-Type': 'application/json' }
          }
        }
      });
      count++;
    }
    res.json({ enqueued: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});
