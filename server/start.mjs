// Production server: serves the built site (dist/) and the API from one Node process. `npm run build && npm start`
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {nodeHandler} from './adapter.mjs';

const dist = path.resolve('dist');
const port = Number(process.env.PORT || 3000);
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2'};

http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) return nodeHandler(req, res);
  const clean = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let file = path.join(dist, clean);
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html'); // SPA routes
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Portfolio on http://localhost:${port}`));
