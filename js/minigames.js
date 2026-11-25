/* ============================================================================
   KUZENLER MİNİ OYUNLAR MOTORU (minigames.js)
   - 10 Yeni Büyükler/Ortak Oyun (Farklı Olanı Bul, Yılan, Tuğla Kırma, Hedef,
     Kelime Bulmaca, Araba Yarışı, Pasta Sipariş, Labirent, Zar Yarışı, Match-3)
   - 20 Farklı Deren & Elif (3 Yaş Özel) Sesli & Büyük Butonlu Eğitici Oyun!
   ============================================================================ */

export const BIG_EXTRA_GAMES = [
  { id: '3d_race',    icon: '🏎️', name: '12. 3D 2P Yarış' },
  { id: '3d_snowball',icon: '⛄', name: '13. 3D Kartopu' },
  { id: '3d_archery', icon: '🏹', name: '14. 3D Okçuluk (Güç)' },
  { id: '3d_soldier', icon: '🪖', name: '15. 3D Asker Savunma' },
  { id: '3d_dessert', icon: '🍰', name: '16. 3D Tatlı Yapma' },
  { id: '3d_jelibon', icon: '🍬', name: '17. 3D Jelibon Yağmuru' },
  { id: 'odd_one',    icon: '🔍', name: '18. Farklı Olanı Bul' },
  { id: 'snake',      icon: '🐍', name: '19. Elma Yiyen Yılan' },
  { id: 'breakout',   icon: '🧱', name: '20. Tuğla Kırma' },
  { id: 'word',       icon: '🔤', name: '21. Kelime Bulmaca' },
  { id: 'maze',       icon: '🧭', name: '22. Çiftlik Labirenti' },
  { id: 'dice_race',  icon: '🎲', name: '23. 4 Kuzen Zar Yarışı' },
  { id: 'match3',     icon: '💎', name: '24. 3\'lü Mücevher' },
  { id: 'fire_water', icon: '🔥', name: '25. 2P Ateş & Su' },
  { id: 'run_2p',     icon: '🏃', name: '26. 2P Koşu Yarışı' },
  { id: 'parkour',    icon: '🧗', name: '27. Engel Aşma Parkuru' }
];

export const TODDLER_20_GAMES = [
  { id: 't_balloon',  icon: '🎈', name: '1. Balon Patlat' },
  { id: 't_sound',    icon: '🐶', name: '2. Hayvan Sesi Bul' },
  { id: 't_shape',    icon: '🔷', name: '3. Şekil Eşleştir' },
  { id: 't_color',    icon: '🎨', name: '4. Renk Sepeti' },
  { id: 't_butterfly',icon: '🦋', name: '5. Kelebek Yakala' },
  { id: 't_bubble',   icon: '🫧', name: '6. Sabun Köpüğü' },
  { id: 't_shadow',   icon: '🐾', name: '7. Gölgesini Bul' },
  { id: 't_bigsmall', icon: '🐘', name: '8. Büyük mü Küçük mü?' },
  { id: 't_train',    icon: '🚂', name: '9. Sayı Treni 1-5' },
  { id: 't_cupcake',  icon: '🧁', name: '10. Cupcake Süsle' },
  { id: 't_fish',     icon: '🐟', name: '11. Balık Besle' },
  { id: 't_flower',   icon: '🌻', name: '12. Çiçek Büyüt' },
  { id: 't_drum',     icon: '🥁', name: '13. Minik Davul' },
  { id: 't_park',     icon: '🚗', name: '14. Araba Park Et' },
  { id: 't_egg',      icon: '🐣', name: '15. Sürpriz Yumurta' },
  { id: 't_rainbow',  icon: '🌈', name: '16. Gökkuşağı Boya' },
  { id: 't_fruitveg', icon: '🍎', name: '17. Meyve Sepeti' },
  { id: 't_stars',    icon: '⭐', name: '18. Yıldız Topla' },
  { id: 't_sleep',    icon: '😴', name: '19. İyi Geceler' },
  { id: 't_gift',     icon: '🎁', name: '20. Hediye Kutusu Aç' }
];

let activeCleanup = null;

export function cleanupMiniGame() {
  if (typeof activeCleanup === 'function') {
    try { activeCleanup(); } catch (e) {}
    activeCleanup = null;
  }
}

export function launchMiniGame(gameId, container, helpers) {
  cleanupMiniGame();
  container.innerHTML = '';
  const { playSound, speakText, addStars, sendMultiplayerSync, onMultiplayerSync } = helpers;

  // Universal 15-Level Progressive Difficulty Header for Big Games!
  let gameLevel = 1;
  const MAX_LV = 15;
  const isBigGame = !gameId.startsWith('t_');
  const outer = document.createElement('div');
  outer.style.cssText = 'width:100%;display:flex;flex-direction:column;align-items:center;gap:8px;';
  if (isBigGame) {
    const lvBar = document.createElement('div');
    lvBar.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;background:linear-gradient(90deg,#e0f2fe,#fce7f3);padding:5px 14px;border-radius:16px;border:3px solid #3b82f6;font-weight:900;font-size:13px;color:#1e40af;';
    lvBar.innerHTML = `
      <button class="hud-btn" id="mg-lv-p" style="padding:3px 8px;font-size:12px;">⬅️</button>
      <span id="mg-lv-t">🏆 Seviye 1 / 15 — Zorluk: ⭐ Kolay</span>
      <button class="hud-btn active" id="mg-lv-n" style="padding:3px 8px;font-size:12px;">➡️</button>`;
    const diffName = (lv) => lv <= 3 ? '⭐ Kolay' : (lv <= 6 ? '⭐⭐ Orta' : (lv <= 10 ? '🔥 Zor' : (lv <= 13 ? '⚡ Çok Zor' : '👑 EFSANE!')));
    const updLv = (n) => {
      gameLevel = Math.max(1, Math.min(MAX_LV, n));
      lvBar.querySelector('#mg-lv-t').textContent = `🏆 Seviye ${gameLevel} / ${MAX_LV} — Zorluk: ${diffName(gameLevel)}`;
      playSound('win');
    };
    lvBar.querySelector('#mg-lv-p').onclick = () => updLv(gameLevel - 1);
    lvBar.querySelector('#mg-lv-n').onclick = () => updLv(gameLevel + 1);
    outer.appendChild(lvBar);
    container.appendChild(outer);
    const bodyHost = document.createElement('div');
    bodyHost.style.cssText = 'width:100%;display:flex;justify-content:center;align-items:center;';
    outer.appendChild(bodyHost);
    container = bodyHost;
  }

  const reward = (n = 2, msg = '') => {
    addStars(n);
    playSound('win');
    if (isBigGame && gameLevel < MAX_LV) {
      gameLevel++;
      const tEl = outer.querySelector('#mg-lv-t');
      const diffName = (lv) => lv <= 3 ? '⭐ Kolay' : (lv <= 6 ? '⭐⭐ Orta' : (lv <= 10 ? '🔥 Zor' : (lv <= 13 ? '⚡ Çok Zor' : '👑 EFSANE!')));
      if (tEl) tEl.textContent = `🏆 Seviye ${gameLevel} / ${MAX_LV} — Zorluk: ${diffName(gameLevel)}`;
    }
    if (msg) speakText(msg);
  };

  /* ==========================================================================
     PART A: 10 NEW GAMES FOR BIGGER COUSINS & CO-OP
     ========================================================================== */

  // 12. FARKLI OLANI BUL (ODD ONE OUT — SCALES 3x3 -> 4x4 -> 5x5 ACROSS 15 LEVELS!)
  if (gameId === 'odd_one') {
    const pairs = [
      ['🐄','🐴'], ['🍎','🍓'], ['✈️','🚗'], ['🌸','🌻'], ['🐶','🐱'],
      ['⭐','🌙'], ['🧁','🍰'], ['🦋','🐝'], ['😀','😃'], ['🍏','🍐'],
      ['🐱','🐯'], ['🦊','🐶'], ['🌺','🌷'], ['🍇','🫐'], ['🎈','🔴']
    ];
    let score = 0;
    const renderRound = () => {
      const cols = gameLevel <= 4 ? 3 : (gameLevel <= 9 ? 4 : 5);
      const total = cols * cols;
      const [baseEmo, oddEmoji] = pairs[(gameLevel - 1 + score) % pairs.length];
      const arr = Array(total - 1).fill(baseEmo);
      arr.push(oddEmoji);
      const shuffled = arr.sort(() => Math.random() - 0.5);
      const cellPx = cols === 3 ? 82 : (cols === 4 ? 66 : 54);

      container.innerHTML = `
        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;">
          <h2 style="color:#db2777;margin:0;font-size:17px;">🔍 Farklı Olanı Bul! (${cols}×${cols} — Skor: ${score})</h2>
          <div id="odd-grid" style="display:grid;grid-template-columns:repeat(${cols},${cellPx}px);gap:6px;"></div>
        </div>`;
      const g = container.querySelector('#odd-grid');
      shuffled.forEach(emo => {
        const b = document.createElement('button');
        b.style.cssText = `height:${cellPx}px;font-size:${cols===5?28:36}px;border-radius:14px;border:3px solid #fbcfe8;background:#fff;cursor:pointer;`;
        b.textContent = emo;
        b.onclick = () => {
          if (emo === oddEmoji) {
            score++;
            reward(2, 'Harika! Farklı olanı hemen buldun!');
            renderRound();
          } else {
            playSound('pop');
            b.style.background = '#fee2e2';
          }
        };
        g.appendChild(b);
      });
    };
    renderRound();
    return;
  }

  // 13. ELMA YİYEN YILAN (SNAKE)
  if (gameId === 'snake') {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <h2 style="color:#16a34a;">🐍 Elma Yiyen Yılan — Skor: <span id="snk-score">0</span></h2>
        <canvas id="snk-canvas" width="320" height="280" style="background:#0f172a;border:4px solid #22c55e;border-radius:18px;"></canvas>
        <div style="display:flex;gap:8px;">
          <button class="hud-btn" id="snk-l">⬅️</button>
          <button class="hud-btn" id="snk-u">⬆️</button>
          <button class="hud-btn" id="snk-d">⬇️</button>
          <button class="hud-btn" id="snk-r">➡️</button>
        </div>
      </div>`;
    const c = container.querySelector('#snk-canvas');
    const ctx = c.getContext('2d');
    const sz = 20;
    let snake = [{x:5,y:5},{x:4,y:5},{x:3,y:5}];
    let dir = {x:1,y:0};
    let apple = {x:10,y:7};
    let score = 0;

    const setDir = (dx, dy) => { if (dir.x !== -dx || dir.y !== -dy) dir = {x:dx,y:dy}; };
    container.querySelector('#snk-l').onclick = () => setDir(-1,0);
    container.querySelector('#snk-r').onclick = () => setDir(1,0);
    container.querySelector('#snk-u').onclick = () => setDir(0,-1);
    container.querySelector('#snk-d').onclick = () => setDir(0,1);

    const onKey = (e) => {
      if (e.key === 'ArrowLeft') setDir(-1,0);
      if (e.key === 'ArrowRight') setDir(1,0);
      if (e.key === 'ArrowUp') setDir(0,-1);
      if (e.key === 'ArrowDown') setDir(0,1);
    };
    window.addEventListener('keydown', onKey);

    const timer = setInterval(() => {
      const head = { x: (snake[0].x + dir.x + 16) % 16, y: (snake[0].y + dir.y + 14) % 14 };
      snake.unshift(head);
      if (head.x === apple.x && head.y === apple.y) {
        score++;
        container.querySelector('#snk-score').textContent = score;
        playSound('pop');
        if (score % 3 === 0) addStars(1);
        apple = { x: Math.floor(Math.random()*16), y: Math.floor(Math.random()*14) };
      } else {
        snake.pop();
      }
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(apple.x*sz+10, apple.y*sz+10, 8, 0, Math.PI*2); ctx.fill();
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
        ctx.fillRect(s.x*sz+2, s.y*sz+2, sz-4, sz-4);
      });
    }, 170);
    activeCleanup = () => { clearInterval(timer); window.removeEventListener('keydown', onKey); };
    return;
  }

  // 14. TUĞLA KIRMA (BREAKOUT)
  if (gameId === 'breakout') {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <h2 style="color:#ec4899;">🧱 Renkli Tuğla Kırma — Skor: <span id="brk-sc">0</span></h2>
        <p style="font-size:12px;font-weight:700;color:#64748b;">Parmağını sağa sola kaydırarak topu sektir!</p>
        <canvas id="brk-c" width="420" height="270" style="background:#1e1b4b;border:4px solid #ec4899;border-radius:18px;touch-action:none;"></canvas>
      </div>`;
    const c = container.querySelector('#brk-c');
    const ctx = c.getContext('2d');
    let px = 170, bx = 210, by = 200, vx = 3.2, vy = -3.2, score = 0;
    const bricks = [];
    const colors = ['#f43f5e','#f59e0b','#10b981','#38bdf8','#a855f7'];
    const buildBricks = () => {
      bricks.length = 0;
      const pattern = (gameLevel - 1) % 4; // 4 different shapes: Wall, Pyramid, Checkerboard, Diamond!
      for (let r = 0; r < 5; r++) for (let col = 0; col < 7; col++) {
        if (pattern === 1 && (col < r || col > 6 - r)) continue;
        if (pattern === 2 && (r + col) % 2 === 1) continue;
        if (pattern === 3 && Math.abs(col - 3) + Math.abs(r - 2) > 3) continue;
        bricks.push({ x: 14 + col*57, y: 16 + r*22, w: 50, h: 17, c: colors[r % colors.length], alive: true });
      }
    };
    buildBricks();
    c.onpointermove = (e) => {
      const rect = c.getBoundingClientRect();
      px = Math.max(0, Math.min(c.width - 80, (e.clientX - rect.left) * (c.width / rect.width) - 40));
    };
    let rafId;
    const loop = () => {
      ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0,0,c.width,c.height);
      bx += vx; by += vy;
      if (bx < 8 || bx > c.width - 8) vx = -vx;
      if (by < 8) vy = -vy;
      if (by > c.height - 26 && bx > px && bx < px + 80) { vy = -Math.abs(vy); playSound('pop'); }
      if (by > c.height) { bx = 210; by = 180; vy = -3.2; }
      bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, b.w, b.h);
        if (bx > b.x && bx < b.x+b.w && by > b.y && by < b.y+b.h) {
          b.alive = false; vy = -vy; score++;
          container.querySelector('#brk-sc').textContent = score;
          playSound('pop');
          if (score % 5 === 0) addStars(1);
        }
      });
      ctx.fillStyle = '#f472b6'; ctx.fillRect(px, c.height - 20, 80, 12);
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI*2); ctx.fill();
      rafId = requestAnimationFrame(loop);
    };
    loop();
    activeCleanup = () => cancelAnimationFrame(rafId);
    return;
  }

  // 15. HEDEF VURMA (ARCHERY)
  if (gameId === 'archery') {
    let score = 0;
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;">
        <h2 style="color:#ef4444;">🎯 Hareketli Hedef Vurma — Skor: <span id="arc-sc">0</span></h2>
        <div id="arc-arena" style="width:440px;max-width:95%;height:260px;background:linear-gradient(180deg,#bae6fd,#dcfce7);border:4px solid #ef4444;border-radius:24px;position:relative;overflow:hidden;"></div>
      </div>`;
    const arena = container.querySelector('#arc-arena');
    const spawnTarget = () => {
      arena.innerHTML = '';
      const t = document.createElement('button');
      t.textContent = '🎯';
      t.style.cssText = `position:absolute;font-size:48px;background:none;border:none;cursor:pointer;left:${10+Math.random()*75}%;top:${10+Math.random()*65}%;transition:all 0.2s;`;
      t.onclick = () => {
        score++;
        container.querySelector('#arc-sc').textContent = score;
        playSound('win');
        if (score % 3 === 0) addStars(1);
        spawnTarget();
      };
      arena.appendChild(t);
    };
    spawnTarget();
    const timer = setInterval(spawnTarget, 1700);
    activeCleanup = () => clearInterval(timer);
    return;
  }

  // 16. KELİME BULMACA (TURKISH WORD PUZZLE)
  if (gameId === 'word') {
    const words = [
      { w: 'İNEK', hint: '🐄 Çiftlikte süt verir!' },
      { w: 'UÇAK', hint: '✈️ Gökyüzünde uçar, Umay\'ın pembesi var!' },
      { w: 'ELMA', hint: '🍎 Kırmızı ve tatlı meyve!' },
      { w: 'KÖPEK', hint: '🐶 Çiftliği ayılardan korur!' },
      { w: 'ARABA', hint: '🚗 Dört tekerlekli, sürülür!' },
      { w: 'BEBEK', hint: '🍼 Süt içer ve büyür!' }
    ];
    let idx = 0, typed = '';
    const renderWord = () => {
      const cur = words[idx % words.length];
      const letters = [...new Set((cur.w + 'AEKMLNRST').split(''))].sort(() => Math.random() - 0.5).slice(0, 10);
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;">
          <h2 style="color:#7c3aed;">🔤 Kelime Bulmaca</h2>
          <div style="font-size:18px;font-weight:800;background:#fef9c3;padding:10px 20px;border-radius:16px;">İpucu: ${cur.hint}</div>
          <div style="font-size:32px;letter-spacing:10px;font-weight:900;color:#db2777;">${typed.padEnd(cur.w.length, '_')}</div>
          <div id="w-keys" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:380px;"></div>
          <button class="hud-btn" id="w-clr">🧹 Sil</button>
        </div>`;
      container.querySelector('#w-clr').onclick = () => { typed = ''; renderWord(); };
      const keys = container.querySelector('#w-keys');
      letters.forEach(ch => {
        const b = document.createElement('button');
        b.className = 'hud-btn';
        b.style.cssText = 'font-size:20px;padding:10px 16px;';
        b.textContent = ch;
        b.onclick = () => {
          playSound('pop');
          if (typed.length < cur.w.length) typed += ch;
          if (typed === cur.w) {
            reward(3, `Harika! ${cur.w} kelimesini doğru buldun!`);
            idx++; typed = '';
            setTimeout(renderWord, 700);
          } else {
            renderWord();
          }
        };
        keys.appendChild(b);
      });
    };
    renderWord();
    return;
  }

  // 17. OTOBAN ARABA YARIŞI
  if (gameId === 'car_race') {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <h2 style="color:#2563eb;">🚗 Otoban Araba Yarışı — Skor: <span id="cr-sc">0</span></h2>
        <canvas id="cr-c" width="320" height="260" style="background:#334155;border:4px solid #38bdf8;border-radius:18px;"></canvas>
        <div style="display:flex;gap:14px;">
          <button class="hud-btn active" id="cr-l" style="font-size:18px;padding:8px 24px;">⬅️ Sola Geç</button>
          <button class="hud-btn active" id="cr-r" style="font-size:18px;padding:8px 24px;">Sağa Geç ➡️</button>
        </div>
      </div>`;
    const c = container.querySelector('#cr-c');
    const ctx = c.getContext('2d');
    const lanes = [60, 160, 260];
    let lane = 1, score = 0;
    let obs = [{ lane: 0, y: -30, emo: '🚧' }, { lane: 2, y: -150, emo: '⭐' }];
    container.querySelector('#cr-l').onclick = () => { lane = Math.max(0, lane - 1); playSound('pop'); };
    container.querySelector('#cr-r').onclick = () => { lane = Math.min(2, lane + 1); playSound('pop'); };

    let rafId;
    const loop = () => {
      ctx.fillStyle = '#334155'; ctx.fillRect(0,0,c.width,c.height);
      ctx.strokeStyle = '#fef08a'; ctx.setLineDash([14,14]); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(110,0); ctx.lineTo(110,260); ctx.moveTo(210,0); ctx.lineTo(210,260); ctx.stroke();
      ctx.font = '36px sans-serif'; ctx.textAlign = 'center';
      obs.forEach(o => {
        o.y += 3.6;
        ctx.fillText(o.emo, lanes[o.lane], o.y);
        if (o.y > 195 && o.y < 245 && o.lane === lane) {
          if (o.emo === '⭐') { score += 5; playSound('win'); addStars(1); }
          else { score = Math.max(0, score - 2); playSound('moo'); }
          o.y = -40; o.lane = Math.floor(Math.random()*3);
          container.querySelector('#cr-sc').textContent = score;
        }
        if (o.y > 280) {
          o.y = -40; o.lane = Math.floor(Math.random()*3);
          o.emo = Math.random() > 0.45 ? '⭐' : '🚧';
          score++; container.querySelector('#cr-sc').textContent = score;
        }
      });
      ctx.fillText('🏎️', lanes[lane], 230);
      rafId = requestAnimationFrame(loop);
    };
    loop();
    activeCleanup = () => cancelAnimationFrame(rafId);
    return;
  }

  // 18. PASTA & DONDURMA SİPARİŞ HAZIRLAMA
  if (gameId === 'cake') {
    const layers = ['🍰','🍓','🍫','🍦','🍒','⭐'];
    let order = [], made = [];
    const newOrder = () => {
      order = [layers[Math.floor(Math.random()*6)], layers[Math.floor(Math.random()*6)], layers[Math.floor(Math.random()*6)]];
      made = [];
      render();
    };
    const render = () => {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;">
          <h2 style="color:#db2777;">🍰 Pasta & Dondurma Sipariş Atölyesi</h2>
          <div style="font-size:20px;font-weight:800;background:#fce7f3;padding:10px 20px;border-radius:16px;">Müşteri Siparişi: <span style="font-size:32px;">${order.join(' ')}</span></div>
          <div style="font-size:20px;font-weight:800;background:#ecfdf5;padding:10px 20px;border-radius:16px;">Senin Pastan: <span style="font-size:32px;">${made.join(' ') || '—'}</span></div>
          <div id="ck-btns" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;"></div>
        </div>`;
      const row = container.querySelector('#ck-btns');
      layers.forEach(l => {
        const b = document.createElement('button');
        b.className = 'hud-btn'; b.style.fontSize = '30px'; b.textContent = l;
        b.onclick = () => {
          playSound('pop'); made.push(l);
          if (made.length === 3) {
            if (made.join('') === order.join('')) { reward(3, 'Harika pasta! Müşteri bayıldı!'); }
            else { speakText('Sipariş farklı oldu, yeni pasta yapalım!'); }
            setTimeout(newOrder, 800);
          } else render();
        };
        row.appendChild(b);
      });
    };
    newOrder();
    return;
  }

  // 19. ÇİFTLİK LABİRENTİ
  if (gameId === 'maze') {
    const map = [
      [0,0,1,0,0,0],
      [1,0,1,0,1,0],
      [0,0,0,0,1,0],
      [0,1,1,0,0,0],
      [0,0,0,1,1,0]
    ];
    let px = 0, py = 0;
    const render = () => {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <h2 style="color:#059669;">🧭 Çiftlik Labirenti (Midilliyi 🌾 Samana Ulaştır!)</h2>
          <div id="mz-g" style="display:grid;grid-template-columns:repeat(6,44px);gap:4px;background:#78350f;padding:6px;border-radius:14px;"></div>
          <div style="display:flex;gap:8px;">
            <button class="hud-btn" id="mz-l">⬅️</button>
            <button class="hud-btn" id="mz-u">⬆️</button>
            <button class="hud-btn" id="mz-d">⬇️</button>
            <button class="hud-btn" id="mz-r">➡️</button>
          </div>
        </div>`;
      const g = container.querySelector('#mz-g');
      for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) {
        const cell = document.createElement('div');
        cell.style.cssText = `width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:26px;background:${map[y][x] ? '#15803d' : '#fef3c7'};`;
        if (x === px && y === py) cell.textContent = '🐴';
        else if (x === 5 && y === 4) cell.textContent = '🌾';
        else if (map[y][x]) cell.textContent = '🌲';
        g.appendChild(cell);
      }
      const move = (dx, dy) => {
        const nx = px + dx, ny = py + dy;
        if (nx >= 0 && nx < 6 && ny >= 0 && ny < 5 && map[ny][nx] === 0) {
          px = nx; py = ny; playSound('pop');
          if (px === 5 && py === 4) { reward(4, 'Bravo! Midilli labirentten çıkıp samana ulaştı!'); px = 0; py = 0; }
          render();
        }
      };
      container.querySelector('#mz-l').onclick = () => move(-1,0);
      container.querySelector('#mz-r').onclick = () => move(1,0);
      container.querySelector('#mz-u').onclick = () => move(0,-1);
      container.querySelector('#mz-d').onclick = () => move(0,1);
    };
    render();
    return;
  }

  // 20. 4 KUZEN ZAR YARIŞI (SIRANI BEKLE & BOT MODU!)
  if (gameId === 'dice_race') {
    const players = [
      { id: 'umay',  name: 'Umay ✈️',  pos: 0, col: '#ff4d94' },
      { id: 'yusuf', name: 'Yusuf 🐄', pos: 0, col: '#10b981' },
      { id: 'deren', name: 'Deren 🍼', pos: 0, col: '#a855f7' },
      { id: 'elif',  name: 'Elif 🦄',  pos: 0, col: '#f59e0b' }
    ];
    const myId = helpers.currentPlayer || 'umay';
    let turn = 0, lastDice = '🎲', vsBot = true, botT = null;

    const doRoll = (isRemoteOrBot = false) => {
      if (!isRemoteOrBot && players[turn].id !== myId) {
        playSound('moo');
        speakText(`Şu an sıra ${players[turn].name} tarafında! Kendi sıranı bekle!`);
        return;
      }
      const roll = 1 + Math.floor(Math.random() * 6);
      lastDice = `🎲 ${players[turn].name}: ${roll} Geldi!`;
      players[turn].pos += roll;
      playSound('pop');
      if (players[turn].pos >= 15) {
        reward(4, `Yaşasın! Zar yarışını ${players[turn].name} kazandı!`);
        players.forEach(p => p.pos = 0);
        turn = 0;
      } else {
        turn = (turn + 1) % 4;
      }
      if (!isRemoteOrBot && !vsBot && sendMultiplayerSync) {
        sendMultiplayerSync({ type: 'dice_sync', positions: players.map(p => p.pos), turn, lastDice });
      }
      render();
      scheduleBotRoll();
    };

    const scheduleBotRoll = () => {
      if (botT) clearTimeout(botT);
      if (vsBot && players[turn].id !== myId) {
        botT = setTimeout(() => doRoll(true), 750);
      }
    };

    const render = () => {
      const isMyTurn = players[turn].id === myId;
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;max-width:540px;">
          <h2 style="color:#7c3aed;margin:0;">🎲 4 Kuzen Zar Yarışı (15 Adımda Bitişe Ulaş!)</h2>
          <div style="display:flex;gap:8px;">
            <button class="hud-btn ${vsBot ? 'active' : ''}" id="dr-bot">🤖 Botlara Karşı</button>
            <button class="hud-btn ${!vsBot ? 'active' : ''}" id="dr-live">🌐 Canlı Kuzenler (Sıra Bekle!)</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;width:100%;" id="dr-tracks"></div>
          <button class="hud-btn ${isMyTurn ? 'active' : ''}" id="dr-roll" style="font-size:16px;padding:10px 22px;${!isMyTurn ? 'opacity:0.55;' : ''}">
            ${isMyTurn ? `${lastDice} — ✅ ZAR AT! (Sıra SENDE)` : `⏳ ${lastDice} — Sıra: ${players[turn].name} (Bekle!)`}
          </button>
        </div>`;
      const tr = container.querySelector('#dr-tracks');
      players.forEach((p, idx) => {
        const pct = Math.min(100, (p.pos / 15) * 100);
        tr.innerHTML += `
          <div style="background:${idx === turn ? '#fef9c3' : '#f1f5f9'};border-radius:16px;padding:6px 12px;border:3px solid ${p.col};">
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:13px;">
              <span>${p.name} ${p.id === myId ? '(SEN)' : (vsBot ? '(Bot 🤖)' : '')}</span>
              <span>${p.pos} / 15 🏁</span>
            </div>
            <div style="height:14px;background:#e2e8f0;border-radius:99px;margin-top:4px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:${p.col};transition:width 0.3s;"></div>
            </div>
          </div>`;
      });
      container.querySelector('#dr-roll').onclick = () => doRoll(false);
      container.querySelector('#dr-bot').onclick = () => { vsBot = true; players.forEach(p => p.pos = 0); turn = 0; render(); scheduleBotRoll(); };
      container.querySelector('#dr-live').onclick = () => { vsBot = false; if (botT) clearTimeout(botT); players.forEach(p => p.pos = 0); turn = 0; render(); };
    };

    const offSync = onMultiplayerSync ? onMultiplayerSync((m) => {
      if (!vsBot && m.type === 'dice_sync' && Array.isArray(m.positions)) {
        m.positions.forEach((v, i) => { if (players[i]) players[i].pos = v; });
        turn = m.turn || 0;
        lastDice = m.lastDice || '🎲';
        playSound('pop');
        render();
      }
    }) : null;
    activeCleanup = () => { if (botT) clearTimeout(botT); if (offSync) offSync(); };
    render();
    scheduleBotRoll();
    return;
  }

  // 21. 3'LÜ MÜCEVHER EŞLEŞTİRME (MATCH-3)
  if (gameId === 'match3') {
    const gems = ['💎','💖','⭐','🍀','🎀'];
    let board = Array.from({length: 25}, () => gems[Math.floor(Math.random()*gems.length)]);
    let sel = null, score = 0;
    const render = () => {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
          <h2 style="color:#0284c7;">💎 3'lü Mücevher Eşleştirme — Skor: ${score}</h2>
          <p style="font-size:12px;font-weight:700;color:#64748b;">İki yan yana mücevhere dokunup yer değiştir, 3 aynı mücevheri yan yana getir!</p>
          <div id="m3-g" style="display:grid;grid-template-columns:repeat(5,54px);gap:6px;background:#e0f2fe;padding:10px;border-radius:18px;"></div>
        </div>`;
      const g = container.querySelector('#m3-g');
      board.forEach((gem, i) => {
        const b = document.createElement('button');
        b.style.cssText = `height:54px;font-size:30px;border-radius:14px;border:3px solid ${sel===i ? '#ef4444' : '#fff'};background:#fff;cursor:pointer;`;
        b.textContent = gem;
        b.onclick = () => {
          playSound('pop');
          if (sel === null) { sel = i; render(); return; }
          [board[sel], board[i]] = [board[i], board[sel]];
          sel = null;
          // Check any 3-in-a-row horizontal or vertical
          let matched = new Set();
          for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
            const k = r*5+c;
            if (board[k] === board[k+1] && board[k] === board[k+2]) { matched.add(k); matched.add(k+1); matched.add(k+2); }
          }
          for (let c = 0; c < 5; c++) for (let r = 0; r < 3; r++) {
            const k = r*5+c;
            if (board[k] === board[k+5] && board[k] === board[k+10]) { matched.add(k); matched.add(k+5); matched.add(k+10); }
          }
          if (matched.size > 0) {
            score += matched.size;
            reward(2);
            matched.forEach(idx => board[idx] = gems[Math.floor(Math.random()*gems.length)]);
          }
          render();
        };
        g.appendChild(b);
      });
    };
    render();
    return;
  }

  // 22. 2 KİŞİLİK ATEŞ & SU OYUNU (KENDİ KARAKTERİNİ KONTROL ET + BOT YARDIMCI!)
  if (gameId === 'fire_water') {
    const isFireOwner = (helpers.currentPlayer === 'yusuf'); // Yusuf = 🔥 Ateş, Umay = 💧 Su
    let botPartner = false;
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;">
          <h2 style="color:#ea580c;font-size:18px;margin:0;">🔥💧 Ateş (Yusuf) & Su (Umay) — Sen: ${isFireOwner ? '🔥 Ateş' : '💧 Su'}</h2>
          <button class="hud-btn active" id="fw-m2p" style="padding:4px 8px;font-size:12px;">🌐 2 Kuzen (Canlı)</button>
          <button class="hud-btn green" id="fw-mbot" style="padding:4px 8px;font-size:12px;">🤖 Bot Yardımcı</button>
        </div>
        <div style="font-size:12px;font-weight:800;color:#475569;" id="fw-msg">🔒 Sadece kendi karakterini hareket ettirebilirsin! Birlikte kapıya ulaşın!</div>
        <canvas id="fw-c" width="520" height="240" style="background:#1e293b;border:4px solid #f97316;border-radius:18px;"></canvas>
        <div style="display:flex;justify-content:space-between;width:520px;max-width:98%;gap:8px;">
          <div style="display:flex;gap:4px;${!isFireOwner ? 'opacity:0.4;' : ''}">
            <button class="hud-btn" style="background:#ffedd5;border-color:#f97316;" id="fw-fl">${isFireOwner ? '🔥⬅️' : '🔒🔥'}</button>
            <button class="hud-btn" style="background:#ffedd5;border-color:#f97316;" id="fw-fj">${isFireOwner ? '🔥Zıpla' : '🔒Yusuf'}</button>
            <button class="hud-btn" style="background:#ffedd5;border-color:#f97316;" id="fw-fr">${isFireOwner ? '🔥➡️' : '🔒🔥'}</button>
          </div>
          <div style="display:flex;gap:4px;${isFireOwner ? 'opacity:0.4;' : ''}">
            <button class="hud-btn" style="background:#e0f2fe;border-color:#38bdf8;" id="fw-wl">${!isFireOwner ? '💧⬅️' : '🔒💧'}</button>
            <button class="hud-btn" style="background:#e0f2fe;border-color:#38bdf8;" id="fw-wj">${!isFireOwner ? '💧Zıpla' : '🔒Umay'}</button>
            <button class="hud-btn" style="background:#e0f2fe;border-color:#38bdf8;" id="fw-wr">${!isFireOwner ? '💧➡️' : '🔒💧'}</button>
          </div>
        </div>
      </div>`;
    const c = container.querySelector('#fw-c'), ctx = c.getContext('2d');
    const fire = { x: 40, y: 190, vx: 0, vy: 0, onG: false };
    const water = { x: 80, y: 190, vx: 0, vy: 0, onG: false };
    const keys = {};
    const bindBtn = (id, k, allowed) => {
      const b = container.querySelector(id);
      b.onpointerdown = () => {
        if (!allowed) { playSound('moo'); speakText('Bu diğer kuzenin karakteri! Sadece kendi karakterini yönetebilirsin!'); return; }
        keys[k] = true;
      };
      b.onpointerup = b.onpointerleave = () => keys[k] = false;
    };
    bindBtn('#fw-fl','a', isFireOwner); bindBtn('#fw-fr','d', isFireOwner); bindBtn('#fw-fj','w', isFireOwner);
    bindBtn('#fw-wl','ArrowLeft', !isFireOwner); bindBtn('#fw-wr','ArrowRight', !isFireOwner); bindBtn('#fw-wj','ArrowUp', !isFireOwner);

    container.querySelector('#fw-m2p').onclick = () => { botPartner = false; container.querySelector('#fw-m2p').classList.add('active'); container.querySelector('#fw-mbot').classList.remove('active'); };
    container.querySelector('#fw-mbot').onclick = () => { botPartner = true; container.querySelector('#fw-mbot').classList.add('active'); container.querySelector('#fw-m2p').classList.remove('active'); speakText('Bot yardımcı aktif! Seninle birlikte kapıya geliyor!'); };

    const kd = (e) => {
      if (isFireOwner && ['a','d','w','A','D','W'].includes(e.key)) keys[e.key.toLowerCase()] = true;
      if (!isFireOwner && ['ArrowLeft','ArrowRight','ArrowUp'].includes(e.key)) keys[e.key] = true;
    };
    const ku = (e) => { keys[e.key.toLowerCase()] = false; keys[e.key] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

    const plats = [{x:0,y:215,w:520,h:25},{x:140,y:165,w:110,h:14},{x:290,y:120,w:110,h:14},{x:410,y:82,w:105,h:14}];
    const hazards = [{x:185,y:209,w:55,h:8,type:'water'},{x:310,y:209,w:55,h:8,type:'fire'}];
    const gems = [{x:190,y:145,type:'fire',got:false},{x:340,y:100,type:'water',got:false}];
    let won = false, rafId, lastSync = 0;

    const stepChar = (ch, l, r, j, isFire, isBotCtrl = false) => {
      if (isBotCtrl) {
        ch.vx = ch.x < 455 ? 2.1 : 0;
        if (ch.onG && (Math.abs(ch.x - 130) < 16 || Math.abs(ch.x - 265) < 16 || Math.abs(ch.x - 395) < 16)) {
          ch.vy = -8.6; ch.onG = false;
        }
      } else {
        ch.vx = (keys[l] ? -3.2 : 0) + (keys[r] ? 3.2 : 0);
        if (keys[j] && ch.onG) { ch.vy = -8.6; ch.onG = false; playSound('pop'); }
      }
      ch.vy += 0.42; ch.x = Math.max(12, Math.min(500, ch.x + ch.vx)); ch.y += ch.vy;
      ch.onG = false;
      plats.forEach(p => {
        if (ch.x > p.x - 8 && ch.x < p.x + p.w + 8 && ch.y >= p.y - 16 && ch.y <= p.y + 8 && ch.vy >= 0) {
          ch.y = p.y - 16; ch.vy = 0; ch.onG = true;
        }
      });
      hazards.forEach(h => {
        if (ch.x > h.x && ch.x < h.x + h.w && ch.y > h.y - 18) {
          if ((isFire && h.type === 'water') || (!isFire && h.type === 'fire')) {
            ch.x = isFire ? 40 : 80; ch.y = 185; playSound('moo');
          }
        }
      });
      gems.forEach(g => {
        if (!g.got && Math.hypot(ch.x - g.x, ch.y - g.y) < 22 && ((isFire && g.type==='fire') || (!isFire && g.type==='water'))) {
          g.got = true; playSound('win'); addStars(1);
        }
      });
    };

    const offSync = onMultiplayerSync ? onMultiplayerSync((m) => {
      if (!botPartner && m.type === 'fw_pos') {
        if (m.who === 'fire' && !isFireOwner) { fire.x = m.x; fire.y = m.y; }
        if (m.who === 'water' && isFireOwner) { water.x = m.x; water.y = m.y; }
      }
    }) : null;

    const loop = () => {
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0,0,c.width,c.height);
      if (isFireOwner) {
        stepChar(fire, 'a', 'd', 'w', true, false);
        if (botPartner) stepChar(water, '', '', '', false, true);
      } else {
        stepChar(water, 'ArrowLeft', 'ArrowRight', 'ArrowUp', false, false);
        if (botPartner) stepChar(fire, '', '', '', true, true);
      }
      if (!botPartner && sendMultiplayerSync && performance.now() - lastSync > 120) {
        lastSync = performance.now();
        const me = isFireOwner ? fire : water;
        sendMultiplayerSync({ type: 'fw_pos', who: isFireOwner ? 'fire' : 'water', x: me.x, y: me.y });
      }
      plats.forEach(p => { ctx.fillStyle = '#64748b'; ctx.fillRect(p.x, p.y, p.w, p.h); });
      hazards.forEach(h => { ctx.fillStyle = h.type==='fire'?'#ef4444':'#38bdf8'; ctx.fillRect(h.x, h.y, h.w, h.h); });
      ctx.fillStyle = '#f97316'; ctx.fillRect(430, 42, 28, 40);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(472, 42, 28, 40);
      ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
      gems.forEach(g => { if (!g.got) ctx.fillText(g.type==='fire'?'🔶':'💎', g.x, g.y); });
      ctx.fillText('🔥', fire.x, fire.y + 8);
      ctx.fillText('💧', water.x, water.y + 8);
      if (!won && fire.y < 90 && fire.x > 415 && water.y < 90 && water.x > 415) {
        won = true; reward(5, 'Yaşasın! Ateş ve Su birlikte bölümü geçti!');
        container.querySelector('#fw-msg').textContent = '🏆 TEBRİKLER! ATEŞ VE SU BİRLİKTE KAZANDI! (+5 ⭐)';
      }
      rafId = requestAnimationFrame(loop);
    };
    loop();
    activeCleanup = () => { cancelAnimationFrame(rafId); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); if (offSync) offSync(); };
    return;
  }

  // 23. 2 KİŞİLİK ARABA YARIŞI (UMAY vs YUSUF)
  if (gameId === 'race_2p') {
    let p1 = 0, p2 = 0, finished = false;
    const render = () => {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;max-width:540px;">
          <h2 style="color:#db2777;">🏎️ 2 Kişilik Süper Araba Yarışı (Umay vs Yusuf!)</h2>
          <p style="font-size:13px;font-weight:800;color:#64748b;">Kendi Gaz butonuna hızlıca dokun (veya A / L tuşları)! 20 adımda bitişe ulaş!</p>
          <div style="width:100%;background:#fce7f3;border:4px solid #ff4d94;border-radius:18px;padding:10px;">
            <div style="font-weight:900;color:#be185d;">👧 Umay Pembe Yarış Arabası (${p1}/20)</div>
            <div style="height:36px;background:#334155;border-radius:12px;position:relative;margin-top:4px;overflow:hidden;">
              <div style="position:absolute;left:${Math.min(88, (p1/20)*88)}%;top:2px;font-size:28px;transition:left 0.1s;">🏎️</div>
              <div style="position:absolute;right:6px;top:4px;font-size:22px;">🏁</div>
            </div>
          </div>
          <div style="width:100%;background:#dcfce7;border:4px solid #10b981;border-radius:18px;padding:10px;">
            <div style="font-weight:900;color:#065f46;">👦 Yusuf Yeşil Yarış Arabası (${p2}/20)</div>
            <div style="height:36px;background:#334155;border-radius:12px;position:relative;margin-top:4px;overflow:hidden;">
              <div style="position:absolute;left:${Math.min(88, (p2/20)*88)}%;top:2px;font-size:28px;transition:left 0.1s;">🚗</div>
              <div style="position:absolute;right:6px;top:4px;font-size:22px;">🏁</div>
            </div>
          </div>
          <div style="display:flex;gap:16px;">
            <button class="hud-btn active" id="r2-p1" style="font-size:18px;padding:12px 24px;">👧 UMAY GAZ! (A)</button>
            <button class="hud-btn green" id="r2-p2" style="font-size:18px;padding:12px 24px;">👦 YUSUF GAZ! (L)</button>
          </div>
        </div>`;
      const go = (who, isRemote = false) => {
        if (finished) { p1 = 0; p2 = 0; finished = false; }
        playSound('pop');
        if (who === 1) p1++; else p2++;
        if (p1 >= 20) { finished = true; reward(4, 'Tebrikler! 2 Kişilik Araba Yarışını Umay kazandı!'); }
        else if (p2 >= 20) { finished = true; reward(4, 'Tebrikler! 2 Kişilik Araba Yarışını Yusuf kazandı!'); }
        if (!isRemote && sendMultiplayerSync) sendMultiplayerSync({ type: 'race2p_step', who });
        render();
      };
      container.querySelector('#r2-p1').onclick = () => go(1);
      container.querySelector('#r2-p2').onclick = () => go(2);
    };
    const offSync = onMultiplayerSync ? onMultiplayerSync((msg) => {
      if (msg.type === 'race2p_step') {
        if (msg.who === 1) p1++; else p2++;
        if (p1 >= 20 || p2 >= 20) finished = true;
        playSound('pop');
        render();
      }
    }) : null;
    const onK = (e) => { if (e.key === 'a' || e.key === 'A') container.querySelector('#r2-p1')?.click(); if (e.key === 'l' || e.key === 'L') container.querySelector('#r2-p2')?.click(); };
    window.addEventListener('keydown', onK);
    activeCleanup = () => { window.removeEventListener('keydown', onK); if (offSync) offSync(); };
    render();
    return;
  }

  // 24. 2 KİŞİLİK KOŞU & ENGEL ATLAMA YARIŞI (KENDİ KOŞUCUN + BOT MODU!)
  if (gameId === 'run_2p') {
    const myLane = (helpers.currentPlayer === 'yusuf') ? 2 : 1; // Umay=1, Yusuf=2
    let vsBot = true;
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;">
          <h2 style="color:#0284c7;margin:0;font-size:18px;">🏃 Koşu Yarışı — Umay: <span id="rn-s1">0</span> | Yusuf: <span id="rn-s2">0</span></h2>
          <button class="hud-btn active" id="rn-mbot" style="padding:4px 8px;font-size:12px;">🤖 Bota Karşı</button>
          <button class="hud-btn green" id="rn-m2p" style="padding:4px 8px;font-size:12px;">🌐 2 Kuzen (Canlı)</button>
        </div>
        <canvas id="rn-c" width="500" height="220" style="background:linear-gradient(180deg,#bae6fd,#dcfce7);border:4px solid #0284c7;border-radius:18px;"></canvas>
        <div style="display:flex;gap:18px;">
          <button class="hud-btn ${myLane === 1 ? 'active' : ''}" id="rn-j1" style="font-size:16px;padding:10px 20px;${myLane !== 1 ? 'opacity:0.45;' : ''}">
            ${myLane === 1 ? '👧 Umay Zıpla! (W)' : '🔒 Umay Koşucusu'}
          </button>
          <button class="hud-btn ${myLane === 2 ? 'green' : ''}" id="rn-j2" style="font-size:16px;padding:10px 20px;${myLane !== 2 ? 'opacity:0.45;' : ''}">
            ${myLane === 2 ? '👦 Yusuf Zıpla! (⬆️)' : '🔒 Yusuf Koşucusu'}
          </button>
        </div>
      </div>`;
    const c = container.querySelector('#rn-c'), ctx = c.getContext('2d');
    let y1 = 80, v1 = 0, y2 = 185, v2 = 0, ox1 = 480, ox2 = 340, s1 = 0, s2 = 0, rafId;
    const j1 = (isRemoteOrBot = false) => {
      if (!isRemoteOrBot && myLane !== 1) { playSound('moo'); speakText('Sadece kendi koşucunu zıplatabilirsin!'); return; }
      if (y1 >= 78) { v1 = -9.5; playSound('pop'); if (!isRemoteOrBot && !vsBot && sendMultiplayerSync) sendMultiplayerSync({ type: 'run2p_jump', who: 1 }); }
    };
    const j2 = (isRemoteOrBot = false) => {
      if (!isRemoteOrBot && myLane !== 2) { playSound('moo'); speakText('Sadece kendi koşucunu zıplatabilirsin!'); return; }
      if (y2 >= 183) { v2 = -9.5; playSound('pop'); if (!isRemoteOrBot && !vsBot && sendMultiplayerSync) sendMultiplayerSync({ type: 'run2p_jump', who: 2 }); }
    };
    container.querySelector('#rn-j1').onclick = () => j1(false);
    container.querySelector('#rn-j2').onclick = () => j2(false);
    container.querySelector('#rn-mbot').onclick = () => { vsBot = true; container.querySelector('#rn-mbot').classList.add('active'); container.querySelector('#rn-m2p').classList.remove('active'); };
    container.querySelector('#rn-m2p').onclick = () => { vsBot = false; container.querySelector('#rn-m2p').classList.add('active'); container.querySelector('#rn-mbot').classList.remove('active'); };

    const onK = (e) => {
      if ((e.key === 'w' || e.key === 'W') && myLane === 1) j1(false);
      if (e.key === 'ArrowUp' && myLane === 2) j2(false);
    };
    window.addEventListener('keydown', onK);
    const offSync = onMultiplayerSync ? onMultiplayerSync((m) => {
      if (!vsBot && m.type === 'run2p_jump') { if (m.who === 1) j1(true); else j2(true); }
    }) : null;

    const loop = () => {
      ctx.clearRect(0,0,c.width,c.height);
      ctx.fillStyle = '#f472b6'; ctx.fillRect(0, 102, 500, 6);
      ctx.fillStyle = '#10b981'; ctx.fillRect(0, 207, 500, 13);
      // Smart Bot jumps for opponent lane in vsBot mode
      if (vsBot) {
        if (myLane === 1 && ox2 < 125 && ox2 > 80 && y2 >= 183 && Math.random() < 0.14) j2(true);
        if (myLane === 2 && ox1 < 125 && ox1 > 80 && y1 >= 78 && Math.random() < 0.14) j1(true);
      }
      y1 = Math.min(80, y1 + v1); v1 += 0.55; if (y1 >= 80) v1 = 0;
      y2 = Math.min(185, y2 + v2); v2 += 0.55; if (y2 >= 185) v2 = 0;
      const runSpd = 3.8 + (gameLevel - 1) * 0.35;
      ox1 -= runSpd; ox2 -= runSpd;
      if (ox1 < -20) { ox1 = 510; s1++; container.querySelector('#rn-s1').textContent = s1; if (s1 >= 10) { reward(4, 'Koşu yarışını Umay kazandı!'); s1 = 0; s2 = 0; } }
      if (ox2 < -20) { ox2 = 510; s2++; container.querySelector('#rn-s2').textContent = s2; if (s2 >= 10) { reward(4, 'Koşu yarışını Yusuf kazandı!'); s1 = 0; s2 = 0; } }
      if (Math.abs(ox1 - 70) < 22 && y1 > 62) { ox1 = 510; playSound('moo'); }
      if (Math.abs(ox2 - 70) < 22 && y2 > 167) { ox2 = 510; playSound('moo'); }
      ctx.font = '32px sans-serif';
      ctx.fillText('🏃‍♀️', 60, y1 + 18); ctx.fillText('🚧', ox1, 98);
      ctx.fillText('🏃‍♂️', 60, y2 + 18); ctx.fillText('🚧', ox2, 203);
      rafId = requestAnimationFrame(loop);
    };
    loop();
    activeCleanup = () => { cancelAnimationFrame(rafId); window.removeEventListener('keydown', onK); if (offSync) offSync(); };
    return;
  }

  // 25. KALE SAVUNMA (CASTLE DEFENSE)
  if (gameId === 'castle_def') {
    let hp = 5, score = 0;
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;">
        <h2 style="color:#7c3aed;">🏰 Kuzenler Kale Savunması — Kaleyi Koru! Can: <span id="cd-hp">❤️❤️❤️❤️❤️</span> | Skor: <span id="cd-sc">0</span></h2>
        <p style="font-size:12px;font-weight:800;color:#64748b;">Kaleye yaklaşan ayılara ve robotlara dokunarak kartopu/ok fırlat!</p>
        <div id="cd-arena" style="width:500px;max-width:96%;height:240px;background:linear-gradient(90deg,#c4b5fd 0%,#bbf7d0 28%,#86efac 100%);border:4px solid #7c3aed;border-radius:20px;position:relative;overflow:hidden;">
          <div style="position:absolute;left:8px;top:65px;font-size:74px;pointer-events:none;">🏰</div>
        </div>
      </div>`;
    const arena = container.querySelector('#cd-arena');
    const enemies = [];
    const spawn = () => {
      const el = document.createElement('button');
      el.textContent = Math.random() > 0.5 ? '🐻' : '🤖';
      const y = 20 + Math.random() * 165;
      el.style.cssText = `position:absolute;left:460px;top:${y}px;font-size:40px;background:none;border:none;cursor:pointer;`;
      const obj = { el, x: 460 };
      el.onclick = () => {
        playSound('win'); score++; container.querySelector('#cd-sc').textContent = score;
        if (score % 4 === 0) addStars(1);
        el.remove(); const idx = enemies.indexOf(obj); if (idx >= 0) enemies.splice(idx, 1);
      };
      arena.appendChild(el); enemies.push(obj);
    };
    const spTimer = setInterval(spawn, 1300);
    const mvTimer = setInterval(() => {
      for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].x -= 6;
        enemies[i].el.style.left = `${enemies[i].x}px`;
        if (enemies[i].x < 68) {
          enemies[i].el.remove(); enemies.splice(i, 1);
          hp = Math.max(0, hp - 1); playSound('bear');
          container.querySelector('#cd-hp').textContent = '❤️'.repeat(hp) || '💔 Yeniden Başla!';
          if (hp === 0) { hp = 5; score = 0; container.querySelector('#cd-hp').textContent = '❤️❤️❤️❤️❤️'; }
        }
      }
    }, 80);
    activeCleanup = () => { clearInterval(spTimer); clearInterval(mvTimer); };
    return;
  }

  // 26. KARTOPU SAVAŞI OYUNU (SNOWBALL FIGHT!)
  if (gameId === 'snowball') {
    let score = 0;
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;">
        <h2 style="color:#0284c7;">⛄ Kış Kartopu Savaşı! — İsabet: <span id="sb-sc">0</span> ❄️</h2>
        <p style="font-size:12px;font-weight:800;color:#475569;">Kardan adamlara ve kış hedeflerine dokunarak kartopu fırlat!</p>
        <div id="sb-arena" style="width:480px;max-width:96%;height:250px;background:linear-gradient(180deg,#7dd3fc 0%,#e0f2fe 55%,#ffffff 55%);border:4px solid #38bdf8;border-radius:22px;position:relative;overflow:hidden;"></div>
      </div>`;
    const arena = container.querySelector('#sb-arena');
    const popSnowman = () => {
      arena.innerHTML = '';
      for (let i = 0; i < 2; i++) {
        const b = document.createElement('button');
        b.textContent = i === 0 ? '⛄' : '🐧';
        b.style.cssText = `position:absolute;left:${12+Math.random()*72}%;top:${28+Math.random()*50}%;font-size:52px;background:none;border:none;cursor:pointer;`;
        b.onclick = () => {
          score++; playSound('pop'); b.textContent = '❄️💥';
          container.querySelector('#sb-sc').textContent = score;
          if (score % 3 === 0) { addStars(1); speakText('Tam isabet! Süper kartopu!'); }
          setTimeout(popSnowman, 260);
        };
        arena.appendChild(b);
      }
    };
    popSnowman();
    const timer = setInterval(popSnowman, 1800);
    activeCleanup = () => clearInterval(timer);
    return;
  }

  // 27. SÜPER ENGEL AŞMA PARKURU (OBBY PLATFORMER!)
  if (gameId === 'parkour') {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <h2 style="color:#a855f7;">🧗 Süper Engel Aşma Parkuru (Obby) — Bayrağa 🏁 Ulaş!</h2>
        <canvas id="pk-c" width="500" height="240" style="background:linear-gradient(180deg,#ede9fe,#bae6fd);border:4px solid #a855f7;border-radius:18px;"></canvas>
        <div style="display:flex;gap:10px;">
          <button class="hud-btn active" id="pk-l">⬅️ Sol</button>
          <button class="hud-btn green" id="pk-j" style="padding:8px 22px;">⬆️ Zıpla!</button>
          <button class="hud-btn active" id="pk-r">Sağ ➡️</button>
        </div>
      </div>`;
    const c = container.querySelector('#pk-c'), ctx = c.getContext('2d');
    const p = { x: 35, y: 170, vy: 0, onG: false };
    const k = {};
    const bind = (id, key) => { const b = container.querySelector(id); b.onpointerdown = () => k[key]=true; b.onpointerup = b.onpointerleave = () => k[key]=false; };
    bind('#pk-l','l'); bind('#pk-r','r'); bind('#pk-j','j');
    const plats = [{x:0,y:210,w:110,h:30},{x:145,y:175,w:90,h:16},{x:270,y:135,w:90,h:16},{x:395,y:95,w:105,h:16}];
    let rafId;
    const loop = () => {
      ctx.clearRect(0,0,c.width,c.height);
      // Lava floor
      ctx.fillStyle = '#ef4444'; ctx.fillRect(110, 225, 390, 15);
      p.x += (k.l ? -3.6 : 0) + (k.r ? 3.6 : 0);
      if (k.j && p.onG) { p.vy = -9.2; p.onG = false; playSound('pop'); }
      p.vy += 0.45; p.y += p.vy; p.onG = false;
      plats.forEach(pl => {
        ctx.fillStyle = '#8b5cf6'; ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        if (p.x > pl.x - 10 && p.x < pl.x + pl.w + 10 && p.y >= pl.y - 18 && p.y <= pl.y + 8 && p.vy >= 0) {
          p.y = pl.y - 18; p.vy = 0; p.onG = true;
        }
      });
      if (p.y > 235) { p.x = 35; p.y = 170; p.vy = 0; playSound('moo'); }
      ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🏁', 460, 88);
      ctx.fillText('🦸', p.x, p.y + 10);
      if (p.x > 435 && p.y < 100) { reward(5, 'Harika! Engel aşma parkurunu bitirdin!'); p.x = 35; p.y = 170; }
      rafId = requestAnimationFrame(loop);
    };
    loop();
    activeCleanup = () => cancelAnimationFrame(rafId);
    return;
  }

  /* ==========================================================================
     PART B: 20 SPECIAL 3-YEAR-OLD GAMES FOR DEREN & ELİF (BIG, VOICE-GUIDED!)
     ========================================================================== */

  // Helper for big-button 3-year-old interactive quizzes
  function renderToddlerQuiz(title, promptSpeech, promptVisual, options, onCorrectNext) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;width:100%;">
        <h2 style="color:#db2777;font-size:22px;">${title}</h2>
        <div style="font-size:34px;font-weight:900;background:#fef9c3;padding:12px 26px;border-radius:24px;border:4px solid #facc15;">${promptVisual}</div>
        <div id="tq-opts" style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;"></div>
      </div>`;
    speakText(promptSpeech);
    const row = container.querySelector('#tq-opts');
    options.forEach(opt => {
      const b = document.createElement('button');
      b.style.cssText = `min-width:115px;min-height:110px;padding:12px 18px;font-size:44px;border-radius:26px;border:5px solid #fff;background:${opt.bg || '#fff'};box-shadow:0 8px 18px rgba(0,0,0,0.12);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;`;
      b.innerHTML = `<span>${opt.visual}</span>${opt.label ? `<small style="font-size:14px;font-weight:800;color:#1e293b;">${opt.label}</small>` : ''}`;
      b.onclick = () => {
        if (opt.correct) {
          reward(2, opt.winSpeech || 'Aferin sana! Harikasın!');
          setTimeout(onCorrectNext, 1100);
        } else {
          playSound('pop');
          speakText('Bir daha deneyelim!');
        }
      };
      row.appendChild(b);
    });
  }

  // T1: Renkli Balon Patlatma
  if (gameId === 't_balloon' || gameId === 't_bubble' || gameId === 't_butterfly' || gameId === 't_stars') {
    const cfg = {
      t_balloon:   { title: '🎈 Renkli Balonları Patlat!', items: ['🎈','🎈','🎈','🎈','🎈','🎈'], bgs: ['#ef4444','#3b82f6','#facc15','#22c55e','#a855f7','#ec4899'], say: 'Pop! Balon patladı!' },
      t_bubble:    { title: '🫧 Dev Sabun Köpüklerini Patlat!', items: ['🫧','🫧','🫧','🫧','🫧','🫧'], bgs: ['#bae6fd','#e0f2fe','#f5d0fe','#cffafe','#dbeafe','#fce7f3'], say: 'Pıt! Köpük patladı!' },
      t_butterfly: { title: '🦋 Kelebekleri Yakala!', items: ['🦋','🦋','🦋','🦋','🦋','🦋'], bgs: ['#fef08a','#fbcfe8','#bbf7d0','#ddd6fe','#fed7aa','#bae6fd'], say: 'Yaşasın! Kelebek yakaladın!' },
      t_stars:     { title: '⭐ Parlak Yıldızları Topla!', items: ['⭐','🌟','✨','⭐','🌟','✨'], bgs: ['#fef08a','#fde68a','#fef9c3','#fde047','#fef08a','#fde68a'], say: 'Harika! Yıldız topladın!' }
    }[gameId];
    const spawn = () => {
      container.innerHTML = `<div style="text-align:center;width:100%;"><h2 style="color:#db2777;margin-bottom:10px;">${cfg.title}</h2><div id="t-pop-area" style="display:grid;grid-template-columns:repeat(3,110px);gap:14px;justify-content:center;"></div></div>`;
      const area = container.querySelector('#t-pop-area');
      let left = cfg.items.length;
      cfg.items.forEach((em, i) => {
        const b = document.createElement('button');
        b.style.cssText = `height:110px;border-radius:50%;border:5px solid #fff;background:${cfg.bgs[i]};font-size:48px;cursor:pointer;box-shadow:0 8px 16px rgba(0,0,0,0.15);`;
        b.textContent = em;
        b.onclick = () => {
          playSound('pop'); speakText(cfg.say); b.style.visibility = 'hidden'; left--;
          if (left === 0) { reward(3, 'Aferin Deren ve Elif! Hepsini bitirdiniz!'); setTimeout(spawn, 1000); }
        };
        area.appendChild(b);
      });
    };
    spawn();
    return;
  }

  // T2: Hangi Hayvan Bu Sesi Çıkarır? (Farklı Hayvan Sesleri + Sese Tekrar Tıklayınca Yine Çalar!)
  if (gameId === 't_sound') {
    const animals = [
      { emo: '🐄', name: 'İnek',   soundType: 'moo',   text: 'Mööö mööö!' },
      { emo: '🐶', name: 'Köpek',  soundType: 'bark',  text: 'Hav hav hav!' },
      { emo: '🐱', name: 'Kedi',   soundType: 'meow',  text: 'Miyav miyav!' },
      { emo: '🐑', name: 'Koyun',  soundType: 'baa',   text: 'Meee meee!' },
      { emo: '🐥', name: 'Civciv', soundType: 'chirp', text: 'Cik cik cik!' },
      { emo: '🐴', name: 'At',     soundType: 'neigh', text: 'İihaaa! Kişneme!' },
      { emo: '🐸', name: 'Kurbağa',soundType: 'frog',  text: 'Vrak vrak!' }
    ];
    let nextTimer = null;
    const next = () => {
      const target = animals[Math.floor(Math.random()*animals.length)];
      const opts = [target, ...animals.filter(a=>a!==target).sort(()=>Math.random()-0.5).slice(0,2)].sort(()=>Math.random()-0.5);
      const playAnimalVoice = () => {
        playSound(target.soundType);
        setTimeout(() => speakText(`${target.text} Bu sesi hangi hayvan çıkarır?`), 420);
      };
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;width:100%;">
          <h2 style="color:#db2777;font-size:22px;">🐶 Hangi Hayvan Bu Sesi Çıkarır?</h2>
          <button id="replay-animal-snd" style="font-size:26px;font-weight:900;background:linear-gradient(135deg,#fef08a,#fde047);padding:14px 28px;border-radius:26px;border:5px solid #fff;box-shadow:0 8px 20px rgba(0,0,0,0.14);cursor:pointer;color:#854d0e;">
            🔊 "${target.text}" — Tekrar Dinle!
          </button>
          <div id="ts-opts" style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;"></div>
        </div>`;
      container.querySelector('#replay-animal-snd').onclick = () => playAnimalVoice();
      playAnimalVoice();
      const row = container.querySelector('#ts-opts');
      opts.forEach(o => {
        const b = document.createElement('button');
        b.style.cssText = 'min-width:120px;min-height:115px;padding:12px 18px;font-size:48px;border-radius:26px;border:5px solid #fff;background:#fff;box-shadow:0 8px 18px rgba(0,0,0,0.12);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;';
        b.innerHTML = `<span>${o.emo}</span><small style="font-size:15px;font-weight:800;color:#1e293b;">${o.name}</small>`;
        b.onclick = () => {
          playSound(o.soundType);
          if (o === target) {
            reward(2, `Aferin! Bu ses ${o.name} sesi!`);
            nextTimer = setTimeout(next, 1200);
          } else {
            speakText(`Hayır, bu ${o.name}! Sese tekrar basıp dinle!`);
          }
        };
        row.appendChild(b);
      });
    };
    activeCleanup = () => { if (nextTimer) clearTimeout(nextTimer); };
    next();
    return;
  }

  // T3: Şekil Eşleştirme
  if (gameId === 't_shape') {
    const shapes = [
      { emo: '🔴', name: 'Daire' }, { emo: '🟦', name: 'Kare' }, { emo: '🔺', name: 'Üçgen' }, { emo: '⭐', name: 'Yıldız' }, { emo: '❤️', name: 'Kalp' }
    ];
    const next = () => {
      const t = shapes[Math.floor(Math.random()*shapes.length)];
      const opts = [t, ...shapes.filter(s=>s!==t).sort(()=>Math.random()-0.5).slice(0,2)].sort(()=>Math.random()-0.5);
      renderToddlerQuiz('🔷 Aynı Şekli Bul!', `${t.name} şeklini bul ve dokun!`, `${t.emo} ${t.name}`,
        opts.map(o => ({ visual: o.emo, label: o.name, correct: o===t, winSpeech: `Aferin! Bu bir ${o.name}!` })), next);
    };
    next();
    return;
  }

  // T4: Renk Sepeti
  if (gameId === 't_color') {
    const cols = [
      { name: 'Kırmızı', bg: '#ef4444', emo: '🍎' },
      { name: 'Mavi', bg: '#3b82f6', emo: '🐳' },
      { name: 'Sarı', bg: '#facc15', emo: '🐥' },
      { name: 'Yeşil', bg: '#22c55e', emo: '🐸' },
      { name: 'Pembe', bg: '#ec4899', emo: '🌸' }
    ];
    const next = () => {
      const t = cols[Math.floor(Math.random()*cols.length)];
      const opts = [t, ...cols.filter(c=>c!==t).sort(()=>Math.random()-0.5).slice(0,2)].sort(()=>Math.random()-0.5);
      renderToddlerQuiz('🎨 Renk Sepeti!', `${t.name} rengi bul ve dokun!`, `${t.name} Rengi Bul!`,
        opts.map(o => ({ visual: o.emo, label: o.name, bg: o.bg, correct: o===t, winSpeech: `Bravo! ${o.name}!` })), next);
    };
    next();
    return;
  }

  // T7: Gölgesini Bul
  if (gameId === 't_shadow') {
    const list = ['🐄','🐴','🐶','🐱','🦄','🐘'];
    const next = () => {
      const t = list[Math.floor(Math.random()*list.length)];
      const opts = [t, ...list.filter(x=>x!==t).sort(()=>Math.random()-0.5).slice(0,2)].sort(()=>Math.random()-0.5);
      renderToddlerQuiz('🐾 Gölgesini Bul!', 'Bu gölge hangi hayvana ait? Dokun!', `<span style="filter:brightness(0);">${t}</span>`,
        opts.map(o => ({ visual: o, correct: o===t, winSpeech: 'Harika! Gölgesini buldun!' })), next);
    };
    next();
    return;
  }

  // T8: Büyük mü Küçük mü?
  if (gameId === 't_bigsmall') {
    const next = () => {
      const askBig = Math.random() > 0.5;
      renderToddlerQuiz('🐘 Büyük mü Küçük mü?', askBig ? 'Büyük olan hayvana dokun!' : 'Küçük olan hayvana dokun!',
        askBig ? 'Hangisi BÜYÜK?' : 'Hangisi KÜÇÜK?', [
          { visual: '<span style="font-size:66px;">🐘</span>', label: 'Büyük Fil', correct: askBig },
          { visual: '<span style="font-size:28px;">🐭</span>', label: 'Küçük Fare', correct: !askBig }
        ], next);
    };
    next();
    return;
  }

  // T9: Sayı Treni 1-5
  if (gameId === 't_train') {
    let nextNum = 1;
    const render = () => {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;">
          <h2 style="color:#0284c7;">🚂 Sayı Trenini Sırayla Diz! (Sıradaki Sayı: ${nextNum})</h2>
          <div style="font-size:32px;background:#e0f2fe;padding:10px 20px;border-radius:18px;">🚂 ${Array.from({length: nextNum-1}, (_,i)=>`[${i+1}]`).join('—')}</div>
          <div id="tr-btns" style="display:flex;gap:12px;"></div>
        </div>`;
      [1,2,3,4,5].sort(()=>Math.random()-0.5).forEach(n => {
        const b = document.createElement('button');
        b.style.cssText = 'width:76px;height:76px;border-radius:20px;border:4px solid #38bdf8;background:#fff;font-size:34px;font-weight:900;cursor:pointer;';
        b.textContent = n;
        b.onclick = () => {
          if (n === nextNum) {
            playSound('pop'); speakText(`${n}!`); nextNum++;
            if (nextNum > 5) { reward(3, 'Yaşasın! Tren vagonlarını 1 den 5 e dizdin!'); nextNum = 1; }
            render();
          } else speakText(`Önce ${nextNum} sayısına dokun!`);
        };
        container.querySelector('#tr-btns').appendChild(b);
      });
    };
    render();
    return;
  }

  // T16: SÜRÜKLE-BIRAK RENK KARIŞTIRMA & YENİ RENK OLUŞTURMA ATÖLYESİ!
  if (gameId === 't_rainbow') {
    const baseColors = [
      { id: 'red',    name: 'Kırmızı', hex: '#ef4444' },
      { id: 'yellow', name: 'Sarı',    hex: '#facc15' },
      { id: 'blue',   name: 'Mavi',    hex: '#3b82f6' },
      { id: 'white',  name: 'Beyaz',   hex: '#f8fafc' }
    ];
    const mixRecipes = {
      'red+yellow':  { name: 'TURUNCU 🍊', hex: '#f97316', say: 'Kırmızı ve Sarı karıştı, harika bir Turuncu oluştu!' },
      'blue+yellow': { name: 'YEŞİL 🍀',   hex: '#22c55e', say: 'Mavi ve Sarı karıştı, mis gibi Yeşil oluştu!' },
      'blue+red':    { name: 'MOR 🍇',     hex: '#a855f7', say: 'Kırmızı ve Mavi karıştı, şahane bir Mor oluştu!' },
      'red+white':   { name: 'PEMBE 🌸',   hex: '#f472b6', say: 'Kırmızı ve Beyaz karıştı, tatlı Pembe oluştu!' },
      'blue+white':  { name: 'AÇIK MAVİ 🐳', hex: '#7dd3fc', say: 'Mavi ve Beyaz karıştı, gökyüzü mavisi oluştu!' },
      'white+yellow':{ name: 'KREM SARI 🌼', hex: '#fef08a', say: 'Sarı ve Beyaz karıştı, papatya sarısı oluştu!' }
    };
    let inPot = [], mixedResult = null;

    const addColorToPot = (c) => {
      playSound('water');
      if (inPot.length >= 2) { inPot = []; mixedResult = null; }
      inPot.push(c);
      if (inPot.length === 2) {
        const key = [inPot[0].id, inPot[1].id].sort().join('+');
        if (mixRecipes[key]) {
          mixedResult = mixRecipes[key];
          reward(3, mixedResult.say);
        } else {
          mixedResult = { name: `${inPot[0].name} (Daha Koyu!)`, hex: inPot[0].hex, say: `İki ${inPot[0].name} karıştı! Başka bir renk dene!` };
          speakText(mixedResult.say);
        }
      } else {
        speakText(`${c.name} boya kazana eklendi! Şimdi başka bir rengi sürükleyip kazana bırak!`);
      }
      renderMix();
    };

    const renderMix = () => {
      const potBg = mixedResult ? mixedResult.hex : (inPot[0] ? inPot[0].hex : '#e2e8f0');
      const potTxt = mixedResult ? mixedResult.name : (inPot[0] ? `${inPot[0].name} + ?` : 'Renkleri Buraya Sürükle!');
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;text-align:center;">
          <h2 style="color:#db2777;">🌈 Sürükle-Bırak Renk Karıştırma Atölyesi!</h2>
          <p style="font-size:13px;font-weight:800;color:#64748b;">İki boya topunu parmağınla tutup ortadaki kazana sürükle, yeni renk oluştur!</p>
          <div id="mix-sources" style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;"></div>
          <div id="mix-pot" style="width:210px;height:130px;border-radius:30px 30px 70px 70px;background:${potBg};border:6px solid #fff;box-shadow:0 12px 26px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:19px;color:${potBg==='#f8fafc'||potBg==='#e2e8f0'||potBg==='#facc15'||potBg==='#fef08a'?'#1e293b':'#fff'};padding:10px;transition:all 0.3s;">
            🎨 ${potTxt}
          </div>
          <button class="hud-btn" id="mix-reset">🧹 Kazanı Temizle</button>
        </div>`;

      container.querySelector('#mix-reset').onclick = () => { inPot = []; mixedResult = null; playSound('pop'); renderMix(); };
      const potEl = container.querySelector('#mix-pot');
      const srcRow = container.querySelector('#mix-sources');

      baseColors.forEach(c => {
        const orb = document.createElement('div');
        orb.style.cssText = `width:84px;height:84px;border-radius:50%;background:${c.hex};border:5px solid #fff;box-shadow:0 8px 16px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:${c.id==='white'||c.id==='yellow'?'#1e293b':'#fff'};cursor:grab;touch-action:none;user-select:none;`;
        orb.textContent = c.name;

        let sx = 0, sy = 0, moved = false;
        orb.addEventListener('pointerdown', (e) => {
          orb.setPointerCapture(e.pointerId);
          sx = e.clientX; sy = e.clientY; moved = false;
          orb.style.zIndex = '999';
          orb.style.position = 'relative';
        });
        orb.addEventListener('pointermove', (e) => {
          if (!orb.hasPointerCapture(e.pointerId)) return;
          const dx = e.clientX - sx, dy = e.clientY - sy;
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
          orb.style.transform = `translate(${dx}px, ${dy}px) scale(1.12)`;
        });
        orb.addEventListener('pointerup', (e) => {
          if (!orb.hasPointerCapture(e.pointerId)) return;
          orb.releasePointerCapture(e.pointerId);
          const pr = potEl.getBoundingClientRect();
          const droppedInPot = (e.clientX >= pr.left - 30 && e.clientX <= pr.right + 30 && e.clientY >= pr.top - 30 && e.clientY <= pr.bottom + 30);
          orb.style.transform = '';
          if (droppedInPot || !moved) addColorToPot(c);
        });
        srcRow.appendChild(orb);
      });
    };
    renderMix();
    return;
  }

  // T10: Cupcake Süsleme & T12: Çiçek Büyütme & T11: Balık Besleme
  if (gameId === 't_cupcake' || gameId === 't_flower' || gameId === 't_fish') {
    let step = 0;
    const stages = {
      t_cupcake: { title: '🧁 Cupcake Süsleme Atölyesi', steps: ['🧁','🧁🍓','🧁🍓🍫','🧁🍓🍫✨'], btn: '🍓 Süs Ekle!' },
      t_flower:  { title: '🌻 Çiçeği Sula ve Büyüt!',   steps: ['🌱','🌿','🌷','🌻'],         btn: '💧 Çiçeği Sula!' },
      t_fish:    { title: '🐟 Akvaryumda Balık Besle!',  steps: ['🐟','🐟🐠','🐟🐠🐡','🐟🐠🐡🐬'], btn: '🍤 Balıklara Yem Ver!' }
    }[gameId];
    const render = () => {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;">
          <h2 style="color:#db2777;">${stages.title}</h2>
          <div style="font-size:82px;background:#fffbeb;padding:20px 40px;border-radius:30px;border:5px solid #fde047;">${stages.steps[step]}</div>
          <button class="hud-btn active" id="t-grow-btn" style="font-size:22px;padding:14px 28px;">${stages.btn}</button>
        </div>`;
      container.querySelector('#t-grow-btn').onclick = () => {
        step++;
        if (step >= stages.steps.length) {
          reward(3, 'Harika oldu! Çok güzel yaptın!');
          step = 0;
        } else {
          playSound('pop');
        }
        render();
      };
    };
    render();
    return;
  }

  // T13: Minik Davul & Ritim Kutusu
  if (gameId === 't_drum') {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;">
        <h2 style="color:#f59e0b;">🥁 Minik Davul & Ritim Kutusu (Dokun ve Çal!)</h2>
        <div id="drum-row" style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;"></div>
      </div>`;
    const pads = [
      { emo: '🥁', name: 'Büyük Davul', bg: '#ef4444', s: 'moo' },
      { emo: '🔔', name: 'Altın Zil',   bg: '#facc15', s: 'win' },
      { emo: '🪘', name: 'Darbuka',     bg: '#10b981', s: 'pop' },
      { emo: '🎺', name: 'Trompet',     bg: '#3b82f6', s: 'water' }
    ];
    pads.forEach(p => {
      const b = document.createElement('button');
      b.style.cssText = `width:120px;height:120px;border-radius:50%;border:6px solid #fff;background:${p.bg};color:#fff;font-size:44px;cursor:pointer;box-shadow:0 10px 20px rgba(0,0,0,0.18);`;
      b.innerHTML = `${p.emo}<div style="font-size:13px;font-weight:800;">${p.name}</div>`;
      b.onclick = () => { playSound(p.s); b.style.transform = 'scale(1.12)'; setTimeout(()=>b.style.transform='scale(1)', 150); };
      container.querySelector('#drum-row').appendChild(b);
    });
    return;
  }

  // T14: Araba Park Et
  if (gameId === 't_park') {
    const garages = [
      { col: '#ef4444', name: 'Kırmızı Garaj', car: '🚗' },
      { col: '#3b82f6', name: 'Mavi Garaj',    car: '🚙' },
      { col: '#22c55e', name: 'Yeşil Garaj',   car: '🚜' }
    ];
    const next = () => {
      const t = garages[Math.floor(Math.random()*garages.length)];
      renderToddlerQuiz('🚗 Arabayı Doğru Garaja Park Et!', `${t.name} hangisi? Arabayı oraya park et!`, `${t.car} ➡️ ${t.name}`,
        garages.map(g => ({ visual: '🏠', label: g.name, bg: g.col, correct: g===t, winSpeech: 'Bip bip! Arabayı harika park ettin!' })), next);
    };
    next();
    return;
  }

  // T15: Sürpriz Yumurta & T20: Sürpriz Hediye Kutusu
  if (gameId === 't_egg' || gameId === 't_gift') {
    const isEgg = gameId === 't_egg';
    const prizes = isEgg ? ['🐣','🦖','🐢','🐥','🦄','🦆'] : ['🧸','✈️','🐴','👑','🚗','🎸'];
    let taps = 0;
    const render = () => {
      const opened = taps >= 3;
      const prize = prizes[Math.floor(Math.random()*prizes.length)];
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;">
          <h2 style="color:#a855f7;">${isEgg ? '🐣 Sürpriz Yumurtaya 3 Kez Dokun!' : '🎁 Sürpriz Hediye Kutusunu Aç!'}</h2>
          <button id="surp-btn" style="font-size:96px;background:none;border:none;cursor:pointer;">${opened ? prize : (isEgg ? '🥚' : '🎁')}</button>
          <p style="font-size:18px;font-weight:800;color:#475569;">${opened ? '🎉 Sürpriz çıktı! Yenisi için dokun!' : `Kalan dokunuş: ${3 - taps}`}</p>
        </div>`;
      container.querySelector('#surp-btn').onclick = () => {
        if (opened) { taps = 0; render(); return; }
        taps++;
        playSound(taps >= 3 ? 'win' : 'pop');
        if (taps >= 3) { addStars(2); speakText('Yaşasın! Sürpriz oyuncak çıktı!'); }
        render();
      };
    };
    render();
    return;
  }

  // T17: Meyve Sepeti Ayırma
  if (gameId === 't_fruitveg') {
    const next = () => {
      const fruits = ['🍎','🍓','🍌','🍇'];
      const f = fruits[Math.floor(Math.random()*fruits.length)];
      renderToddlerQuiz('🍎 Meyveyi Bul ve Sepete Koy!', 'Tatlı meyveyi bul ve dokun!', 'Hangisi Meyve?', [
        { visual: f, label: 'Meyve', correct: true, winSpeech: 'Aferin! Çok tatlı meyve!' },
        { visual: '🚗', label: 'Araba', correct: false },
        { visual: '👟', label: 'Ayakkabı', correct: false }
      ], next);
    };
    next();
    return;
  }

  // T19: İyi Geceler (Hayvanları Yatağına Yatır)
  if (gameId === 't_sleep') {
    const sleepers = ['🐶','🐱','🐮','🐴'];
    let asleep = [false, false, false, false];
    const render = () => {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;">
          <h2 style="color:#4f46e5;">😴 Hayvanları Yatağına Yatır (İyi Geceler!)</h2>
          <div id="sl-row" style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;"></div>
        </div>`;
      sleepers.forEach((em, i) => {
        const b = document.createElement('button');
        b.style.cssText = `width:110px;height:120px;border-radius:24px;border:4px solid #818cf8;background:${asleep[i] ? '#1e1b4b' : '#fff'};color:#fff;font-size:48px;cursor:pointer;`;
        b.innerHTML = `${em}<div style="font-size:14px;color:${asleep[i] ? '#fde047' : '#334155'};font-weight:800;">${asleep[i] ? '💤 Uyudu' : '🛏️ Yatır'}</div>`;
        b.onclick = () => {
          asleep[i] = true; playSound('pop'); speakText('İyi geceler!');
          if (asleep.every(Boolean)) { reward(3, 'Bütün hayvanlar mışıl mışıl uyudu! Aferin!'); asleep = [false,false,false,false]; }
          render();
        };
        container.querySelector('#sl-row').appendChild(b);
      });
    };
    render();
    return;
  }
}
