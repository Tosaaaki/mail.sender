function verifyLogin(id, pw) {
  if (!id || !pw) return null;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('送信者');
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  var hash = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pw, Utilities.Charset.UTF_8)
  );
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === id && row[1] === hash) {
      var token = Utilities.getUuid();
      CacheService.getScriptCache().put(token, id, 3600);
      return token;
    }
  }
  return null;
}

function getUserFromToken(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache();
  var userId = cache.get(token);
  if (!userId) return null;
  return { id: userId };
}
