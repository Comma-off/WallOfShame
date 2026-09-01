/** Minimal static server for local preview: `npm run serve`. */
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath, URL} from 'node:url';

const root = new URL('../', import.meta.url);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const port = Number(process.env.PORT) || 4173;

createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  const rel = path === '/' ? 'index.html' : path.replace(/^\/+/, '');
  if (rel.includes('..')) { res.writeHead(400).end('Bad path'); return; }
  try {
    const body = await readFile(fileURLToPath(new URL(rel, root)));
    const ext = rel.slice(rel.lastIndexOf('.'));
    res.writeHead(200, {'content-type': TYPES[ext] || 'application/octet-stream'});
    res.end(body);
  } catch {
    res.writeHead(404, {'content-type': 'text/plain'}).end('Not found');
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
