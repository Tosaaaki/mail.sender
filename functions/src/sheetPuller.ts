import * as functions from 'firebase-functions';
import { CloudTasksClient } from '@google-cloud/tasks';

const client = new CloudTasksClient();

export const sheetPuller = functions.https.onRequest(async (req: any, res: any) => {
  const queue = process.env.QUEUE_NAME;
  const region = process.env.TASKS_REGION;
  const project = process.env.GCP_PROJECT || process.env.PROJECT_ID;
  const url = process.env.SEND_MAIL_URL || '';
  if (!queue || !region || !project || !url) {
    res.status(500).send('Missing environment configuration');
    return;
  }
  const parent = client.queuePath(project, region, queue);

  const task = {
    httpRequest: {
      httpMethod: 'POST' as const,
      url,
      oidcToken: {
        serviceAccountEmail: process.env.TASKS_SERVICE_ACCOUNT || '',
      },
    },
  };

  await client.createTask({ parent, task });
  res.json({ scheduled: true });
});
