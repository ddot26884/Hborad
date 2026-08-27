const crypto = require('crypto');
const { getExpectedToken } = require('./_lib/auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  const password = process.env.SITE_PASSWORD || '';
  if (!password) {
    res.status(500).json({ ok: false, error: 'SITE_PASSWORD 환경변수가 설정되지 않았습니다.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const input = (body && body.password) || '';

  const a = Buffer.from(String(input));
  const b = Buffer.from(String(password));
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    res.status(401).json({ ok: false });
    return;
  }

  const token = getExpectedToken();
  const maxAge = 60 * 60 * 24 * 30; // 30일
  res.setHeader(
    'Set-Cookie',
    `hb_auth=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );
  res.status(200).json({ ok: true });
};
