module.exports = (req, res) => {
  res.setHeader('Set-Cookie', 'hb_auth=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');
  res.status(200).json({ ok: true });
};
