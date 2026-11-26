// Where edited content lives. Pick the backend with environment variables:
//  - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or Vercel KV's KV_REST_API_URL + KV_REST_API_TOKEN): hosted Redis, for Vercel
//  - otherwise a JSON file (data/content.json, or CONTENT_FILE): local use, or a server with a persistent disk
import fs from 'node:fs/promises';
import path from 'node:path';

const KEY = 'portfolio:content';

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
  };
}

export function createStore(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (url && token) return upstashStore(url.replace(/\/$/, ''), token);
  return fileStore(env.CONTENT_FILE || path.join(process.cwd(), 'data', 'content.json'));
}
