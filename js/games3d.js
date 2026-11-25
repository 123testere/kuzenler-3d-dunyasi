import * as THREE from 'three';

/* ============================================================================
   GERÇEK 3 BOYUTLU BÜYÜK EKRAN OYUN MOTORU (games3d.js)
   - Bellek sızıntısı ve çökme önleyici otomatik cleanup/dispose!
   - 6 Büyük 3D Oyun:
     1. 3D 2 Kişilik Canlı Araba Yarışı (Kazanan Kupası & Canlı Senkron)
     2. 3D Kartopu Savaşı (Kavisli 3D Kartopu Fiziği)
     3. 3D Okçuluk (Basılı Tut -> Güç/Şiddet + Hareketli İsabet Nişangahı!)
     4. 3D Asker Olma & Üs Savunma (3D Top/Lazer & Rütbe Atlama)
     5. 3D Tatlı & Pasta Yapma Atölyesi (Dönen 3D Katmanlı Pasta Tasarımı)
     6. 3D Jelibon Yağmuru Toplama (Gökyüzünden Yağan 3D Renkli Jelibonlar)
   ============================================================================ */

let active3DStop = null;

export function stop3DMiniGame() {
  if (typeof active3DStop === 'function') {
    try { active3DStop(); } catch (e) {}
    active3DStop = null;
  }
}

export function launch3DMiniGame(gameId, container, helpers) {
  stop3DMiniGame();
  container.innerHTML = '';
  const { playSound, speakText, addStars, sendMultiplayerSync, onMultiplayerSync } = helpers;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative;';
  container.appendChild(wrapper);

  // UNIVERSAL 15-LEVEL PROGRESSIVE DIFFICULTY BAR FOR ALL 3D GAMES!
  let currentLevel = 1;
  const MAX_LEVEL = 15;
  const levelBar = document.createElement('div');
  levelBar.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;background:linear-gradient(90deg,#fef3c7,#fce7f3);padding:5px 14px;border-radius:16px;border:3px solid #f59e0b;width:100%;max-width:860px;font-weight:900;font-size:13px;color:#92400e;';
  levelBar.innerHTML = `
    <button class="hud-btn" id="g3-lv-prev" style="padding:3px 9px;font-size:12px;">⬅️ Önceki</button>
    <span id="g3-lv-label">🏆 Seviye 1 / 15 — Zorluk: ⭐ Kolay</span>
    <button class="hud-btn active" id="g3-lv-next" style="padding:3px 9px;font-size:12px;">Sonraki ➡️</button>
  `;
  wrapper.appendChild(levelBar);

  let onLevelChanged = () => {};
  const getDiffLabel = (lv) => lv <= 3 ? '⭐ Kolay' : (lv <= 6 ? '⭐⭐ Orta' : (lv <= 10 ? '🔥 Zor' : (lv <= 13 ? '⚡ Çok Zor' : '👑 EFSANE!')));
  const setLevel = (lv, announce = true) => {
    currentLevel = Math.max(1, Math.min(MAX_LEVEL, lv));
    levelBar.querySelector('#g3-lv-label').textContent = `🏆 Seviye ${currentLevel} / ${MAX_LEVEL} — Zorluk: ${getDiffLabel(currentLevel)}`;
    onLevelChanged(currentLevel);
    if (announce) {
      playSound('win');
      speakText(`Seviye ${currentLevel} başladı! Zorluk arttı!`);
    }
  };
  levelBar.querySelector('#g3-lv-prev').onclick = () => setLevel(currentLevel - 1, true);
  levelBar.querySelector('#g3-lv-next').onclick = () => setLevel(currentLevel + 1, true);

  const hudTop = document.createElement('div');
  hudTop.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;max-width:860px;flex-wrap:wrap;gap:8px;background:rgba(255,255,255,0.92);padding:8px 14px;border-radius:18px;border:3px solid #f472b6;';
  wrapper.appendChild(hudTop);

  const isLandscapePhone = window.innerHeight <= 520;
  const isMobile = window.innerWidth < 760 || isLandscapePhone;
  const h = isLandscapePhone ? Math.max(155, window.innerHeight - 185) : (isMobile ? 255 : 360);
  const canvasHost = document.createElement('div');
  canvasHost.style.cssText = `width:100%;max-width:860px;height:${h}px;border-radius:18px;overflow:hidden;border:3px solid #fff;box-shadow:0 14px 30px rgba(0,0,0,0.2);position:relative;background:#0f172a;touch-action:none;`;
  wrapper.appendChild(canvasHost);

  const controlsBar = document.createElement('div');
  controlsBar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;width:100%;';
  wrapper.appendChild(controlsBar);

  // Shared Three.js Mini-Scene Setup (Cleanly disposed on exit so browser NEVER crashes!)
  const w = Math.max(280, Math.min(860, canvasHost.clientWidth || (window.innerWidth - 28)));
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(48, w / h, 0.1, 160);
  const ren = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  ren.setSize(w, h);
  ren.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  ren.shadowMap.enabled = true;
  canvasHost.appendChild(ren.domElement);

  sc.add(new THREE.HemisphereLight(0xffffff, 0xfef08a, 1.25));
  const dl = new THREE.DirectionalLight(0xffffff, 1.15);
  dl.position.set(10, 18, 12);
  sc.add(dl);

  let rafId = null;
  let extraCleanup = () => {};

  const finishCleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    try { extraCleanup(); } catch (e) {}
    sc.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    ren.dispose();
  };
  active3DStop = finishCleanup;

  /* ==========================================================================
     1. 3D 2 KİŞİLİK CANLI ARABA YARIŞI (3d_race) — KAZANAN PANKARTLI!
     ========================================================================== */
  if (gameId === '3d_race') {
    sc.background = new THREE.Color('#7dd3fc');
    cam.position.set(0, 7.5, 11.5);
    cam.lookAt(0, 1, -4);

    // 3D Road & Finish Line
    const road = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 60), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    road.position.set(0, -0.15, -22);
    const grass = new THREE.Mesh(new THREE.BoxGeometry(40, 0.2, 60), new THREE.MeshStandardMaterial({ color: 0x4ade80 }));
    grass.position.set(0, -0.25, -22);
    const finishArch = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    finishArch.position.set(0, 3.5, -42);
    sc.add(road, grass, finishArch);
    [-4.6, 4.6].forEach(px => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3.8, 10), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      p.position.set(px, 1.9, -42); sc.add(p);
    });

    const makeCar = (col) => {
      const g = new THREE.Group();
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 3.0), new THREE.MeshStandardMaterial({ color: col, roughness: 0.2 }));
      b.position.y = 0.65;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 1.4), new THREE.MeshStandardMaterial({ color: 0xbae6fd }));
      cab.position.set(0, 1.2, -0.2);
      g.add(b, cab);
      [[-0.95, 0.9], [0.95, 0.9], [-0.95, -0.9], [0.95, -0.9]].forEach(([wx, wz]) => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 14), new THREE.MeshStandardMaterial({ color: 0x111827 }));
        wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.38, wz); g.add(wh);
      });
      return g;
    };

    const car1 = makeCar(0xff4d94); car1.position.set(-2.2, 0, 2);
    const car2 = makeCar(0x10b981); car2.position.set(2.2, 0, 2);
    sc.add(car1, car2);

    let z1 = 2, z2 = 2, winner = null, raceMode = 'online'; // 'online' | 'local' | 'bot'
    const myCar = (helpers.currentPlayer === 'yusuf') ? 2 : 1; // Umay=1 (Pembe), Yusuf=2 (Yeşil)

    hudTop.innerHTML = `
      <b style="color:#db2777;font-size:14px;">🏎️ 3D Yarış</b>
      <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">
        <button class="hud-btn active" id="r3-m2p" style="padding:4px 8px;font-size:11.5px;">🌐 Online 2P</button>
        <button class="hud-btn" id="r3-mloc" style="padding:4px 8px;font-size:11.5px;">📱 Aynı Cihaz 2P</button>
        <button class="hud-btn green" id="r3-mbot" style="padding:4px 8px;font-size:11.5px;">🤖 Bota Karşı</button>
        <span id="r3-st" style="font-weight:900;color:#059669;font-size:12px;">Bitişe ilk ulaşan kazanır!</span>
      </div>`;
    controlsBar.innerHTML = `
      <button class="hud-btn active" id="r3-g1" style="font-size:15px;padding:9px 18px;">👧 UMAY 3D GAZ! (A)</button>
      <button class="hud-btn green" id="r3-g2" style="font-size:15px;padding:9px 18px;">👦 YUSUF 3D GAZ! (L)</button>
      <button class="hud-btn" id="r3-rst">🔄 Yeniden</button>`;

    const updateRaceBtns = () => {
      const b1 = controlsBar.querySelector('#r3-g1');
      const b2 = controlsBar.querySelector('#r3-g2');
      const lockOther = (raceMode !== 'local');
      b1.style.opacity = (lockOther && myCar !== 1) ? '0.45' : '1';
      b2.style.opacity = (lockOther && myCar !== 2) ? '0.45' : '1';
      b1.textContent = (lockOther && myCar !== 1) ? '🔒 Umay Arabası' : '👧 UMAY 3D GAZ! (A)';
      b2.textContent = (lockOther && myCar !== 2) ? '🔒 Yusuf Arabası' : '👦 YUSUF 3D GAZ! (L)';
    };
    updateRaceBtns();

    const pushCar = (who, isRemote = false) => {
      if (winner) return;
      if (!isRemote && raceMode !== 'local' && who !== myCar) {
        playSound('moo');
        speakText('Bu diğer kuzenin arabası! Aynı cihazda oynamak için "Aynı Cihaz 2P" seçin!');
        return;
      }
      playSound('pop');
      if (who === 1) z1 -= 2.4; else z2 -= 2.4;
      if (!isRemote && raceMode === 'online' && sendMultiplayerSync) sendMultiplayerSync({ type: 'race3d_push', who });
      const finishZ = finishArch.position.z;
      if (z1 <= finishZ) {
        winner = (raceMode === 'bot' && myCar === 2) ? 'BOT (Pembe Araba)' : 'UMAY (Pembe Araba)';
        hudTop.querySelector('#r3-st').textContent = `🏆 KAZANAN: ${winner}! 🎉`;
        addStars(5); playSound('win'); speakText(`Tebrikler! 3 Boyutlu Araba Yarışını ${winner} kazandı!`);
        if (currentLevel < MAX_LEVEL) setTimeout(() => setLevel(currentLevel + 1, true), 1600);
      } else if (z2 <= finishZ) {
        winner = (raceMode === 'bot' && myCar === 1) ? 'BOT (Yeşil Araba)' : 'YUSUF (Yeşil Araba)';
        hudTop.querySelector('#r3-st').textContent = `🏆 KAZANAN: ${winner}! 🎉`;
        addStars(5); playSound('win'); speakText(`Tebrikler! 3 Boyutlu Araba Yarışını ${winner} kazandı!`);
        if (currentLevel < MAX_LEVEL) setTimeout(() => setLevel(currentLevel + 1, true), 1600);
      }
    };

    const biomes = [
      { sky: '#7dd3fc', grass: 0x4ade80, name: '☀️ Yaz Pisti' },
      { sky: '#fde68a', grass: 0xf59e0b, name: '🏜️ Çöl Pisti' },
      { sky: '#1e1b4b', grass: 0x312e81, name: '🌙 Gece Neon Pisti' },
      { sky: '#cbd5e1', grass: 0xf8fafc, name: '❄️ Buzul Kar Pisti' },
      { sky: '#4c1d95', grass: 0x7c3aed, name: '🌌 Uzay Pisti' }
    ];
    const resetRace = () => {
      z1 = 2; z2 = 2; winner = null;
      const bm = biomes[(currentLevel - 1) % biomes.length];
      sc.background.set(bm.sky);
      grass.material.color.setHex(bm.grass);
      const finishZ = -(36 + currentLevel * 3);
      finishArch.position.z = finishZ;
      hudTop.querySelector('#r3-st').textContent = `${bm.name} (Lv ${currentLevel})`;
    };
    const setRMode = (m) => {
      raceMode = m;
      hudTop.querySelector('#r3-m2p').classList.toggle('active', m === 'online');
      hudTop.querySelector('#r3-mloc').classList.toggle('active', m === 'local');
      hudTop.querySelector('#r3-mbot').classList.toggle('active', m === 'bot');
      updateRaceBtns();
      resetRace();
    };
    hudTop.querySelector('#r3-m2p').onclick = () => setRMode('online');
    hudTop.querySelector('#r3-mloc').onclick = () => setRMode('local');
    hudTop.querySelector('#r3-mbot').onclick = () => setRMode('bot');

    controlsBar.querySelector('#r3-g1').onclick = () => pushCar(1);
    controlsBar.querySelector('#r3-g2').onclick = () => pushCar(2);
    controlsBar.querySelector('#r3-rst').onclick = resetRace;

    const botTimer = setInterval(() => {
      if (raceMode === 'bot' && !winner) {
        const botChance = Math.min(0.98, 0.35 + currentLevel * 0.045);
        if (Math.random() < botChance) pushCar(myCar === 1 ? 2 : 1, true);
      }
    }, 260);
    onLevelChanged = () => resetRace();

    const onK = (e) => {
      if ((e.key === 'a' || e.key === 'A') && (raceMode === 'local' || myCar === 1)) pushCar(1);
      if ((e.key === 'l' || e.key === 'L') && (raceMode === 'local' || myCar === 2)) pushCar(2);
    };
    window.addEventListener('keydown', onK);
    const offSync = onMultiplayerSync ? onMultiplayerSync((m) => { if (raceMode === 'online' && m.type === 'race3d_push') pushCar(m.who, true); }) : null;
    extraCleanup = () => { clearInterval(botTimer); window.removeEventListener('keydown', onK); if (offSync) offSync(); };

    const loop = () => {
      car1.position.z += (z1 - car1.position.z) * 0.2;
      car2.position.z += (z2 - car2.position.z) * 0.2;
      const leadZ = Math.min(car1.position.z, car2.position.z);
      cam.position.z = leadZ + 11;
      cam.lookAt(0, 1, leadZ - 6);
      ren.render(sc, cam);
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return;
  }

  /* ==========================================================================
     2. 3D KARTOPU SAVAŞI (3d_snowball)
     ========================================================================== */
  if (gameId === '3d_snowball') {
    sc.background = new THREE.Color('#bae6fd');
    cam.position.set(0, 4.5, 11);
    cam.lookAt(0, 1.5, -6);

    const snowGround = new THREE.Mesh(new THREE.BoxGeometry(36, 0.4, 36), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    snowGround.position.y = -0.2; sc.add(snowGround);

    const makeSnowman = () => {
      const sm = new THREE.Group();
      const wm = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), wm); b1.position.y = 0.85;
      const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), wm); b2.position.y = 2.0;
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
      nose.rotation.x = Math.PI / 2; nose.position.set(0, 2.0, 0.65);
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      hat.position.y = 2.7;
      sm.add(b1, b2, nose, hat);
      return sm;
    };

    const targets = [];
    for (let i = 0; i < 3; i++) {
      const sm = makeSnowman();
      sm.position.set((i - 1) * 4.5, 0, -5 - i * 2.5);
      sm.userData = { speed: (i % 2 === 0 ? 1 : -1) * (0.04 + i * 0.015) };
      sc.add(sm); targets.push(sm);
    }

    const snowballs = [];
    let score = 0;
    hudTop.innerHTML = `<b style="color:#0284c7;font-size:16px;">⛄ 3D Kartopu Savaşı — Ekrandaki Kardan Adamlara Dokun ve Kartopu Fırlat!</b><span id="sb3-sc" style="font-weight:900;color:#db2777;">İsabet: 0 ❄️</span>`;

    const rc = new THREE.Raycaster(), pt = new THREE.Vector2();
    const onDown = (e) => {
      const r = ren.domElement.getBoundingClientRect();
      pt.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pt.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      rc.setFromCamera(pt, cam);
      const dir = rc.ray.direction.clone().normalize();
      const sb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      sb.position.set(0, 2.2, 8.5);
      sb.userData = { vx: dir.x * 0.85, vy: dir.y * 0.85 + 0.14, vz: dir.z * 0.85 };
      sc.add(sb); snowballs.push(sb);
      playSound('pop');
    };
    ren.domElement.addEventListener('pointerdown', onDown);
    extraCleanup = () => ren.domElement.removeEventListener('pointerdown', onDown);

    // Moving 3D Ice Shield Wall appears on Level 4+ to make levels genuinely harder!
    const iceWall = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.2, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 })
    );
    iceWall.position.set(0, 1.1, -3.2);
    iceWall.visible = false;
    sc.add(iceWall);

    const loop = () => {
      const lvMult = 1 + (currentLevel - 1) * 0.2;
      const nowT = performance.now() * 0.003;
      iceWall.visible = currentLevel >= 4;
      if (iceWall.visible) iceWall.position.x = Math.sin(nowT * (0.7 + currentLevel * 0.1)) * 5.2;
      targets.forEach((t, idx) => {
        t.position.x += t.userData.speed * lvMult;
        if (currentLevel >= 5) t.position.y = Math.abs(Math.sin(nowT * 2 + idx)) * (0.4 + currentLevel * 0.08);
        else t.position.y = 0;
        if (Math.abs(t.position.x) > 7.5) t.userData.speed *= -1;
      });
      for (let i = snowballs.length - 1; i >= 0; i--) {
        const s = snowballs[i];
        s.position.x += s.userData.vx; s.position.y += s.userData.vy; s.position.z += s.userData.vz;
        s.userData.vy -= 0.008;
        let hit = false;
        if (iceWall.visible && Math.abs(s.position.z - iceWall.position.z) < 0.6 && Math.abs(s.position.x - iceWall.position.x) < 1.8 && s.position.y < 2.3) {
          hit = true; playSound('pop');
        }
        if (!hit) targets.forEach(t => {
          if (s.position.distanceTo(new THREE.Vector3(t.position.x, t.position.y + 1.6, t.position.z)) < 1.35) {
            hit = true; score++;
            hudTop.querySelector('#sb3-sc').textContent = `İsabet: ${score} ❄️`;
            playSound('win'); if (score % 3 === 0) addStars(1);
            if (score % 5 === 0 && currentLevel < MAX_LEVEL) setLevel(currentLevel + 1, true);
            t.position.x = (Math.random() - 0.5) * 12;
          }
        });
        if (hit || s.position.z < -25 || s.position.y < -1) {
          sc.remove(s); s.geometry.dispose(); s.material.dispose(); snowballs.splice(i, 1);
        }
      }
      ren.render(sc, cam);
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return;
  }

  /* ==========================================================================
     3. 3D OKÇULUK — BASILI TUTUNCA HEM İSABET HEM ŞİDDET/GÜÇ AYARI! (3d_archery)
     ========================================================================== */
  if (gameId === '3d_archery') {
    sc.background = new THREE.Color('#bae6fd');
    cam.position.set(0, 3.6, 11);
    cam.lookAt(0, 2.2, -10);

    const grass = new THREE.Mesh(new THREE.BoxGeometry(36, 0.4, 40), new THREE.MeshStandardMaterial({ color: 0x4ade80 }));
    grass.position.y = -0.2; sc.add(grass);

    // 3D Bullseye Target Board
    const targetGrp = new THREE.Group();
    targetGrp.position.set(0, 3.2, -12);
    [2.1, 1.5, 0.9, 0.4].forEach((rad, i) => {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(rad, rad, 0.14 + i * 0.03, 28),
        new THREE.MeshStandardMaterial({ color: [0xffffff, 0x3b82f6, 0xef4444, 0xfacc15][i] })
      );
      ring.rotation.x = Math.PI / 2;
      targetGrp.add(ring);
    });
    sc.add(targetGrp);

    // 3D Aim Reticle Ring hovering in front of target
    const aimRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.45, 0.06, 10, 24),
      new THREE.MeshBasicMaterial({ color: 0xff4d94 })
    );
    aimRing.position.set(0, 3.2, -11.4);
    sc.add(aimRing);

    let charging = false, power = 0, aimPhase = 0, score = 0;
    const arrows = [];

    hudTop.innerHTML = `<b style="color:#dc2626;font-size:15px;">🏹 3D Okçuluk: Tuşa Basılı Tut (Hem Şiddeti Hem İsabeti Ayarla!) ve Bırak!</b><span id="ar3-sc" style="font-weight:900;color:#7c3aed;">Puan: 0 🎯</span>`;
    controlsBar.innerHTML = `
      <div style="width:220px;height:22px;background:#e2e8f0;border-radius:99px;border:3px solid #fff;overflow:hidden;">
        <div id="ar3-pwr" style="width:0%;height:100%;background:linear-gradient(90deg,#22c55e,#facc15,#ef4444);"></div>
      </div>
      <button class="hud-btn active" id="ar3-fire" style="font-size:17px;padding:10px 24px;">🏹 BASILI TUT & OKU FIRLAT!</button>`;

    const fireBtn = controlsBar.querySelector('#ar3-fire');
    fireBtn.onpointerdown = () => { charging = true; power = 0; playSound('pop'); };
    const releaseArrow = () => {
      if (!charging) return;
      charging = false;
      const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      arrow.rotation.x = Math.PI / 2;
      arrow.position.set(aimRing.position.x * 0.25, 2.2, 8);
      const speed = 0.45 + (power / 100) * 0.75;
      arrow.userData = { vx: (aimRing.position.x - arrow.position.x) * 0.045, vy: 0.16 + (power / 100) * 0.22, vz: -speed, stuck: false };
      sc.add(arrow); arrows.push(arrow);
      playSound('win');
    };
    fireBtn.onpointerup = releaseArrow;
    fireBtn.onpointerleave = releaseArrow;

    const loop = () => {
      aimPhase += 0.03 + (currentLevel - 1) * 0.007;
      const tScale = Math.max(0.52, 1.0 - (currentLevel - 1) * 0.032);
      targetGrp.scale.set(tScale, tScale, 1);
      // Higher levels move the target board itself in different patterns (Horizontal Lv3+, Figure-8 Lv7+)!
      if (currentLevel >= 3) {
        targetGrp.position.x = Math.sin(aimPhase * (0.4 + currentLevel * 0.05)) * Math.min(4.2, currentLevel * 0.35);
      } else {
        targetGrp.position.x = 0;
      }
      if (currentLevel >= 7) {
        targetGrp.position.y = 3.2 + Math.sin(aimPhase * 0.9) * 1.1;
      } else {
        targetGrp.position.y = 3.2;
      }
      aimRing.position.x = Math.sin(aimPhase) * (2.4 + currentLevel * 0.12);
      aimRing.position.y = 3.2 + Math.cos(aimPhase * 1.4) * 1.1;
      if (charging) {
        power = (power + 2.2 + currentLevel * 0.16) % 101;
        controlsBar.querySelector('#ar3-pwr').style.width = `${power}%`;
      }
      arrows.forEach(a => {
        if (a.userData.stuck) return;
        a.position.x += a.userData.vx; a.position.y += a.userData.vy; a.position.z += a.userData.vz;
        a.userData.vy -= 0.009;
        if (a.position.z <= -11.8) {
          a.userData.stuck = true;
          const dist = Math.hypot(a.position.x - targetGrp.position.x, a.position.y - targetGrp.position.y);
          if (dist < 2.2 * tScale) {
            const pts = dist < 0.5 ? 10 : (dist < 1.1 ? 5 : 2);
            score += pts;
            hudTop.querySelector('#ar3-sc').textContent = `Puan: ${score} 🎯 (+${pts}!)`;
            addStars(pts >= 5 ? 2 : 1);
            if (score >= currentLevel * 12 && currentLevel < MAX_LEVEL) setLevel(currentLevel + 1, true);
            speakText(pts === 10 ? 'TAM ON İKİDEN! SÜPER ATIŞ!' : `Harika isabet! ${pts} puan!`);
          }
        }
      });
      ren.render(sc, cam);
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return;
  }

  /* ==========================================================================
     4. 3D ASKER OLMA & KALE SAVUNMA (3d_soldier)
     ========================================================================== */
  if (gameId === '3d_soldier') {
    sc.background = new THREE.Color('#38bdf8');
    cam.position.set(0, 7, 13);
    cam.lookAt(0, 1.5, -5);

    const floor = new THREE.Mesh(new THREE.BoxGeometry(34, 0.4, 34), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
    floor.position.y = -0.2; sc.add(floor);

    // 3D Soldier Fortress Wall + Cannon Turret
    const fort = new THREE.Mesh(new THREE.BoxGeometry(10, 2.4, 2.2), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    fort.position.set(0, 1.2, 6.5); sc.add(fort);
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 2.4, 12), new THREE.MeshStandardMaterial({ color: 0x166534 }));
    cannon.rotation.x = Math.PI / 2; cannon.position.set(0, 2.7, 5.5); sc.add(cannon);

    let score = 0, rank = 'Er';
    const enemies = [], shots = [];
    hudTop.innerHTML = `<b style="color:#166534;font-size:15px;">🪖 3D Asker & Kale Savunması — Gelen 3D Robotlara Dokun & Ateş Et!</b><span id="sol-sc" style="font-weight:900;color:#b91c1c;">Rütbe: Er • Skor: 0</span>`;

    const spawnBot = () => {
      const bot = new THREE.Group();
      const isBoss = (currentLevel >= 7 && Math.random() < 0.28);
      const isScout = (!isBoss && currentLevel >= 4 && Math.random() < 0.45);
      const bodyGeo = isScout ? new THREE.ConeGeometry(0.75, 1.8, 4) : new THREE.BoxGeometry(isBoss ? 1.8 : 1.1, isBoss ? 2.2 : 1.5, isBoss ? 1.8 : 1.1);
      const bodyCol = isBoss ? 0x7c3aed : (isScout ? 0xf59e0b : 0xef4444);
      const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: bodyCol, metalness: isBoss ? 0.5 : 0.1 }));
      body.position.y = isBoss ? 1.1 : 0.85;
      const head = new THREE.Mesh(new THREE.BoxGeometry(isBoss ? 1.2 : 0.8, 0.7, isBoss ? 1.2 : 0.8), new THREE.MeshStandardMaterial({ color: isBoss ? 0xef4444 : 0xfacc15 }));
      head.position.y = isBoss ? 2.5 : 1.85;
      bot.add(body, head);
      bot.position.set((Math.random() - 0.5) * 11, 0, -14);
      bot.userData = { hp: isBoss ? 3 : 1, isScout, phase: Math.random() * 6 };
      sc.add(bot); enemies.push(bot);
    };
    const spInt = setInterval(spawnBot, 1450);
    spawnBot();

    const rc = new THREE.Raycaster(), pt = new THREE.Vector2();
    const onDown = (e) => {
      const r = ren.domElement.getBoundingClientRect();
      pt.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pt.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      rc.setFromCamera(pt, cam);
      const hits = rc.intersectObjects(enemies, true);
      playSound('horn');
      if (hits.length > 0) {
        let root = hits[0].object;
        while (root.parent && !enemies.includes(root)) root = root.parent;
        root.userData.hp = (root.userData.hp || 1) - 1;
        if (root.userData.hp > 0) {
          root.scale.multiplyScalar(0.86);
          playSound('pop');
          return;
        }
        sc.remove(root);
        const idx = enemies.indexOf(root); if (idx >= 0) enemies.splice(idx, 1);
        score++;
        const ranks = ['Er','Onbaşı','Çavuş','Başçavuş','Teğmen','Üsteğmen','Yüzbaşı','Binbaşı','Yarbay','Albay','Tuğgeneral','Tümgeneral','Korgeneral','Orgeneral','Mareşal 👑'];
        rank = ranks[Math.min(ranks.length - 1, currentLevel - 1)];
        hudTop.querySelector('#sol-sc').textContent = `Rütbe: ${rank} • Skor: ${score}`;
        playSound('win'); addStars(1);
        if (score % 5 === 0 && currentLevel < MAX_LEVEL) setLevel(currentLevel + 1, true);
      }
    };
    ren.domElement.addEventListener('pointerdown', onDown);
    extraCleanup = () => { clearInterval(spInt); ren.domElement.removeEventListener('pointerdown', onDown); };

    const loop = () => {
      const botSpd = 0.045 + (currentLevel - 1) * 0.014;
      const nowT = performance.now() * 0.005;
      for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];
        en.position.z += en.userData.isScout ? botSpd * 1.45 : botSpd;
        if (en.userData.isScout) en.position.x += Math.sin(nowT + en.userData.phase) * 0.14;
        if (en.position.z > 5.0) {
          sc.remove(en); enemies.splice(i, 1); playSound('bear');
        }
      }
      ren.render(sc, cam);
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return;
  }

  /* ==========================================================================
     5. 3D TATLI & PASTA YAPMA ATÖLYESİ (3d_dessert)
     ========================================================================== */
  if (gameId === '3d_dessert') {
    sc.background = new THREE.Color('#fce7f3');
    cam.position.set(0, 4.2, 8.2);
    cam.lookAt(0, 1.8, 0);

    const stand = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.4, 28), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    stand.position.y = 0.2; sc.add(stand);

    const cakeRoot = new THREE.Group();
    cakeRoot.position.y = 0.4; sc.add(cakeRoot);
    let tierH = 0;

    hudTop.innerHTML = `<b style="color:#db2777;font-size:16px;">🍰 3D Tatlı & Pasta Yapma Atölyesi — Kendi 3 Boyutlu Pastanı Tasarla!</b>`;
    controlsBar.innerHTML = `
      <button class="hud-btn active" id="dk-choco">🍫 Çikolata Katı</button>
      <button class="hud-btn" id="dk-straw">🍓 Çilek Katı</button>
      <button class="hud-btn" id="dk-van">🍦 Vanilya Katı</button>
      <button class="hud-btn green" id="dk-jelly">🍬 Jelibon Süsü</button>
      <button class="hud-btn" id="dk-candle">🕯️ Mum Dik & Kutla!</button>
      <button class="hud-btn" id="dk-clr">🧹 Yeni Pasta</button>`;

    const addLayer = (hex) => {
      if (tierH >= 3.2) return;
      const rad = Math.max(0.9, 2.1 - tierH * 0.35);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 0.8, 28), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.35 }));
      mesh.position.y = tierH + 0.4;
      cakeRoot.add(mesh); tierH += 0.8;
      playSound('pop');
    };
    controlsBar.querySelector('#dk-choco').onclick = () => addLayer(0x78350f);
    controlsBar.querySelector('#dk-straw').onclick = () => addLayer(0xf472b6);
    controlsBar.querySelector('#dk-van').onclick = () => addLayer(0xfef3c7);
    controlsBar.querySelector('#dk-jelly').onclick = () => {
      const cols = [0xef4444, 0x3b82f6, 0x22c55e, 0xfacc15, 0xa855f7];
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const j = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshStandardMaterial({ color: cols[i % cols.length] }));
        j.position.set(Math.cos(ang) * 1.1, Math.max(0.85, tierH + 0.1), Math.sin(ang) * 1.1);
        cakeRoot.add(j);
      }
      playSound('win'); addStars(1);
    };
    controlsBar.querySelector('#dk-candle').onclick = () => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 10), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      c.position.y = tierH + 0.35;
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      fl.position.y = tierH + 0.78;
      cakeRoot.add(c, fl);
      playSound('win'); addStars(3); speakText('Harika 3 boyutlu tatlı yaptın! Ellerine sağlık!');
    };
    controlsBar.querySelector('#dk-clr').onclick = () => { while (cakeRoot.children.length) cakeRoot.remove(cakeRoot.children[0]); tierH = 0; };
    addLayer(0xf472b6);

    const loop = () => {
      cakeRoot.rotation.y += 0.015;
      ren.render(sc, cam);
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return;
  }

  /* ==========================================================================
     6. 3D JELİBON YAĞMURU TOPLAMA (3d_jelibon)
     ========================================================================== */
  if (gameId === '3d_jelibon') {
    sc.background = new THREE.Color('#f5d0fe');
    cam.position.set(0, 5, 11);
    cam.lookAt(0, 2, 0);

    const basket = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.0, 1.0, 20), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    basket.position.set(0, 0.5, 0); sc.add(basket);

    let bx = 0, score = 0;
    const jellies = [];
    const jCols = [0xef4444, 0xfacc15, 0x22c55e, 0x38bdf8, 0xff4d94, 0xa855f7];

    hudTop.innerHTML = `<b style="color:#db2777;font-size:16px;">🍬 3D Jelibon Yağmuru — Sepeti Parmağınla Sağa Sola Kaydır & Jelibonları Yakala!</b><span id="jl-sc" style="font-weight:900;color:#7c3aed;">Jelibon: 0 🍬</span>`;

    const onMove = (e) => {
      const r = ren.domElement.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      bx = Math.max(-6.5, Math.min(6.5, nx * 7.5));
    };
    ren.domElement.addEventListener('pointermove', onMove);
    extraCleanup = () => ren.domElement.removeEventListener('pointermove', onMove);

    const loop = () => {
      basket.position.x += (bx - basket.position.x) * 0.25;
      const spawnRate = 0.045 + currentLevel * 0.008;
      const fallSpd = 0.095 + currentLevel * 0.016;
      const goalScore = currentLevel * 8;
      if (Math.random() < spawnRate) {
        const isBomb = (currentLevel >= 3 && Math.random() < Math.min(0.32, 0.1 + currentLevel * 0.018));
        const shapeIdx = Math.floor(Math.random() * 3);
        const geo = isBomb
          ? new THREE.SphereGeometry(0.42, 12, 12)
          : (shapeIdx === 0 ? new THREE.CapsuleGeometry(0.32, 0.35, 8, 12) : (shapeIdx === 1 ? new THREE.BoxGeometry(0.55, 0.55, 0.55) : new THREE.OctahedronGeometry(0.42, 0)));
        const mat = new THREE.MeshStandardMaterial({ color: isBomb ? 0x111827 : jCols[Math.floor(Math.random() * jCols.length)], roughness: 0.15 });
        const j = new THREE.Mesh(geo, mat);
        j.position.set((Math.random() - 0.5) * 12, 9, 0);
        j.userData = { isBomb };
        sc.add(j); jellies.push(j);
      }
      for (let i = jellies.length - 1; i >= 0; i--) {
        const j = jellies[i];
        j.position.y -= fallSpd; j.rotation.x += 0.06; j.rotation.z += 0.04;
        if (j.position.y < 1.2 && Math.abs(j.position.x - basket.position.x) < 1.55) {
          if (j.userData.isBomb) {
            score = Math.max(0, score - 2);
            playSound('bear');
            hudTop.querySelector('#jl-sc').textContent = `💣 BOMBA! Jelibon: ${score} / ${goalScore}`;
          } else {
            score++; hudTop.querySelector('#jl-sc').textContent = `Jelibon: ${score} / ${goalScore} 🍬`;
            playSound('pop'); if (score % 4 === 0) addStars(1);
            if (score >= goalScore && currentLevel < MAX_LEVEL) {
              addStars(3);
              setLevel(currentLevel + 1, true);
            }
          }
          sc.remove(j); j.geometry.dispose(); j.material.dispose(); jellies.splice(i, 1);
        } else if (j.position.y < -1) {
          sc.remove(j); j.geometry.dispose(); j.material.dispose(); jellies.splice(i, 1);
        }
      }
      ren.render(sc, cam);
      rafId = requestAnimationFrame(loop);
    };
    loop();
  }
}
