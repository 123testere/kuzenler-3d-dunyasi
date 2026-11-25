const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Connected Server-Sent Events (SSE) clients for real-time cousin multiplayer sync
const clients = new Set();
let SERVER_VERSION = String(Date.now());

// Auto-watch game files so any edit immediately triggers automatic page refresh on all connected devices!
let watchDebounce = null;
['index.html', 'css', 'js'].forEach(rel => {
  const full = path.join(PUBLIC_DIR, rel);
  try {
    fs.watch(full, { recursive: false }, () => {
      if (watchDebounce) clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => {
        SERVER_VERSION = String(Date.now());
        broadcastToClients({ type: 'reload_page', version: SERVER_VERSION });
      }, 400);
    });
  } catch (e) {}
});

// Keepalive ping every 25s so cloud proxies (Render/Railway/ngrok) never drop live multiplayer SSE!
setInterval(() => {
  for (const res of clients) {
    try { res.write(': ping\n\n'); } catch (e) { clients.delete(res); }
  }
}, 25000);

function broadcastToClients(dataObj) {
  const payload = `data: ${JSON.stringify(dataObj)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (e) {
      clients.delete(res);
    }
  }
}

const server = http.createServer((req, res) => {
  // Real-time SSE endpoint for live cousin sync across iPads/tablets
  if (req.url === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', version: SERVER_VERSION })}\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.url === '/api/version' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ version: SERVER_VERSION }));
  }

  // Broadcast endpoint when any cousin moves an item, plays XOX, or sends a voice sticker
  if (req.url === '/api/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) req.destroy();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        broadcastToClients(parsed);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end('Bad JSON');
      }
    });
    return;
  }

  // Static file server
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, decodeURIComponent(reqPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      return res.end('Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================================`);
  console.log(`🎉 KUZENLER DÜNYASI (Umay, Yusuf, Deren & Elif) HAZIR!`);
  console.log(`💻 Bilgisayardan Oynamak İçin: http://localhost:${PORT}`);

  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`📱 Aynı Wi-Fi'daki iPad/iPhone'dan Girmek İçin: http://${net.address}:${PORT}`);
      }
    }
  }
  console.log(`========================================================\n`);
});
