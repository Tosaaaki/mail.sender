function verifyLogin(token) {
  if (!token) return false;
  // TODO: トークンの有効性を確認する処理を実装する
  return token === 'valid-token';
}

function getUserFromToken(token) {
  if (!verifyLogin(token)) return null;
  // TODO: トークンからユーザー情報を取得する処理を実装する
  return { id: 'user1', email: 'user@example.com' };
}
