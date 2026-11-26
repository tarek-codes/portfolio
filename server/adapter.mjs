// Connects the API core to Node's http (the dev server, `npm start`) and to Vercel functions (which pre-parse JSON bodies).
import {handle} from './core.mjs';

const MAX_BODY = 512 * 1024;

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) return typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') return undefined;
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw Object.assign(new Error('Request too large'), {status: 413});
    chunks.push(c);
  }
  return safeParse(Buffer.concat(chunks).toString('utf8'));
}
const safeParse = (s) => { try { return s ? JSON.parse(s) : undefined; } catch { return undefined; } };

export async function nodeHandler(req, res) {
  try {
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const body = await readBody(req);
    const out = await handle({method: req.method, url: req.originalUrl || req.url, headers: req.headers, body, ip});
    res.statusCode = out.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify(out.body));
  } catch (err) {
    res.statusCode = err.status || 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({error: err.status === 413 ? 'Request too large.' : 'Bad request.'}));
  }
}
