
function login(username, password) {
  if (username === 'user' && password === 'pass') {
    var token = Utilities.getUuid();
    PropertiesService.getScriptProperties().setProperty('token_' + token, username);
    return token;
  }
  return null;
}

function verifyLogin(token) {
  if (!token) return false;
  return !!PropertiesService.getScriptProperties().getProperty('token_' + token);
}

function getUserFromToken(token) {
  if (!verifyLogin(token)) return null;
  var username = PropertiesService.getScriptProperties().getProperty('token_' + token);
  return { id: username, email: username + '@example.com' };
