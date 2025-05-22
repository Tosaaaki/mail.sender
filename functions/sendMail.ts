import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

async function verifyTaskRequest(req: Request) {
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

export const sendMail = async (req: Request, res: Response) => {
  try {
    await verifyTaskRequest(req);
  } catch (err) {
    res.status(401).send('Unauthorized');
    return;
  }

  // 本来はここでメール送信処理を行う
  res.json({ sent: true });
};