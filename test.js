import assert from 'assert';
process.env.USE_ADMIN_STUB = '1';
import * as admin from './functions/dist/admin-stub.js';

const { getCount } = await import('./functions/dist/getCount.js');
const { sendMail } = await import('./functions/dist/sendMail.js');

// Test getCount
admin.__setData({ 'counters/default': { count: 3 } });
const res1 = {
  statusCode: 200,
  body: null,
  json(data) { this.body = data; },
  status(code) { this.statusCode = code; return this; }
};
await getCount({}, res1);
assert.deepStrictEqual(res1.body, { count: 3 });
assert.strictEqual(res1.statusCode, 200);

// Test sendMail success
process.env.TASKS_SERVICE_ACCOUNT = 'svc@example.com';
const req2 = { get: () => 'Bearer valid' };
const res2 = {
  statusCode: 200,
  body: null,
  json(data) { this.body = data; },
  send(data) { this.body = data; },
  status(code) { this.statusCode = code; return this; }
};
await sendMail(req2, res2);
assert.deepStrictEqual(res2.body, { sent: true });
assert.strictEqual(res2.statusCode, 200);

// Verify counter incremented
const resCount = { statusCode: 200, body: null, json(d){this.body=d;}, status(c){this.statusCode=c;return this;} };
await getCount({}, resCount);
assert.deepStrictEqual(resCount.body, { count: 4 });
assert.strictEqual(resCount.statusCode, 200);

// Test sendMail unauthorized
const req3 = { get: () => 'Bearer invalid' };
const res3 = {
  statusCode: 200,
  body: null,
  json(data) { this.body = data; },
  send(data) { this.body = data; },
  status(code) { this.statusCode = code; return this; }
};
await sendMail(req3, res3);
assert.strictEqual(res3.statusCode, 401);
assert.strictEqual(res3.body, 'Unauthorized');

console.log('Tests passed');
