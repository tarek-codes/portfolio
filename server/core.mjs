// The portfolio's tiny API. Anyone can READ content; every change needs the admin password.
//   GET    /api/content              edited content (public)
//   POST   /api/login                {password} -> {token}
//   GET    /api/session              checks a token
//   PUT    /api/content/:name        {value}  (auth)   save a collection
//   DELETE /api/content/:name                 (auth)   drop edits, back to the built-in default
//   GET    /api/search?type=&q=      (auth)  movie / series search
//   GET    /api/letterboxd?user=     (auth)  a Letterboxd diary (public RSS feed)
// The password is never stored: only an scrypt hash of it (ADMIN_PASSWORD_HASH), plus a secret for signing sessions.
import crypto from 'node:crypto';
import schema from '../shared/schema.json' with {type: 'json'};
import {createStore} from './store.mjs';

const COLLECTIONS = schema.collections;
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_JSON_BYTES = 200 * 1024;
const UA = 'portfolio-admin/1.0 (personal site)';

let store;
const getStore = () => (store ||= createStore());

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/* ---------------- auth ---------------- */

const b64u = (buf) => Buffer.from(buf).toString('base64url');

function verifyPassword(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || '';
  const [scheme, saltB64, hashB64] = stored.split(':');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) throw new HttpError(503, 'Admin is not set up on this server.');
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(String(password), Buffer.from(saltB64, 'base64'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new HttpError(503, 'Admin is not set up on this server.');
  return s;
}

function signToken() {
  const payload = b64u(JSON.stringify({exp: Date.now() + TOKEN_TTL_MS, n: crypto.randomBytes(8).toString('hex')}));
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function checkToken(headers) {
  const m = /^Bearer (.+)$/.exec(headers.authorization || headers.Authorization || '');
  if (!m) throw new HttpError(401, 'Please sign in.');
  const [payload, sig] = m[1].split('.');
  if (!payload || !sig) throw new HttpError(401, 'Please sign in.');
  const want = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(want);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new HttpError(401, 'Please sign in.');
  let exp = 0;
  try { exp = JSON.parse(Buffer.from(payload, 'base64url').toString()).exp; } catch { /* falls through */ }
  if (!(exp > Date.now())) throw new HttpError(401, 'Your session expired. Please sign in again.');
}

/* a small per-IP brake on password guessing */
const attempts = new Map();
function brake(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.reset < now) { attempts.set(ip, {count: 0, reset: now + 15 * 60 * 1000}); return; }
  if (rec.count >= 8) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
}
const fail = (ip) => { const r = attempts.get(ip); if (r) r.count++; };

/* ---------------- validation: only known fields, sane types ---------------- */

const URL_OK = /^(https?:\/\/|\/|mailto:|#)/i;
const bad = (path, msg) => new HttpError(400, `${path}: ${msg}`);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function cleanField(field, v, path) {
  const where = `${path}${field.label ? ` (${field.label})` : ''}`;
  switch (field.type) {
    case 'text': case 'textarea': {
      if (typeof v !== 'string') throw bad(where, 'must be text');
      const s = v.trim();
      if (s.length > (field.type === 'textarea' ? 20000 : 2000)) throw bad(where, 'is too long');
      return s;
    }
    case 'url': {
      if (typeof v !== 'string') throw bad(where, 'must be a link');
      const s = v.trim();
      if (s && !URL_OK.test(s)) throw bad(where, 'must start with https://, http://, mailto: or /');
      return s;
    }
    case 'embed': {
      if (typeof v !== 'string') throw bad(where, 'must be a link');
      const s = v.trim();
      if (s && !/^https:\/\//i.test(s)) throw bad(where, 'must start with https://');
      return s;
    }
    case 'number': {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) throw bad(where, 'must be a number');
      if (field.min !== undefined && n < field.min) throw bad(where, `must be at least ${field.min}`);
      if (field.max !== undefined && n > field.max) throw bad(where, `must be at most ${field.max}`);
      return n;
    }
    case 'select': {
      if (!field.options.includes(v)) throw bad(where, `must be one of ${field.options.join(', ')}`);
      return v;
    }
    case 'strings': {
      const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : null;
      if (!arr || arr.length > 300) throw bad(where, 'must be a list');
      return arr.map((x) => {
        if (typeof x !== 'string') throw bad(where, 'must be a list of text');
        if (x.length > 4000) throw bad(where, 'has an item that is too long');
        return x.trim();
      }).filter(Boolean);
    }
    case 'list': {
      if (!Array.isArray(v) || v.length > 300) throw bad(where, 'must be a list');
      return v.map((item, i) => cleanObject(field.fields, item, `${path}[${i + 1}]`));
    }
    default: throw bad(where, 'unsupported field');
  }
}

function cleanObject(fields, input, path) {
  if (!isObj(input)) throw bad(path, 'must be an object');
  const out = {};
  for (const f of fields) {
    const v = input[f.key];
    const empty = v === undefined || v === null || v === '';
    if (empty) {
      if (f.required) throw bad(`${path}.${f.key}`, `${f.label} is required`);
      if (f.type === 'strings' || f.type === 'list') out[f.key] = [];
      continue;
    }
    out[f.key] = cleanField(f, v, `${path}.${f.key}`);
  }
  return out;
}

function validate(name, value) {
  const def = COLLECTIONS[name];
  if (!def) throw new HttpError(404, 'Unknown collection.');
  let cleaned;
  if (def.kind === 'object') cleaned = cleanObject(def.fields, value, name);
  else {
    if (!Array.isArray(value) || value.length > 500) throw bad(name, 'must be a list of up to 500 items');
    cleaned = value.map((item, i) => cleanObject(def.fields, item, `${def.label} #${i + 1}`));
  }
  if (Buffer.byteLength(JSON.stringify(cleaned)) > MAX_JSON_BYTES) throw bad(name, 'is too large');
  return cleaned;
}

/* ---------------- search ---------------- */

const decode = (s = '') =>
  s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const stripTags = (s = '') => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const short = (s, n = 220) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** fetch with one retry, and a friendly error if the other service can't be reached */
async function fetchRetry(url, init) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, {...init, signal: AbortSignal.timeout(12000)});
    } catch {
      if (attempt >= 1) throw new HttpError(502, 'Could not reach the search service. Please try again.');
      await new Promise((r) => setTimeout(r, 400));
    }
  }
}

async function getJson(url, headers = {}) {
  const init = {headers: {'User-Agent': UA, Accept: 'application/json', ...headers}};
  let r = await fetchRetry(url, init);
  if (r.status === 429) { // asked to slow down: wait as told (up to 8s) and try once more
    const wait = Math.min(Number(r.headers.get('retry-after')) || 2, 8);
    await new Promise((res) => setTimeout(res, wait * 1000));
    r = await fetchRetry(url, init);
  }
  if (!r.ok) throw new HttpError(502, r.status === 429 ? 'The search service is busy. Try again in a few seconds.' : `The search service answered ${r.status}.`);
  return r.json();
}

async function tmdb(type, q) {
  const key = process.env.TMDB_API_KEY;
  const path = type === 'series' ? 'tv' : 'movie';
  const bearer = key.startsWith('eyJ');
  const url = `https://api.themoviedb.org/3/search/${path}?query=${encodeURIComponent(q)}&include_adult=false${bearer ? '' : `&api_key=${encodeURIComponent(key)}`}`;
  const data = await getJson(url, bearer ? {Authorization: `Bearer ${key}`} : {});
  return (data.results || []).slice(0, 12).map((r) => ({
    title: r.title || r.name,
    year: String((r.release_date || r.first_air_date || '').slice(0, 4)),
    kind: type,
    poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : '',
    overview: short(r.overview || ''),
    link: type === 'movie' ? `https://letterboxd.com/tmdb/${r.id}/` : `https://www.themoviedb.org/tv/${r.id}`,
  }));
}

/**
 * Search-as-you-type: the last word is often unfinished ("game of thr"). If nothing found matches what was typed,
 * search the finished words instead and keep only titles that contain the whole typed text.
 */
async function withPartialWords(q, find, titleOf) {
  const typed = q.toLowerCase();
  const words = q.split(/\s+/);
  const first = await find(q);
  if (first.some((r) => titleOf(r).toLowerCase().includes(typed)) || words.length < 2) return first;
  const base = (await find(words.slice(0, -1).join(' '))).filter((r) => titleOf(r).toLowerCase().includes(typed));
  return base.length ? base : first;
}

async function tvmaze(q) {
  const find = (term) => getJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(term)}`);
  const data = await withPartialWords(q, find, ({show}) => show.name);
  return data.slice(0, 12).map(({show}) => ({
    title: show.name,
    year: String((show.premiered || '').slice(0, 4)),
    kind: 'series',
    poster: (show.image && (show.image.medium || show.image.original) || '').replace(/^http:/, 'https:'),
    overview: short(stripTags(show.summary || '')),
    link: show.url || '',
  }));
}

async function wikipediaFilms(q) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=10' +
    `&gsrsearch=${encodeURIComponent(`${q}${/[\p{L}\p{N}]$/u.test(q) ? '*' : ''} film`)}&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=400` +
    '&exintro=1&explaintext=1&exsentences=2&exlimit=max';
  const data = await getJson(url);
  const pages = Object.values((data.query && data.query.pages) || {}).sort((a, b) => a.index - b.index);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const seen = new Set();
  return pages
    .filter((p) => /\bfilm\b/i.test(p.extract || '') || /film\)/.test(p.title))
    .filter((p) => words.every((w) => p.title.toLowerCase().includes(w))) // the title itself must match, not just mention the query
    .slice(0, 10)
    .map((p) => {
      const title = p.title.replace(/\s*\(.*?\)\s*$/, '');
      const year = (p.title.match(/\((\d{4}) film\)/) || (p.extract || '').match(/\b((?:19|20)\d{2})\b/) || [])[1] || '';
      return {
        _page: p.title,
        title, year, kind: 'movie', poster: (p.thumbnail && p.thumbnail.source) || '',
        overview: short((p.extract || '').replace(/\s+/g, ' ')),
        link: `https://letterboxd.com/search/${encodeURIComponent(title)}/`,
      };
    })
    .filter((r) => { const k = `${r.title}|${r.year}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

/** Wikipedia's search doesn't return film posters (they are fair-use images), but each article names its poster file in the infobox. Two batched requests cover every result. */
async function addInfoboxPosters(results) {
  const missing = results.filter((r) => !r.poster && r._page);
  if (!missing.length) return;
  try {
    const titles = missing.map((r) => r._page).join('|');
    const d = await getJson(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&rvsection=0&titles=${encodeURIComponent(titles)}`);
    const fileOf = new Map();
    for (const pg of Object.values(d.query?.pages || {})) {
      const text = pg.revisions?.[0]?.slots?.main?.['*'] || '';
      const m = text.match(/\|\s*image\s*=\s*(?:\[\[(?:File|Image):)?([^\n|\]]+)/i);
      if (m && /\.(jpe?g|png|webp)\s*$/i.test(m[1])) fileOf.set(pg.title, m[1].trim().replace(/_/g, ' '));
    }
    const names = [...new Set(fileOf.values())];
    if (!names.length) return;
    const info = await getJson(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=400&titles=${encodeURIComponent(names.map((n) => `File:${n}`).join('|'))}`);
    const urlOf = new Map(Object.values(info.query?.pages || {}).map((pg) => [String(pg.title || '').replace(/^File:/, '').replace(/_/g, ' '), pg.imageinfo?.[0]?.thumburl || '']));
    for (const r of missing) {
      const url = urlOf.get(fileOf.get(r._page) || '');
      if (url) r.poster = url.replace(/^http:/, 'https:');
    }
  } catch { /* posters are optional: the result still shows without one */ }
}

const searchCache = new Map();
async function search(type, q) {
  if (!['movie', 'series'].includes(type)) throw new HttpError(400, 'type must be movie or series.');
  q = String(q || '').trim();
  if (q.length < 2 || q.length > 100) throw new HttpError(400, 'Type at least 2 characters.');
  const key = `${type}|${q.toLowerCase()}`;
  const hit = searchCache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.data;
  let data;
  if (process.env.TMDB_API_KEY) data = {source: 'TMDB', results: await tmdb(type, q)};
  else if (type === 'series') data = {source: 'TVmaze', results: await tvmaze(q)};
  else {
    const results = await withPartialWords(q, wikipediaFilms, (r) => r.title);
    await addInfoboxPosters(results);
    results.forEach((r) => delete r._page);
    data = {source: 'Wikipedia', results};
  }
  if (searchCache.size > 200) searchCache.clear();
  searchCache.set(key, {at: Date.now(), data});
  return data;
}

async function letterboxd(user) {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(user || '')) throw new HttpError(400, 'Enter a Letterboxd username.');
  const r = await fetchRetry(`https://letterboxd.com/${encodeURIComponent(user)}/rss/`, {headers: {'User-Agent': UA}});
  if (r.status === 404) throw new HttpError(404, 'No Letterboxd profile with that username.');
  if (!r.ok) throw new HttpError(502, `Letterboxd answered ${r.status}.`);
  const xml = await r.text();
  const tag = (block, name) => {
    const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
    return m ? decode(m[1]).trim() : '';
  };
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const results = items
    .map((it) => {
      const title = tag(it, 'letterboxd:filmTitle');
      const poster = (decode(tag(it, 'description')).match(/<img src="([^"]+)"/) || [])[1] || '';
      return {
        title, year: tag(it, 'letterboxd:filmYear'), kind: 'movie', poster,
        rating: tag(it, 'letterboxd:memberRating'), watchedOn: tag(it, 'letterboxd:watchedDate'), link: tag(it, 'link'),
        overview: '',
      };
    })
    .filter((x) => x.title);
  return {source: 'Letterboxd', results};
}

/* ---------------- routes ---------------- */

export async function handle({method, url, headers = {}, body, ip = 'unknown'}) {
  const u = new URL(url, 'http://local');
  const p = u.pathname.replace(/\/+$/, '');
  const json = (status, data) => ({status, body: data});
  try {
    if (method === 'GET' && p === '/api/content') return json(200, await getStore().getAll());

    if (method === 'POST' && p === '/api/login') {
      brake(ip);
      const pw = body && typeof body.password === 'string' ? body.password : '';
      if (!pw || pw.length > 200 || !verifyPassword(pw)) {
        fail(ip);
        await new Promise((r) => setTimeout(r, 800)); // slows guessing down
        throw new HttpError(401, 'Wrong password.');
      }
      attempts.delete(ip);
      return json(200, {token: signToken(), expiresInHours: TOKEN_TTL_MS / 3600000, storage: getStore().kind, tmdb: Boolean(process.env.TMDB_API_KEY)});
    }

    if (p === '/api/session' && method === 'GET') { checkToken(headers); return json(200, {ok: true}); }

    const m = p.match(/^\/api\/content\/([a-z]+)$/);
    if (m && method === 'PUT') {
      checkToken(headers);
      if (!COLLECTIONS[m[1]]) throw new HttpError(404, 'Unknown collection.');
      const value = validate(m[1], body && body.value);
      await getStore().set(m[1], value);
      return json(200, {ok: true, value});
    }
    if (m && method === 'DELETE') {
      checkToken(headers);
      if (!COLLECTIONS[m[1]]) throw new HttpError(404, 'Unknown collection.');
      await getStore().del(m[1]);
      return json(200, {ok: true});
    }

    if (method === 'GET' && p === '/api/search') { checkToken(headers); return json(200, await search(u.searchParams.get('type'), u.searchParams.get('q'))); }
    if (method === 'GET' && p === '/api/letterboxd') { checkToken(headers); return json(200, await letterboxd(u.searchParams.get('user'))); }

    throw new HttpError(404, 'Not found.');
  } catch (err) {
    if (err instanceof HttpError) return json(err.status, {error: err.message});
    console.error('[api]', err && err.message);
    return json(500, {error: 'Something went wrong on the server.'});
  }
}
