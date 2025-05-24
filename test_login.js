import assert from 'assert';

// Stub fetch to avoid real network calls
let captured;
global.fetch = async (url, opts) => {
  captured = { url, opts };
  const body = JSON.parse(opts.body);
  if (body.email === 'user@example.com' && body.password === 'pass123') {
    return { json: async () => ({ idToken: 'token123' }) };
  }
  return { json: async () => ({ error: 'invalid credentials' }) };
};

const { login } = await import('./functions/dist/login.js');

// 正しい資格情報の場合はトークンが返る
const req1 = { body: { email: 'user@example.com', password: 'pass123' } };
const res1 = { statusCode: 200, body: null, json(d){this.body=d;}, status(c){this.statusCode=c; return this;} };
await login(req1, res1);
assert.strictEqual(res1.statusCode, 200);
assert.deepStrictEqual(res1.body, { token: 'token123' });

// 資格情報が欠落している場合は400エラー
const req2 = { body: { email: 'user@example.com' } };
const res2 = { statusCode: 200, body: null, json(d){this.body=d;}, status(c){this.statusCode=c; return this;} };
await login(req2, res2);
assert.strictEqual(res2.statusCode, 400);
assert.deepStrictEqual(res2.body, { error: 'missing credentials' });

console.log('login tests passed');

