const { isAuthed } = require('./_lib/auth');

module.exports = (req, res) => {
  res.status(200).json({ authed: isAuthed(req) });
};
