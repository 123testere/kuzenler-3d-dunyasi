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

// Connected Server-Sent Events (SSE) clients + Persistent Ring Buffer for 100% Reliable 2P Online Sync!
const clients = new Set();
let SERVER_VERSION = String(Date.now());
let eventSeq = 0;
const recentEvents = []; // { seq, data }
const latestState = {
  chess: null,
  xox: null,
  onlineCousins: [],
  farmAnimals: []
};

function recordAndBroadcast(dataObj) {
  eventSeq++;
  const enriched = { ...dataObj, _seq: eventSeq };
  if (dataObj.type === 'chess_sync' && dataObj.chess) latestState.chess = dataObj.chess;
  if (dataObj.type === 'xox_sync' && dataObj.xox) latestState.xox = dataObj.xox;
  if (dataObj.type === 'presence_join' && dataObj.name) {
    if (!latestState.onlineCousins.includes(dataObj.name)) latestState.onlineCousins.push(dataObj.name);
  }
  if (dataObj.type === 'farm_animal_spawn' && dataObj.animal) {
    if (!latestState.farmAnimals.some(a => a.uid === dataObj.animal.uid)) {
      latestState.farmAnimals.push(dataObj.animal);
      if (latestState.farmAnimals.length > 40) latestState.farmAnimals.shift();
    }
  }
  recentEvents.push({ seq: eventSeq, data: enriched });
  if (recentEvents.length > 150) recentEvents.shift();

  const payload = `data: ${JSON.stringify(enriched)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (e) {
      clients.delete(res);
    }
  }
}

function broadcastToClients(dataObj) {
  recordAndBroadcast(dataObj);
}

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

const server = http.createServer((req, res) => {
  // CORS preflight support
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, ngrok-skip-browser-warning'
    });
    return res.end();
  }

  // Real-time SSE endpoint for live cousin sync across iPads/phones/cities
  if (req.url.startsWith('/api/events') && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', version: SERVER_VERSION, seq: eventSeq, latestState })}\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Reliable HTTP Poll fallback (guarantees 2P moves NEVER get lost on mobile 4G / ngrok / Render!)
  if (req.url.startsWith('/api/poll') && req.method === 'GET') {
    const u = new URL(req.url, 'http://localhost');
    const since = parseInt(u.searchParams.get('since') || '0', 10) || 0;
    const missed = recentEvents.filter(ev => ev.seq > since).map(ev => ev.data);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({ version: SERVER_VERSION, seq: eventSeq, events: missed, latestState: since === 0 ? latestState : null }));
  }

  if (req.url === '/api/version' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ version: SERVER_VERSION }));
  }

  // Broadcast endpoint when any cousin moves a chess piece, plays XOX, races, or sends voice chat
  if (req.url === '/api/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) req.destroy();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        recordAndBroadcast(parsed);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true, seq: eventSeq }));
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
