// Where edited content lives. Pick the backend with environment variables:
//  - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or Vercel KV's KV_REST_API_URL + KV_REST_API_TOKEN): hosted Redis, for Vercel
//  - otherwise a JSON file (data/content.json, or CONTENT_FILE): local use, or a server with a persistent disk
import fs from 'node:fs/promises';
import path from 'node:path';

const KEY = 'portfolio:content';
const VISITORS_KEY = 'portfolio:visitors';

function fileStore(file) {
  const read = async () => {
    try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return {collections: {}}; }
  };
  const write = async (data) => {
    await fs.mkdir(path.dirname(file), {recursive: true});
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 1));
    await fs.rename(tmp, file); // atomic replace
  };
  return {
    kind: 'file',
    getAll: read,
    async set(name, value) {
      const d = await read();
      d.collections[name] = value;
      d.updatedAt = new Date().toISOString();
      await write(d);
    },
    async del(name) {
      const d = await read();
      delete d.collections[name];
      d.updatedAt = new Date().toISOString();
      await write(d);
    },
    ...fileVisitors(path.join(path.dirname(file), 'visitors.json')),
  };
}

/** Unique visitors: a set of hashed ids, kept apart from the content so edits and visits never overwrite each other. */
function fileVisitors(file) {
  let queue = Promise.resolve(); // writes are serialised so two visits at once can't lose one
  const read = async () => {
    try { return new Set(JSON.parse(await fs.readFile(file, 'utf8')).ids || []); } catch { return new Set(); }
  };
  return {
    countVisitors: async () => (await read()).size,
    addVisitor(hash) {
      const job = queue.then(async () => {
        const ids = await read();
        if (!ids.has(hash)) {
          ids.add(hash);
          await fs.mkdir(path.dirname(file), {recursive: true});
          const tmp = `${file}.${process.pid}.tmp`;
          await fs.writeFile(tmp, JSON.stringify({ids: [...ids]}));
          await fs.rename(tmp, file);
        }
        return ids.size;
      });
      queue = job.catch(() => {});
      return job;
    },
  };
}

function upstashStore(url, token) {
  const headers = {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'};
  const read = async () => {
    const r = await fetch(`${url}/get/${encodeURIComponent(KEY)}`, {headers});
    if (!r.ok) throw new Error(`Storage read failed (${r.status})`);
    const {result} = await r.json();
    return result ? JSON.parse(result) : {collections: {}};
  };
  const write = async (data) => {
    const r = await fetch(url, {method: 'POST', headers, body: JSON.stringify(['SET', KEY, JSON.stringify(data)])});
    if (!r.ok) throw new Error(`Storage write failed (${r.status})`);
  };
  return {
    kind: 'upstash',
    getAll: read,
    async set(name, value) {
      const d = await read();
      d.collections[name] = value;
      d.updatedAt = new Date().toISOString();
      await write(d);
    },
    async del(name) {
      const d = await read();
      delete d.collections[name];
      d.updatedAt = new Date().toISOString();
      await write(d);
    },
    async countVisitors() {
      const r = await fetch(url, {method: 'POST', headers, body: JSON.stringify(['SCARD', VISITORS_KEY])});
      if (!r.ok) throw new Error(`Storage read failed (${r.status})`);
      return Number((await r.json()).result) || 0;
    },
    async addVisitor(hash) {
      const r = await fetch(url, {method: 'POST', headers, body: JSON.stringify(['SADD', VISITORS_KEY, hash])});
      if (!r.ok) throw new Error(`Storage write failed (${r.status})`);
      return this.countVisitors();
    },
  };
}

export function createStore(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (url && token) return upstashStore(url.replace(/\/$/, ''), token);
  return fileStore(env.CONTENT_FILE || path.join(process.cwd(), 'data', 'content.json'));
}
