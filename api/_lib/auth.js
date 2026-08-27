const crypto = require('crypto');

// SITE_PASSWORD를 키로 고정 문자열을 HMAC 서명한 값을 세션 토큰으로 사용합니다.
// 별도의 세션 저장소(DB) 없이도 검증할 수 있어 서버리스 환경에 적합합니다.
function getExpectedToken() {
  const secret = process.env.SITE_PASSWORD || '';
  return crypto.createHmac('sha256', secret).update('hborad-auth-v1').digest('hex');
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function isAuthed(req) {
  if (!process.env.SITE_PASSWORD) return false;
  const cookies = parseCookies(req.headers.cookie);
  return cookies.hb_auth === getExpectedToken();
}

module.exports = { getExpectedToken, parseCookies, isAuthed };
