const { isAuthed } = require('./_lib/auth');

const GITHUB_API = 'https://api.github.com';

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hborad-app'
  };
}

function getConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const path = process.env.GITHUB_DATA_PATH || 'data/hboard-data.json';
  if (!owner || !repo || !process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_OWNER / GITHUB_REPO / GITHUB_TOKEN 환경변수를 확인하세요.');
  }
  return { owner, repo, branch, path };
}

// 저장소의 데이터 파일을 읽습니다. 파일이 아직 없으면 빈 객체를 돌려줍니다.
async function fetchFile() {
  const { owner, repo, branch, path } = getConfig();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const r = await fetch(url, { headers: ghHeaders() });
  if (r.status === 404) return { sha: null, data: {} };
  if (!r.ok) throw new Error('GitHub 파일 조회 실패: ' + r.status + ' ' + (await r.text()));
  const json = await r.json();
  const content = Buffer.from(json.content, 'base64').toString('utf-8');
  let data = {};
  try { data = JSON.parse(content); } catch (e) { data = {}; }
  return { sha: json.sha, data };
}

// 데이터 파일을 커밋합니다. sha가 없으면 새 파일을 생성합니다.
async function saveFile(data, sha, message) {
  const { owner, repo, branch, path } = getConfig();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const body = {
    message: message || 'hborad: update data',
    content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
    branch
  };
  if (sha) body.sha = sha;
  const r = await fetch(url, {
    method: 'PUT',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    const err = new Error('GitHub 저장 실패: ' + r.status + ' ' + t);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

// key 하나를 읽기→수정→저장합니다. 다른 요청과 거의 동시에 저장해서
// GitHub 파일 버전(sha)이 어긋나 409/422가 나면, 최신 파일을 다시 읽어
// 같은 수정을 재적용한 뒤 재시도합니다 (최대 4회).
async function applyKeyUpdate(mutate) {
  let lastErr;
  for (let i = 0; i < 4; i++) {
    const { sha, data } = await fetchFile();
    mutate(data);
    try {
      await saveFile(data, sha, undefined);
      return;
    } catch (e) {
      lastErr = e;
      if (e.status === 409 || e.status === 422 || e.status === 412) {
        await sleep(200 * (i + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

module.exports = async (req, res) => {
  if (!isAuthed(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      const { data } = await fetchFile();
      if (!key) {
        res.status(200).json(data);
        return;
      }
      if (data[key] === undefined) {
        res.status(200).json(null);
        return;
      }
      res.status(200).json({ key, value: data[key], shared: false });
      return;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      const { key, value, _delete } = body || {};
      if (!key) {
        res.status(400).json({ error: 'key가 필요합니다.' });
        return;
      }
      await applyKeyUpdate((data) => {
        if (_delete) { delete data[key]; }
        else { data[key] = value; }
      });
      res.status(200).json({ key, value, shared: false });
      return;
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
