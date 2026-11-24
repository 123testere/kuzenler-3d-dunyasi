import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Chess3DGame } from './chess3d.js';
import { BIG_EXTRA_GAMES, TODDLER_20_GAMES, launchMiniGame, cleanupMiniGame } from './minigames.js';
import { launch3DMiniGame, stop3DMiniGame } from './games3d.js';

/* ============================================================================
   3D KUZENLER DÜNYASI — DEV SÜRÜM (41 OYUN + 3D LUNAPARK + ARABA/AT SÜRME + SESLİ SOHBET)
   ============================================================================ */

const COUSINS = {
  umay:  { id: 'umay',  name: 'Umay',  age: 8, gender: 'girl', avatar: 'assets/umay/chelsea_doll.png', emoji: '✈️', color: '#ff4d94', carColor: 0xff4d94, greeting: 'Hoş geldin Umay! 3 boyutlu odan, araban, midillin, lunaparkın ve 41 oyunun seni bekliyor!' },
  yusuf: { id: 'yusuf', name: 'Yusuf', age: 8, gender: 'boy',  avatar: 'assets/sprites/cow_face.png',  emoji: '🐄', color: '#10b981', carColor: 0x16a34a, greeting: 'Hoş geldin Yusuf! Çiftliğinde karakterini ve hayvanını gezdirebilir, araba ve at sürebilir, 3 boyutlu satranç oynayabilirsin!' },
  deren: { id: 'deren', name: 'Deren', age: 3, gender: 'girl', avatar: 'assets/sprites/baby.png',      emoji: '🍼', color: '#a855f7', carColor: 0xa855f7, greeting: 'Hoş geldin Deren! Senin kendi 3 boyutlu odan, lunaparkın ve 20 özel 3 yaş oyunun hazır!' },
  elif:  { id: 'elif',  name: 'Elif',  age: 3, gender: 'girl', avatar: 'assets/sprites/unicorn.png',   emoji: '🦄', color: '#f59e0b', carColor: 0xf59e0b, greeting: 'Hoş geldin Elif! Hadi kendi odanı süsle, lunaparkta dönme dolaba bin ve 20 özel oyununu oyna!' }
};

const state = {
  currentPlayer: 'umay',
  currentMode: 'map',
  currentRoomOwner: 'umay',
  currentFarmOwner: 'yusuf',
  starterPet: 'pony',
  unlockedForAll: { 'yusuf-farm': false },
  farmUmayInvited: false,
  farmDragMode: true,
  pendingHelpTargetMode: null,
  houseBrushActive: false,
  houseBrushColor: '#ff4d94',
  activeSalonBrushColor: '#ff4d94',
  inventory: { wheat: 6, milk: 4, apple: 5, stars: 25 },
  farmTool: 'love',
  selectedAnimalMesh: null,
  fieldStage: 0,
  baby: { level: 1, growth: 25, diaperDirty: true },
  babyWardrobeFilter: 'all',
  babyConfigs: {
    umay:  { outfit: 'pink_bunny',        shoes: 'pink_bow_booties',  mouth: 'pacifier_pink', hat: 'daisy_headband', bib: 'none',           toy: 'plush_teddy' },
    yusuf: { outfit: 'super_baby',        shoes: 'blue_sneakers',     mouth: 'pacifier_blue', hat: 'bear_beanie',    bib: 'none',           toy: 'baby_rattle' },
    deren: { outfit: 'princess_dress',    shoes: 'pink_bow_booties',  mouth: 'pacifier_pink', hat: 'baby_crown',     bib: 'strawberry_bib', toy: 'plush_teddy' },
    elif:  { outfit: 'unicorn_tutu',      shoes: 'rainbow_sandals',   mouth: 'pacifier_pink', hat: 'daisy_headband', bib: 'none',           toy: 'baby_rattle' }
  },
  // 3D Avatar Driving / Riding / Hand-Carrying State
  mountMode: 'walk', // 'walk' | 'car' | 'horse' | 'ferris' | 'carousel'
  carriedItem: 'none', // 'none' | 'water' | 'hay' | 'apple'
  moveKeys: { up: false, down: false, left: false, right: false },
  salonChar: 'umay',
  salonTab: 'hair',
  salonConfigs: {
    umay:  { hairStyle: 'long', hairColor: '#f59e0b', lipColor: '#ff4d94', blushColor: '#fda4af', eyeShadow: '#f472b6', eyeColor: '#2563eb', faceArt: 'hearts', outfit: 'umay_sweater', shoes: 'umay_boots', acc: 'umay_helmet', petType: 'pony', petColor: '#9ca3af', petHat: 'crown', petOutfit: 'pink_saddle', petCollar: 'bell' },
    yusuf: { hairStyle: 'spiky', hairColor: '#451a03', lipColor: '#fca5a5', blushColor: 'none', eyeShadow: 'none', eyeColor: '#10b981', faceArt: 'lightning', outfit: 'farmer', shoes: 'cowboy_boots', acc: 'cowboy_hat', petType: 'cow', petColor: '#ffffff', petHat: 'cowboy_hat', petOutfit: 'hero_cape', petCollar: 'bell' },
    deren: { hairStyle: 'pigtails', hairColor: '#78350f', lipColor: '#fb7185', blushColor: '#fda4af', eyeShadow: '#c084fc', eyeColor: '#6366f1', faceArt: 'hearts', outfit: 'princess', shoes: 'umay_boots', acc: 'crown', petType: 'dog', petColor: '#d97706', petHat: 'ribbon', petOutfit: 'yellow_sweater', petCollar: 'bowtie' },
    elif:  { hairStyle: 'bun', hairColor: '#ec4899', lipColor: '#f43f5e', blushColor: '#fbcfe8', eyeShadow: '#38bdf8', eyeColor: '#8b5cf6', faceArt: 'stars', outfit: 'unicorn_dress', shoes: 'umay_boots', acc: 'glasses', petType: 'cat', petColor: '#f472b6', petHat: 'crown', petOutfit: 'pink_saddle', petCollar: 'bell' }
  },
  arcadeCategory: 'big',
  xox: { board: Array(9).fill(null), turn: 'p1', p1: 'umay', p2: 'yusuf', winner: null },
  puzzle: { image: 'assets/umay/raw_plane.jpg', title: 'Pembe Barbie Uçağı', tiles: [0,1,2,3,4,5,6,7,8], selectedIdx: null },
  chatMessages: [
    { id: 1, sender: 'Umay', emoji: '🎡', text: '3D Lunaparkta dönme dolaba bindim! Yusuf çiftliğine arabamla geliyorum!' },
    { id: 2, sender: 'Yusuf', emoji: '🐴', text: 'Midillime bindim, tarlamı sürdüm! Deren ve Elif yeni 20 oyununuzu deneyin!' }
  ]
};

const CLIENT_ID = 'c_' + Math.random().toString(36).slice(2, 9);
const multiplayerListeners = new Set();

function sendMultiplayerSync(payload) {
  const packet = { ...payload, senderClientId: CLIENT_ID };
  if (syncChannel) syncChannel.postMessage(packet);
  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packet)
  }).catch(() => {});
}

function onMultiplayerSync(fn) {
  multiplayerListeners.add(fn);
  return () => multiplayerListeners.delete(fn);
}

const syncChannel = ('BroadcastChannel' in window) ? new BroadcastChannel('kuzenler_3d_sync') : null;
if (syncChannel) syncChannel.onmessage = (ev) => handleIncomingSync(ev.data);

/* ============================================================================
   1. AUDIO & TURKISH VOICE (TTS)
   ============================================================================ */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (type === 'pop' || type === 'brush') {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.frequency.setValueAtTime(type === 'brush' ? 540 : 380, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.09);
    } else if (type === 'horn') {
      [440, 554].forEach((f, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + i * 0.16);
        gain.gain.setValueAtTime(0.18, now + i * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.16 + 0.13);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.16); osc.stop(now + i * 0.16 + 0.14);
      });
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.008, now + i * 0.08 + 0.24);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.25);
      });
    } else if (type === 'moo' || type === 'bear') {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(type === 'bear' ? 95 : 145, now);
      osc.frequency.linearRampToValueAtTime(type === 'bear' ? 75 : 185, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.72);
    } else if (type === 'bark') {
      [320, 420].forEach((f, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + i * 0.14);
        osc.frequency.exponentialRampToValueAtTime(180, now + i * 0.14 + 0.1);
        gain.gain.setValueAtTime(0.18, now + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.14 + 0.11);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.14); osc.stop(now + i * 0.14 + 0.12);
      });
    } else if (type === 'water') {
      [440, 587, 659, 880].forEach((f, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.05); osc.stop(now + i * 0.05 + 0.13);
      });
    } else if (type === 'meow') {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.45);
      gain.gain.setValueAtTime(0.22, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);
      osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'baa') {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, now);
      for (let i = 0; i < 5; i++) osc.frequency.setValueAtTime(i % 2 === 0 ? 370 : 310, now + i * 0.08);
      gain.gain.setValueAtTime(0.16, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.47);
    } else if (type === 'chirp') {
      [0, 0.14, 0.28].forEach(d => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now + d);
        osc.frequency.exponentialRampToValueAtTime(2200, now + d + 0.08);
        gain.gain.setValueAtTime(0.18, now + d); gain.gain.exponentialRampToValueAtTime(0.01, now + d + 0.1);
        osc.connect(gain).connect(ctx.destination); osc.start(now + d); osc.stop(now + d + 0.11);
      });
    } else if (type === 'neigh') {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.55);
      gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.58);
      osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.6);
    } else if (type === 'frog') {
      [0, 0.22].forEach(d => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now + d);
        osc.frequency.exponentialRampToValueAtTime(260, now + d + 0.14);
        gain.gain.setValueAtTime(0.15, now + d); gain.gain.exponentialRampToValueAtTime(0.01, now + d + 0.16);
        osc.connect(gain).connect(ctx.destination); osc.start(now + d); osc.stop(now + d + 0.17);
      });
    } else if (type === 'cry' || type === 'vomit') {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = type === 'cry' ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(type === 'cry' ? 580 : 180, now);
      osc.frequency.linearRampToValueAtTime(type === 'cry' ? 420 : 95, now + 0.45);
      gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.52);
    }
  } catch (e) {}
}

function speakText(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR'; u.rate = 1.04; u.pitch = 1.14;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

function spawnFloatingFX(emoji, x, y) {
  const el = document.createElement('div');
  el.className = 'floating-fx';
  el.textContent = emoji;
  el.style.left = `${(x || window.innerWidth / 2) - 16}px`;
  el.style.top = `${(y || window.innerHeight / 2) - 16}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

function addStars(n = 1) {
  state.inventory.stars += n;
  updateInventoryUI();
}

/* ============================================================================
   2. THREE.JS 3D ENGINE & SHARED TEXTURE/LABEL HELPERS
   ============================================================================ */
let scene, camera, renderer, controls, raycaster, pointer;
let dragPlane, isDragging3D = false, dragged3DObject = null, isPaintingWithFinger = false;
let selected3DRoomItem = null;
let planeTourActive = false, planeTourAngle = 0;
let roomPlaneFlying = false, roomPlaneAngle = 0;
let tractorDriving = false, tractorAngle = 0;
let salonDanceTimer = 0;

const texLoader = new THREE.TextureLoader();
const textureCache = {};
function getTex(url) {
  const safeUrl = url.endsWith('.svg') ? url.replace('.svg', '.png') : url;
  if (!textureCache[safeUrl]) {
    const t = texLoader.load(safeUrl);
    t.colorSpace = THREE.SRGBColorSpace;
    textureCache[safeUrl] = t;
  }
  return textureCache[safeUrl];
}

function create3DTextLabel(text, bgColor = '#10b981') {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgColor;
  ctx.beginPath(); ctx.roundRect(10, 8, 236, 48, 24); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px Fredoka, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text.slice(0, 18), 128, 33);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(2.2, 0.55, 1);
  sprite.name = 'name_label_sprite';
  return sprite;
}

const worldGroups = {
  map: new THREE.Group(),
  rooms: new THREE.Group(),
  salon: new THREE.Group(),
  'yusuf-farm': new THREE.Group(),
  lunapark: new THREE.Group(),
  nursery: new THREE.Group()
};

// Individual 3D Room Sub-Groups for All 4 Cousins!
const cousinRoomGroups = {
  umay: new THREE.Group(),
  yusuf: new THREE.Group(),
  deren: new THREE.Group(),
  elif: new THREE.Group()
};

const draggableRoomObjects = [];
const farmAnimalMeshes = [];
const farmDogMeshes = [];
const farmCropMeshes = [];
const nurseryBalloonMeshes = [];

let mapTourPlane = null;
let roomHeroPlane = null;
let salonCharacterRoot = null;
let farmTractorMesh = null;
let farmBearMesh = null;
let bearAttackState = null;
let nurseryBabyGroup = null, nurseryDirtyMesh = null, nurseryCleanDiaperMesh = null;

// Walkable / Drivable 3D Player Avatar + Following Pet + Car + Horse (Works in Map, Farm & Lunapark!)
let explorerRig = null;       // Root group moved by D-Pad / WASD
let explorerAvatarMesh = null;
let explorerCarMesh = null;
let explorerHorseMesh = null;
let explorerHandProp = null;
let explorerFollowerPet = null;

// Lunapark Animated Attractions
let ferrisWheelRotor = null;
let carouselRotor = null;

function init3DEngine() {
  const container = document.getElementById('webgl-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#bae6fd');
  scene.fog = new THREE.FogExp2('#bae6fd', 0.0085);

  camera = new THREE.PerspectiveCamera(44, container.clientWidth / container.clientHeight, 0.1, 240);
  camera.position.set(0, 14, 24);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.minDistance = 3.2;
  controls.maxDistance = 48;

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xfef08a, 1.25);
  hemiLight.position.set(0, 28, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
  dirLight.position.set(16, 26, 18);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  const d = 22;
  dirLight.shadow.camera.left = -d; dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d; dirLight.shadow.camera.bottom = -d;
  scene.add(dirLight);

  Object.values(worldGroups).forEach(g => { g.visible = false; scene.add(g); });
  worldGroups.map.visible = true;

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  // Build All 6 3D Worlds!
  build3DVillageMap();
  init3DWeatherSystem();
  buildAll4CousinRooms();
  build3DSalonStudio();
  build3DYusufFarm();
  build3DLunaparkWorld();
  build3DNurseryWorld();

  // Build Playable Explorer Rig (Avatar + Car + Riding Horse + Hand-Carried Items + Following Pet)
  buildExplorerRig();

  renderer.domElement.addEventListener('pointerdown', on3DPointerDown);
  renderer.domElement.addEventListener('pointermove', on3DPointerMove);
  window.addEventListener('pointerup', on3DPointerUp);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', (e) => handleKeyboardMove(e, true));
  window.addEventListener('keyup', (e) => handleKeyboardMove(e, false));

  animate3DLoop();
}

function onWindowResize() {
  const container = document.getElementById('webgl-container');
  if (!container || !renderer) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function create3DSpriteStandee(texUrl, width, height, withBase = true, baseColor = 0xffffff) {
  const group = new THREE.Group();
  if (withBase) {
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(width * 0.36, width * 0.4, 0.14, 24),
      new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.4 })
    );
    baseMesh.position.y = 0.07; baseMesh.castShadow = true; baseMesh.receiveShadow = true;
    group.add(baseMesh);
  }
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: getTex(texUrl), transparent: true, alphaTest: 0.06, side: THREE.DoubleSide, roughness: 0.35 })
  );
  mesh.position.y = height / 2 + (withBase ? 0.12 : 0);
  mesh.castShadow = true;
  group.add(mesh);
  return group;
}

/* ============================================================================
   3. 3D DRIVABLE CAR, RIDABLE HORSE, WALKING AVATAR & HAND-CARRIED ITEMS
   ============================================================================ */
function create3DSportCarMesh(carColor = 0xff4d94) {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.2, metalness: 0.25 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 });

  // Lower Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.72, 3.6), bodyMat);
  chassis.position.y = 0.68; chassis.castShadow = true;
  car.add(chassis);

  // Open Convertible Windshield + Seat
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.65, 0.12), glassMat);
  windshield.position.set(0, 1.32, 0.65); windshield.rotation.x = -0.35;
  const steering = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 8, 16), tireMat);
  steering.position.set(0, 1.25, 0.42); steering.rotation.x = 0.5;
  car.add(windshield, steering);

  // Headlights & Taillights
  [-0.68, 0.68].forEach(lx => {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    hl.position.set(lx, 0.75, 1.82);
    const tl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    tl.position.set(lx, 0.75, -1.82);
    car.add(hl, tl);
  });

  // 4 Wheels
  [[-1.08, 1.1], [1.08, 1.1], [-1.08, -1.1], [1.08, -1.1]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 20), tireMat);
    wheel.rotation.z = Math.PI / 2; wheel.position.set(wx, 0.42, wz); wheel.castShadow = true;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.33, 14), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    hub.rotation.z = Math.PI / 2; hub.position.set(wx, 0.42, wz);
    car.add(wheel, hub);
  });
  return car;
}

function buildExplorerRig() {
  if (explorerRig && explorerRig.parent) explorerRig.parent.remove(explorerRig);
  if (explorerFollowerPet && explorerFollowerPet.parent) explorerFollowerPet.parent.remove(explorerFollowerPet);

  explorerRig = new THREE.Group();
  explorerRig.position.set(-1.5, 0, 4.5);

  const cid = state.currentPlayer;
  const cfg = state.salonConfigs[cid];

  // 1. 3D Character Avatar
  explorerAvatarMesh = createFitted3DCharacter(cid, cfg, false);
  explorerAvatarMesh.scale.set(0.55, 0.55, 0.55);
  const tag = create3DTextLabel(`${COUSINS[cid].emoji} ${COUSINS[cid].name}`, COUSINS[cid].color);
  tag.position.set(0, 6.2, 0);
  explorerAvatarMesh.add(tag);
  explorerRig.add(explorerAvatarMesh);

  // 2. 3D Hand-Carried Prop (Water Bucket / Hay / Apple attached right in front of character's hand!)
  explorerHandProp = new THREE.Group();
  explorerHandProp.position.set(0.65, 1.15, 0.65);
  explorerRig.add(explorerHandProp);

  // 3. 3D Convertible Sport Car (visible when mounted in car!)
  explorerCarMesh = create3DSportCarMesh(COUSINS[cid].carColor);
  explorerCarMesh.visible = (state.mountMode === 'car');
  explorerRig.add(explorerCarMesh);

  // 4. 3D Ridable Pony Horse (visible when riding horse!)
  explorerHorseMesh = create3DCompanionPetMesh('pony', { petColor: '#9ca3af', petOutfit: 'pink_saddle', petHat: 'none', petCollar: 'bell' });
  explorerHorseMesh.scale.set(1.15, 1.15, 1.15);
  explorerHorseMesh.visible = (state.mountMode === 'horse');
  explorerRig.add(explorerHorseMesh);

  // 5. Companion Pet that follows the player around!
  explorerFollowerPet = create3DCompanionPetMesh(cfg.petType || 'pony', cfg);
  explorerFollowerPet.scale.set(0.85, 0.85, 0.85);
  explorerFollowerPet.position.set(-3.2, 0, 5.2);

  attachExplorerToActiveWorld();
  applyExplorerMountPose();
  updateCarriedItemMesh();
}

function attachExplorerToActiveWorld() {
  if (!explorerRig) return;
  const walkWorlds = ['map', 'yusuf-farm', 'lunapark'];
  const showPad = walkWorlds.includes(state.currentMode);
  const pad = document.getElementById('drive-pad');
  if (pad) pad.classList.toggle('visible', showPad);

  if (showPad) {
    worldGroups[state.currentMode].add(explorerRig);
    worldGroups[state.currentMode].add(explorerFollowerPet);
  }
}

function applyExplorerMountPose() {
  if (!explorerAvatarMesh) return;
  explorerCarMesh.visible = (state.mountMode === 'car');
  explorerHorseMesh.visible = (state.mountMode === 'horse');

  if (state.mountMode === 'car') {
    explorerAvatarMesh.position.set(0, 0.35, -0.2);
    document.getElementById('drive-pad-status').textContent = '🚗 3D Araba Sürülüyor! (Korna: 📯)';
    document.getElementById('btn-toggle-car').textContent = '🚶 Arabadan İn';
    document.getElementById('btn-toggle-horse').textContent = '🐴 Ata Bin';
  } else if (state.mountMode === 'horse') {
    explorerAvatarMesh.position.set(0, 1.25, -0.05);
    document.getElementById('drive-pad-status').textContent = '🐴 3D Midilli Sürülüyor! (Zıpla: 📯)';
    document.getElementById('btn-toggle-horse').textContent = '🚶 Attan İn';
    document.getElementById('btn-toggle-car').textContent = '🚗 Arabaya Bin';
  } else {
    explorerAvatarMesh.position.set(0, 0, 0);
    document.getElementById('drive-pad-status').textContent = `🚶 ${COUSINS[state.currentPlayer].name} Geziyor`;
    document.getElementById('btn-toggle-car').textContent = '🚗 Arabaya Bin';
    document.getElementById('btn-toggle-horse').textContent = '🐴 Ata Bin';
  }
}

function updateCarriedItemMesh() {
  if (!explorerHandProp) return;
  while (explorerHandProp.children.length > 0) explorerHandProp.remove(explorerHandProp.children[0]);
  if (state.carriedItem === 'water') {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    explorerHandProp.add(b);
  } else if (state.carriedItem === 'hay') {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.45), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
    explorerHandProp.add(h);
  } else if (state.carriedItem === 'apple') {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    explorerHandProp.add(a);
  }
}

window.setMoveKey = (dir, isDown) => { state.moveKeys[dir] = isDown; };
function handleKeyboardMove(e, isDown) {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') state.moveKeys.up = isDown;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') state.moveKeys.down = isDown;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.moveKeys.left = isDown;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.moveKeys.right = isDown;
}

window.toggleMountCar = function() {
  state.mountMode = (state.mountMode === 'car') ? 'walk' : 'car';
  applyExplorerMountPose();
  playSound(state.mountMode === 'car' ? 'horn' : 'pop');
  speakText(state.mountMode === 'car' ? '3 Boyutlu arabana bindin! Yön tuşlarıyla sürebilir ve kornaya basabilirsin!' : 'Arabadan indin!');
};

window.toggleMountHorse = function() {
  state.mountMode = (state.mountMode === 'horse') ? 'walk' : 'horse';
  applyExplorerMountPose();
  playSound('win');
  speakText(state.mountMode === 'horse' ? '3 Boyutlu midilli atına bindin! Haydi dörtnala gez!' : 'Attan indin!');
};

const POSSESSIVE_NAME = { umay: "Umay'ın", yusuf: "Yusuf'un", deren: "Deren'in", elif: "Elif'in" };

window.carryItemInHand = function(item) {
  state.carriedItem = item;
  updateCarriedItemMesh();
  playSound('pop');
  const st = document.getElementById('drive-pad-status');
  if (item === 'water') {
    if (st) st.textContent = '🪣 Elinde Su Kovası Var! Hayvana Yürü!';
    speakText('Eline su kovasını aldın! Şimdi hayvanın yanına yürüyüp kendi elinle su içir!');
  } else if (item === 'hay') {
    if (st) st.textContent = '🌾 Elinde Ot Var! Hayvana Yürü!';
    speakText('Eline ot balyasını aldın! Hayvanın yanına yürüyüp kendi elinle yedir!');
  } else if (item === 'apple') {
    if (st) st.textContent = '🍎 Elinde Elma Var! Hayvana Yürü!';
    speakText('Eline kırmızı elma aldın! Hayvanlara götürebilirsin!');
  } else {
    applyExplorerMountPose();
  }
};

window.avatarActionHornOrJump = function() {
  if (!explorerRig) return;
  if (state.mountMode === 'car') {
    playSound('horn');
    spawnFloatingFX('📯');
  } else {
    playSound('pop');
    explorerRig.position.y = 1.2;
    setTimeout(() => { explorerRig.position.y = 0; }, 320);
  }
};

/* ============================================================================
   4. TRUE 3D ANIMALS, TRACTOR & LUNAPARK WORLD
   ============================================================================ */
function create3DCompanionPetMesh(petType = 'pony', petCfg = {}) {
  const pet = new THREE.Group();
  const defaultColors = { pony: '#9ca3af', cow: '#ffffff', dog: '#d97706', cat: '#f9a8d4', sheep: '#f8fafc', bear: '#5c2d0c', rabbit: '#f8fafc', panda: '#ffffff', penguin: '#1e293b', lion: '#f59e0b' };
  const bodyColor = petCfg.petColor || defaultColors[petType] || '#9ca3af';
  const mainMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.45 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const pinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.35 });

  const isTall = (petType === 'pony' || petType === 'cow' || petType === 'bear');
  const bodyLen = isTall ? 1.75 : 1.25;
  const bodyRad = petType === 'bear' ? 0.62 : (isTall ? 0.48 : 0.38);
  const legH    = isTall ? 0.85 : 0.55;
  const bodyY   = legH + bodyRad * 0.85;
  const headY   = bodyY + (isTall ? 0.65 : 0.45);
  const headZ   = bodyLen * 0.48;

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(bodyRad, bodyLen - bodyRad, 14, 20), mainMat);
  torso.rotation.x = Math.PI / 2; torso.position.set(0, bodyY, 0); torso.castShadow = true;
  pet.add(torso);

  if (petType === 'cow') {
    const spot1 = new THREE.Mesh(new THREE.SphereGeometry(bodyRad * 1.03, 14, 14), darkMat);
    spot1.position.set(0.1, bodyY + 0.08, -0.2); spot1.scale.set(0.95, 0.85, 0.7);
    const spot2 = new THREE.Mesh(new THREE.SphereGeometry(bodyRad * 1.02, 14, 14), darkMat);
    spot2.position.set(-0.12, bodyY - 0.05, 0.35); spot2.scale.set(0.9, 0.8, 0.6);
    const udder = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), pinkMat);
    udder.position.set(0, bodyY - bodyRad * 0.9, -0.25);
    pet.add(spot1, spot2, udder);
  }

  const legX = bodyRad * 0.65, legZ = (bodyLen - bodyRad) * 0.48;
  [[-legX, -legZ], [legX, -legZ], [-legX, legZ], [legX, legZ]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, legH, 10), mainMat);
    leg.position.set(lx, legH / 2, lz); leg.castShadow = true;
    pet.add(leg);
  });

  if (isTall) {
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.75, 14), mainMat);
    neck.position.set(0, bodyY + 0.35, headZ - 0.15); neck.rotation.x = 0.35;
    pet.add(neck);
  }

  const head = new THREE.Mesh(new THREE.SphereGeometry(isTall ? 0.46 : 0.42, 20, 20), mainMat);
  head.position.set(0, headY, headZ); head.scale.set(0.92, 0.95, 1.15); head.castShadow = true;
  pet.add(head);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(isTall ? 0.25 : 0.2, 14, 14), petType === 'cow' ? pinkMat : mainMat);
  snout.position.set(0, headY - 0.08, headZ + (isTall ? 0.42 : 0.35));
  pet.add(snout);

  [-0.22, 0.22].forEach(ex => {
    const eyeW = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eyeW.position.set(ex, headY + 0.1, headZ + 0.32);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), darkMat);
    pupil.position.set(ex, headY + 0.1, headZ + 0.39);
    pet.add(eyeW, pupil);
  });

  if (petType === 'pony') {
    const maneMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.45), maneMat);
    mane.position.set(0, bodyY + 0.45, headZ - 0.25); mane.rotation.x = 0.35;
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.75, 8, 12), maneMat);
    tail.position.set(0, bodyY - 0.1, -bodyLen * 0.55); tail.rotation.x = -0.45;
    pet.add(mane, tail);
  } else if (petType === 'cow') {
    [-0.28, 0.28].forEach(ex => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 8), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
      horn.position.set(ex, headY + 0.44, headZ - 0.05);
      pet.add(horn);
    });
  } else if (petType === 'cat') {
    [-0.24, 0.24].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), mainMat);
      ear.position.set(ex, headY + 0.42, headZ);
      pet.add(ear);
    });
  } else if (petType === 'rabbit') {
    [-0.18, 0.18].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.55, 8, 10), mainMat);
      ear.position.set(ex, headY + 0.55, headZ - 0.05);
      pet.add(ear);
    });
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    puff.position.set(0, bodyY, -bodyLen * 0.52);
    pet.add(puff);
  } else if (petType === 'panda') {
    [-0.32, 0.32].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), darkMat);
      ear.position.set(ex, headY + 0.36, headZ - 0.05);
      const patch = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), darkMat);
      patch.position.set(ex * 0.68, headY + 0.1, headZ + 0.28);
      pet.add(ear, patch);
    });
  } else if (petType === 'penguin') {
    const belly = new THREE.Mesh(new THREE.SphereGeometry(bodyRad * 0.9, 14, 14), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    belly.position.set(0, bodyY - 0.02, 0.12);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 8), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
    beak.rotation.x = Math.PI / 2; beak.position.set(0, headY - 0.06, headZ + 0.45);
    pet.add(belly, beak);
  } else if (petType === 'lion') {
    const mane = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.18, 12, 20), new THREE.MeshStandardMaterial({ color: 0x92400e }));
    mane.position.set(0, headY, headZ - 0.06);
    pet.add(mane);
  } else {
    [-0.34, 0.34].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), mainMat);
      ear.position.set(ex, headY + 0.38, headZ - 0.05);
      pet.add(ear);
    });
  }

  // Pet Clothing / Saddle
  const pOutfit = petCfg.petOutfit || 'none';
  if (pOutfit !== 'none') {
    const coatColor = pOutfit === 'yellow_sweater' ? 0xf5cf60 : (pOutfit === 'hero_cape' ? 0xef4444 : 0xf472b6);
    const wrap = new THREE.Mesh(
      new THREE.CylinderGeometry(bodyRad + 0.025, bodyRad + 0.025, bodyLen * 0.55, 20, 1, false, -Math.PI * 0.72, Math.PI * 1.44),
      new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.35, side: THREE.DoubleSide })
    );
    wrap.rotation.z = Math.PI / 2; wrap.rotation.x = Math.PI / 2; wrap.position.set(0, bodyY + 0.02, 0);
    pet.add(wrap);
  }

  // Pet Hat
  const pHat = petCfg.petHat || 'none';
  const hatTopY = headY + (isTall ? 0.38 : 0.36);
  if (pHat === 'crown') {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.22, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, side: THREE.DoubleSide }));
    crown.position.set(0, hatTopY + 0.08, headZ);
    pet.add(crown);
  } else if (pHat === 'cowboy_hat') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 18), new THREE.MeshStandardMaterial({ color: 0x92400e }));
    brim.position.set(0, hatTopY, headZ);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.28, 18), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    top.position.set(0, hatTopY + 0.15, headZ);
    pet.add(brim, top);
  } else if (pHat === 'umay_helmet') {
    const hDome = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.48), new THREE.MeshStandardMaterial({ color: 0xff5d9e }));
    hDome.position.set(0, headY + 0.08, headZ);
    pet.add(hDome);
  }
  return pet;
}

function create3DTractorMesh() {
  const tractor = new THREE.Group();
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.35 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.6 });

  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.15, 1.3), greenMat);
  hood.position.set(0.6, 1.15, 0); hood.castShadow = true;
  const cabinBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.45), greenMat);
  cabinBase.position.set(-0.85, 1.15, 0); cabinBase.castShadow = true;
  const cabinGlass = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 1.38), glassMat);
  cabinGlass.position.set(-0.85, 2.15, 0);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.18, 1.55), yellowMat);
  roof.position.set(-0.85, 2.75, 0);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 10), tireMat);
  pipe.position.set(1.1, 2.1, 0.45);
  tractor.add(hood, cabinBase, cabinGlass, roof, pipe);

  [-0.85, 0.85].forEach(wz => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.45, 20), tireMat);
    tire.rotation.x = Math.PI / 2; tire.position.set(-0.85, 0.85, wz);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.48, 14), yellowMat);
    rim.rotation.x = Math.PI / 2; rim.position.set(-0.85, 0.85, wz);
    tractor.add(tire, rim);
  });
  [-0.78, 0.78].forEach(wz => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.35, 18), tireMat);
    tire.rotation.x = Math.PI / 2; tire.position.set(1.15, 0.52, wz);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.38, 14), yellowMat);
    rim.rotation.x = Math.PI / 2; rim.position.set(1.15, 0.52, wz);
    tractor.add(tire, rim);
  });
  return tractor;
}

function create3DTree() {
  const t = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.6, 10), new THREE.MeshStandardMaterial({ color: 0x92400e }));
  trunk.position.y = 0.8; trunk.castShadow = true;
  const l1 = new THREE.Mesh(new THREE.SphereGeometry(1.25, 14, 14), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
  l1.position.y = 2.2; l1.castShadow = true;
  const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 14, 14), new THREE.MeshStandardMaterial({ color: 0x4ade80 }));
  l2.position.set(0.4, 2.9, 0.2);
  t.add(trunk, l1, l2);
  return t;
}

/* ============================================================================
   5. WORLD 5: 3D KUZENLER LUNAPARKI (FERRIS WHEEL, CAROUSEL, BUMPER CARS, COTTON CANDY!)
   ============================================================================ */
function build3DLunaparkWorld() {
  const g = worldGroups.lunapark;

  // Festive Pastel Ground
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 16, 0.6, 40),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 })
  );
  ground.position.y = -0.3; ground.receiveShadow = true;
  g.add(ground);

  // 1. GIANT ROTATING 3D FERRIS WHEEL (DÖNME DOLAP)
  const ferrisBase = new THREE.Group();
  ferrisBase.position.set(-6.2, 0, -4.5);
  const legMat = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.3 });
  [-1.8, 1.8].forEach(lx => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 7.2, 12), legMat);
    leg.position.set(lx, 3.4, 0); leg.rotation.z = lx < 0 ? -0.22 : 0.22;
    ferrisBase.add(leg);
  });

  ferrisWheelRotor = new THREE.Group();
  ferrisWheelRotor.position.set(0, 6.4, 0);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.2, 12, 36), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5 }));
  ferrisWheelRotor.add(rim);

  const gondolaColors = [0xff4d94, 0x38bdf8, 0x10b981, 0xa855f7, 0xf59e0b, 0xef4444, 0x06b6d4, 0xec4899];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 9.2, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    spoke.rotation.z = ang;
    ferrisWheelRotor.add(spoke);

    const gondola = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.0, 1.1),
      new THREE.MeshStandardMaterial({ color: gondolaColors[i], roughness: 0.3 })
    );
    gondola.position.set(Math.cos(ang) * 4.6, Math.sin(ang) * 4.6, 0);
    gondola.castShadow = true;
    ferrisWheelRotor.add(gondola);
  }
  ferrisBase.add(ferrisWheelRotor);
  const fLbl = create3DTextLabel('🎡 3D Dönme Dolap', '#db2777');
  fLbl.position.set(0, 11.6, 0);
  ferrisBase.add(fLbl);
  g.add(ferrisBase);

  // 2. ROTATING 3D CAROUSEL (ATLIKARINCA)
  const carBase = new THREE.Group();
  carBase.position.set(6.0, 0, -4.2);
  const floorDisk = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.0, 0.5, 28), new THREE.MeshStandardMaterial({ color: 0xf472b6 }));
  floorDisk.position.y = 0.25;
  const centerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 4.8, 16), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
  centerPole.position.y = 2.6;
  const tentRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.2, 16), new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }));
  tentRoof.position.y = 5.6;
  carBase.add(floorDisk, centerPole, tentRoof);

  carouselRotor = new THREE.Group();
  carouselRotor.position.y = 0.5;
  const ponyColors = ['#ffffff', '#f472b6', '#38bdf8', '#fde047', '#a855f7', '#34d399'];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.0, 8), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
    pole.position.set(Math.cos(ang) * 2.6, 2.0, Math.sin(ang) * 2.6);
    const horse = create3DCompanionPetMesh('pony', { petColor: ponyColors[i], petOutfit: 'pink_saddle' });
    horse.scale.set(0.62, 0.62, 0.62);
    horse.position.set(Math.cos(ang) * 2.6, 0.6, Math.sin(ang) * 2.6);
    horse.rotation.y = -ang;
    carouselRotor.add(pole, horse);
  }
  carBase.add(carouselRotor);
  const cLbl = create3DTextLabel('🎠 3D Atlıkarınca', '#7c3aed');
  cLbl.position.set(0, 7.2, 0);
  carBase.add(cLbl);
  g.add(carBase);

  // 3. COTTON CANDY STAND & DECORATIVE BALLOONS
  const stand = new THREE.Group();
  stand.position.set(0, 0, -7.2);
  const booth = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 1.6), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
  booth.position.y = 0.9;
  const awning = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 2.0), new THREE.MeshStandardMaterial({ color: 0xff4d94 }));
  awning.position.y = 2.8;
  const sLbl = create3DTextLabel('🍭 Pamuk Şeker Standı', '#ec4899');
  sLbl.position.y = 3.7;
  stand.add(booth, awning, sLbl);
  g.add(stand);

  // Parked Bumper Cars on the Lunapark Plaza
  const bumper1 = create3DSportCarMesh(0x38bdf8);
  bumper1.scale.set(0.75, 0.75, 0.75); bumper1.position.set(-5.2, 0, 4.2); bumper1.rotation.y = 0.6;
  const bumper2 = create3DSportCarMesh(0xfacc15);
  bumper2.scale.set(0.75, 0.75, 0.75); bumper2.position.set(5.2, 0, 4.2); bumper2.rotation.y = -0.6;
  g.add(bumper1, bumper2);
}

window.rideLunaparkAttraction = function(mode) {
  playSound('win');
  if (mode === 'ferris') {
    state.mountMode = 'ferris';
    applyExplorerMountPose();
    speakText('Yaşasın! 3 Boyutlu Dönme Dolaba bindin! Gökyüzüne doğru yükseliyorsun!');
  } else if (mode === 'carousel') {
    // Smooth boarding animation: walk & hop up onto the spinning 3D Carousel Horse!
    state.mountMode = 'boarding_carousel';
    state.boardingProgress = 0;
    if (explorerRig) {
      state.boardingStart = explorerRig.position.clone();
    }
    applyExplorerMountPose();
    speakText('Atlıkarıncaya doğru yürüyorsun ve 3 boyutlu renkli atın sırtına biniyorsun!');
  } else if (mode === 'bumper') {
    state.mountMode = 'car';
    applyExplorerMountPose();
    if (explorerRig) explorerRig.position.set(0, 0, 4.0);
    speakText('Çarpışan arabaya bindin! Yön tuşlarıyla lunaparkta sür!');
  } else {
    state.mountMode = 'walk';
    applyExplorerMountPose();
    if (explorerRig) explorerRig.position.set(0, 0, 4.5);
    speakText('Yere indin, şimdi lunaparkta yürüyerek gezebilirsin!');
  }
};

window.eatCottonCandy = function() {
  playSound('win');
  addStars(2);
  spawnFloatingFX('🍭');
  speakText('Mmm! Pembe pamuk şeker çok lezzetli! +2 Yıldız kazandın!');
};

/* ============================================================================
   6. VILLAGE MAP & ALL 4 COUSINS' 3D ROOMS
   ============================================================================ */
// 4 Seasons & 3D Weather Particle System (Snow & Rain!)
let weatherPoints = null;
let activeWeather = 'summer'; // 'summer' | 'spring' | 'autumn' | 'winter' | 'rain'
let mapIslandMat = null;

function init3DWeatherSystem() {
  const count = 450;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = Math.random() * 20;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0.9 });
  weatherPoints = new THREE.Points(geo, mat);
  weatherPoints.visible = false;
  scene.add(weatherPoints);
}

window.setSeasonAndWeather = function(season) {
  activeWeather = season;
  ['summer', 'spring', 'autumn', 'winter', 'rain'].forEach(s => {
    const b = document.getElementById(`season-${s}`);
    if (b) b.classList.toggle('active', s === season);
  });
  playSound(season === 'rain' ? 'water' : 'win');

  const configs = {
    summer:  { sky: '#7dd3fc', ground: 0x4ade80, snow: false, rain: false, jelibon: false, msg: '☀️ Yaz mevsimi! Güneş parlıyor!' },
    spring:  { sky: '#bae6fd', ground: 0x86efac, snow: false, rain: false, jelibon: false, msg: '🌸 İlkbahar geldi, her yer çiçek açtı!' },
    autumn:  { sky: '#fed7aa', ground: 0xd97706, snow: false, rain: false, jelibon: false, msg: '🍂 Sonbahar mevsimi! Yapraklar sarardı!' },
    winter:  { sky: '#cbd5e1', ground: 0xf8fafc, snow: true,  rain: false, jelibon: false, msg: '❄️ Kış geldi! 3 boyutlu kar yağıyor! Hadi kartopu oynayalım!' },
    rain:    { sky: '#64748b', ground: 0x15803d, snow: false, rain: true,  jelibon: false, msg: '🌧️ Yağmur yağıyor! Çiftlikteki bitkiler ve ağaçlar sulanıyor!' },
    jelibon: { sky: '#f5d0fe', ground: 0xfbcfe8, snow: false, rain: false, jelibon: true,  msg: '🍬 YAŞASIN! Gökyüzünden renkli 3 boyutlu Jelibon Yağmuru yağıyor!' }
  };
  const cfg = configs[season] || configs.summer;
  scene.background.set(cfg.sky);
  if (scene.fog) scene.fog.color.set(cfg.sky);
  if (farmPastureMat) farmPastureMat.color.setHex(cfg.ground);
  if (mapIslandMat) mapIslandMat.color.setHex(cfg.ground);

  if (weatherPoints) {
    weatherPoints.visible = (cfg.snow || cfg.rain || cfg.jelibon);
    weatherPoints.material.color.setHex(cfg.jelibon ? 0xff4d94 : (cfg.snow ? 0xffffff : 0x38bdf8));
    weatherPoints.material.size = cfg.jelibon ? 0.65 : (cfg.snow ? 0.38 : 0.24);
  }
  speakText(cfg.msg);
};

window.toggleMountTrain = function() {
  state.mountMode = (state.mountMode === 'car') ? 'walk' : 'car';
  applyExplorerMountPose();
  playSound('horn');
  speakText(state.mountMode === 'car' ? 'Çuf çuf! 3 Boyutlu Trene & Araca bindin! Yön tuşlarıyla sür!' : 'Trenden indin!');
};

function build3DVillageMap() {
  const g = worldGroups.map;
  mapIslandMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.7 });
  const island = new THREE.Mesh(new THREE.CylinderGeometry(18, 15, 2.2, 36), mapIslandMat);
  island.position.y = -1.1; island.receiveShadow = true;
  const pathGeo = new THREE.RingGeometry(4.5, 9.8, 36); pathGeo.rotateX(-Math.PI / 2);
  const pathMesh = new THREE.Mesh(pathGeo, new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.8 }));
  pathMesh.position.y = 0.02; pathMesh.receiveShadow = true;
  g.add(island, pathMesh);

  function addBldg(x, z, rCol, wCol, icon, mode, label) {
    const b = new THREE.Group(); b.position.set(x, 0, z);
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.3, 3.0), new THREE.MeshStandardMaterial({ color: wCol }));
    body.position.y = 1.15; body.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.6, 4), new THREE.MeshStandardMaterial({ color: rCol }));
    roof.position.y = 3.1; roof.rotation.y = Math.PI / 4;
    const sign = create3DSpriteStandee(icon, 2.0, 1.8, false); sign.position.y = 3.85;
    const lbl = create3DTextLabel(label, `#${rCol.toString(16).padStart(6,'0')}`); lbl.position.y = 6.0;
    b.add(body, roof, sign, lbl);
    b.userData = { clickableType: 'map_building', targetMode: mode, label };
    g.add(b);
  }

  addBldg(-7.8, -3.5, 0xff4d94, 0xfff1f2, 'assets/umay/plane.png',     'rooms',      '4 Kuzen 3D Odaları');
  addBldg(-2.6, -7.8, 0xa855f7, 0xfaf5ff, 'assets/umay/sweater.png',   'salon',      'Makyaj & Giydir');
  addBldg(2.8,  -7.8, 0xec4899, 0xfce7f3, 'assets/sprites/balloon.png','lunapark',   '3D Lunapark 🎡');
  addBldg(7.8,  -3.5, 0x10b981, 0xecfdf5, 'assets/sprites/tractor.png','yusuf-farm', '3D Çiftlik 🚜');
  addBldg(-5.5,  5.5, 0xf59e0b, 0xfffbeb, 'assets/sprites/baby.png',   'nursery',    '3D Bebek & Bez');
  addBldg(5.5,   5.5, 0x3b82f6, 0xeff6ff, 'assets/umay/pony.png',      'arcade',     '41 Oyun & Satranç');

  [[-12, -1], [12, -1], [-10, -8], [10, -8]].forEach(([tx, tz]) => {
    const tr = create3DTree(); tr.position.set(tx, 0, tz); g.add(tr);
  });

  mapTourPlane = create3DSpriteStandee('assets/umay/plane.png', 3.8, 2.5, false);
  mapTourPlane.position.set(0, 7.2, 0);
  g.add(mapTourPlane);
}

const ROOM_3D_CATALOG = [
  // ⭐ Özel Eşyalar (5)
  { id: 'plane_3d',      name: '3D Pembe Barbie Uçağı',  cat: 'umay', special: true, icon: 'assets/umay/plane.png',        type: 'umay_plane', w: 3.6, h: 2.5 },
  { id: 'chelsea_3d',    name: '3D Chelsea Bebek',       cat: 'umay', special: true, icon: 'assets/umay/chelsea_doll.png', type: 'standee',    w: 1.5, h: 2.8, baseColor: 0xff4d94 },
  { id: 'pony_3d',       name: '3D Midilli Atı',         cat: 'umay', special: true, icon: 'assets/umay/pony.png',         type: 'pet_3d',     petType: 'pony' },
  { id: 'sweater_3d',    name: '3D Sarı Kazak',          cat: 'umay', special: true, icon: 'assets/umay/sweater.png',      type: 'standee',    w: 1.7, h: 1.7, baseColor: 0xfacc15 },
  { id: 'boots_3d',      name: '3D Hello Kitty Botlar',  cat: 'umay', special: true, icon: 'assets/umay/boots.png',        type: 'standee',    w: 1.5, h: 1.5, baseColor: 0x1e293b },

  // 🛋️ Temel 3D Ev Mobilyaları & Bahçe
  { id: 'bed_3d',        name: '3D Prenses Yatağı',      cat: 'furniture', icon: 'assets/sprites/bed.png',     type: 'mesh_bed', tint: '#f472b6' },
  { id: 'yusuf_bed',     name: '3D Yeşil Yarış Yatağı',  cat: 'furniture', icon: 'assets/sprites/bed.png',     type: 'mesh_yusuf_bed', tint: '#10b981' },
  { id: 'bunk_bed_3d',   name: '3D İki Katlı Ranza',     cat: 'furniture', icon: 'assets/sprites/bed.png',     type: 'mesh_bunk_bed', special: true, tint: '#f59e0b' },
  { id: 'sofa_3d',       name: '3D Büyük L-Koltuk',      cat: 'furniture', icon: 'assets/sprites/couch.png',   type: 'mesh_sofa', tint: '#3b82f6' },
  { id: 'wardrobe_3d',   name: '3D Büyük Gardırop',      cat: 'furniture', icon: 'assets/sprites/dress.png',   type: 'mesh_wardrobe', tint: '#f9a8d4' },
  { id: 'vanity_3d',     name: '3D Makyaj Masası & Ruj', cat: 'furniture', icon: 'assets/sprites/mirror.png',  type: 'mesh_vanity', tint: '#fbcfe8' },
  { id: 'tv_3d',         name: '3D Dev Ekran TV',        cat: 'furniture', icon: 'assets/sprites/music.png',   type: 'mesh_tv', tint: '#334155' },
  { id: 'gaming_desk',   name: '3D Oyuncu Masası & PC',  cat: 'furniture', icon: 'assets/sprites/star.png',    type: 'mesh_gaming_desk', special: true, tint: '#a855f7' },
  { id: 'bookshelf_3d',  name: '3D Renkli Kitaplık',     cat: 'furniture', icon: 'assets/sprites/sparkles.png',type: 'mesh_bookshelf', tint: '#b45309' },
  { id: 'dining_3d',     name: '3D Yemek Masası & Pasta',cat: 'furniture', icon: 'assets/sprites/apple.png',   type: 'mesh_dining_table', tint: '#f472b6' },
  { id: 'kitchen_3d',    name: '3D Mutfak & Buzdolabı',  cat: 'furniture', icon: 'assets/sprites/apple.png',   type: 'mesh_kitchen', tint: '#f472b6' },
  { id: 'piano_3d',      name: '3D Kuyruklu Piyano',     cat: 'furniture', icon: 'assets/sprites/music.png',   type: 'mesh_piano', special: true, tint: '#111827' },
  { id: 'dollhouse_3d',  name: '3D Prenses Bebek Evi',   cat: 'furniture', icon: 'assets/sprites/crown.png',   type: 'mesh_dollhouse', special: true, tint: '#ec4899' },
  { id: 'aquarium_3d',   name: '3D Işıklı Akvaryum',     cat: 'furniture', icon: 'assets/sprites/sparkles.png',type: 'mesh_aquarium', tint: '#0ea5e9' },
  { id: 'toy_chest_3d',  name: '3D Oyuncak Sandığı',     cat: 'furniture', icon: 'assets/sprites/balloon.png', type: 'mesh_toy_chest', tint: '#f59e0b' },
  { id: 'lamp_3d',       name: '3D Gece Lambası',        cat: 'furniture', icon: 'assets/sprites/star.png',    type: 'mesh_lamp', tint: '#facc15' },

  // 🌳 Dış Mekan & 3D Bahçe Eşyaları
  { id: 'pool_3d',       name: '3D Yüzme Havuzu',        cat: 'garden', special: true, icon: 'assets/sprites/sparkles.png', type: 'mesh_pool', tint: '#38bdf8' },
  { id: 'trampoline_3d', name: '3D Bahçe Trambolini',    cat: 'garden', special: true, icon: 'assets/sprites/balloon.png',  type: 'mesh_trampoline', tint: '#3b82f6' },
  { id: 'slide_3d',      name: '3D Oyun Kaydırağı',      cat: 'garden', icon: 'assets/sprites/star.png',      type: 'mesh_slide', tint: '#ec4899' },
  { id: 'swing_3d',      name: '3D Bahçe Salıncağı',     cat: 'garden', icon: 'assets/sprites/heart.png',     type: 'mesh_swing', tint: '#ef4444' },
  { id: 'tent_3d',       name: '3D Oyun & Kamp Çadırı',  cat: 'garden', icon: 'assets/sprites/sparkles.png',  type: 'mesh_tent', tint: '#a855f7' },
  { id: 'picnic_3d',     name: '3D Şemsiyeli Piknik',    cat: 'garden', icon: 'assets/sprites/sunflower.png', type: 'mesh_picnic', tint: '#ff4d94' },
  { id: 'soccer_3d',     name: '3D Futbol Kalesi & Top', cat: 'garden', icon: 'assets/sprites/star.png',      type: 'mesh_soccer_goal', tint: '#ffffff' },
  { id: 'fountain_3d',   name: '3D Bahçe Çeşmesi',       cat: 'garden', icon: 'assets/sprites/sparkles.png',  type: 'mesh_fountain', tint: '#38bdf8' },
  { id: 'garden_tree',   name: '3D Elma Ağacı',          cat: 'garden', icon: 'assets/sprites/apple.png',     type: 'mesh_garden_tree', tint: '#22c55e' },

  // ✨ Süsler, Halılar, Sanat & 3D Canlılar
  { id: 'rug_3d',        name: '3D Kalpli Halı',         cat: 'decor', icon: 'assets/sprites/heart.png',    type: 'mesh_rug', tint: '#f43f5e' },
  { id: 'rainbow_rug',   name: '3D Gökkuşağı Halı',      cat: 'decor', icon: 'assets/sprites/sparkles.png', type: 'mesh_rainbow_rug' },
  { id: 'plant_3d',      name: '3D Saksı Çiçeği',        cat: 'decor', icon: 'assets/sprites/tulip.png',    type: 'mesh_plant', tint: '#ff4d94' },
  { id: 'chandelier_3d', name: '3D Kristal Avize',       cat: 'decor', icon: 'assets/sprites/crown.png',    type: 'mesh_chandelier', tint: '#facc15' },
  { id: 'easel_3d',      name: '3D Resim Şövalesi',      cat: 'decor', icon: 'assets/sprites/star.png',     type: 'mesh_easel', tint: '#b45309' },
  { id: 'car_mini',      name: '3D Yeşil Yarış Arabası', cat: 'decor', icon: 'assets/sprites/tractor.png',  type: 'car_mini', tint: '#16a34a' },
  { id: 'dog_3d',        name: '3D Sevimli Köpek',       cat: 'decor', icon: 'assets/sprites/dog.png',      type: 'pet_3d', petType: 'dog' },
  { id: 'cat_3d',        name: '3D Pamuk Kedi',          cat: 'decor', icon: 'assets/sprites/cat.png',      type: 'pet_3d', petType: 'cat' },
  { id: 'rabbit_3d',     name: '3D Uzun Kulak Tavşan',   cat: 'decor', icon: 'assets/sprites/heart.png',    type: 'pet_3d', petType: 'rabbit' },
  { id: 'panda_3d',      name: '3D Tatlı Panda',         cat: 'decor', icon: 'assets/sprites/sparkles.png', type: 'pet_3d', petType: 'panda' },
  { id: 'penguin_3d',    name: '3D Minik Penguen',       cat: 'decor', icon: 'assets/sprites/star.png',     type: 'pet_3d', petType: 'penguin' },
  { id: 'lion_3d',       name: '3D Yeleli Aslan',        cat: 'decor', icon: 'assets/sprites/sunflower.png',type: 'pet_3d', petType: 'lion' },
  { id: 'unicorn_3d',    name: '3D Sihirli Unicorn',     cat: 'decor', icon: 'assets/sprites/unicorn.png',  type: 'standee', w: 1.8, h: 1.8, baseColor: 0xc084fc }
];

// EXPAND ROOM_3D_CATALOG TO 105+ WELL-PROPORTIONED, COLOR-VARIED 3D ROOM & GARDEN ITEMS!
(() => {
  const colorSets = [
    { key: 'pink',   label: 'Pembe',    hex: '#ec4899' },
    { key: 'purple', label: 'Mor',      hex: '#a855f7' },
    { key: 'blue',   label: 'Mavi',     hex: '#3b82f6' },
    { key: 'cyan',   label: 'Turkuaz',  hex: '#06b6d4' },
    { key: 'green',  label: 'Yeşil',    hex: '#10b981' },
    { key: 'gold',   label: 'Altın',    hex: '#f59e0b' },
    { key: 'red',    label: 'Kırmızı',  hex: '#ef4444' },
    { key: 'white',  label: 'Beyaz',    hex: '#f8fafc' }
  ];
  const templates = [
    { base: 'bed',      name: '3D Lüks Yatak',         cat: 'furniture', type: 'mesh_bed',         icon: 'assets/sprites/bed.png',       cols: ['purple','blue','cyan','gold','red','white'] },
    { base: 'bunk',     name: '3D Ranza Yatak',        cat: 'furniture', type: 'mesh_bunk_bed',    icon: 'assets/sprites/bed.png',       cols: ['pink','blue','green','white'] },
    { base: 'sofa',     name: '3D L-Koltuk',           cat: 'furniture', type: 'mesh_sofa',        icon: 'assets/sprites/couch.png',     cols: ['pink','purple','green','gold','red','cyan','white'] },
    { base: 'wardrobe', name: '3D Gardırop',           cat: 'furniture', type: 'mesh_wardrobe',    icon: 'assets/sprites/dress.png',     cols: ['purple','blue','green','gold','white'] },
    { base: 'vanity',   name: '3D Makyaj Masası',      cat: 'furniture', type: 'mesh_vanity',      icon: 'assets/sprites/mirror.png',    cols: ['purple','cyan','gold','white'] },
    { base: 'gaming',   name: '3D Oyuncu Masası',      cat: 'furniture', type: 'mesh_gaming_desk', icon: 'assets/sprites/star.png',      cols: ['pink','blue','green','red'] },
    { base: 'book',     name: '3D Kitaplık',           cat: 'furniture', type: 'mesh_bookshelf',   icon: 'assets/sprites/sparkles.png',  cols: ['pink','blue','green','white'] },
    { base: 'piano',    name: '3D Kuyruklu Piyano',    cat: 'furniture', type: 'mesh_piano',       icon: 'assets/sprites/music.png',     cols: ['pink','purple','white','gold'] },
    { base: 'dollh',    name: '3D Bebek Evi',          cat: 'furniture', type: 'mesh_dollhouse',   icon: 'assets/sprites/crown.png',     cols: ['purple','cyan','gold'] },
    { base: 'kitchen',  name: '3D Mutfak Seti',        cat: 'furniture', type: 'mesh_kitchen',     icon: 'assets/sprites/apple.png',     cols: ['blue','green','gold'] },
    { base: 'dining',   name: '3D Yemek Masası',       cat: 'furniture', type: 'mesh_dining_table',icon: 'assets/sprites/apple.png',     cols: ['purple','cyan','green'] },
    { base: 'lamp',     name: '3D Gece Lambası',       cat: 'furniture', type: 'mesh_lamp',        icon: 'assets/sprites/star.png',      cols: ['pink','purple','cyan'] },
    { base: 'pool',     name: '3D Yüzme Havuzu',       cat: 'garden',    type: 'mesh_pool',        icon: 'assets/sprites/sparkles.png',  cols: ['pink','purple','green'] },
    { base: 'tramp',    name: '3D Trambolin',          cat: 'garden',    type: 'mesh_trampoline',  icon: 'assets/sprites/balloon.png',   cols: ['pink','green','red'] },
    { base: 'slide',    name: '3D Kaydırak',           cat: 'garden',    type: 'mesh_slide',       icon: 'assets/sprites/star.png',      cols: ['blue','green','gold'] },
    { base: 'tent',     name: '3D Oyun Çadırı',        cat: 'garden',    type: 'mesh_tent',        icon: 'assets/sprites/sparkles.png',  cols: ['pink','cyan','gold'] },
    { base: 'rug',      name: '3D Yuvarlak Halı',      cat: 'decor',     type: 'mesh_rug',         icon: 'assets/sprites/heart.png',     cols: ['purple','blue','cyan','green','gold'] },
    { base: 'car',      name: '3D Spor Araba',         cat: 'decor',     type: 'car_mini',         icon: 'assets/sprites/tractor.png',   cols: ['pink','blue','red','gold','purple'] }
  ];
  templates.forEach(t => {
    t.cols.forEach(ck => {
      const c = colorSets.find(x => x.key === ck);
      ROOM_3D_CATALOG.push({
        id: `${t.base}_${ck}`,
        name: `${c.label} ${t.name}`,
        cat: t.cat,
        icon: t.icon,
        type: t.type,
        tint: c.hex
      });
    });
  });
})();

function buildRoomShell(grp, wallHex, floorHex) {
  // Outdoor 3D Garden Lawn surrounding the room so kids can decorate BOTH inside AND outside!
  const outdoorGarden = new THREE.Mesh(new THREE.BoxGeometry(28, 0.3, 24), new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 }));
  outdoorGarden.position.set(0, -0.35, 3); outdoorGarden.receiveShadow = true;
  grp.add(outdoorGarden);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 14), new THREE.MeshStandardMaterial({ color: floorHex, roughness: 0.55 }));
  floor.position.y = -0.2; floor.receiveShadow = true;
  const backW = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 0.4), new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.6 }));
  backW.position.set(0, 4, -7); backW.receiveShadow = true;
  const leftW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 14), new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.6 }));
  leftW.position.set(-8, 4, 0); leftW.receiveShadow = true;
  const winF = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.8, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  winF.position.set(-3.2, 4.6, -6.9);
  const winG = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.4), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }));
  winG.position.set(-3.2, 4.6, -6.62);
  grp.add(floor, backW, leftW, winF, winG);
}

window.clearCurrent3DRoom = function() {
  const grp = cousinRoomGroups[state.currentRoomOwner];
  if (!grp) return;
  for (let i = draggableRoomObjects.length - 1; i >= 0; i--) {
    const obj = draggableRoomObjects[i];
    if (obj.parent === grp) {
      grp.remove(obj);
      draggableRoomObjects.splice(i, 1);
    }
  }
  selected3DRoomItem = null;
  playSound('pop');
  speakText('Odan tamamen boşaltıldı! Şimdi en baştan sıfırdan hem odanı hem dış bahçeni kendi istediğin gibi kurabilirsin!');
};

function buildAll4CousinRooms() {
  const themes = {
    umay:  { wall: 0xfbcfe8, floor: 0xfde68a },
    yusuf: { wall: 0xbbf7d0, floor: 0xfed7aa },
    deren: { wall: 0xe9d5ff, floor: 0xfce7f3 },
    elif:  { wall: 0xbae6fd, floor: 0xfef08a }
  };
  Object.keys(cousinRoomGroups).forEach(owner => {
    const grp = cousinRoomGroups[owner];
    buildRoomShell(grp, themes[owner].wall, themes[owner].floor);
    grp.visible = (owner === 'umay');
    worldGroups.rooms.add(grp);
  });

  // Populate Umay's Room
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='bed_3d'),    -4.8, -3.5, 'umay');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='vanity_3d'),  4.5, -4.8, 'umay');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='plane_3d'),   1.2,  1.8, 'umay');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='chelsea_3d'),-1.8,  1.5, 'umay');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='pony_3d'),    4.0,  1.2, 'umay');

  // Populate Yusuf's Room
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='yusuf_bed'), -4.8, -3.5, 'yusuf');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='tv_3d'),      4.2, -5.0, 'yusuf');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='car_mini'),   0.5,  1.5, 'yusuf');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='dog_3d'),    -2.2,  2.2, 'yusuf');

  // Populate Deren's 3-Year-Old Princess & Makeup Room
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='bed_3d'),    -4.8, -3.5, 'deren');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='vanity_3d'),  4.2, -4.8, 'deren');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='rug_3d'),     0,    0.5, 'deren');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='cat_3d'),     2.2,  1.8, 'deren');

  // Populate Elif's 3-Year-Old Unicorn & Makeup Room
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='bed_3d'),    -4.8, -3.5, 'elif');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='vanity_3d'),  4.2, -4.8, 'elif');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='unicorn_3d'), 0.5,  1.2, 'elif');
  spawn3DRoomObject(ROOM_3D_CATALOG.find(x=>x.id==='pony_3d'),    3.5,  1.8, 'elif');

  render3DRoomCatalog('all');
}

function create3DMeshFurniture(type) {
  const grp = new THREE.Group();
  const mat = (col, rough = 0.45, metal = 0.08) => new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal });

  if (type === 'mesh_bed' || type === 'mesh_yusuf_bed') {
    const isY = type === 'mesh_yusuf_bed';
    const f = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 4.4), mat(isY ? 0x10b981 : 0xf472b6));
    f.position.y = 0.3; f.castShadow = true;
    const m = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.5, 4.0), mat(0xffffff));
    m.position.y = 0.75;
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(3.36, 0.52, 2.5), mat(isY ? 0x38bdf8 : 0xf9a8d4));
    blanket.position.set(0, 0.78, 0.7);
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 0.75), mat(0xfef08a));
    pillow.position.set(0, 1.12, -1.35);
    const hb = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.35), mat(isY ? 0x059669 : 0xdb2777));
    hb.position.set(0, 1.1, -2.05);
    grp.add(f, m, blanket, pillow, hb);
  } else if (type === 'mesh_bunk_bed') {
    const frameMat = mat(0xf59e0b);
    [[-1.6, -2.0], [1.6, -2.0], [-1.6, 2.0], [1.6, 2.0]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.2, 10), frameMat);
      post.position.set(px, 2.1, pz); post.castShadow = true; grp.add(post);
    });
    [0.6, 2.7].forEach((by, i) => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.3, 4.1), frameMat); base.position.y = by;
      const matt = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.35, 3.8), mat(i === 0 ? 0xec4899 : 0x38bdf8)); matt.position.y = by + 0.3;
      const pil = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.65), mat(0xffffff)); pil.position.set(0, by + 0.55, -1.3);
      grp.add(base, matt, pil);
    });
    // Ladder on front
    for (let r = 0; r < 5; r++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.1), mat(0xffffff));
      rung.position.set(1.1, 0.6 + r * 0.65, 2.05); grp.add(rung);
    }
  } else if (type === 'mesh_vanity') {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 1.2), mat(0xfbcfe8));
    desk.position.y = 0.7; desk.castShadow = true;
    const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 24), mat(0xbae6fd, 0.1, 0.7));
    mirror.rotation.x = Math.PI / 2; mirror.position.set(0, 2.25, -0.45);
    [-0.8, -0.4, 0.4, 0.8].forEach((mx, i) => {
      const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.38, 10), mat([0xff4d94, 0xef4444, 0xa855f7, 0x38bdf8][i]));
      lip.position.set(mx, 1.58, 0.15);
      grp.add(lip);
    });
    grp.add(desk, mirror);
  } else if (type === 'mesh_sofa') {
    const s = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.75, 1.7), mat(0x3b82f6)); s.position.y = 0.38; s.castShadow = true;
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.6, 0.42), mat(0x2563eb)); b.position.set(0, 0.85, -0.65);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.15, 1.7), mat(0x1d4ed8)); armL.position.set(-1.7, 0.6, 0);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.15, 1.7), mat(0x1d4ed8)); armR.position.set(1.7, 0.6, 0);
    const cush1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.25), mat(0xfacc15)); cush1.position.set(-1.0, 1.0, -0.25); cush1.rotation.z = 0.15;
    const cush2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.25), mat(0xf472b6)); cush2.position.set(1.0, 1.0, -0.25); cush2.rotation.z = -0.15;
    grp.add(s, b, armL, armR, cush1, cush2);
  } else if (type === 'mesh_wardrobe') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4.2, 1.4), mat(0xf9a8d4)); body.position.y = 2.1; body.castShadow = true;
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.0, 0.06), mat(0xbe185d)); line.position.set(0, 2.1, 0.71);
    const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), mat(0xfacc15, 0.2, 0.8)); h1.position.set(-0.22, 2.2, 0.76);
    const h2 = h1.clone(); h2.position.x = 0.22;
    grp.add(body, line, h1, h2);
  } else if (type === 'mesh_tv') {
    const st = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.9, 1.0), mat(0x334155)); st.position.y = 0.45; st.castShadow = true;
    const sc = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.85, 0.16), mat(0x0f172a)); sc.position.y = 1.92;
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 1.6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 })); glow.position.set(0, 1.92, 0.09);
    grp.add(st, sc, glow);
  } else if (type === 'mesh_gaming_desk') {
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 1.5), mat(0x1e293b)); top.position.y = 1.45; top.castShadow = true;
    const rgb = new THREE.Mesh(new THREE.BoxGeometry(3.24, 0.08, 1.54), new THREE.MeshBasicMaterial({ color: 0xa855f7 })); rgb.position.y = 1.36;
    [[-1.4, -0.6], [1.4, -0.6], [-1.4, 0.6], [1.4, 0.6]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 0.15), mat(0x0f172a)); leg.position.set(lx, 0.7, lz); grp.add(leg);
    });
    const mon = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.12), mat(0x0f172a)); mon.position.set(0, 2.2, -0.35);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.9), new THREE.MeshBasicMaterial({ color: 0x22d3ee })); scr.position.set(0, 2.2, -0.28);
    const kb = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.38), mat(0xec4899)); kb.position.set(0, 1.57, 0.25);
    const chair = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.5, 0.9), mat(0xef4444)); chair.position.set(0, 0.75, 1.35);
    grp.add(top, rgb, mon, scr, kb, chair);
  } else if (type === 'mesh_bookshelf') {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.8, 0.9), mat(0xb45309)); frame.position.y = 1.9; frame.castShadow = true;
    const cols = [0xef4444, 0x3b82f6, 0x10b981, 0xfacc15, 0xec4899, 0xa855f7];
    for (let row = 0; row < 3; row++) {
      for (let b = 0; b < 6; b++) {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.72, 0.65), mat(cols[(row * 3 + b) % cols.length]));
        book.position.set(-0.92 + b * 0.36, 0.85 + row * 1.1, 0.18);
        grp.add(book);
      }
    }
    grp.add(frame);
  } else if (type === 'mesh_dining_table') {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.18, 24), mat(0xfef3c7)); top.position.y = 1.35; top.castShadow = true;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.5, 1.35, 16), mat(0xd97706)); ped.position.y = 0.68;
    const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.42, 18), mat(0xf472b6)); cake.position.y = 1.65;
    grp.add(top, ped, cake);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.75), mat(0x38bdf8));
      ch.position.set(Math.cos(a) * 2.1, 0.45, Math.sin(a) * 2.1); grp.add(ch);
    }
  } else if (type === 'mesh_kitchen') {
    const counter = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.5, 1.3), mat(0xffffff)); counter.position.set(-0.6, 0.75, 0); counter.castShadow = true;
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.16, 1.38), mat(0xf472b6)); top.position.set(-0.6, 1.56, 0);
    const burner1 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 14), mat(0x1e293b)); burner1.position.set(-1.3, 1.66, 0);
    const burner2 = burner1.clone(); burner2.position.x = -0.5;
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.6, 1.4), mat(0xbae6fd)); fridge.position.set(1.9, 1.8, 0); fridge.castShadow = true;
    grp.add(counter, top, burner1, burner2, fridge);
  } else if (type === 'mesh_piano') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.5, 1.8), mat(0x111827, 0.2, 0.4)); body.position.y = 1.35; body.castShadow = true;
    const keys = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.55), mat(0xffffff)); keys.position.set(0, 1.2, 1.05);
    const stool = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.6), mat(0xbe185d)); stool.position.set(0, 0.4, 1.9);
    [[-1.2, -0.7], [1.2, -0.7], [-1.2, 0.7], [1.2, 0.7]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 10), mat(0x111827)); leg.position.set(lx, 0.45, lz); grp.add(leg);
    });
    grp.add(body, keys, stool);
  } else if (type === 'mesh_dollhouse') {
    const house = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 1.4), mat(0xfbcfe8)); house.position.y = 1.4; house.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.4, 4), mat(0xec4899)); roof.position.y = 3.5; roof.rotation.y = Math.PI / 4;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.1, 0.12), mat(0xa855f7)); door.position.set(0, 0.55, 0.72);
    [-0.75, 0.75].forEach(wx => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      win.position.set(wx, 2.0, 0.72); grp.add(win);
    });
    grp.add(house, roof, door);
  } else if (type === 'mesh_aquarium') {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 1.1), mat(0x1e293b)); stand.position.y = 0.55;
    const water = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 0.95), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.72, roughness: 0.1 }));
    water.position.y = 1.9;
    [[-0.6, 2.1, 0xf97316], [0.5, 1.7, 0xfacc15], [0.1, 2.3, 0xec4899]].forEach(([fx, fy, fc]) => {
      const fish = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), mat(fc)); fish.scale.set(1.5, 0.9, 0.6); fish.position.set(fx, fy, 0); grp.add(fish);
    });
    grp.add(stand, water);
  } else if (type === 'mesh_toy_chest') {
    const box = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.3), mat(0xf59e0b)); box.position.y = 0.6; box.castShadow = true;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.2, 1.35), mat(0xef4444)); lid.position.set(0, 1.55, -0.5); lid.rotation.x = -0.8;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), mat(0x38bdf8)); ball.position.set(-0.4, 1.3, 0.1);
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), mat(0x22c55e)); block.position.set(0.45, 1.3, 0.15); block.rotation.y = 0.5;
    grp.add(box, lid, ball, block);
  } else if (type === 'mesh_lamp') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.16, 16), mat(0xfacc15, 0.2, 0.7)); base.position.y = 0.08;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.0, 10), mat(0xfacc15, 0.2, 0.7)); pole.position.y = 1.58;
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 0.95, 18), new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.45 }));
    shade.position.y = 3.2;
    grp.add(base, pole, shade);
  } else if (type === 'mesh_pool') {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.3, 0.75, 28), mat(0xffffff)); rim.position.y = 0.38;
    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 2.85, 0.65, 28), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.2 })); water.position.y = 0.45;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.22, 12, 20), mat(0xff4d94)); ring.rotation.x = Math.PI / 2; ring.position.set(0.8, 0.85, 0.4);
    grp.add(rim, water, ring);
  } else if (type === 'mesh_trampoline') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.18, 12, 24), mat(0x3b82f6)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.9;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 0.12, 24), mat(0x111827)); pad.position.y = 0.9;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 8), mat(0x94a3b8));
      leg.position.set(Math.cos(a) * 2.0, 0.45, Math.sin(a) * 2.0); grp.add(leg);
    }
    grp.add(ring, pad);
  } else if (type === 'mesh_slide') {
    const plat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.4), mat(0xfacc15)); plat.position.set(0, 2.3, -1.2);
    const chute = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 3.4), mat(0xec4899)); chute.position.set(0, 1.25, 0.6); chute.rotation.x = 0.68;
    [[-0.6, -1.8], [0.6, -1.8], [-0.6, -0.6], [0.6, -0.6]].forEach(([px, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.4, 8), mat(0x3b82f6)); p.position.set(px, 1.2, pz); grp.add(p);
    });
    grp.add(plat, chute);
  } else if (type === 'mesh_swing') {
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 10), mat(0xef4444)); topBar.rotation.z = Math.PI / 2; topBar.position.y = 3.2;
    [[-1.6, -0.7, 0.22], [-1.6, 0.7, -0.22], [1.6, -0.7, 0.22], [1.6, 0.7, -0.22]].forEach(([x, z, rx]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.5, 8), mat(0xf59e0b));
      leg.position.set(x, 1.6, z); leg.rotation.x = rx; grp.add(leg);
    });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.55), mat(0x22c55e)); seat.position.y = 0.9;
    [-0.45, 0.45].forEach(rx => {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6), mat(0xffffff)); rope.position.set(rx, 2.05, 0); grp.add(rope);
    });
    grp.add(topBar, seat);
  } else if (type === 'mesh_tent') {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 3.2, 6), mat(0xa855f7)); cone.position.y = 1.6; cone.castShadow = true;
    const door = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 3), mat(0xfef08a)); door.position.set(0, 0.9, 1.25);
    grp.add(cone, door);
  } else if (type === 'mesh_picnic') {
    const tbl = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 1.4), mat(0xd97706)); tbl.position.y = 1.1;
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.45), mat(0xb45309)); b1.position.set(0, 0.55, 1.1);
    const b2 = b1.clone(); b2.position.z = -1.1;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 10), mat(0xffffff)); pole.position.y = 1.6;
    const umb = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.9, 12), mat(0xff4d94)); umb.position.y = 3.2;
    grp.add(tbl, b1, b2, pole, umb);
  } else if (type === 'mesh_soccer_goal') {
    const postMat = mat(0xffffff);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.6, 10), postMat); top.rotation.z = Math.PI / 2; top.position.y = 2.4;
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 10), postMat); l.position.set(-1.8, 1.2, 0);
    const r = l.clone(); r.position.x = 1.8;
    const net = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.3, 1.0), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.45 })); net.position.set(0, 1.15, -0.5);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), mat(0xffffff)); ball.position.set(0, 0.32, 1.4);
    grp.add(top, l, r, net, ball);
  } else if (type === 'mesh_fountain') {
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.6, 20), mat(0xcbd5e1)); b1.position.y = 0.3;
    const w1 = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.5, 20), mat(0x38bdf8, 0.1)); w1.position.y = 0.38;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.8, 14), mat(0xe2e8f0)); col.position.y = 1.2;
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.6, 0.35, 18), mat(0xcbd5e1)); b2.position.y = 2.1;
    const jet = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), mat(0x7dd3fc, 0.1)); jet.position.y = 2.5;
    grp.add(b1, w1, col, b2, jet);
  } else if (type === 'mesh_garden_tree') {
    const tr = create3DTree();
    [[-0.7, 2.1, 0.7], [0.7, 2.4, 0.5], [0, 2.7, -0.7]].forEach(([ax, ay, az]) => {
      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), mat(0xef4444)); apple.position.set(ax, ay, az); tr.add(apple);
    });
    grp.add(tr);
  } else if (type === 'mesh_rainbow_rug') {
    [0xef4444, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7].forEach((c, i) => {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(2.7 - i * 0.45, 2.7 - i * 0.45, 0.06 + i * 0.005, 28), mat(c));
      r.position.y = 0.03 + i * 0.004; grp.add(r);
    });
  } else if (type === 'mesh_plant') {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.45, 0.9, 14), mat(0xd97706)); pot.position.y = 0.45;
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 14), mat(0x22c55e)); bush.position.y = 1.35;
    [[-0.4, 1.85, 0.3], [0.4, 1.9, 0.2], [0, 2.05, -0.2]].forEach(([fx, fy, fz]) => {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), mat(0xff4d94)); fl.position.set(fx, fy, fz); grp.add(fl);
    });
    grp.add(pot, bush);
  } else if (type === 'mesh_chandelier') {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), mat(0xfacc15, 0.2, 0.8)); cord.position.y = 5.4;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.1, 10, 24), mat(0xfacc15, 0.2, 0.8)); ring.rotation.x = Math.PI / 2; ring.position.y = 4.7;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.7 }));
      bulb.position.set(Math.cos(a) * 1.1, 4.9, Math.sin(a) * 1.1); grp.add(bulb);
    }
    grp.add(cord, ring);
  } else if (type === 'mesh_easel') {
    const wood = mat(0xb45309);
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), wood); l1.position.set(-0.55, 1.35, 0.2); l1.rotation.z = -0.15;
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), wood); l2.position.set(0.55, 1.35, 0.2); l2.rotation.z = 0.15;
    const l3 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), wood); l3.position.set(0, 1.35, -0.55); l3.rotation.x = -0.35;
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.1), mat(0xfffdf7)); board.position.set(0, 1.8, 0.15); board.rotation.x = -0.18;
    grp.add(l1, l2, l3, board);
  } else {
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.06, 28), mat(0xf43f5e)); rug.position.y = 0.03;
    grp.add(rug);
  }
  return grp;
}

window.paintSelected3DFurniture = function() {
  if (!selected3DRoomItem) {
    speakText('Önce boyamak istediğin 3 boyutlu eşyaya dokun!');
    return;
  }
  const picker = document.getElementById('room-color-picker');
  const col = state.houseBrushColor || (picker ? picker.value : '#ff4d94');
  selected3DRoomItem.traverse(child => {
    if (child.isMesh && child.material && child.material.color && !child.material.map) {
      child.material = child.material.clone();
      child.material.color.set(col);
    }
  });
  playSound('win');
  spawnFloatingFX('🎨');
  speakText('Harika! Seçtiğin 3 boyutlu mobilya yeni rengine boyandı!');
};

function spawn3DRoomObject(itemDef, x = 0, z = 0, owner = null) {
  if (!itemDef) return;
  const targetOwner = owner || state.currentRoomOwner;
  let obj;
  if (itemDef.type === 'umay_plane') {
    obj = create3DSpriteStandee(itemDef.icon, itemDef.w, itemDef.h, true, 0xff4d94);
    roomHeroPlane = obj;
  } else if (itemDef.type === 'pet_3d') {
    obj = create3DCompanionPetMesh(itemDef.petType, state.salonConfigs[targetOwner]);
  } else if (itemDef.type === 'car_mini') {
    obj = create3DSportCarMesh(itemDef.tint ? new THREE.Color(itemDef.tint).getHex() : 0x16a34a);
    obj.scale.set(0.65, 0.65, 0.65);
  } else if (itemDef.type === 'standee') {
    obj = create3DSpriteStandee(itemDef.icon, itemDef.w, itemDef.h, true, itemDef.baseColor || 0xffffff);
  } else {
    obj = create3DMeshFurniture(itemDef.type);
    // Apply custom furniture color tint cleanly to the first primary mesh so every color variant looks distinct & neat!
    if (itemDef.tint && obj.children.length > 0) {
      const targetMesh = obj.children[0];
      if (targetMesh.isMesh && targetMesh.material && targetMesh.material.color) {
        targetMesh.material = targetMesh.material.clone();
        targetMesh.material.color.set(itemDef.tint);
      }
      if (obj.children[2] && obj.children[2].isMesh && obj.children[2].material?.color && (itemDef.type === 'mesh_bed' || itemDef.type === 'mesh_sofa')) {
        obj.children[2].material = obj.children[2].material.clone();
        obj.children[2].material.color.set(itemDef.tint);
      }
    }
  }
  obj.position.set(x, 0, z);
  obj.userData = { draggableRoomItem: true, name: itemDef.name };
  cousinRoomGroups[targetOwner].add(obj);
  draggableRoomObjects.push(obj);
  selected3DRoomItem = obj;
  return obj;
}

window.switch3DRoomOwner = function(ownerId) {
  state.currentRoomOwner = ownerId;
  Object.keys(cousinRoomGroups).forEach(k => cousinRoomGroups[k].visible = (k === ownerId));
  ['umay','yusuf','deren','elif'].forEach(k => {
    const btn = document.getElementById(`rtab-${k}`);
    if (btn) btn.classList.toggle('active', k === ownerId);
  });
  document.getElementById('room-owner-title').textContent = `🛋️ ${POSSESSIVE_NAME[ownerId]} 3D Odası`;
  playSound('pop');
  speakText(`${POSSESSIVE_NAME[ownerId]} 3 boyutlu odasına girdin!`);
};

function render3DRoomCatalog(cat) {
  const grid = document.getElementById('room-3d-catalog');
  if (!grid) return;
  grid.innerHTML = '';
  ROOM_3D_CATALOG.filter(x => cat === 'all' || x.cat === cat).forEach(item => {
    const card = document.createElement('div');
    card.className = `item-card ${item.special ? 'special' : ''}`;
    const dot = item.tint ? `<span style="position:absolute;top:5px;right:5px;width:14px;height:14px;border-radius:50%;background:${item.tint};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></span>` : '';
    card.style.position = 'relative';
    card.innerHTML = `${dot}<img src="${item.icon}" alt="${item.name}" /><span class="title">${item.name}</span>`;
    card.onclick = () => {
      playSound('pop');
      spawn3DRoomObject(item, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 4, state.currentRoomOwner);
      speakText(`${item.name} odaya eklendi!`);
    };
    grid.appendChild(card);
  });
}

window.filter3DRoomCatalog = (cat, btn) => {
  document.querySelectorAll('#room-tabs .tab-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  playSound('pop');
  render3DRoomCatalog(cat);
};

window.selectHousePaintBrush = (hex) => {
  state.houseBrushColor = hex;
  state.houseBrushActive = true;
  const b = document.getElementById('room-brush-toggle');
  if (b) { b.textContent = '🖌️ Fırça: AÇIK'; b.classList.add('active'); }
  playSound('pop');
};
window.toggleHouseBrushMode = () => {
  state.houseBrushActive = !state.houseBrushActive;
  const b = document.getElementById('room-brush-toggle');
  if (b) { b.textContent = state.houseBrushActive ? '🖌️ Fırça: AÇIK' : '🖌️ Fırça: Kapalı'; b.classList.toggle('active', state.houseBrushActive); }
  playSound('pop');
};

window.manipulateSelected3DItem = (action) => {
  if (!selected3DRoomItem) return;
  playSound('pop');
  if (action === 'rotateL') selected3DRoomItem.rotation.y -= Math.PI / 6;
  if (action === 'rotateR') selected3DRoomItem.rotation.y += Math.PI / 6;
  if (action === 'scaleUp') selected3DRoomItem.scale.multiplyScalar(1.15);
  if (action === 'scaleDown') selected3DRoomItem.scale.multiplyScalar(0.87);
  if (action === 'liftUp') selected3DRoomItem.position.y = selected3DRoomItem.position.y > 0.2 ? 0 : 1.5;
  if (action === 'delete') {
    if (selected3DRoomItem.parent) selected3DRoomItem.parent.remove(selected3DRoomItem);
    const i = draggableRoomObjects.indexOf(selected3DRoomItem);
    if (i >= 0) draggableRoomObjects.splice(i, 1);
    selected3DRoomItem = draggableRoomObjects[0] || null;
  }
};

window.fly3DPlaneInRoom = () => { playSound('win'); roomPlaneFlying = true; roomPlaneAngle = 0; };

/* Canvas Wall Art & 3D Sculpted Framing Studio */
let artBrushColor = '#ef4444';
let artBrushSize = 9;
let artRainbowMode = false;
let artRainbowHue = 0;
let artActiveStamp = null;
let artFrameStyle = 'gold';
let artFrameCustomHex = '#a855f7';
const hungCountBack = { umay: 0, yusuf: 0, deren: 0, elif: 0 };
const hungCountLeft = { umay: 0, yusuf: 0, deren: 0, elif: 0 };

function initWallArtCanvas() {
  const c = document.getElementById('wall-art-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = artBrushSize;
  let dr = false;
  let lastP = null;
  const pos = (e) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) }; };

  c.addEventListener('pointerdown', (e) => {
    const p = pos(e);
    if (artActiveStamp) {
      ctx.font = '38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(artActiveStamp, p.x, p.y);
      playSound('pop');
      return;
    }
    dr = true;
    lastP = p;
    ctx.lineWidth = artBrushSize;
    ctx.strokeStyle = artRainbowMode ? `hsl(${artRainbowHue}, 90%, 55%)` : artBrushColor;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
  });

  c.addEventListener('pointermove', (e) => {
    if (!dr || artActiveStamp) return;
    const p = pos(e);
    ctx.lineWidth = artBrushSize;
    if (artRainbowMode) {
      artRainbowHue = (artRainbowHue + 6) % 360;
      ctx.strokeStyle = `hsl(${artRainbowHue}, 90%, 55%)`;
    } else {
      ctx.strokeStyle = artBrushColor;
    }
    ctx.beginPath();
    if (lastP) ctx.moveTo(lastP.x, lastP.y);
    else ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastP = p;
  });

  window.addEventListener('pointerup', () => { dr = false; lastP = null; });
}

window.openPaintingModal = () => { playSound('pop'); document.getElementById('painting-modal').classList.remove('hidden'); };
window.closePaintingModal = () => document.getElementById('painting-modal').classList.add('hidden');

window.setArtBrush = (hex) => {
  artActiveStamp = null;
  if (hex === 'rainbow') {
    artRainbowMode = true;
  } else {
    artRainbowMode = false;
    artBrushColor = hex;
  }
  const rb = document.getElementById('art-rainbow-btn');
  if (rb) rb.classList.toggle('active', artRainbowMode);
  playSound('pop');
};

window.setArtBrushSize = (sz) => {
  artBrushSize = sz;
  artActiveStamp = null;
  playSound('pop');
};

window.selectArtStamp = (emoji) => {
  artActiveStamp = emoji;
  playSound('pop');
  if (emoji) speakText(`${emoji} çıkartması seçildi! Resmin üstüne dokunarak basabilirsin!`);
};

window.selectArtFrameStyle = (style, customHex) => {
  artFrameStyle = style;
  if (customHex) artFrameCustomHex = customHex;
  ['gold', 'pink', 'wood', 'rainbow', 'silver'].forEach(s => {
    const b = document.getElementById(`frame-btn-${s}`);
    if (b) b.classList.toggle('active', s === style);
  });
  const c = document.getElementById('wall-art-canvas');
  if (c) {
    const borderColors = {
      gold: '#d97706',
      pink: '#ec4899',
      wood: '#78350f',
      rainbow: '#8b5cf6',
      silver: '#94a3b8',
      custom: artFrameCustomHex
    };
    c.style.borderColor = borderColors[style] || '#d97706';
  }
  playSound('pop');
};

window.clearWallArtCanvas = () => {
  const c = document.getElementById('wall-art-canvas');
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fffdf7';
  ctx.fillRect(0, 0, c.width, c.height);
  playSound('pop');
};

function create3DFramedPaintingMesh(tex, frameStyle, customHex, withEasel = false) {
  const grp = new THREE.Group();
  const w = 2.6, h = 1.65, thick = 0.2, depth = 0.22;

  const styleMap = {
    gold:    { cols: [0xfacc15, 0xf59e0b, 0xfacc15, 0xf59e0b], corner: 0xfef08a, metal: 0.75, rough: 0.22 },
    pink:    { cols: [0xff4d94, 0xf472b6, 0xff4d94, 0xf472b6], corner: 0xfef08a, metal: 0.35, rough: 0.25 },
    wood:    { cols: [0x92400e, 0x78350f, 0x92400e, 0x78350f], corner: 0xd97706, metal: 0.1,  rough: 0.65 },
    rainbow: { cols: [0xef4444, 0x22c55e, 0x3b82f6, 0xfacc15], corner: 0xec4899, metal: 0.3,  rough: 0.25 },
    silver:  { cols: [0xe2e8f0, 0xcbd5e1, 0xe2e8f0, 0xcbd5e1], corner: 0x38bdf8, metal: 0.85, rough: 0.15 },
    custom:  { cols: [customHex, customHex, customHex, customHex], corner: 0xfacc15, metal: 0.35, rough: 0.3 }
  };
  const cfg = styleMap[frameStyle] || styleMap.gold;

  const frameBody = new THREE.Group();
  // 4 Sculpted 3D Frame Bars (Top, Bottom, Left, Right)
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(w + thick * 2, thick, depth), new THREE.MeshStandardMaterial({ color: cfg.cols[0], metalness: cfg.metal, roughness: cfg.rough }));
  topBar.position.set(0, h / 2 + thick / 2, 0);
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(w + thick * 2, thick, depth), new THREE.MeshStandardMaterial({ color: cfg.cols[1], metalness: cfg.metal, roughness: cfg.rough }));
  botBar.position.set(0, -h / 2 - thick / 2, 0);
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(thick, h, depth), new THREE.MeshStandardMaterial({ color: cfg.cols[2], metalness: cfg.metal, roughness: cfg.rough }));
  leftBar.position.set(-w / 2 - thick / 2, 0, 0);
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(thick, h, depth), new THREE.MeshStandardMaterial({ color: cfg.cols[3], metalness: cfg.metal, roughness: cfg.rough }));
  rightBar.position.set(w / 2 + thick / 2, 0, 0);

  // Decorative 3D Corner Gems / Ornaments
  const cornerMat = new THREE.MeshStandardMaterial({ color: cfg.corner, metalness: 0.7, roughness: 0.2 });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), cornerMat);
    gem.position.set(sx * (w / 2 + thick / 2), sy * (h / 2 + thick / 2), depth / 2 + 0.02);
    frameBody.add(gem);
  });

  // Canvas Backing & Artwork Plane
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  const artPlane = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, h - 0.06), new THREE.MeshBasicMaterial({ map: tex }));
  artPlane.position.z = 0.06;

  frameBody.add(topBar, botBar, leftBar, rightBar, backPanel, artPlane);

  if (withEasel) {
    const wood = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 8), wood); l1.position.set(-0.7, 1.45, 0.25); l1.rotation.z = -0.14;
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 8), wood); l2.position.set(0.7, 1.45, 0.25); l2.rotation.z = 0.14;
    const l3 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 8), wood); l3.position.set(0, 1.45, -0.6); l3.rotation.x = -0.32;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.25), wood); shelf.position.set(0, 1.15, 0.35);
    frameBody.position.set(0, 2.05, 0.26);
    frameBody.rotation.x = -0.14;
    frameBody.scale.set(0.85, 0.85, 0.85);
    grp.add(l1, l2, l3, shelf, frameBody);
  } else {
    grp.add(frameBody);
  }
  return grp;
}

window.hangPaintingOnCurrent3DRoom = () => {
  const c = document.getElementById('wall-art-canvas');
  const dataUrl = c.toDataURL('image/png');
  const targetHouseSel = document.getElementById('art-target-house')?.value || 'current';
  const targetWallSel = document.getElementById('art-target-wall')?.value || 'back';

  const targets = targetHouseSel === 'all'
    ? ['umay', 'yusuf', 'deren', 'elif']
    : [targetHouseSel === 'current' ? state.currentRoomOwner : targetHouseSel];

  targets.forEach(ow => {
    const tex = texLoader.load(dataUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    const isEasel = (targetWallSel === 'easel');
    const frameGrp = create3DFramedPaintingMesh(tex, artFrameStyle, artFrameCustomHex, isEasel);

    if (isEasel) {
      frameGrp.position.set((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 3);
      frameGrp.userData = { draggableRoomItem: true, name: '3D Çerçeveli Tablo (Şövale)' };
    } else if (targetWallSel === 'left') {
      const idx = hungCountLeft[ow]++;
      frameGrp.rotation.y = Math.PI / 2;
      frameGrp.position.set(-7.68, 4.9 - Math.floor(idx / 3) * 2.2, -4.0 + (idx % 3) * 3.4);
      frameGrp.userData = { draggableRoomItem: true, name: '3D Çerçeveli Duvar Tablosu' };
    } else {
      const idx = hungCountBack[ow]++;
      frameGrp.position.set(1.4 + (idx % 2) * 3.5, 5.1 - Math.floor(idx / 2) * 2.2, -6.68);
      frameGrp.userData = { draggableRoomItem: true, name: '3D Çerçeveli Duvar Tablosu' };
    }
    cousinRoomGroups[ow].add(frameGrp);
    draggableRoomObjects.push(frameGrp);
    selected3DRoomItem = frameGrp;
  });

  addStars(3);
  window.closePaintingModal();
  if (targetHouseSel !== 'all' && targetHouseSel !== 'current') {
    window.switch3DRoomOwner(targetHouseSel);
  }
  window.switchMode('rooms');
  playSound('win');
  spawnFloatingFX('🖼️');
  const msg = targetHouseSel === 'all'
    ? 'Harika! Çerçeveli tablon tüm 4 kuzenin 3 boyutlu evine asıldı! +3 Yıldız!'
    : `Harika! Çerçeveli tablon ${COUSINS[targets[0]].name}'ın 3 boyutlu evine asıldı! +3 Yıldız!`;
  speakText(msg);
};

/* ============================================================================
   7. SALON (HAND-PAINTED MAKEUP, HAIR, OUTFIT & PET DRESS-UP)
   ============================================================================ */
const SALON_COLORS = {
  hair:   ['#f59e0b', '#451a03', '#111827', '#ec4899', '#38bdf8', '#a855f7', '#dc2626', '#10b981'],
  makeup: ['#ff4d94', '#e11d48', '#fb7185', '#c084fc', '#f97316', '#38bdf8', '#22c55e', '#facc15'],
  outfit: ['#f5cf60', '#ff4d94', '#38bdf8', '#10b981', '#a855f7', '#ef4444'],
  acc:    ['#ff4d94', '#facc15', '#38bdf8', '#10b981', '#a855f7'],
  pet:    ['#9ca3af', '#ffffff', '#d97706', '#f472b6', '#a855f7', '#38bdf8']
};
// 4 COMPLETELY SEPARATE WARDROBES & MAKEUP KITS (One unique set per cousin!)
const COUSIN_WARDROBES = {
  umay: {
    hair: [
      { id: 'long', name: 'Umay Uzun Dalgalı Saç', emoji: '💇‍♀️', prop: 'hairStyle' },
      { id: 'bun', name: 'Umay Balo Topuzu', emoji: '👑', prop: 'hairStyle' },
      { id: 'pigtails', name: 'Umay İkili Örgü Topuz', emoji: '🎀', prop: 'hairStyle' }
    ],
    makeup: [
      { id: 'lip_pink', name: 'Umay Pembe Parlak Ruj', emoji: '💄', prop: 'lipColor', val: '#ff4d94' },
      { id: 'lip_red', name: 'Umay Yakut Kırmızı Ruj', emoji: '💋', prop: 'lipColor', val: '#e11d48' },
      { id: 'blush_pink', name: 'Umay Gül Allığı', emoji: '😊', prop: 'blushColor', val: '#fda4af' },
      { id: 'eye_pink', name: 'Umay Simli Pembe Far', emoji: '✨', prop: 'eyeShadow', val: '#f472b6' },
      { id: 'art_hearts', name: 'Umay Kalpli Yanak Süsü', emoji: '💖', prop: 'faceArt', val: 'hearts' }
    ],
    outfit: [
      { id: 'umay_sweater', name: 'Umay Sarı Trend Hunters Kazak', img: 'assets/umay/sweater.png', prop: 'outfit', special: true },
      { id: 'unicorn_dress', name: 'Umay Unicornlu Gökkuşağı Elbise', img: 'assets/sprites/unicorn.png', prop: 'outfit', special: true },
      { id: 'heart_dress', name: 'Umay Kalpli Prenses Elbisesi', img: 'assets/sprites/heart.png', prop: 'outfit' },
      { id: 'star_dress', name: 'Umay Yıldızlı Gece Elbisesi', img: 'assets/sprites/star.png', prop: 'outfit' },
      { id: 'flower_dress', name: 'Umay Çiçekli Bahar Elbisesi', img: 'assets/sprites/tulip.png', prop: 'outfit' },
      { id: 'umay_boots', name: 'Umay Hello Kitty Kürklü Bot', img: 'assets/umay/boots.png', prop: 'shoes', special: true }
    ],
    acc: [
      { id: 'umay_helmet', name: 'Umay Pembe Binici Kaskı', img: 'assets/umay/helmet.png', prop: 'acc', special: true },
      { id: 'crown', name: 'Umay Elmas Tacı', img: 'assets/sprites/crown.png', prop: 'acc' },
      { id: 'none', name: 'Şapkayı Çıkar', emoji: '🧹', prop: 'acc', val: 'none' }
    ]
  },
  yusuf: {
    hair: [
      { id: 'spiky', name: 'Yusuf Havalı Dik Saç', emoji: '⚡', prop: 'hairStyle', special: true },
      { id: 'curly', name: 'Yusuf Kıvırcık Saç', emoji: '🦱', prop: 'hairStyle' },
      { id: 'sidepart', name: 'Yusuf Yandan Ayrık Saç', emoji: '👦', prop: 'hairStyle' }
    ],
    makeup: [
      { id: 'art_lightning', name: 'Yusuf Şimşek Yüz Boyası', emoji: '⚡', prop: 'faceArt', val: 'lightning', special: true },
      { id: 'art_mustache', name: 'Yusuf Komik Çiftçi Bıyığı', emoji: '🥸', prop: 'faceArt', val: 'mustache', special: true },
      { id: 'lens_green', name: 'Yusuf Zümrüt Göz', emoji: '🟢', prop: 'eyeColor', val: '#10b981' },
      { id: 'art_stars', name: 'Yusuf Şampiyon Yıldızı', emoji: '⭐', prop: 'faceArt', val: 'stars' }
    ],
    outfit: [
      { id: 'farmer', name: 'Yusuf Yeşil Çiftçi Tulumu', img: 'assets/sprites/tractor.png', prop: 'outfit', special: true },
      { id: 'superhero', name: 'Yusuf Süper Kahraman Kostümü', img: 'assets/sprites/star.png', prop: 'outfit', special: true },
      { id: 'football', name: 'Yusuf 10 Numara Futbol Forması', img: 'assets/sprites/tshirt.png', prop: 'outfit' },
      { id: 'astronaut', name: 'Yusuf Uzay Astronot Kostümü', img: 'assets/sprites/sparkles.png', prop: 'outfit' },
      { id: 'knight', name: 'Yusuf Kale Şövalye Zırhı', img: 'assets/sprites/crown.png', prop: 'outfit' },
      { id: 'cowboy_boots', name: 'Yusuf Kahverengi Çiftlik Çizmesi', img: 'assets/sprites/jeans.png', prop: 'shoes', special: true }
    ],
    acc: [
      { id: 'cowboy_hat', name: 'Yusuf Kovboy & Çiftçi Şapkası', img: 'assets/sprites/sunflower.png', prop: 'acc', special: true },
      { id: 'none', name: 'Şapkayı Çıkar', emoji: '🧹', prop: 'acc', val: 'none' }
    ]
  },
  deren: {
    hair: [
      { id: 'pigtails', name: 'Deren Minik İki Topuz', emoji: '🎀', prop: 'hairStyle', special: true },
      { id: 'long', name: 'Deren İpek Saçlar', emoji: '👧', prop: 'hairStyle' }
    ],
    makeup: [
      { id: 'blush_pink', name: 'Deren Şeker Allık', emoji: '🌸', prop: 'blushColor', val: '#f9a8d4' },
      { id: 'lip_pink', name: 'Deren Çilekli Dudak Kremi', emoji: '🍓', prop: 'lipColor', val: '#fb7185' },
      { id: 'eye_purple', name: 'Deren Mor Peri Farı', emoji: '💜', prop: 'eyeShadow', val: '#c084fc' },
      { id: 'art_hearts', name: 'Deren Kalp Çıkartması', emoji: '💖', prop: 'faceArt', val: 'hearts' }
    ],
    outfit: [
      { id: 'princess', name: 'Deren Mor Prenses Tütü', img: 'assets/sprites/dress.png', prop: 'outfit', special: true },
      { id: 'unicorn_dress', name: 'Deren Unicornlu Pembe Elbise', img: 'assets/sprites/unicorn.png', prop: 'outfit', special: true },
      { id: 'heart_dress', name: 'Deren Kalpli Bebek Elbisesi', img: 'assets/sprites/heart.png', prop: 'outfit' },
      { id: 'flower_dress', name: 'Deren Çiçekli Tulum', img: 'assets/sprites/tulip.png', prop: 'outfit' },
      { id: 'umay_boots', name: 'Deren Kurdeleli Patik Bot', img: 'assets/umay/boots.png', prop: 'shoes' }
    ],
    acc: [
      { id: 'crown', name: 'Deren Minik Peri Tacı', img: 'assets/sprites/crown.png', prop: 'acc', special: true },
      { id: 'none', name: 'Tacını Çıkar', emoji: '🧹', prop: 'acc', val: 'none' }
    ]
  },
  elif: {
    hair: [
      { id: 'bun', name: 'Elif Unicorn Topuzu', emoji: '🦄', prop: 'hairStyle', special: true },
      { id: 'pigtails', name: 'Elif Gökkuşağı Topuzu', emoji: '🌈', prop: 'hairStyle' }
    ],
    makeup: [
      { id: 'eye_blue', name: 'Elif Gökkuşağı Mavi Far', emoji: '💎', prop: 'eyeShadow', val: '#38bdf8' },
      { id: 'lip_coral', name: 'Elif Şeftali Dudak Parlatıcı', emoji: '🍑', prop: 'lipColor', val: '#fb923c' },
      { id: 'art_stars', name: 'Elif Parlak Yıldız Süsü', emoji: '⭐', prop: 'faceArt', val: 'stars', special: true },
      { id: 'blush_peach', name: 'Elif Papatya Allığı', emoji: '🌼', prop: 'blushColor', val: '#fbcfe8' }
    ],
    outfit: [
      { id: 'unicorn_dress', name: 'Elif Gökkuşağı Unicorn Elbise', img: 'assets/sprites/unicorn.png', prop: 'outfit', special: true },
      { id: 'star_dress', name: 'Elif Yıldızlı Prenses Elbisesi', img: 'assets/sprites/star.png', prop: 'outfit', special: true },
      { id: 'flower_dress', name: 'Elif Papatyalı Sarı Elbise', img: 'assets/sprites/sunflower.png', prop: 'outfit' },
      { id: 'heart_dress', name: 'Elif Kalpli Pembe Elbise', img: 'assets/sprites/heart.png', prop: 'outfit' },
      { id: 'umay_boots', name: 'Elif Yıldızlı Kış Botu', img: 'assets/umay/boots.png', prop: 'shoes' }
    ],
    acc: [
      { id: 'crown', name: 'Elif Altın Yıldız Tacı', img: 'assets/sprites/crown.png', prop: 'acc', special: true },
      { id: 'none', name: 'Tacını Çıkar', emoji: '🧹', prop: 'acc', val: 'none' }
    ]
  }
};

// EXPAND UMAY & YUSUF WARDROBES TO 110+ WELL-FITTED 3D OUTFITS WITH RICH COLOR OPTIONS!
const CUSTOM_OUTFIT_REGISTRY = {};
(() => {
  const umayStyles = [
    { key: 'ballet',   label: 'Bale Tütü Elbise',      img: 'assets/sprites/dress.png',    isDress: true,  print: 'assets/sprites/heart.png' },
    { key: 'unicorn',  label: 'Unicorn Prenses Elbise',img: 'assets/sprites/unicorn.png',  isDress: true,  print: 'assets/sprites/unicorn.png', tutu: true },
    { key: 'starry',   label: 'Yıldızlı Gece Elbise',  img: 'assets/sprites/star.png',     isDress: true,  print: 'assets/sprites/star.png' },
    { key: 'flower',   label: 'Çiçekli Bahar Elbise',  img: 'assets/sprites/tulip.png',    isDress: true,  print: 'assets/sprites/tulip.png' },
    { key: 'royal',    label: 'Kraliyet Balo Elbise',  img: 'assets/sprites/crown.png',    isDress: true,  print: 'assets/sprites/crown.png', tutu: true },
    { key: 'sweater',  label: 'Trend Kazak & Kot',     img: 'assets/umay/sweater.png',     isDress: false, print: 'assets/umay/sweater_chest.png' },
    { key: 'sparkle',  label: 'Simli Parti Elbisesi',  img: 'assets/sprites/sparkles.png', isDress: true,  print: 'assets/sprites/sparkles.png' }
  ];
  const umayColors = [
    { key: 'pink',     name: 'Pembe',      top: '#ff4d94', skirt: '#f472b6' },
    { key: 'purple',   name: 'Mor',        top: '#a855f7', skirt: '#c084fc' },
    { key: 'sky',      name: 'Gök Mavisi', top: '#38bdf8', skirt: '#7dd3fc' },
    { key: 'gold',     name: 'Altın Sarı', top: '#facc15', skirt: '#fde047' },
    { key: 'mint',     name: 'Su Yeşili',  top: '#34d399', skirt: '#6ee7b7' },
    { key: 'coral',    name: 'Mercan',     top: '#fb7185', skirt: '#fda4af' },
    { key: 'lavender', name: 'Lila',       top: '#8b5cf6', skirt: '#ddd6fe' },
    { key: 'ruby',     name: 'Yakut',      top: '#e11d48', skirt: '#fb7185' }
  ];
  umayStyles.forEach(st => {
    umayColors.forEach(c => {
      const id = `umay_${st.key}_${c.key}`;
      CUSTOM_OUTFIT_REGISTRY[id] = { top: c.top, skirt: c.skirt, isDress: st.isDress, tutu: !!st.tutu, print: st.print, pants: '#1d4ed8' };
      COUSIN_WARDROBES.umay.outfit.push({ id, name: `${c.name} ${st.label}`, img: st.img, prop: 'outfit', tint: c.top });
    });
  });

  const yusufStyles = [
    { key: 'hero',     label: 'Süper Kahraman Zırhı',  img: 'assets/sprites/star.png',     print: 'assets/sprites/star.png',     cape: true,  pants: '#1e293b' },
    { key: 'football', label: '10 Numara Forma',       img: 'assets/sprites/tshirt.png',   print: 'assets/sprites/star.png',     cape: false, pants: '#0f172a' },
    { key: 'racer',    label: 'Yarış Pilotu Tulumu',   img: 'assets/sprites/tractor.png',  print: 'assets/sprites/sparkles.png', cape: false, pants: '#1e293b' },
    { key: 'knight',   label: 'Şövalye Zırhı',         img: 'assets/sprites/crown.png',    print: 'assets/sprites/crown.png',    cape: true,  pants: '#475569', metal: true },
    { key: 'astro',    label: 'Uzay Astronot Takımı',  img: 'assets/sprites/sparkles.png', print: 'assets/sprites/sparkles.png', cape: false, pants: '#e2e8f0' },
    { key: 'hoodie',   label: 'Havalı Kapüşonlu',      img: 'assets/sprites/tshirt.png',   print: 'assets/sprites/heart.png',    cape: false, pants: '#1d4ed8' },
    { key: 'farmer',   label: 'Çiftlik Kaptan Tulumu', img: 'assets/sprites/tractor.png',  print: 'assets/sprites/sunflower.png',cape: false, pants: '#1e3a8a' }
  ];
  const yusufColors = [
    { key: 'green',  name: 'Zümrüt Yeşil', top: '#10b981', capeCol: '#facc15' },
    { key: 'blue',   name: 'Kral Mavi',    top: '#2563eb', capeCol: '#ef4444' },
    { key: 'red',    name: 'Ateş Kırmızı', top: '#dc2626', capeCol: '#facc15' },
    { key: 'orange', name: 'Turuncu',      top: '#f97316', capeCol: '#0f172a' },
    { key: 'navy',   name: 'Lacivert',     top: '#1e3a8a', capeCol: '#38bdf8' },
    { key: 'gold',   name: 'Altın',        top: '#eab308', capeCol: '#dc2626' },
    { key: 'cyan',   name: 'Turkuaz',      top: '#06b6d4', capeCol: '#1e293b' },
    { key: 'black',  name: 'Siyah Gece',   top: '#1e293b', capeCol: '#ef4444' }
  ];
  yusufStyles.forEach(st => {
    yusufColors.forEach(c => {
      const id = `yusuf_${st.key}_${c.key}`;
      CUSTOM_OUTFIT_REGISTRY[id] = { top: c.top, isDress: false, cape: st.cape, capeCol: c.capeCol, print: st.print, pants: st.pants, metal: !!st.metal };
      COUSIN_WARDROBES.yusuf.outfit.push({ id, name: `${c.name} ${st.label}`, img: st.img, prop: 'outfit', tint: c.top });
    });
  });
})();

const SHARED_PET_CATALOG = [
  { id: 'pet_pony', name: '3D Midilli Atı', img: 'assets/umay/pony.png', prop: 'petType', val: 'pony', special: true },
  { id: 'pet_cow', name: '3D Benekli İnek', img: 'assets/sprites/cow.png', prop: 'petType', val: 'cow', special: true },
  { id: 'pet_dog', name: '3D Koruyucu Köpek', img: 'assets/sprites/dog.png', prop: 'petType', val: 'dog' },
  { id: 'pet_cat', name: '3D Pamuk Kedi', img: 'assets/sprites/cat.png', prop: 'petType', val: 'cat' },
  { id: 'phat_crown', name: 'Canlıya Taç Tak', img: 'assets/sprites/crown.png', prop: 'petHat', val: 'crown' },
  { id: 'phat_cowboy', name: 'Canlıya Şapka', emoji: '🤠', prop: 'petHat', val: 'cowboy_hat' },
  { id: 'pout_sweater', name: 'Canlıya Sarı Kazak', img: 'assets/umay/sweater.png', prop: 'petOutfit', val: 'yellow_sweater', special: true },
  { id: 'pout_saddle', name: 'Canlıya Pembe Eyer', emoji: '🌸', prop: 'petOutfit', val: 'pink_saddle' }
];

function createFitted3DCharacter(charId, cfg, withCompanionPet = true) {
  const root = new THREE.Group();
  const isBoy = charId === 'yusuf';
  const scale = (charId === 'deren' || charId === 'elif') ? 0.88 : 1.0;
  const charGrp = new THREE.Group();
  charGrp.scale.set(scale, scale, scale);
  if (withCompanionPet) charGrp.position.x = -0.75;

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffe4c4, roughness: 0.42 });
  const customOut = CUSTOM_OUTFIT_REGISTRY[cfg.outfit] || null;
  const wearingDress = customOut ? !!customOut.isDress : ['princess', 'unicorn_dress', 'heart_dress', 'star_dress', 'flower_dress'].includes(cfg.outfit);
  const legColor = wearingDress ? 0xffe4c4 : (customOut ? customOut.pants : (cfg.outfit === 'astronaut' ? 0xf8fafc : (cfg.outfit === 'knight' ? 0x64748b : 0x1d4ed8)));
  const legMat = new THREE.MeshStandardMaterial({ color: legColor });

  [-0.38, 0.38].forEach(lx => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 1.45, 18), legMat);
    leg.position.set(lx, 1.15, 0); charGrp.add(leg);
    const bootMat = new THREE.MeshStandardMaterial({ color: cfg.shoes === 'umay_boots' ? 0x111827 : 0x78350f, roughness: 0.15 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.23, 0.62, 18), bootMat);
    shaft.position.set(lx, 0.48, 0);
    const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.32, 10, 14), bootMat);
    foot.rotation.x = Math.PI / 2; foot.position.set(lx, 0.22, 0.12);
    charGrp.add(shaft, foot);
  });

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.58, 0.45, 20), legMat);
  pelvis.position.y = 1.75; charGrp.add(pelvis);

  const outfitColors = {
    umay_sweater: 0xf5cf60, princess: 0xff4d94, unicorn_dress: 0xc084fc,
    heart_dress: 0xf43f5e, star_dress: 0x3b82f6, flower_dress: 0xfacc15,
    farmer: 0x16a34a, superhero: 0xdc2626, football: 0x2563eb, astronaut: 0xf8fafc, knight: 0x94a3b8
  };
  const isMetallic = (cfg.outfit === 'knight' || (customOut && customOut.metal));
  const outfitMat = new THREE.MeshStandardMaterial({
    color: customOut ? customOut.top : (outfitColors[cfg.outfit] || 0xf5cf60),
    roughness: isMetallic ? 0.2 : 0.48,
    metalness: isMetallic ? 0.6 : 0.06
  });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.68, 1.55, 24), outfitMat);
  torso.position.y = 2.62; torso.castShadow = true;
  charGrp.add(torso);

  // Visible Curved 3D Picture Print on Chest (Unicorn, Heart, Star, Flower, Umay's Sweater, Heroes!)
  const chestPrintMap = {
    umay_sweater:  'assets/umay/sweater_chest.png',
    unicorn_dress: 'assets/sprites/unicorn.png',
    heart_dress:   'assets/sprites/heart.png',
    star_dress:    'assets/sprites/star.png',
    flower_dress:  'assets/sprites/tulip.png',
    superhero:     'assets/sprites/star.png',
    astronaut:     'assets/sprites/sparkles.png',
    knight:        'assets/sprites/crown.png'
  };
  const printUrl = (customOut && customOut.print) || chestPrintMap[cfg.outfit];
  if (printUrl) {
    const isWide = (cfg.outfit === 'umay_sweater' || printUrl.includes('sweater_chest'));
    const chestDecal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.69, isWide ? 0.58 : 0.82, 22, 1, true, isWide ? -0.62 : -0.52, isWide ? 1.24 : 1.04),
      new THREE.MeshBasicMaterial({ map: getTex(printUrl), transparent: true })
    );
    chestDecal.position.y = 2.74;
    charGrp.add(chestDecal);
  }
  if (wearingDress) {
    const skCol = customOut ? customOut.skirt : (cfg.outfit === 'unicorn_dress' ? 0x38bdf8 : (cfg.outfit === 'heart_dress' ? 0xfb7185 : (cfg.outfit === 'star_dress' ? 0x6366f1 : (cfg.outfit === 'flower_dress' ? 0x4ade80 : 0xff4d94))));
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 1.42, 1.15, 24), new THREE.MeshStandardMaterial({ color: skCol, roughness: 0.35 }));
    sk.position.y = 1.45; charGrp.add(sk);
    if (cfg.outfit === 'unicorn_dress' || (customOut && customOut.tutu)) {
      const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.56, 0.32, 24), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 }));
      tier2.position.y = 0.88; charGrp.add(tier2);
    }
  }
  if (cfg.outfit === 'superhero' || (customOut && customOut.cape)) {
    const cape = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 1.9, 0.1),
      new THREE.MeshStandardMaterial({ color: (customOut && customOut.capeCol) ? customOut.capeCol : 0xfacc15, roughness: 0.4 })
    );
    cape.position.set(0, 2.25, -0.75); cape.rotation.x = 0.16;
    charGrp.add(cape);
  }

  [-0.78, 0.78].forEach((ax, idx) => {
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.92, 10, 14), outfitMat);
    sleeve.position.set(ax, 2.65, 0); sleeve.rotation.z = idx === 0 ? 0.22 : -0.22;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), skinMat);
    hand.position.set(ax * 1.15, 2.02, 0);
    charGrp.add(sleeve, hand);
  });

  const headY = 4.38, headR = 0.88;
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 28, 28), skinMat);
  head.position.y = headY; head.castShadow = true; head.userData = { salonPaintZone: 'face' };
  charGrp.add(head);

  [-0.31, 0.31].forEach(ex => {
    const eShadow = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 14), new THREE.MeshStandardMaterial({ color: (cfg.eyeShadow && cfg.eyeShadow !== 'none') ? cfg.eyeShadow : 0xffe4c4 }));
    eShadow.position.set(ex, headY + 0.11, 0.74); eShadow.scale.set(1.2, 0.85, 0.45); eShadow.userData = { salonPaintZone: 'eyeshadow' };
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    sclera.position.set(ex, headY + 0.04, 0.76); sclera.scale.set(1.1, 1.0, 0.55);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), new THREE.MeshBasicMaterial({ color: cfg.eyeColor || '#2563eb' }));
    iris.position.set(ex, headY + 0.04, 0.83); iris.scale.set(1.0, 1.0, 0.5);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color: 0x111827 }));
    pupil.position.set(ex, headY + 0.04, 0.86);
    charGrp.add(eShadow, sclera, iris, pupil);
  });

  [-0.48, 0.48].forEach(bx => {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), new THREE.MeshBasicMaterial({ color: (cfg.blushColor && cfg.blushColor !== 'none') ? cfg.blushColor : 0xffe4c4, transparent: true, opacity: (cfg.blushColor && cfg.blushColor !== 'none') ? 0.6 : 0.15 }));
    blush.position.set(bx, headY - 0.14, 0.72); blush.scale.set(1.2, 0.8, 0.35); blush.userData = { salonPaintZone: 'blush' };
    charGrp.add(blush);
  });

  const lips = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.055, 10, 20, Math.PI), new THREE.MeshStandardMaterial({ color: cfg.lipColor || '#ff4d94' }));
  lips.rotation.x = Math.PI + 0.15; lips.position.set(0, headY - 0.24, 0.83); lips.userData = { salonPaintZone: 'lips' };
  charGrp.add(lips);

  const makeHairMat = () => new THREE.MeshStandardMaterial({ color: cfg.hairColor || '#f59e0b', roughness: 0.42 });
  const scalp = new THREE.Mesh(new THREE.SphereGeometry(headR + 0.04, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.62), makeHairMat());
  scalp.position.y = headY + 0.02; scalp.rotation.x = -0.35; scalp.userData = { salonPaintZone: 'hair_strand' };
  charGrp.add(scalp);

  if (cfg.hairStyle === 'long') {
    [-0.68, 0.68].forEach(sx => {
      const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.35, 10, 14), makeHairMat());
      l.position.set(sx, headY - 0.55, 0.08); l.userData = { salonPaintZone: 'hair_strand' }; charGrp.add(l);
    });
  } else if (cfg.hairStyle === 'spiky') {
    for (let i = -2; i <= 2; i++) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.62, 10), makeHairMat());
      sp.position.set(i * 0.25, headY + 0.92, 0.15); sp.rotation.z = -i * 0.22; sp.userData = { salonPaintZone: 'hair_strand' };
      charGrp.add(sp);
    }
  } else if (cfg.hairStyle === 'pigtails') {
    [-1.02, 1.02].forEach(px => {
      const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.6, 10, 14), makeHairMat());
      p.position.set(px, headY + 0.05, -0.1); p.userData = { salonPaintZone: 'hair_strand' }; charGrp.add(p);
    });
  } else if (cfg.hairStyle === 'bun') {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 20), makeHairMat());
    b.position.set(0, headY + 1.12, -0.15); b.userData = { salonPaintZone: 'hair_strand' }; charGrp.add(b);
  }

  if (cfg.acc === 'umay_helmet') {
    const hMat = new THREE.MeshStandardMaterial({ color: 0xff5d9e, roughness: 0.2 });
    const hDome = new THREE.Mesh(new THREE.SphereGeometry(headR + 0.08, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.45), hMat);
    hDome.position.y = headY + 0.14; hDome.rotation.x = -0.15;
    charGrp.add(hDome);
  } else if (cfg.acc === 'crown') {
    const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.4, 0.38, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, side: THREE.DoubleSide }));
    cr.position.set(0, headY + 0.96, 0.05); charGrp.add(cr);
  } else if (cfg.acc === 'cowboy_hat') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0x92400e }));
    brim.position.set(0, headY + 0.68, 0);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.58, 20), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    top.position.set(0, headY + 0.98, 0); charGrp.add(brim, top);
  }

  root.add(charGrp);
  if (withCompanionPet) {
    const petMesh = create3DCompanionPetMesh(cfg.petType || 'pony', cfg);
    petMesh.position.set(1.45, 0, 0.15); petMesh.rotation.y = -0.35;
    root.add(petMesh);
  }
  return root;
}

function build3DSalonStudio() {
  const g = worldGroups.salon;
  const p1 = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0xfbcfe8 })); p1.position.y = -0.25;
  const p2 = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.3, 32), new THREE.MeshStandardMaterial({ color: 0xffffff })); p2.position.y = 0.15;
  const arch = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.24, 14, 40, Math.PI), new THREE.MeshStandardMaterial({ color: 0xff4d94 })); arch.position.set(0, 0.2, -2.6);
  g.add(p1, p2, arch);
  salonCharacterRoot = new THREE.Group(); salonCharacterRoot.position.y = 0.3; g.add(salonCharacterRoot);
  rebuild3DSalonCharacter(); renderSalonUI();
}

function rebuild3DSalonCharacter() {
  if (!salonCharacterRoot) return;
  while (salonCharacterRoot.children.length > 0) salonCharacterRoot.remove(salonCharacterRoot.children[0]);
  salonCharacterRoot.add(createFitted3DCharacter(state.salonChar, state.salonConfigs[state.salonChar], true));
}

function renderSalonUI() {
  const names = { umay: '👧 Umay', yusuf: '👦 Yusuf', deren: '👶 Deren', elif: '🦄 Elif' };
  ['umay','yusuf','deren','elif'].forEach(cid => {
    const el = document.getElementById(`salon-char-${cid}`);
    if (!el) return;
    const isMine = (cid === state.currentPlayer);
    el.classList.toggle('active', state.salonChar === cid);
    el.textContent = isMine ? names[cid] : `🔒 ${COUSINS[cid].name}`;
    el.style.opacity = isMine ? '1' : '0.55';
  });
  const swBox = document.getElementById('salon-color-swatches');
  swBox.innerHTML = '';
  (SALON_COLORS[state.salonTab] || SALON_COLORS.hair).forEach(hex => {
    const sw = document.createElement('div');
    sw.className = `color-swatch ${state.activeSalonBrushColor === hex ? 'active' : ''}`;
    sw.style.background = hex;
    sw.onclick = () => {
      playSound('pop'); state.activeSalonBrushColor = hex;
      if (state.salonTab === 'pet') { state.salonConfigs[state.salonChar].petColor = hex; rebuild3DSalonCharacter(); }
      renderSalonUI();
    };
    swBox.appendChild(sw);
  });
  const grid = document.getElementById('salon-items-grid');
  grid.innerHTML = '';
  const wardrobe = COUSIN_WARDROBES[state.salonChar] || COUSIN_WARDROBES.umay;
  const items = state.salonTab === 'pet' ? SHARED_PET_CATALOG : (wardrobe[state.salonTab] || []);
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = `item-card ${item.special ? 'special' : ''}`;
    card.innerHTML = `${item.img ? `<img src="${item.img}" />` : `<span class="emoji-icon">${item.emoji}</span>`}<span class="title">${item.name}</span>`;
    card.onclick = () => {
      playSound('pop');
      const cfg = state.salonConfigs[state.salonChar];
      cfg[item.prop] = item.val !== undefined ? item.val : item.id;
      rebuild3DSalonCharacter();
      if (state.salonChar === state.currentPlayer) buildExplorerRig();
    };
    grid.appendChild(card);
  });
}

window.selectStarterPet = (petType) => {
  state.starterPet = petType;
  ['pony','cow','dog','cat'].forEach(p => {
    const el = document.getElementById(`start-pet-${p}`);
    if (el) el.classList.toggle('active', p === petType);
  });
  Object.values(state.salonConfigs).forEach(c => c.petType = petType);
  playSound('pop');
};
window.switchSalonModel = (cid, force = false) => {
  // Strict Privacy Rule: Each cousin can ONLY dress up & make up their OWN character!
  if (!force && cid !== state.currentPlayer) {
    playSound('pop');
    speakText(`Burası kilitli! Her kuzen sadece kendi karakterini giydirebilir! ${COUSINS[cid].name} kendi girişini yapınca giyinebilir.`);
    return;
  }
  state.salonChar = cid; playSound('pop'); rebuild3DSalonCharacter(); renderSalonUI();
};
window.switchSalonTab = (tab, btn) => {
  state.salonTab = tab;
  document.querySelectorAll('#salon-cat-tabs .tab-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  playSound('pop'); renderSalonUI();
};
window.focusSalonCamera = (v) => {
  playSound('pop');
  if (v === 'face') { camera.position.set(-1.5, 4.5, 4.8); controls.target.set(-1.4, 4.3, 0); }
  else if (v === 'pet') { camera.position.set(0.4, 2.5, 6.2); controls.target.set(0.4, 1.5, 0); }
  else { camera.position.set(-1.1, 3.3, 10.5); controls.target.set(-1.0, 2.7, 0); }
  controls.update();
};
window.animateSalonModel = () => { playSound('win'); salonDanceTimer = 95; };

/* ============================================================================
   8. 3D FARM (FOR ALL 4 COUSINS + DECORATIONS + BEAR DEFENSE + HAND-CARRYING!)
   ============================================================================ */
let farmPastureMat = null;
const draggableFarmObjects = [];
let selectedFarmDragItem = null;

function canEditFarm(announce = true) {
  if (state.currentPlayer === 'yusuf') return true;
  if (state.currentPlayer === 'umay' && state.farmUmayInvited) return true;
  if (announce) {
    playSound('moo');
    speakText('Çiftliği sadece Yusuf veya Yusuf\'un çağırdığı Umay düzenleyebilir!');
    const st = document.getElementById('farm-active-tool-text');
    if (st) st.textContent = '🔒 Çiftliği sadece Yusuf (veya Yusuf\'un çağırdığı Umay) düzenleyebilir!';
  }
  return false;
}

window.toggleFarmDragMode = function() {
  if (!canEditFarm(true)) return;
  state.farmDragMode = !state.farmDragMode;
  const b = document.getElementById('farm-drag-toggle');
  if (b) {
    b.textContent = state.farmDragMode ? '✋ Sürükle-Bırak: AÇIK' : '✋ Sürükle-Bırak: Kapalı';
    b.classList.toggle('active', state.farmDragMode);
  }
  playSound('pop');
};

window.manipulateSelectedFarmItem = function(action) {
  if (!canEditFarm(true)) return;
  if (!selectedFarmDragItem) {
    speakText('Önce düzenlemek istediğin çiftlik eşyasına dokun!');
    return;
  }
  playSound('pop');
  if (action === 'rotate') {
    selectedFarmDragItem.rotation.y += Math.PI / 6;
  } else if (action === 'delete') {
    if (selectedFarmDragItem.parent) selectedFarmDragItem.parent.remove(selectedFarmDragItem);
    const di = draggableFarmObjects.indexOf(selectedFarmDragItem);
    if (di >= 0) draggableFarmObjects.splice(di, 1);
    const ai = farmAnimalMeshes.indexOf(selectedFarmDragItem);
    if (ai >= 0) farmAnimalMeshes.splice(ai, 1);
    const dogi = farmDogMeshes.indexOf(selectedFarmDragItem);
    if (dogi >= 0) farmDogMeshes.splice(dogi, 1);
    selectedFarmDragItem = null;
  }
};

window.inviteUmayToEditFarm = function() {
  if (state.currentPlayer !== 'yusuf') {
    playSound('moo');
    speakText('Umay\'ı çiftliği düzenlemeye sadece çiftliğin sahibi Yusuf çağırabilir!');
    return;
  }
  state.farmUmayInvited = true;
  state.unlockedForAll['yusuf-farm'] = true;
  sendMultiplayerSync({ type: 'farm_invite_umay', allowed: true });
  window.requestCousinHelp('umay', 'Yusuf seni 3D çiftliğe çağırdı! Gel ve sürükle-bırak ile çiftliğin her tarafını birlikte düzenleyelim!', 'yusuf-farm');
};
const FARM_3D_TOOLS = [
  { id: 'love',  name: 'Sev & Okşa',  icon: 'assets/sprites/heart.png' },
  { id: 'feed',  name: 'Ot Yedir',    icon: 'assets/sprites/corn.png' },
  { id: 'water', name: 'Su İçir',     icon: 'assets/sprites/bucket.png' },
  { id: 'wash',  name: 'Köpürt Yıka', icon: 'assets/sprites/sponge.png' },
  { id: 'milk',  name: 'Süt Sağ',     icon: 'assets/sprites/milk.png' }
];
const FARM_3D_DECOR = [
  { name: '+1 3D İnek',         icon: 'assets/sprites/cow.png',       act: () => window.spawn3DFarmAnimal('cow') },
  { name: '+1 Koruyucu Köpek',  icon: 'assets/sprites/dog.png',       act: () => window.spawn3DFarmAnimal('dog') },
  { name: '+1 3D Midilli',      icon: 'assets/umay/pony.png',         act: () => window.spawn3DFarmAnimal('pony') },
  { name: '+1 3D Çiçek Kemeri', icon: 'assets/sprites/tulip.png',     act: () => addFarmOrnament('arch') },
  { name: '+1 3D Fener & Balon',icon: 'assets/sprites/balloon.png',   act: () => addFarmOrnament('lantern') },
  { name: '+1 3D Rüzgar Gülü',  icon: 'assets/sprites/sunflower.png', act: () => addFarmOrnament('windmill') },
  { name: '+1 3D Piknik Masası',icon: 'assets/sprites/chair.png',     act: () => addFarmOrnament('picnic') },
  { name: '+1 3D Gölet',        icon: 'assets/sprites/water.png',     act: () => addFarmOrnament('pond') }
];

function addFarmOrnament(type) {
  if (!canEditFarm(true)) return;
  const g = worldGroups['yusuf-farm'];
  const rx = (Math.random() - 0.5) * 14, rz = (Math.random() - 0.5) * 10;
  const grp = new THREE.Group(); grp.position.set(rx, 0, rz);
  if (type === 'arch') {
    const a = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.25, 10, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf472b6 }));
    a.position.y = 0.2; grp.add(a);
  } else if (type === 'lantern') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.0, 10), new THREE.MeshStandardMaterial({ color: 0x334155 })); pole.position.y = 1.5;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfef08a })); bulb.position.y = 3.1;
    grp.add(pole, bulb);
  } else if (type === 'windmill') {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 3.6, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc })); tower.position.y = 1.8;
    const blades = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.25, 0.12), new THREE.MeshStandardMaterial({ color: 0xef4444 })); blades.position.set(0, 3.4, 0.4);
    grp.add(tower, blades);
  } else if (type === 'picnic') {
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 1.4), new THREE.MeshStandardMaterial({ color: 0xb45309 })); top.position.y = 1.0;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.8), new THREE.MeshStandardMaterial({ color: 0x92400e })); leg.position.y = 0.5;
    grp.add(top, leg);
  } else if (type === 'pond') {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 })); p.position.y = 0.06;
    grp.add(p);
  }
  g.add(grp);
  draggableFarmObjects.push(grp);
  selectedFarmDragItem = grp;
  playSound('win');
  speakText('Çiftliğe yeni 3 boyutlu süsleme eklendi! Parmağınla sürükleyip istediğin yere koyabilirsin!');
}

let farmWaterWell = null;
const farmFruitTrees = [];
let activeProximityZone = null; // { type: 'water' | 'field' | 'tree', target }

function create3DWaterWell() {
  const well = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.9, 20), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }));
  base.position.y = 0.45;
  const waterDisk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 20), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 }));
  waterDisk.position.y = 0.85;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.1, 4), new THREE.MeshStandardMaterial({ color: 0x92400e }));
  roof.position.y = 2.9; roof.rotation.y = Math.PI / 4;
  [-1.0, 1.0].forEach(px => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.0, 8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    post.position.set(px, 1.6, 0); well.add(post);
  });
  const lbl = create3DTextLabel('💧 Su Kuyusu (Yaklaş!)', '#0284c7');
  lbl.position.y = 4.0;
  well.add(base, waterDisk, roof, lbl);
  return well;
}

function create3DFruitTree(x, z) {
  const tree = create3DTree();
  tree.position.set(x, 0, z);
  const fruits = new THREE.Group();
  fruits.name = 'fruits_group';
  [[-0.7, 2.3, 0.8], [0.7, 2.5, 0.7], [0.0, 2.0, 1.0], [-0.5, 3.0, -0.5], [0.6, 2.1, -0.7]].forEach(([fx, fy, fz]) => {
    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 }));
    apple.position.set(fx, fy, fz);
    fruits.add(apple);
  });
  const lbl = create3DTextLabel('🍎 Meyve Ağacı', '#dc2626');
  lbl.position.y = 4.2;
  tree.add(fruits, lbl);
  tree.userData = { hasFruit: true };
  return tree;
}

window.plantFruitTree3D = function() {
  if (!canEditFarm(true)) return;
  const x = -5.5 + Math.random() * 10;
  const z = -4.5 + Math.random() * 8;
  const tree = create3DFruitTree(x, z);
  worldGroups['yusuf-farm'].add(tree);
  farmFruitTrees.push(tree);
  draggableFarmObjects.push(tree);
  selectedFarmDragItem = tree;
  playSound('win');
  speakText('Yeni bir 3 boyutlu meyve ağacı diktin! Sürükleyip istediğin yere koyabilirsin!');
};

window.mountTractorAndPlow = function() {
  if (!explorerRig || !farmTractorMesh) return;
  state.mountMode = 'tractor';
  tractorDriving = true;
  tractorAngle = 0;
  playSound('win');
  window.plowAndGrow3DField();
  speakText(`${COUSINS[state.currentPlayer].name} 3 boyutlu traktöre bindi ve tarlayı kendi sürüyor!`);
};

window.executeFarmProximityAction = function() {
  if (!activeProximityZone) return;
  if (activeProximityZone.type === 'water') {
    window.carryItemInHand('water');
    playSound('water');
    spawnFloatingFX('🪣');
    speakText('Su kuyusundan kovanı ağzına kadar doldurdun! Şimdi hayvanların yanına götür!');
  } else if (activeProximityZone.type === 'field') {
    window.mountTractorAndPlow();
  } else if (activeProximityZone.type === 'tree') {
    const tree = activeProximityZone.target;
    const fg = tree.getObjectByName('fruits_group');
    if (fg && tree.userData.hasFruit) {
      fg.visible = false;
      tree.userData.hasFruit = false;
      state.inventory.apple += 3;
      addStars(3);
      playSound('win');
      spawnFloatingFX('🍎');
      speakText('Harika! Ağaçtan 3 taze elma topladın! Birazdan yeni elmalar yetişecek!');
      setTimeout(() => { fg.visible = true; tree.userData.hasFruit = true; }, 8000);
    } else {
      speakText('Bu ağaçtaki elmalar yeni yetişiyor, biraz bekle!');
    }
  }
};

function build3DYusufFarm() {
  const g = worldGroups['yusuf-farm'];
  farmPastureMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.8 });
  const pasture = new THREE.Mesh(new THREE.BoxGeometry(28, 0.5, 24), farmPastureMat);
  pasture.position.y = -0.25; pasture.receiveShadow = true;
  g.add(pasture);

  // Red Barn (Draggable!)
  const barn = new THREE.Group(); barn.position.set(-7.5, 0, -6.2);
  const bBody = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.6, 4.0), new THREE.MeshStandardMaterial({ color: 0xdc2626 })); bBody.position.y = 1.8;
  const bRoof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 2.3, 4), new THREE.MeshStandardMaterial({ color: 0x7f1d1d })); bRoof.position.y = 4.75; bRoof.rotation.y = Math.PI / 4;
  barn.add(bBody, bRoof); g.add(barn);
  draggableFarmObjects.push(barn);

  // 3D Water Well (Draggable! Walk near it to get "Su Al!" prompt!)
  farmWaterWell = create3DWaterWell();
  farmWaterWell.position.set(-6.0, 0, 3.5);
  g.add(farmWaterWell);
  draggableFarmObjects.push(farmWaterWell);

  // Starter 3D Fruit Tree with red apples! (Draggable!)
  const starterTree = create3DFruitTree(2.8, -5.8);
  g.add(starterTree);
  farmFruitTrees.push(starterTree);
  draggableFarmObjects.push(starterTree);

  // Crop Field (Draggable as a single group!)
  const fieldGroup = new THREE.Group();
  fieldGroup.position.set(6.5, 0, 1.5);
  const field = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.14, 5.2), new THREE.MeshStandardMaterial({ color: 0x78350f }));
  field.position.set(0, 0.07, 0); fieldGroup.add(field);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const stalk = new THREE.Group();
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x16a34a })); st.position.y = 0.7;
    const corn = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.45, 6, 10), new THREE.MeshStandardMaterial({ color: 0xfacc15 })); corn.position.y = 1.35;
    stalk.add(st, corn); stalk.position.set(-2.2 + c * 1.45, 0, -1.8 + r * 1.7); stalk.scale.set(0.25, 0.25, 0.25);
    fieldGroup.add(stalk); farmCropMeshes.push(stalk);
  }
  g.add(fieldGroup);
  draggableFarmObjects.push(fieldGroup);

  farmTractorMesh = create3DTractorMesh(); farmTractorMesh.position.set(6.2, 0, -4.2); farmTractorMesh.rotation.y = -0.5; g.add(farmTractorMesh);
  draggableFarmObjects.push(farmTractorMesh);

  farmBearMesh = create3DCompanionPetMesh('bear', { petColor: '#5c2d0c' });
  farmBearMesh.scale.set(1.5, 1.5, 1.5);
  const bearLbl = create3DTextLabel('🐻 Aç Boz Ayı!', '#b91c1c'); bearLbl.position.y = 2.8;
  farmBearMesh.add(bearLbl); farmBearMesh.position.set(12.5, 0, -7.5); farmBearMesh.visible = false;
  g.add(farmBearMesh);

  window.spawn3DFarmAnimal('cow', -2.2, 0.5, 'Sarıkız', true);
  window.spawn3DFarmAnimal('cow',  1.5, 1.8, 'Benekli', true);
  window.spawn3DFarmAnimal('pony',-0.2,-2.0, 'Rüzgar Midilli', true);
  window.spawn3DFarmAnimal('dog', -4.5, 1.2, 'Karabaş');
  window.spawn3DFarmAnimal('dog',  2.2,-3.2, 'Cesur');

  renderFarm3DSidebar();
}

window.switch3DFarmTheme = function(ownerId) {
  state.currentFarmOwner = ownerId;
  ['yusuf','umay','deren','elif'].forEach(k => {
    const b = document.getElementById(`ftab-${k}`);
    if (b) b.classList.toggle('active', k === ownerId);
  });
  const grassCols = { yusuf: 0x4ade80, umay: 0x86efac, deren: 0xa7f3d0, elif: 0xbef264 };
  if (farmPastureMat) farmPastureMat.color.setHex(grassCols[ownerId] || 0x4ade80);
  document.getElementById('farm-owner-title').textContent = `🚜 ${POSSESSIVE_NAME[ownerId]} 3D Çiftliği`;
  playSound('pop');
  speakText(`${POSSESSIVE_NAME[ownerId]} 3 boyutlu çiftliğine geçtin!`);
};

window.spawn3DFarmAnimal = function(type, x = (Math.random()-0.5)*6, z = (Math.random()-0.5)*4, customName = null, isSystemInit = false) {
  if (!isSystemInit && !canEditFarm(true)) return;
  const name = customName || `${type==='dog'?'Karabaş':type==='pony'?'Midilli':'Sarıkız'} ${farmAnimalMeshes.length+1}`;
  const mesh = create3DCompanionPetMesh(type, { petOutfit: type==='pony'?'pink_saddle':'none', petCollar: 'bell' });
  mesh.scale.set(1.2, 1.2, 1.2);
  const lbl = create3DTextLabel(`${type==='dog'?'🐶':type==='pony'?'🐴':'🐄'} ${name}`, type==='dog'?'#d97706':'#10b981');
  lbl.position.y = 2.55; mesh.add(lbl);
  mesh.position.set(x, 0, z);
  mesh.userData = { clickableType: 'farm_animal', animalType: type, name, hunger: 70, thirst: 65, clean: 65, love: 80, phase: Math.random()*6, targetX: x, targetZ: z, handCooldown: 0 };
  worldGroups['yusuf-farm'].add(mesh);
  farmAnimalMeshes.push(mesh);
  draggableFarmObjects.push(mesh);
  if (type === 'dog') farmDogMeshes.push(mesh);
  state.selectedAnimalMesh = mesh;
  updateFarmAnimalBanner(mesh.userData);
};

window.renameSelected3DAnimal = () => {
  const t = state.selectedAnimalMesh || farmAnimalMeshes[0];
  if (!t) return;
  const n = window.prompt('Hayvanına yeni isim koy:', t.userData.name);
  if (!n || !n.trim()) return;
  t.userData.name = n.trim();
  const old = t.getObjectByName('name_label_sprite');
  if (old) t.remove(old);
  const nl = create3DTextLabel(`🐾 ${t.userData.name}`, '#10b981'); nl.position.y = 2.55; t.add(nl);
  updateFarmAnimalBanner(t.userData);
  playSound('win');
};

window.plowAndGrow3DField = () => {
  state.fieldStage = (state.fieldStage + 1) % 4;
  tractorDriving = true; tractorAngle = 0;
  const scales = [0.25, 0.5, 0.9, 1.35];
  farmCropMeshes.forEach(s => s.scale.set(scales[state.fieldStage], scales[state.fieldStage], scales[state.fieldStage]));
  if (state.fieldStage === 3) { state.inventory.wheat += 4; addStars(3); speakText('Mısırlar büyüdü ve hasat edildi! +4 Ot kazandın!'); }
  else speakText('Tarla sürülüyor ve büyüyor!');
  playSound('win');
};

window.trigger3DBearAttack = () => {
  if (!farmBearMesh) return;
  farmBearMesh.visible = true; farmBearMesh.position.set(11.5, 0, -5.5);
  bearAttackState = 'approaching';
  playSound('bear');
  if (farmDogMeshes.length > 0) {
    speakText('Dikkat! Ayı saldırıyor! Koruyucu köpeklerin ayıyı kovalıyor!');
  } else {
    speakText('EYVAH! Ayı saldırıyor ve köyde hiç koruyucu köpek yok! Çabuk köpek ekle yoksa bütün hayvanları öldürecek!');
    const st = document.getElementById('farm-active-tool-text');
    if (st) st.textContent = '⚠️ AYI SALDIRIYOR! Köyde köpek yok! Hemen "+1 Koruyucu Köpek" koy!';
  }
};

function interactWith3DFarmAnimal(animalMesh, sx, sy, forcedTool = null) {
  const d = animalMesh.userData;
  const tool = forcedTool || state.farmTool;
  state.selectedAnimalMesh = animalMesh;
  animalMesh.position.y = 0.85; setTimeout(() => animalMesh.position.y = 0, 300);

  if (tool === 'feed' || tool === 'hay' || tool === 'apple') {
    d.hunger = Math.min(100, d.hunger + 30); playSound('moo'); spawnFloatingFX('🌽', sx, sy);
    speakText(`${d.name} elinden yemeğini afiyetle yedi!`);
  } else if (tool === 'water') {
    d.thirst = Math.min(100, d.thirst + 35); playSound('water'); spawnFloatingFX('💧', sx, sy);
    speakText(`${d.name} elinden suyunu içti!`);
  } else if (tool === 'wash') {
    d.clean = Math.min(100, d.clean + 45); playSound('water'); spawnFloatingFX('🫧', sx, sy);
  } else if (tool === 'milk') {
    if (d.animalType === 'cow') { state.inventory.milk += 1; addStars(2); playSound('win'); spawnFloatingFX('🥛', sx, sy); }
  } else {
    d.love = Math.min(100, d.love + 25); addStars(1); playSound(d.animalType==='dog'?'bark':'moo'); spawnFloatingFX('❤️', sx, sy);
  }
  updateInventoryUI(); updateFarmAnimalBanner(d);
}

function updateFarmAnimalBanner(d) {
  if (!d) return;
  document.getElementById('selected-animal-title').textContent = d.name;
  document.getElementById('bar-hunger').style.width = `${d.hunger}%`;
  document.getElementById('bar-thirst').style.width = `${d.thirst}%`;
  document.getElementById('bar-clean').style.width = `${d.clean}%`;
  document.getElementById('bar-love').style.width = `${d.love}%`;
}

function renderFarm3DSidebar() {
  const tg = document.getElementById('farm-3d-tools'); tg.innerHTML = '';
  FARM_3D_TOOLS.forEach(t => {
    const c = document.createElement('div'); c.className = `item-card ${state.farmTool===t.id?'active special':''}`;
    c.innerHTML = `<img src="${t.icon}" /><span class="title">${t.name}</span>`;
    c.onclick = () => { state.farmTool = t.id; playSound('pop'); renderFarm3DSidebar(); };
    tg.appendChild(c);
  });
  const dg = document.getElementById('farm-3d-decor'); dg.innerHTML = '';
  FARM_3D_DECOR.forEach(d => {
    const c = document.createElement('div'); c.className = 'item-card';
    c.innerHTML = `<img src="${d.icon}" /><span class="title">${d.name}</span>`;
    c.onclick = d.act;
    dg.appendChild(c);
  });
}

/* ============================================================================
   9. REAL 3D BABY BODY NURSERY (CRIES WHEN HUNGRY, SICK, VOMITS, DIAPER, GROWS!)
      (Balloon Game Separated to Arcade!)
   ============================================================================ */
let babyTearsGroup = null, babyFeverMesh = null, babyVomitMesh = null, babyMouthMesh = null;

// 22 DETAILED BABY-SPECIFIC 3D CLOTHES, SHOES & BABY PRODUCTS (FOR UMAY, YUSUF, DEREN & ELİF!)
const BABY_WARDROBE_ITEMS = [
  // 8 Bebek Giysisi (outfit)
  { id: 'pink_bunny',        cat: 'outfit',  slot: 'outfit', name: 'Tavşanlı Pembe Tulum',    emoji: '🐰', color: 0xf472b6 },
  { id: 'yellow_duck',       cat: 'outfit',  slot: 'outfit', name: 'Ördekli Sarı Tulum',      emoji: '🐥', color: 0xfacc15 },
  { id: 'unicorn_tutu',      cat: 'outfit',  slot: 'outfit', name: 'Unicorn Gökkuşağı Tütü',  emoji: '🦄', color: 0xe879f9, special: true },
  { id: 'blue_star_pj',      cat: 'outfit',  slot: 'outfit', name: 'Yıldızlı Mavi Pijama',    emoji: '⭐', color: 0x38bdf8 },
  { id: 'princess_dress',    cat: 'outfit',  slot: 'outfit', name: 'Prenses Tüllü Elbise',    emoji: '👑', color: 0xa855f7, special: true },
  { id: 'strawberry_romper', cat: 'outfit',  slot: 'outfit', name: 'Çilekli Bahar Salopet',   emoji: '🍓', color: 0xf43f5e },
  { id: 'super_baby',        cat: 'outfit',  slot: 'outfit', name: 'Süper Bebek Pelerinli',   emoji: '🦸', color: 0x2563eb, special: true },
  { id: 'velvet_winter',     cat: 'outfit',  slot: 'outfit', name: 'Kadife Kışlık Mont',      emoji: '❄️', color: 0x14b8a6 },

  // 6 Bebek Ayakkabısı & Patiği (shoes)
  { id: 'pink_bow_booties',  cat: 'shoes',   slot: 'shoes',  name: 'Pembe Kurdeleli Patik',   emoji: '🎀', color: 0xff4d94, special: true },
  { id: 'yellow_star_boots', cat: 'shoes',   slot: 'shoes',  name: 'Sarı Yıldızlı Bebek Bot', emoji: '🥾', color: 0xf59e0b },
  { id: 'blue_sneakers',     cat: 'shoes',   slot: 'shoes',  name: 'Mavi İlk Adım Spor',      emoji: '👟', color: 0x3b82f6 },
  { id: 'bunny_slippers',    cat: 'shoes',   slot: 'shoes',  name: 'Tavşan Kulaklı Patik',    emoji: '🐇', color: 0xffffff, special: true },
  { id: 'red_maryjane',      cat: 'shoes',   slot: 'shoes',  name: 'Kırmızı Rugan Ayakkabı',  emoji: '👠', color: 0xdc2626 },
  { id: 'rainbow_sandals',   cat: 'shoes',   slot: 'shoes',  name: 'Gökkuşağı Simli Sandalet',emoji: '🌈', color: 0xa855f7 },

  // 8 Bebeklere Özel Ürün & Aksesuar (product)
  { id: 'pacifier_pink',     cat: 'product', slot: 'mouth',  name: 'Pembe Kalpli Emzik',      emoji: '🩷', color: 0xff4d94 },
  { id: 'pacifier_blue',     cat: 'product', slot: 'mouth',  name: 'Mavi Yıldızlı Emzik',     emoji: '💙', color: 0x38bdf8 },
  { id: 'daisy_headband',    cat: 'product', slot: 'hat',    name: 'Papatyalı Bandana',       emoji: '🌼', color: 0xfef08a, special: true },
  { id: 'bear_beanie',       cat: 'product', slot: 'hat',    name: 'Ayıcık Kulaklı Bere',     emoji: '🐻', color: 0xb45309 },
  { id: 'baby_crown',        cat: 'product', slot: 'hat',    name: 'Altın Bebek Tacı',        emoji: '👑', color: 0xfacc15, special: true },
  { id: 'strawberry_bib',    cat: 'product', slot: 'bib',    name: 'Çilekli Mama Önlüğü',     emoji: '🍓', color: 0xfb7185 },
  { id: 'plush_teddy',       cat: 'product', slot: 'toy',    name: 'Peluş Oyuncak Ayıcık',    emoji: '🧸', color: 0xd97706, special: true },
  { id: 'baby_rattle',       cat: 'product', slot: 'toy',    name: 'Renkli Bebek Çıngırağı',  emoji: '🪀', color: 0x22c55e }
];

function create3DBabyBodyMesh(cfg = null) {
  const bCfg = cfg || state.babyConfigs[state.currentPlayer] || state.babyConfigs.umay;
  const baby = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffe4c4, roughness: 0.4 });
  const diaperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
  const outfitDef = BABY_WARDROBE_ITEMS.find(x => x.id === bCfg.outfit) || BABY_WARDROBE_ITEMS[0];
  const onesieMat = new THREE.MeshStandardMaterial({ color: outfitDef.color, roughness: 0.45 });

  // Chubby 3D Baby Torso & Detailed Onesie
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.92, 24, 24), onesieMat);
  torso.position.y = 1.35; torso.scale.set(1.0, 1.15, 0.9); torso.castShadow = true;
  baby.add(torso);

  // Outfit-Specific 3D Details (Tutu skirt, Cape, Fur collar, Chest badge!)
  if (bCfg.outfit === 'unicorn_tutu' || bCfg.outfit === 'princess_dress') {
    const skirtCols = bCfg.outfit === 'unicorn_tutu' ? [0xff4d94, 0xfacc15, 0x38bdf8, 0xa855f7] : [0xc084fc, 0xf472b6, 0xe879f9];
    skirtCols.forEach((sc, i) => {
      const frill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.88 + i * 0.1, 1.18 + i * 0.14, 0.28, 22),
        new THREE.MeshStandardMaterial({ color: sc, roughness: 0.35 })
      );
      frill.position.y = 1.05 - i * 0.11;
      baby.add(frill);
    });
  } else if (bCfg.outfit === 'super_baby') {
    const cape = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 0.12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    cape.position.set(0, 1.3, -0.88); cape.rotation.x = 0.25;
    const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    emblem.position.set(0, 1.55, 0.86); emblem.scale.set(1, 1, 0.3);
    baby.add(cape, emblem);
  } else if (bCfg.outfit === 'velvet_winter') {
    const fur = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.16, 10, 20), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    fur.rotation.x = Math.PI / 2; fur.position.set(0, 2.02, 0.08);
    baby.add(fur);
  } else {
    // Cute chest pocket / badge
    const badge = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    badge.position.set(0, 1.52, 0.82); badge.scale.set(1.1, 1.0, 0.35);
    baby.add(badge);
  }

  // 3D Diaper Bottom
  nurseryCleanDiaperMesh = new THREE.Mesh(new THREE.SphereGeometry(0.88, 20, 20), diaperMat);
  nurseryCleanDiaperMesh.position.set(0, 0.88, 0); nurseryCleanDiaperMesh.scale.set(1.02, 0.72, 0.96);
  baby.add(nurseryCleanDiaperMesh);

  // Dirty Diaper Indicator
  nurseryDirtyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 14), new THREE.MeshStandardMaterial({ color: 0x78350f }));
  nurseryDirtyMesh.position.set(0, 0.75, 0.72);
  nurseryDirtyMesh.visible = Boolean(state.baby?.diaperDirty);
  baby.add(nurseryDirtyMesh);

  // Chubby 3D Legs, Sleeves & Arms + Detailed 3D Baby Shoes!
  const shoeDef = BABY_WARDROBE_ITEMS.find(x => x.id === bCfg.shoes);
  [-0.55, 0.55].forEach(lx => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.55, 10, 14), skinMat);
    leg.position.set(lx, 0.45, 0.45); leg.rotation.x = Math.PI / 2.4;
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 10, 14), skinMat);
    arm.position.set(lx * 1.65, 1.55, 0.2); arm.rotation.z = lx < 0 ? 0.65 : -0.65;
    const sleeve = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), onesieMat);
    sleeve.position.set(lx * 1.4, 1.72, 0.14);
    baby.add(leg, arm, sleeve);

    // 3D Baby Shoes / Booties on Feet!
    if (shoeDef) {
      const shoeGrp = new THREE.Group();
      shoeGrp.position.set(lx, 0.36, 0.88);
      const shoeBase = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.24, 0.28, 10, 14),
        new THREE.MeshStandardMaterial({ color: shoeDef.color, roughness: bCfg.shoes === 'red_maryjane' ? 0.15 : 0.45 })
      );
      shoeBase.rotation.x = Math.PI / 2;
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.62), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      sole.position.y = -0.2;
      shoeGrp.add(shoeBase, sole);

      if (bCfg.shoes === 'pink_bow_booties') {
        const bow = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
        bow.position.set(0, 0.24, 0.08); shoeGrp.add(bow);
      } else if (bCfg.shoes === 'bunny_slippers') {
        [-0.1, 0.1].forEach(ex => {
          const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 6, 8), new THREE.MeshStandardMaterial({ color: 0xfbcfe8 }));
          ear.position.set(ex, 0.34, 0.06); shoeGrp.add(ear);
        });
      } else if (bCfg.shoes === 'rainbow_sandals') {
        const strap = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 14), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
        strap.position.set(0, 0.06, 0.05); shoeGrp.add(strap);
      }
      baby.add(shoeGrp);
    }
  });

  // Big Cute 3D Baby Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.05, 28, 28), skinMat);
  head.position.y = 2.85; head.castShadow = true;
  baby.add(head);

  // Cute Curl of Hair on top
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.08, 10, 16, Math.PI * 1.5), new THREE.MeshStandardMaterial({ color: 0x92400e }));
  curl.position.set(0, 3.92, 0.25);
  baby.add(curl);

  // Expressive Eyes + Blush
  [-0.36, 0.36].forEach(ex => {
    const ew = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    ew.position.set(ex, 2.95, 0.92);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0x1e293b }));
    pup.position.set(ex, 2.95, 1.05);
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfda4af, transparent: true, opacity: 0.6 }));
    blush.position.set(ex * 1.5, 2.72, 0.84); blush.scale.set(1.1, 0.7, 0.4);
    baby.add(ew, pup, blush);
  });

  // Mouth
  babyMouthMesh = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 10, 20, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
  babyMouthMesh.rotation.x = state.baby?.crying ? 0 : Math.PI;
  babyMouthMesh.position.set(0, 2.55, 0.98);
  baby.add(babyMouthMesh);

  // 3D Baby Products: Pacifier (Emzik)
  if (bCfg.mouth === 'pacifier_pink' || bCfg.mouth === 'pacifier_blue') {
    const pCol = bCfg.mouth === 'pacifier_pink' ? 0xff4d94 : 0x38bdf8;
    const shield = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), new THREE.MeshStandardMaterial({ color: pCol, roughness: 0.25 }));
    shield.scale.set(1.2, 0.9, 0.4); shield.position.set(0, 2.54, 1.06);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    ring.position.set(0, 2.48, 1.18);
    baby.add(shield, ring);
  }

  // 3D Baby Products: Headband / Bear Beanie / Baby Crown
  if (bCfg.hat === 'daisy_headband') {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.07, 10, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xff4d94 }));
    band.position.set(0, 2.95, 0.05);
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    center.position.set(0.52, 3.82, 0.42);
    for (let p = 0; p < 6; p++) {
      const a = (p / 6) * Math.PI * 2;
      const pet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      pet.position.set(0.52 + Math.cos(a) * 0.2, 3.82 + Math.sin(a) * 0.2, 0.42);
      baby.add(pet);
    }
    baby.add(band, center);
  } else if (bCfg.hat === 'bear_beanie') {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), new THREE.MeshStandardMaterial({ color: 0xb45309 }));
    cap.position.y = 2.92;
    [-0.68, 0.68].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), new THREE.MeshStandardMaterial({ color: 0x92400e }));
      ear.position.set(ex, 3.85, 0.05); baby.add(ear);
    });
    baby.add(cap);
  } else if (bCfg.hat === 'baby_crown') {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.36, 0.35, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.75, roughness: 0.2, side: THREE.DoubleSide }));
    crown.position.set(0, 4.02, 0.1);
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
    gem.position.set(0, 4.02, 0.48);
    baby.add(crown, gem);
  }

  // 3D Baby Products: Bib (Mama Önlüğü)
  if (bCfg.bib === 'strawberry_bib') {
    const bib = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.58, 16, 1, false, -Math.PI * 0.38, Math.PI * 0.76), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    bib.position.set(0, 1.72, 0.32);
    const berry = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
    berry.position.set(0, 1.65, 0.96);
    baby.add(bib, berry);
  }

  // 3D Baby Products: Hand-held Toy (Peluş Ayıcık / Çıngırak)
  if (bCfg.toy === 'plush_teddy') {
    const teddy = new THREE.Group();
    teddy.position.set(1.22, 1.48, 0.55);
    const tMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    const tb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), tMat);
    const th = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), tMat); th.position.y = 0.34;
    const te1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), tMat); te1.position.set(-0.16, 0.52, 0);
    const te2 = te1.clone(); te2.position.x = 0.16;
    teddy.add(tb, th, te1, te2);
    baby.add(teddy);
  } else if (bCfg.toy === 'baby_rattle') {
    const rattle = new THREE.Group();
    rattle.position.set(1.18, 1.52, 0.52);
    rattle.rotation.z = -0.45;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 10), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15 })); ball.position.y = 0.34;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 8, 16), new THREE.MeshStandardMaterial({ color: 0xec4899 })); ring.position.y = 0.34;
    rattle.add(handle, ball, ring);
    baby.add(rattle);
  }

  // 3D Blue Tears (Visible when crying/hungry!)
  babyTearsGroup = new THREE.Group();
  [-0.36, 0.36].forEach(tx => {
    const tear = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 }));
    tear.scale.y = 1.5; tear.position.set(tx, 2.65, 1.06);
    babyTearsGroup.add(tear);
  });
  babyTearsGroup.visible = Boolean(state.baby?.crying);
  baby.add(babyTearsGroup);

  // 3D Fever Forehead Patch & Thermometer (Visible when sick!)
  babyFeverMesh = new THREE.Group();
  const redHead = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.32, 0.12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  redHead.position.set(0, 3.35, 0.98);
  const thermo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  thermo.rotation.z = Math.PI / 3; thermo.position.set(0.35, 2.48, 1.05);
  babyFeverMesh.add(redHead, thermo);
  babyFeverMesh.visible = Boolean(state.baby?.sick);
  baby.add(babyFeverMesh);

  // 3D Vomit Mess on Bib (Visible when baby vomits!)
  babyVomitMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 14), new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.4 }));
  babyVomitMesh.position.set(0, 1.75, 0.88); babyVomitMesh.scale.set(1.2, 0.8, 0.5);
  babyVomitMesh.visible = Boolean(state.baby?.vomited);
  baby.add(babyVomitMesh);

  return baby;
}

window.rebuild3DNurseryBaby = function() {
  const g = worldGroups.nursery;
  if (!g) return;
  if (nurseryBabyGroup) g.remove(nurseryBabyGroup);
  nurseryBabyGroup = create3DBabyBodyMesh(state.babyConfigs[state.currentPlayer]);
  nurseryBabyGroup.position.y = 0.7;
  const s = Math.min(1.55, 1 + ((state.baby?.level || 1) - 1) * 0.14);
  nurseryBabyGroup.scale.set(s, s, s);
  g.add(nurseryBabyGroup);
};

window.renderBabyWardrobeGrid = function(filterCat = null) {
  if (filterCat) state.babyWardrobeFilter = filterCat;
  const cat = state.babyWardrobeFilter || 'all';
  const grid = document.getElementById('baby-dressup-grid');
  const titleEl = document.getElementById('baby-wardrobe-title');
  if (titleEl) {
    const owner = POSSESSIVE_NAME[state.currentPlayer] || 'Kuzen';
    titleEl.textContent = `👶 ${owner} Bebeği (${BABY_WARDROBE_ITEMS.length} Ürün)`;
  }
  if (!grid) return;
  grid.innerHTML = '';
  const curCfg = state.babyConfigs[state.currentPlayer] || state.babyConfigs.umay;

  BABY_WARDROBE_ITEMS.filter(it => cat === 'all' || it.cat === cat).forEach(it => {
    const isActive = curCfg[it.slot] === it.id;
    const card = document.createElement('div');
    card.className = `item-card ${it.special ? 'special' : ''} ${isActive ? 'active' : ''}`;
    card.innerHTML = `<div style="font-size:32px;line-height:1.1;">${it.emoji}</div><span class="title">${it.name}</span>`;
    card.onclick = () => {
      const cfg = state.babyConfigs[state.currentPlayer];
      // Toggle off optional products if already worn, always apply outfits & shoes
      if (it.cat === 'product' && cfg[it.slot] === it.id) {
        cfg[it.slot] = 'none';
      } else {
        cfg[it.slot] = it.id;
      }
      playSound('win');
      addStars(1);
      spawnFloatingFX(it.emoji);
      window.rebuild3DNurseryBaby();
      window.renderBabyWardrobeGrid();
      const st = document.getElementById('nursery-3d-status');
      if (st) st.textContent = `✨ Bebeğine "${it.name}" giydirdin! Çok tatlı oldu! (+1 ⭐)`;
      speakText(`${it.name} bebeğine çok yakıştı!`);
    };
    grid.appendChild(card);
  });
};

window.filterBabyWardrobe = function(cat, btn) {
  document.querySelectorAll('#baby-dress-tabs .tab-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  playSound('pop');
  window.renderBabyWardrobeGrid(cat);
};

function build3DNurseryWorld() {
  const g = worldGroups.nursery;
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.4, 32), new THREE.MeshStandardMaterial({ color: 0xfef3c7 })); floor.position.y = -0.2;
  const crib = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.7, 3.6), new THREE.MeshStandardMaterial({ color: 0xfbcfe8 })); crib.position.y = 0.35;
  g.add(floor, crib);

  state.baby = { level: 1, growth: 25, hunger: 65, health: 100, clean: 80, crying: false, sick: false, vomited: false, diaperDirty: false };
  window.rebuild3DNurseryBaby();
  window.renderBabyWardrobeGrid('all');
  if (chessGame) chessGame.render();
  renderXoxBoard();
  updateBabyStatsUI();
}

function updateBabyStatsUI() {
  const h = document.getElementById('baby-hunger-val');
  const hl = document.getElementById('baby-health-val');
  const cl = document.getElementById('baby-clean-val');
  const ag = document.getElementById('baby-age-val');
  if (h) h.textContent = `${state.baby.hunger}%`;
  if (hl) hl.textContent = `${state.baby.health}%`;
  if (cl) cl.textContent = `${state.baby.clean}%`;
  if (ag) ag.textContent = `${state.baby.level} Yaş`;
}

window.triggerBabyNeed = function(need) {
  const st = document.getElementById('nursery-3d-status');
  if (need === 'hungry') {
    state.baby.hunger = 15; state.baby.crying = true;
    if (babyTearsGroup) babyTearsGroup.visible = true;
    if (babyMouthMesh) babyMouthMesh.rotation.x = 0; // Sad crying mouth!
    playSound('cry');
    st.textContent = '😭 Bebeğimiz acıktı ve ağlıyor! Hemen 🍼 Süt / Mama Yedir!';
    speakText('Ühü ühü! Bebeğimiz çok acıktı ve ağlıyor! Hemen süt veya mama verelim!');
  } else if (need === 'sick') {
    state.baby.health = 35; state.baby.sick = true;
    if (babyFeverMesh) babyFeverMesh.visible = true;
    playSound('cry');
    st.textContent = '🤒 Eyvah! Bebeğimiz hasta oldu ve ateşi çıktı! Hemen 💊 İlaç / Şurup İçir!';
    speakText('Eyvah! Bebeğimiz hasta olmuş, ateşi çıkmış! Hemen şurup ve ilaç içirelim!');
  } else if (need === 'vomit') {
    state.baby.clean = 25; state.baby.vomited = true;
    if (babyVomitMesh) babyVomitMesh.visible = true;
    playSound('vomit');
    st.textContent = '🤮 Bebeğimiz midesini bozup kustu! Hemen 🧻 Mendille Sil!';
    speakText('Ayy bebeğimiz kustu! Hemen ıslak mendille üstünü silelim!');
  }
  updateBabyStatsUI();
};

window.soilBabyDiaper = () => {
  state.baby.diaperDirty = true; state.baby.clean = 20;
  if (nurseryDirtyMesh) nurseryDirtyMesh.visible = true;
  playSound('pop');
  document.getElementById('nursery-3d-status').textContent = '💩 Bebeğin altı kirlendi! 🧻 Mendille sil -> ✨ Pudra -> 🧷 Temiz Bez!';
  speakText('Bebeğin altı kirlendi! Hadi ıslak mendille silelim!');
  updateBabyStatsUI();
};

window.openSeparateBalloonGame = () => {
  window.switchMode('arcade');
  window.switchArcadeCategory('toddler', true);
  openArcadeGame('t_balloon');
};

window.nursery3DAction = (act) => {
  if (!nurseryBabyGroup) return;
  nurseryBabyGroup.position.y = 1.2; setTimeout(() => nurseryBabyGroup.position.y = 0.7, 300);
  const st = document.getElementById('nursery-3d-status');

  if (act === 'milk') {
    if (state.inventory.milk > 0) state.inventory.milk--;
    state.baby.hunger = Math.min(100, state.baby.hunger + 45);
    state.baby.crying = false;
    if (babyTearsGroup) babyTearsGroup.visible = false;
    if (babyMouthMesh) babyMouthMesh.rotation.x = Math.PI; // Happy smile!
    playSound('water'); spawnFloatingFX('🍼');
    st.textContent = '😊 Bebeğimiz sütünü içti, ağlaması durdu ve gülümsüyor!';
    speakText('Bebeğimiz sütünü ve mamasını yedi, çok mutlu oldu!');
    // Occasional realistic baby burp/spit-up if overfed at 100%
  } else if (act === 'medicine') {
    state.baby.health = 100; state.baby.sick = false;
    if (babyFeverMesh) babyFeverMesh.visible = false;
    playSound('win'); spawnFloatingFX('💊'); addStars(2);
    st.textContent = '💪 Yaşasın! Bebeğimiz ilacını içti, ateşi düştü ve iyileşti! (+2 ⭐)';
    speakText('Aferin! Bebeğimiz ilacını içti ve tamamen iyileşti!');
  } else if (act === 'wipe') {
    state.baby.clean = Math.min(100, state.baby.clean + 50);
    state.baby.vomited = false; state.baby.diaperDirty = false;
    if (nurseryDirtyMesh) nurseryDirtyMesh.visible = false;
    if (babyVomitMesh) babyVomitMesh.visible = false;
    playSound('water'); spawnFloatingFX('🧻');
    st.textContent = '✨ Kusmuk ve kirler mendille tertemiz silindi!';
    speakText('Mendille her yeri tertemiz sildik!');
  } else if (act === 'powder') {
    playSound('pop'); spawnFloatingFX('✨');
    st.textContent = '🌸 Mis kokulu bebek pudrası sürüldü!';
  } else if (act === 'diaper') {
    state.baby.clean = 100; state.baby.diaperDirty = false;
    if (nurseryDirtyMesh) nurseryDirtyMesh.visible = false;
    addStars(3); playSound('win'); spawnFloatingFX('🧷');
    st.textContent = '🎉 Temiz bez bağlandı! Bebeğimiz tertemiz! (+3 ⭐)';
  } else if (act === 'sleep') {
    state.baby.growth += 50;
    if (state.baby.growth >= 100) {
      state.baby.level += 1; state.baby.growth = 20;
      const s = Math.min(1.55, 1 + (state.baby.level - 1) * 0.14);
      nurseryBabyGroup.scale.set(s, s, s);
      addStars(5); playSound('win');
      st.textContent = `🎂 YAŞASIN! Bebeğimiz büyüdü ve ${state.baby.level} yaşına girdi! (+5 ⭐)`;
      speakText(`Yaşasın! Bebeğimiz büyüdü ve ${state.baby.level} yaşına girdi!`);
    } else {
      playSound('win'); spawnFloatingFX('🌙');
      st.textContent = '🌙 Ninni çaldık, bebeğimiz mışıl mışıl uyudu ve büyüyor!';
    }
  }
  updateBabyStatsUI();
  updateInventoryUI();
};

/* ============================================================================
   10. 3D RAYCASTING & MAIN ANIMATION LOOP (WALKING, DRIVING, RIDING, LUNAPARK!)
   ============================================================================ */
function getNormalizedPointer(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function applyFingerBrush(e) {
  getNormalizedPointer(e);
  raycaster.setFromCamera(pointer, camera);
  if (state.currentMode === 'salon' && salonCharacterRoot) {
    const hits = raycaster.intersectObjects(salonCharacterRoot.children, true);
    if (hits.length > 0) {
      const m = hits[0].object, z = m.userData?.salonPaintZone;
      if (z === 'hair_strand' || z === 'lips' || z === 'blush' || z === 'eyeshadow') {
        m.material.color.set(state.activeSalonBrushColor);
        if (z === 'blush') m.material.opacity = 0.65;
        playSound('brush'); spawnFloatingFX('✨', e.clientX, e.clientY);
        return true;
      }
    }
  }
  if (state.currentMode === 'rooms' && state.houseBrushActive) {
    const hits = raycaster.intersectObjects(cousinRoomGroups[state.currentRoomOwner].children, true);
    if (hits.length > 0 && hits[0].object.material?.color) {
      hits[0].object.material.color.set(state.houseBrushColor);
      playSound('brush'); spawnFloatingFX('🖌️', e.clientX, e.clientY);
      return true;
    }
  }
  return false;
}

function on3DPointerDown(e) {
  if (applyFingerBrush(e)) { isPaintingWithFinger = true; controls.enabled = false; return; }
  getNormalizedPointer(e);
  raycaster.setFromCamera(pointer, camera);

  if (state.currentMode === 'rooms' && !state.houseBrushActive) {
    const hits = raycaster.intersectObjects(draggableRoomObjects, true);
    if (hits.length > 0) {
      let r = hits[0].object;
      while (r.parent && !draggableRoomObjects.includes(r)) r = r.parent;
      if (draggableRoomObjects.includes(r)) {
        selected3DRoomItem = r; isDragging3D = true; dragged3DObject = r; controls.enabled = false; playSound('pop'); return;
      }
    }
  }

  // FULL-FARM DRAG-AND-DROP (Only Yusuf or Yusuf-invited Umay can rearrange everything!)
  if (state.currentMode === 'yusuf-farm' && state.farmDragMode) {
    const hits = raycaster.intersectObjects(draggableFarmObjects, true);
    if (hits.length > 0) {
      if (!canEditFarm(true)) return;
      let r = hits[0].object;
      while (r.parent && !draggableFarmObjects.includes(r)) r = r.parent;
      if (draggableFarmObjects.includes(r)) {
        selectedFarmDragItem = r; isDragging3D = true; dragged3DObject = r; controls.enabled = false; playSound('pop'); return;
      }
    }
  }

  const grp = worldGroups[state.currentMode];
  if (!grp) return;
  const hits = raycaster.intersectObjects(grp.children, true);
  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj && (!obj.userData || !obj.userData.clickableType)) obj = obj.parent;
    if (!obj || !obj.userData) return;
    if (obj.userData.clickableType === 'map_building') { playSound('win'); window.tryAccessMode(obj.userData.targetMode); }
    else if (obj.userData.clickableType === 'farm_animal') { interactWith3DFarmAnimal(obj, e.clientX, e.clientY); }
    else if (obj.userData.clickableType === 'balloon_3d') {
      playSound('pop'); addStars(1); spawnFloatingFX('🎈', e.clientX, e.clientY); speakText(obj.userData.speech);
      worldGroups.nursery.remove(obj);
      const i = nurseryBalloonMeshes.indexOf(obj); if (i >= 0) nurseryBalloonMeshes.splice(i, 1);
      if (nurseryBalloonMeshes.length === 0) setTimeout(window.spawn3DBalloons, 600);
    }
  }
}

function on3DPointerMove(e) {
  if (isPaintingWithFinger) { applyFingerBrush(e); return; }
  if (!isDragging3D || !dragged3DObject) return;
  getNormalizedPointer(e); raycaster.setFromCamera(pointer, camera);
  const pt = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(dragPlane, pt)) {
    const maxX = state.currentMode === 'yusuf-farm' ? 13.0 : 7.5;
    const maxZ = state.currentMode === 'yusuf-farm' ? 11.0 : 6.0;
    dragged3DObject.position.x = Math.max(-maxX, Math.min(maxX, pt.x));
    dragged3DObject.position.z = Math.max(-maxZ, Math.min(maxZ, pt.z));
    if (dragged3DObject.userData && dragged3DObject.userData.clickableType === 'farm_animal') {
      dragged3DObject.userData.targetX = dragged3DObject.position.x;
      dragged3DObject.userData.targetZ = dragged3DObject.position.z;
    }
  }
}

function on3DPointerUp() {
  if (isPaintingWithFinger) { isPaintingWithFinger = false; controls.enabled = true; }
  if (isDragging3D) { isDragging3D = false; dragged3DObject = null; controls.enabled = true; }
}

function animate3DLoop() {
  requestAnimationFrame(animate3DLoop);
  const t = performance.now() * 0.001;

  // 1. Explorer Avatar Walking / Car Driving / Horse Riding / Carousel Boarding / Tractor Plowing!
  if (explorerRig && ['map', 'yusuf-farm', 'lunapark'].includes(state.currentMode)) {
    if (state.currentMode === 'lunapark' && state.mountMode === 'ferris' && ferrisWheelRotor) {
      const a = ferrisWheelRotor.rotation.z;
      explorerRig.position.set(-6.2 + Math.cos(a) * 4.6, 6.4 + Math.sin(a) * 4.6 - 0.5, -4.5);
    } else if (state.currentMode === 'lunapark' && state.mountMode === 'boarding_carousel' && carouselRotor) {
      // Real boarding animation: walk & hop onto the spinning 3D carousel horse!
      state.boardingProgress = Math.min(1, (state.boardingProgress || 0) + 0.025);
      const a = carouselRotor.rotation.y;
      const targetPos = new THREE.Vector3(6.0 + Math.cos(a) * 2.6, 1.55, -4.2 + Math.sin(a) * 2.6);
      const startPos = state.boardingStart || new THREE.Vector3(0, 0, 4.5);
      explorerRig.position.lerpVectors(startPos, targetPos, state.boardingProgress);
      explorerRig.position.y += Math.sin(state.boardingProgress * Math.PI) * 1.4; // Boarding hop arc!
      if (state.boardingProgress >= 1) {
        state.mountMode = 'carousel';
        playSound('win');
      }
    } else if (state.currentMode === 'lunapark' && state.mountMode === 'carousel' && carouselRotor) {
      const a = carouselRotor.rotation.y;
      explorerRig.position.set(6.0 + Math.cos(a) * 2.6, 1.5 + Math.sin(t * 4) * 0.32, -4.2 + Math.sin(a) * 2.6);
      explorerRig.rotation.y = -a;
    } else if (state.currentMode === 'yusuf-farm' && state.mountMode === 'tractor' && farmTractorMesh) {
      // Sit right inside the 3D Tractor driver cabin while plowing!
      explorerRig.position.set(farmTractorMesh.position.x, 1.35, farmTractorMesh.position.z);
      explorerRig.rotation.y = farmTractorMesh.rotation.y + Math.PI / 2;
      if (!tractorDriving) {
        state.mountMode = 'walk';
        explorerRig.position.set(4.5, 0, -2.5);
      }
    } else {
      const spd = state.mountMode === 'car' ? 0.2 : (state.mountMode === 'horse' ? 0.16 : 0.11);
      let vx = 0, vz = 0;
      if (state.moveKeys.left) vx -= spd;
      if (state.moveKeys.right) vx += spd;
      if (state.moveKeys.up) vz -= spd;
      if (state.moveKeys.down) vz += spd;
      if (vx !== 0 || vz !== 0) {
        explorerRig.position.x = Math.max(-12, Math.min(12, explorerRig.position.x + vx));
        explorerRig.position.z = Math.max(-10, Math.min(10, explorerRig.position.z + vz));
        explorerRig.rotation.y = Math.atan2(vx, vz);
        if (state.mountMode === 'walk' || state.mountMode === 'horse') {
          explorerRig.position.y = Math.abs(Math.sin(t * 12)) * 0.18;
        }
        // Broadcast 3D avatar position to other connected cousin tablets (throttled to ~10Hz)
        if (performance.now() - lastPosBroadcast > 110) {
          lastPosBroadcast = performance.now();
          sendMultiplayerSync({
            type: 'avatar_pos',
            cousinId: state.currentPlayer,
            mode: state.currentMode,
            x: explorerRig.position.x,
            y: explorerRig.position.y,
            z: explorerRig.position.z,
            rotY: explorerRig.rotation.y
          });
        }
      }
    }

    // Companion Pet smoothly follows behind the player!
    if (explorerFollowerPet) {
      const tx = explorerRig.position.x - 1.8, tz = explorerRig.position.z + 1.2;
      const dx = tx - explorerFollowerPet.position.x, dz = tz - explorerFollowerPet.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.4) {
        explorerFollowerPet.position.x += (dx / dist) * 0.09;
        explorerFollowerPet.position.z += (dz / dist) * 0.09;
        explorerFollowerPet.rotation.y = Math.atan2(dx, dz);
        explorerFollowerPet.position.y = Math.abs(Math.sin(t * 9)) * 0.14;
      }
    }
  }

  // 2. Lunapark Ferris Wheel & Carousel Rotation
  if (worldGroups.lunapark.visible) {
    if (ferrisWheelRotor) ferrisWheelRotor.rotation.z += 0.012;
    if (carouselRotor) carouselRotor.rotation.y += 0.022;
  }

  // 3. Village Map Plane
  if (mapTourPlane && worldGroups.map.visible) {
    planeTourAngle += planeTourActive ? 0.03 : 0.01;
    mapTourPlane.position.set(Math.cos(planeTourAngle)*8.5, 6.8+Math.sin(t*2)*0.4, Math.sin(planeTourAngle)*8.5);
    mapTourPlane.rotation.y = -planeTourAngle;
  }

  // 4. Room Plane Flight
  if (roomPlaneFlying && roomHeroPlane) {
    roomPlaneAngle += 0.05;
    roomHeroPlane.position.set(Math.cos(roomPlaneAngle)*3.5, 2.5, Math.sin(roomPlaneAngle)*3.0);
    if (roomPlaneAngle > Math.PI * 2) { roomPlaneFlying = false; roomHeroPlane.position.set(1.2, 0, 1.8); }
  }

  // 5. Farm Tractor, Wandering Animals, Hand-Carrying Feed Auto-Deliver & Bear vs Dogs!
  if (worldGroups['yusuf-farm'].visible) {
    if (tractorDriving && farmTractorMesh) {
      tractorAngle += 0.035;
      farmTractorMesh.position.set(Math.cos(tractorAngle)*5.5, 0, Math.sin(tractorAngle)*4.0);
      farmTractorMesh.rotation.y = -tractorAngle - Math.PI / 2;
      if (tractorAngle > Math.PI * 2) { tractorDriving = false; farmTractorMesh.position.set(6.2, 0, -4.2); }
    }

    // Dynamic Farm Proximity Detector (Water Well, Crop Field, Fruit Trees)
    if (explorerRig) {
      const pBar = document.getElementById('farm-proximity-bar');
      const pTxt = document.getElementById('farm-proximity-text');
      const pBtn = document.getElementById('farm-proximity-btn');
      const pHelp = document.getElementById('farm-proximity-help-btn');
      let foundZone = null;

      if (farmWaterWell && explorerRig.position.distanceTo(farmWaterWell.position) < 3.6) {
        foundZone = { type: 'water', text: '💧 Su Kuyusunun Yanındasın!', btn: '🪣 Su Al!', showHelp: false };
      } else if (explorerRig.position.distanceTo(new THREE.Vector3(6.5, 0, 1.5)) < 4.5) {
        foundZone = { type: 'field', text: '🌾 Tarlanın Yanındasın!', btn: '🚜 Traktöre Bin & Sür!', showHelp: false };
      } else {
        for (const tree of farmFruitTrees) {
          if (explorerRig.position.distanceTo(tree.position) < 3.5) {
            foundZone = { type: 'tree', target: tree, text: '🍎 Meyve Ağacının Altındasın!', btn: '🍎 Elma Topla!', showHelp: true };
            break;
          }
        }
      }
      activeProximityZone = foundZone;
      if (pBar) {
        if (foundZone) {
          pBar.style.display = 'flex';
          if (pTxt) pTxt.textContent = foundZone.text;
          if (pBtn) pBtn.textContent = foundZone.btn;
          if (pHelp) pHelp.style.display = foundZone.showHelp ? 'inline-flex' : 'none';
        } else {
          pBar.style.display = 'none';
        }
      }
    }

    farmAnimalMeshes.forEach(a => {
      const u = a.userData;
      if (u.handCooldown > 0) u.handCooldown--;
      if (Math.random() < 0.008) { u.targetX = -5.5 + Math.random()*9.5; u.targetZ = -3.5 + Math.random()*7.5; }
      if (bearAttackState === 'approaching' && u.animalType === 'dog' && farmBearMesh) {
        u.targetX = farmBearMesh.position.x - 1.2; u.targetZ = farmBearMesh.position.z;
      }
      const dx = u.targetX - a.position.x, dz = u.targetZ - a.position.z, dist = Math.hypot(dx, dz);
      if (dist > 0.15) {
        const sp = (bearAttackState === 'approaching' && u.animalType === 'dog') ? 0.09 : 0.018;
        a.position.x += (dx/dist)*sp; a.position.z += (dz/dist)*sp;
        a.rotation.y = Math.atan2(dx, dz);
        a.position.y = Math.abs(Math.sin(t*6+u.phase)) * 0.1;
      }

      // If Player Avatar walks near this animal: animal rejoices! If player carries water/hay/apple, auto-feeds by hand!
      if (explorerRig) {
        const pDist = a.position.distanceTo(explorerRig.position);
        if (pDist < 2.6) {
          a.position.y = Math.abs(Math.sin(t * 11)) * 0.42;
          if (state.carriedItem !== 'none' && u.handCooldown === 0) {
            u.handCooldown = 90;
            interactWith3DFarmAnimal(a, window.innerWidth * 0.55, window.innerHeight * 0.45, state.carriedItem);
          }
        }
      }
    });

    if (bearAttackState === 'approaching' && farmBearMesh) {
      farmBearMesh.position.x -= 0.045; farmBearMesh.position.z += 0.025;
      if (farmDogMeshes.length > 0 && farmDogMeshes.some(d => d.position.distanceTo(farmBearMesh.position) < 2.4)) {
        bearAttackState = 'chased_away'; playSound('bark'); addStars(4);
        const st = document.getElementById('farm-active-tool-text');
        if (st) st.textContent = '🐶 Hav hav! Koruyucu köpeklerin ayıyı kovaladı ve tüm hayvanları kurtardı! (+4 ⭐)';
        speakText('Hav hav! Koruyucu köpekler ayıyı ormana kovaladı! Hayvanların güvende!');
      } else if (farmDogMeshes.length === 0 && farmBearMesh.position.x < 3.2) {
        // NO GUARD DOGS IN VILLAGE -> BEAR KILLS ALL FARM ANIMALS!
        const killedCount = farmAnimalMeshes.length;
        for (let i = farmAnimalMeshes.length - 1; i >= 0; i--) {
          const an = farmAnimalMeshes[i];
          worldGroups['yusuf-farm'].remove(an);
          const di = draggableFarmObjects.indexOf(an);
          if (di >= 0) draggableFarmObjects.splice(di, 1);
        }
        farmAnimalMeshes.length = 0;
        state.selectedAnimalMesh = null;
        bearAttackState = 'chased_away';
        playSound('bear');
        const st = document.getElementById('farm-active-tool-text');
        if (st) st.textContent = `🐻💀 EYVAH! Köyde köpek olmadığı için ayı bütün hayvanları (${killedCount} hayvan) öldürdü! Hemen "+1 Koruyucu Köpek" koy!`;
        speakText('Eyvah! Köyde koruyucu köpek olmadığı için ayı çiftlikteki bütün hayvanları öldürdü! Hemen koruyucu köpek koy ve yeni hayvanlar al!');
      }
    } else if (bearAttackState === 'chased_away' && farmBearMesh) {
      farmBearMesh.position.x += 0.09; farmBearMesh.position.z -= 0.05;
      if (farmBearMesh.position.x > 13.5) { farmBearMesh.visible = false; bearAttackState = null; }
    }
  }

  // 6. Salon Dance & Nursery Balloons
  if (salonCharacterRoot && worldGroups.salon.visible) {
    if (salonDanceTimer > 0) { salonDanceTimer--; salonCharacterRoot.rotation.y += 0.1; salonCharacterRoot.position.y = 0.3 + Math.abs(Math.sin(t*10))*0.5; }
    else salonCharacterRoot.position.y = 0.3 + Math.sin(t*2.5)*0.05;
  }
  if (worldGroups.nursery.visible) {
    nurseryBalloonMeshes.forEach(b => { b.position.y = 2.5 + Math.sin(t*2.2+b.userData.phase)*0.45; });
  }

  // 7. 3D Falling Snowflakes & Raindrops Animation!
  if (weatherPoints && weatherPoints.visible) {
    const pos = weatherPoints.geometry.attributes.position;
    const fallSpeed = activeWeather === 'rain' ? 0.45 : 0.08;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - fallSpeed;
      let x = pos.getX(i) + (activeWeather === 'winter' ? Math.sin(t + i) * 0.015 : 0);
      if (y < 0) y = 20;
      pos.setY(i, y);
      pos.setX(i, x);
    }
    pos.needsUpdate = true;
  }

  controls.update();
  renderer.render(scene, camera);
}

window.trigger3DPlaneTour = () => { planeTourActive = true; playSound('win'); setTimeout(() => planeTourActive = false, 4500); };
window.reset3DCamera = () => { playSound('pop'); setCameraForMode(state.currentMode); };

function setCameraForMode(mode) {
  if (!camera || !controls) return;
  if (mode === 'map') { scene.background.set('#bae6fd'); camera.position.set(0, 14, 24); controls.target.set(0, 1, 0); }
  else if (mode === 'rooms') { scene.background.set('#fce7f3'); camera.position.set(4, 9.5, 14.5); controls.target.set(0, 2, 0); }
  else if (mode === 'salon') { scene.background.set('#f5d0fe'); camera.position.set(-1.1, 3.3, 10.5); controls.target.set(-1.0, 2.7, 0); }
  else if (mode === 'yusuf-farm') { scene.background.set('#7dd3fc'); camera.position.set(0, 12, 18.5); controls.target.set(0, 1.5, 0); }
  else if (mode === 'lunapark') { scene.background.set('#fde68a'); camera.position.set(0, 11.5, 20.5); controls.target.set(0, 3.0, -2.0); }
  else if (mode === 'nursery') { scene.background.set('#fef3c7'); camera.position.set(0, 7.5, 13.5); controls.target.set(0, 2.0, 0); }
  controls.update();
}

/* ============================================================================
   11. REAL 3D CHESS + 41 MINI-GAMES ROUTER (21 BIG + 20 DEREN & ELIF 3-YEAR-OLD!)
   ============================================================================ */
let chessGame = null;
const BUILTIN_BIG_GAMES = [
  { id: 'chess3d', icon: '♟️', name: '1. 3D Satranç' },
  { id: 'guess',   icon: '🎨', name: '2. Çiz & Tahmin' },
  { id: 'memory',  icon: '🧠', name: '3. Hafıza Kartı' },
  { id: 'xox',     icon: '❌', name: '4. Kuzen XOX' },
  { id: 'puzzle',  icon: '🧩', name: '5. Yapboz' },
  { id: 'catch',   icon: '🍎', name: '6. Elma Yakala' },
  { id: 'whack',   icon: '🐻', name: '7. Ayı Kovala' },
  { id: 'piano',   icon: '🎹', name: '8. Piyano' },
  { id: 'math',    icon: '🧮', name: '9. Matematik' },
  { id: 'race',    icon: '🏇', name: '10. Midilli Yarışı' },
  { id: 'simon',   icon: '🌈', name: '11. Renk Sırası' }
];

window.switchArcadeCategory = function(cat, force = false) {
  const age = COUSINS[state.currentPlayer].age;
  // Strict Age/Cousin Game Lock: 8-year-olds (Umay/Yusuf) cannot play 3-year-old games & vice versa!
  if (!force && age === 8 && cat === 'toddler') {
    playSound('pop');
    speakText('Burası sadece 3 yaşındaki Deren ve Elif\'in oyun alanı! Sen kendi 27 büyük oyununu oynayabilirsin!');
    return;
  }
  if (!force && age === 3 && cat === 'big') {
    playSound('pop');
    speakText('Burası 8 yaşındaki Umay ve Yusuf\'un oyunları! Sen kendi 20 özel 3 yaş oyununu oynayabilirsin!');
    return;
  }
  state.arcadeCategory = cat;
  document.getElementById('cat-big-btn').classList.toggle('active', cat === 'big');
  document.getElementById('cat-toddler-btn').classList.toggle('active', cat === 'toddler');
  playSound('pop');
  renderArcadeRibbon();
  if (cat === 'toddler') openArcadeGame(TODDLER_20_GAMES[0].id);
  else openArcadeGame('chess3d');
};

function renderArcadeRibbon() {
  const ribbon = document.getElementById('arcade-games-ribbon');
  if (!ribbon) return;
  ribbon.innerHTML = '';
  const list = state.arcadeCategory === 'big'
    ? [...BUILTIN_BIG_GAMES, ...BIG_EXTRA_GAMES]
    : TODDLER_20_GAMES;

  list.forEach((g, idx) => {
    const btn = document.createElement('button');
    btn.className = `arcade-tab-btn ${idx === 0 ? 'active' : ''}`;
    btn.style.cssText = 'padding:6px 11px;font-size:12.5px;';
    btn.dataset.gid = g.id;
    btn.textContent = `${g.icon} ${g.name}`;
    btn.onclick = () => {
      openArcadeGame(g.id, btn);
      // On phones, fold the game list automatically after picking a game so the game gets the FULL screen!
      if (window.innerWidth <= 860) window.toggleArcadeGameList(true);
    };
    ribbon.appendChild(btn);
  });
}

function openArcadeGame(gid, btnEl = null) {
  cleanupMiniGame();
  stop3DMiniGame();
  if (whackT) { clearInterval(whackT); whackT = null; }
  if (autoDrawInt) { clearInterval(autoDrawInt); autoDrawInt = null; }
  playSound('pop');
  document.querySelectorAll('#arcade-games-ribbon .arcade-tab-btn').forEach(b => {
    b.classList.toggle('active', btnEl ? (b === btnEl) : (b.dataset.gid === gid));
  });
  document.querySelectorAll('.arcade-panel').forEach(p => p.classList.remove('active'));

  const staticPanel = document.getElementById(`arcade-sub-${gid}`);
  if (staticPanel) {
    staticPanel.classList.add('active');
    if (gid === 'catch') window.startCatchGame();
    if (gid === 'whack') window.startWhackBearGame();
    if (gid === 'math') window.generateMathQuestion('easy');
    if (gid === 'race') window.startPonyRaceGame();
  } else if (gid.startsWith('3d_')) {
    // Launch Full-Screen Real 3D WebGL Mini-Game!
    document.getElementById('arcade-sub-dynamic').classList.add('active');
    const mount = document.getElementById('dynamic-minigame-mount');
    launch3DMiniGame(gid, mount, { playSound, speakText, addStars, sendMultiplayerSync, onMultiplayerSync, currentPlayer: state.currentPlayer });
  } else {
    // Mount dynamic game from minigames.js
    document.getElementById('arcade-sub-dynamic').classList.add('active');
    const mount = document.getElementById('dynamic-minigame-mount');
    launchMiniGame(gid, mount, { playSound, speakText, addStars, sendMultiplayerSync, onMultiplayerSync, currentPlayer: state.currentPlayer });
  }
}

window.reset3DChess = () => chessGame && chessGame.reset();
window.chessSetMode = (vsBot) => chessGame && chessGame.setMode(vsBot);
window.chessUndo = () => chessGame && chessGame.undo();

/* Built-in Games 2..11 Handlers */
const PICTIONARY_WORDS = [
  { id: 'sun', word: 'Güneş ☀️', speech: 'Güneş', strokes: [{ color: '#f59e0b', pts: [[200,80],[235,90],[250,125],[235,160],[200,170],[165,160],[150,125],[165,90],[200,80]] }, { color: '#f59e0b', pts: [[200,40],[200,68]] }, { color: '#f59e0b', pts: [[200,182],[200,210]] }] },
  { id: 'house', word: 'Ev 🏠', speech: 'Ev', strokes: [{ color: '#3b82f6', pts: [[130,125],[270,125],[270,220],[130,220],[130,125]] }, { color: '#ef4444', pts: [[115,125],[200,55],[285,125],[115,125]] }] },
  { id: 'apple', word: 'Elma 🍎', speech: 'Elma', strokes: [{ color: '#ef4444', pts: [[200,90],[245,85],[265,130],[245,190],[200,200],[155,190],[135,130],[155,85],[200,90]] }, { color: '#10b981', pts: [[205,68],[235,58],[220,78],[205,68]] }] },
  { id: 'plane', word: 'Pembe Uçak ✈️', speech: 'Pembe Uçak', strokes: [{ color: '#ec4899', pts: [[100,140],[280,140],[310,125],[280,110],[100,110],[100,140]] }, { color: '#f472b6', pts: [[170,125],[205,60],[230,125]] }] },
  { id: 'cow', word: 'İnek 🐄', speech: 'İnek', strokes: [{ color: '#1e293b', pts: [[130,115],[240,115],[240,180],[130,180],[130,115]] }, { color: '#1e293b', pts: [[240,95],[290,95],[290,145],[240,145]] }] }
];
let currentGuessWord = PICTIONARY_WORDS[0], guessPenColor = '#1e293b', guessHintStep = 0, autoDrawInt = null;
function initGuessCanvas() {
  const c = document.getElementById('guess-canvas'); if (!c) return;
  const ctx = c.getContext('2d'); ctx.lineCap = 'round'; ctx.lineWidth = 6;
  let dr = false;
  const pos = (e) => { const r = c.getBoundingClientRect(); return { x: (e.clientX-r.left)*(c.width/r.width), y: (e.clientY-r.top)*(c.height/r.height) }; };
  c.addEventListener('pointerdown', (e) => { dr = true; const p = pos(e); ctx.strokeStyle = guessPenColor; ctx.beginPath(); ctx.moveTo(p.x, p.y); });
  c.addEventListener('pointermove', (e) => { if (!dr) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
  window.addEventListener('pointerup', () => dr = false);
  window.startAutoDrawRound();
}
window.setGuessPenColor = (h) => { guessPenColor = h; playSound('pop'); };
window.clearGuessCanvas = () => { const c = document.getElementById('guess-canvas'); if (c) c.getContext('2d').clearRect(0,0,c.width,c.height); };
window.startAutoDrawRound = () => {
  if (autoDrawInt) clearInterval(autoDrawInt); window.clearGuessCanvas();
  currentGuessWord = PICTIONARY_WORDS[Math.floor(Math.random()*PICTIONARY_WORDS.length)]; guessHintStep = 0;
  renderGuessChoices(); window.drawStepHint();
  autoDrawInt = setInterval(() => { if (guessHintStep < currentGuessWord.strokes.length) window.drawStepHint(); else clearInterval(autoDrawInt); }, 850);
};
window.startCousinDrawRound = () => { if (autoDrawInt) clearInterval(autoDrawInt); window.clearGuessCanvas(); currentGuessWord = PICTIONARY_WORDS[Math.floor(Math.random()*PICTIONARY_WORDS.length)]; document.getElementById('guess-prompt-title').textContent = `✏️ Gizli Kelime: ${currentGuessWord.word}`; renderGuessChoices(); };
window.drawStepHint = () => {
  const c = document.getElementById('guess-canvas'); if (!c) return;
  const ctx = c.getContext('2d'), st = currentGuessWord.strokes[guessHintStep++ % currentGuessWord.strokes.length];
  if (!st) return; ctx.strokeStyle = st.color; ctx.lineWidth = 7; ctx.beginPath();
  st.pts.forEach(([x,y], i) => i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)); ctx.stroke();
};
function renderGuessChoices() {
  const g = document.getElementById('guess-choices-grid'); if (!g) return; g.innerHTML = '';
  const opts = [currentGuessWord, ...PICTIONARY_WORDS.filter(w=>w.id!==currentGuessWord.id).sort(()=>Math.random()-0.5).slice(0,3)].sort(()=>Math.random()-0.5);
  opts.forEach(o => {
    const b = document.createElement('button'); b.className = 'guess-choice-btn'; b.textContent = o.word;
    b.onclick = () => {
      if (o.id === currentGuessWord.id) { b.classList.add('correct'); playSound('win'); addStars(3); speakText(`Bravo! ${o.speech}!`); setTimeout(window.startAutoDrawRound, 1500); }
      else { b.classList.add('wrong'); playSound('pop'); }
    };
    g.appendChild(b);
  });
}

let memoryDeck = [], flippedIdx = [];
window.initMemoryGame = () => {
  const icons = ['assets/umay/plane.png','assets/umay/sweater.png','assets/umay/boots.png','assets/umay/pony.png','assets/sprites/cow.png','assets/sprites/baby.png'];
  memoryDeck = [...icons,...icons].map((src,i)=>({src,f:false,m:false})).sort(()=>Math.random()-0.5);
  flippedIdx = []; renderMem();
};
function renderMem() {
  const g = document.getElementById('memory-grid'); if (!g) return; g.innerHTML = '';
  memoryDeck.forEach((c, i) => {
    const el = document.createElement('div'); el.className = `memory-card ${(c.f||c.m)?'flipped':''}`;
    el.innerHTML = (c.f||c.m) ? `<img src="${c.src}" />` : '<span>❓</span>';
    el.onclick = () => {
      if (c.f||c.m||flippedIdx.length>=2) return; playSound('pop'); c.f = true; flippedIdx.push(i); renderMem();
      if (flippedIdx.length===2) {
        const [a,b] = flippedIdx;
        if (memoryDeck[a].src === memoryDeck[b].src) { memoryDeck[a].m=memoryDeck[b].m=true; flippedIdx=[]; playSound('win'); addStars(2); }
        else setTimeout(()=>{ memoryDeck[a].f=memoryDeck[b].f=false; flippedIdx=[]; renderMem(); }, 750);
      }
    };
    g.appendChild(el);
  });
}

const XOX_T = { umay: 'assets/umay/plane.png', yusuf: 'assets/sprites/cow.png', deren: 'assets/sprites/baby.png', elif: 'assets/sprites/unicorn.png' };
let xoxVsBot = false;

window.setXoxMode = (vsBot) => {
  xoxVsBot = vsBot;
  const b2 = document.getElementById('xox-mode-2p');
  const bb = document.getElementById('xox-mode-bot');
  if (b2) b2.classList.toggle('active', !vsBot);
  if (bb) bb.classList.toggle('active', vsBot);
  window.resetXoxGame();
  speakText(vsBot ? 'XOX Bota karşı başladı! Sıra sende!' : 'XOX 2 Kuzen canlı başladı! Herkes kendi sırasını beklemeli!');
};

function checkXoxWinner(board, whoName) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [x,y,z] of lines) {
    if (board[x] && board[x] === board[y] && board[x] === board[z]) return whoName;
  }
  if (board.every(v => v)) return 'Berabere 🤝';
  return null;
}

function makeXoxBotMove() {
  if (!xoxVsBot || state.xox.winner || state.xox.turn !== 'p2') return;
  const empties = state.xox.board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  if (empties.length === 0) return;
  const pick = empties[Math.floor(Math.random() * empties.length)];
  const botId = state.xox.p2;
  state.xox.board[pick] = botId;
  playSound('pop');
  state.xox.winner = checkXoxWinner(state.xox.board, 'Bot 🤖');
  if (!state.xox.winner) state.xox.turn = 'p1';
  else playSound('win');
  renderXoxBoard();
}

function renderXoxBoard() {
  const b = document.getElementById('xox-board'); if (!b) return; b.innerHTML = '';
  state.xox.p1 = xoxVsBot ? state.currentPlayer : document.getElementById('xox-p1').value;
  state.xox.p2 = xoxVsBot ? (state.currentPlayer === 'yusuf' ? 'umay' : 'yusuf') : document.getElementById('xox-p2').value;
  const act = state.xox.turn === 'p1' ? state.xox.p1 : state.xox.p2;
  const isMyTurn = xoxVsBot ? (state.xox.turn === 'p1') : (state.currentPlayer === act);
  const actName = (xoxVsBot && state.xox.turn === 'p2') ? 'Bot 🤖' : COUSINS[act].name;

  document.getElementById('xox-turn-label').textContent = state.xox.winner
    ? `🏆 Sonuç: ${state.xox.winner}`
    : (isMyTurn ? `✅ Sıra SENDE! (${actName})` : `⏳ Sıra ${actName}'ta — Kendi sıranı bekle!`);

  state.xox.board.forEach((v, i) => {
    const cell = document.createElement('div'); cell.className = 'xox-cell';
    if (v) cell.innerHTML = `<img src="${XOX_T[v]}" />`;
    cell.onclick = () => {
      if (state.xox.board[i] || state.xox.winner) return;
      // STRICT TURN LOCK: Never allow playing during opponent's or bot's turn!
      if (!isMyTurn) {
        playSound('moo');
        speakText(`Şu an sıra ${actName} tarafında! Kendi sıranı bekle!`);
        return;
      }
      state.xox.board[i] = act; playSound('pop');
      state.xox.winner = checkXoxWinner(state.xox.board, COUSINS[act].name);
      if (!state.xox.winner) state.xox.turn = state.xox.turn === 'p1' ? 'p2' : 'p1';
      else { playSound('win'); addStars(3); speakText(`Tebrikler! ${state.xox.winner} kazandı!`); }
      if (!xoxVsBot) sendMultiplayerSync({ type: 'xox_sync', xox: state.xox });
      renderXoxBoard();
      if (xoxVsBot && !state.xox.winner && state.xox.turn === 'p2') {
        setTimeout(makeXoxBotMove, 500);
      }
    };
    b.appendChild(cell);
  });
}
window.resetXoxGame = () => {
  state.xox.board = Array(9).fill(null);
  state.xox.turn = 'p1';
  state.xox.winner = null;
  if (!xoxVsBot) sendMultiplayerSync({ type: 'xox_sync', xox: state.xox });
  renderXoxBoard();
};

window.startPuzzle = (img, t) => { state.puzzle.image = img; state.puzzle.title = t; window.shuffleCurrentPuzzle(); };
window.shuffleCurrentPuzzle = () => { state.puzzle.tiles = [0,1,2,3,4,5,6,7,8].sort(()=>Math.random()-0.5); state.puzzle.selectedIdx = null; renderPuz(); };
function renderPuz() {
  const g = document.getElementById('puzzle-grid'); if (!g) return; g.innerHTML = '';
  state.puzzle.tiles.forEach((p, idx) => {
    const t = document.createElement('div'); t.className = `puzzle-tile ${state.puzzle.selectedIdx===idx?'selected-tile':''}`;
    t.style.backgroundImage = `url('${state.puzzle.image}')`;
    t.style.backgroundPosition = `-${(p%3)*102}px -${Math.floor(p/3)*102}px`;
    t.innerHTML = `<span class="tile-num">${p+1}</span>`;
    t.onclick = () => {
      playSound('pop');
      if (state.puzzle.selectedIdx===null) state.puzzle.selectedIdx = idx;
      else { const f = state.puzzle.selectedIdx; [state.puzzle.tiles[f],state.puzzle.tiles[idx]]=[state.puzzle.tiles[idx],state.puzzle.tiles[f]]; state.puzzle.selectedIdx=null; }
      renderPuz();
    };
    g.appendChild(t);
  });
}
window.solveCurrentPuzzleHint = () => { for (let i=0;i<9;i++) if (state.puzzle.tiles[i]!==i) { const k=state.puzzle.tiles.indexOf(i); [state.puzzle.tiles[i],state.puzzle.tiles[k]]=[state.puzzle.tiles[k],state.puzzle.tiles[i]]; break; } renderPuz(); };

let catchId = null, catchX = 200, catchSc = 0, fallIt = [];
window.startCatchGame = () => {
  const c = document.getElementById('catch-canvas'); if (!c) return;
  const ctx = c.getContext('2d'); catchSc = 0; fallIt = []; if (catchId) cancelAnimationFrame(catchId);
  c.onpointermove = (e) => { const r = c.getBoundingClientRect(); catchX = (e.clientX-r.left)*(c.width/r.width); };
  const step = () => {
    if (state.currentMode !== 'arcade') return;
    ctx.clearRect(0,0,c.width,c.height);
    if (Math.random() < 0.035) fallIt.push({ x: 30+Math.random()*(c.width-60), y: -15, emo: ['🍎','🥛','🍓','⭐'][Math.floor(Math.random()*4)] });
    ctx.font = '30px sans-serif'; ctx.textAlign = 'center';
    for (let i=fallIt.length-1;i>=0;i--) {
      fallIt[i].y += 2.8; ctx.fillText(fallIt[i].emo, fallIt[i].x, fallIt[i].y);
      if (fallIt[i].y > c.height-40 && Math.abs(fallIt[i].x - catchX) < 45) { catchSc++; playSound('pop'); document.getElementById('catch-score-label').textContent = `Skor: ${catchSc}`; fallIt.splice(i,1); }
      else if (fallIt[i].y > c.height+20) fallIt.splice(i,1);
    }
    ctx.fillStyle = '#d97706'; ctx.fillRect(catchX-38, c.height-30, 76, 20);
    catchId = requestAnimationFrame(step);
  };
  step();
};

let whackH = -1, whackS = 0, whackT = null;
window.startWhackBearGame = () => { whackS = 0; if (whackT) clearInterval(whackT); renderWhack(); whackT = setInterval(() => { whackH = Math.floor(Math.random()*9); renderWhack(); }, 900); };
function renderWhack() {
  const g = document.getElementById('whack-grid'); if (!g) return; g.innerHTML = '';
  for (let i=0;i<9;i++) {
    const b = document.createElement('button');
    b.style.cssText = `border-radius:20px;border:4px solid #78350f;background:${i===whackH?'#fef08a':'#dcfce7'};font-size:38px;cursor:pointer;`;
    b.textContent = i===whackH ? '🐻' : '🌽';
    b.onclick = () => { if (i===whackH) { whackS++; whackH=-1; playSound('bark'); document.getElementById('whack-score-label').textContent = `🐶 Skor: ${whackS}`; renderWhack(); } };
    g.appendChild(b);
  }
}

let instType = 'piano';
window.setPianoInstrument = (t) => { instType = t; playSound('pop'); };
function playFreq(f) { const ctx = getAudioCtx(); if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = instType==='xylo'?'sine':'triangle'; o.frequency.setValueAtTime(f, ctx.currentTime); g.gain.setValueAtTime(0.24, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.38); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.4); }
function initPianoKeys() {
  const row = document.getElementById('piano-keys-row'); if (!row) return; row.innerHTML = '';
  [{n:'Do',f:261.6,c:'#ef4444',e:'🐄'},{n:'Re',f:293.6,c:'#f97316',e:'🐴'},{n:'Mi',f:329.6,c:'#eab308',e:'🐥'},{n:'Fa',f:349.2,c:'#22c55e',e:'🐶'},{n:'Sol',f:392,c:'#06b6d4',e:'🐱'},{n:'La',f:440,c:'#3b82f6',e:'🦄'},{n:'Si',f:493.8,c:'#8b5cf6',e:'✈️'}].forEach(k => {
    const b = document.createElement('button');
    b.style.cssText = `width:68px;height:145px;background:${k.c};color:#fff;border:4px solid #fff;border-radius:18px;font-weight:900;cursor:pointer;font-size:15px;`;
    b.innerHTML = `<div style="font-size:26px;">${k.e}</div>${k.n}`;
    b.onclick = () => playFreq(k.f); row.appendChild(b);
  });
}
window.playAutoNurserySong = () => [392,392,440,392,349.2,329.6].forEach((f,i)=>setTimeout(()=>playFreq(f), i*320));

window.generateMathQuestion = (lvl = 'easy') => {
  const box = document.getElementById('math-visual-box'), row = document.getElementById('math-options-row');
  if (!box || !row) return; row.innerHTML = '';
  const ans = lvl==='easy' ? 1+Math.floor(Math.random()*5) : (2+Math.floor(Math.random()*6))+(1+Math.floor(Math.random()*5));
  box.textContent = lvl==='easy' ? Array(ans).fill('🐄').join(' ') : `${Math.floor(ans/2)} + ${ans-Math.floor(ans/2)} = ?`;
  const set = new Set([ans]); while(set.size<4) set.add(Math.max(1, ans+Math.floor(Math.random()*5)-2));
  [...set].sort((a,b)=>a-b).forEach(num => {
    const b = document.createElement('button'); b.className = 'guess-choice-btn'; b.textContent = num;
    b.onclick = () => { if (num===ans) { playSound('win'); addStars(2); window.generateMathQuestion(lvl); } else playSound('pop'); };
    row.appendChild(b);
  });
};

let raceId = null, rY = 155, rVy = 0, oX = 460, rSc = 0;
window.startPonyRaceGame = () => {
  const c = document.getElementById('race-canvas'); if (!c) return;
  const ctx = c.getContext('2d'); if (rY >= 150) { rVy = -11; playSound('pop'); }
  if (raceId) return; c.onclick = () => { if (rY >= 150) { rVy = -11; playSound('pop'); } };
  const step = () => {
    if (state.currentMode !== 'arcade') { raceId = null; return; }
    ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle = '#22c55e'; ctx.fillRect(0,185,c.width,35);
    rY += rVy; rVy += 0.55; if (rY > 155) { rY = 155; rVy = 0; }
    oX -= 4.2; if (oX < -25) { oX = c.width+30; rSc++; document.getElementById('race-score-label').textContent = `Skor: ${rSc}`; }
    if (Math.abs(oX-80)<26 && rY>130) { rSc = 0; oX = c.width+40; }
    ctx.font = '40px sans-serif'; ctx.fillText('🐴', 65, rY+24); ctx.fillText('🚧', oX, 182);
    raceId = requestAnimationFrame(step);
  };
  step();
};

let simonSeq = [], simonIdx = 0;
window.startSimonGame = () => { simonSeq = [Math.floor(Math.random()*4)]; simonIdx = 0; playSimon(); };
function playSimon() { simonSeq.forEach((p,i)=>setTimeout(()=>flashSim(p),(i+1)*600)); }
function flashSim(id) { const b=document.getElementById(`simon-${id}`); if(!b)return; playFreq([261.6,329.6,392,523.2][id]); b.style.transform='scale(1.15)'; setTimeout(()=>b.style.transform='scale(1)',300); }
window.pressSimonPad = (id) => {
  flashSim(id); if (simonSeq.length===0) { window.startSimonGame(); return; }
  if (id===simonSeq[simonIdx]) { simonIdx++; if (simonIdx>=simonSeq.length) { playSound('win'); addStars(2); simonSeq.push(Math.floor(Math.random()*4)); simonIdx=0; setTimeout(playSimon,800); } }
  else { playSound('moo'); window.startSimonGame(); }
};

/* ============================================================================
   12. REAL VOICE CHAT (PUSH-TO-TALK MICROPHONE RECORDING) + NAVIGATION
   ============================================================================ */
let mediaRecorder = null, audioChunks = [], isRecordingVoice = false;

window.toggleVoiceRecording = async function() {
  const btn = document.getElementById('voice-rec-btn');
  const st = document.getElementById('voice-rec-status');

  if (isRecordingVoice && mediaRecorder) {
    mediaRecorder.stop();
    isRecordingVoice = false;
    btn.classList.remove('recording');
    btn.textContent = '🎙️ Sesli Mesaj Kaydet & Gönder!';
    st.textContent = 'Gönderildi! ✅';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const p = COUSINS[state.currentPlayer];
        playSound('win');
        addChatMessage(p.name, '🎙️', 'Sesli mesaj gönderdi! Dinlemek için dokun:', null, reader.result);
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(tr => tr.stop());
    };
    mediaRecorder.start();
    isRecordingVoice = true;
    btn.classList.add('recording');
    btn.textContent = '⏹️ Kaydı Bitir & Gönder!';
    st.textContent = '🔴 Kaydediliyor... Konuş!';
  } catch (err) {
    // Fallback if browser/device has no microphone permission: send instant Turkish TTS voice note!
    const p = COUSINS[state.currentPlayer];
    const spoken = window.prompt('Mikrofon izni bulunamadı — Sesli okunacak mesajını yaz:', 'Merhaba kuzenlerim, hadi birlikte oynayalım!');
    if (spoken) {
      playSound('win');
      speakText(`${p.name} sesli mesaj gönderdi: ${spoken}`);
      addChatMessage(p.name, '🎙️', spoken);
    }
  }
};

window.tryAccessMode = function(targetMode) {
  const p = state.currentPlayer;
  if (targetMode === 'yusuf-farm' && p !== 'yusuf' && !state.unlockedForAll['yusuf-farm']) {
    window.requestCousinHelp(p, `${COUSINS[p].name}, Yusuf'un 3D çiftliğinde gezmek, araba/at sürmek ve hayvanlara su/ot vermek istiyor! Kapı açılsın mı?`, 'yusuf-farm');
    return;
  }
  window.switchMode(targetMode);
};

window.requestCousinHelp = (who, msg, targetMode = null) => {
  playSound('win');
  state.pendingHelpTargetMode = targetMode || state.currentMode;
  document.getElementById('coop-invite-text').textContent = `🆘 ${msg}`;
  document.getElementById('coop-invite-popup').style.display = 'flex';
  speakText(msg);
  addChatMessage(COUSINS[state.currentPlayer].name, '🆘', msg);
};

window.acceptCousinHelp = () => {
  document.getElementById('coop-invite-popup').style.display = 'none';
  state.unlockedForAll['yusuf-farm'] = true;
  document.getElementById('label-yusuf-farm').textContent = '3D Çiftlik & Araba/At';
  playSound('win');
  if (state.pendingHelpTargetMode) window.switchMode(state.pendingHelpTargetMode);
};

// STRICT NAME-VALIDATED LOGIN (Only Umay, Yusuf, Deren, Elif accepted — case-insensitive!)
const onlineCousins = new Set(['Umay']);

function updateOnlineCousinsBadge() {
  const pill = document.getElementById('online-cousins-pill');
  if (pill) pill.textContent = `🟢 Aktif: ${[...onlineCousins].join(', ')}`;
}

window.requireNameLoginPrompt = function(hintName) {
  const inp = document.getElementById('login-name-input');
  const errEl = document.getElementById('login-error-msg');
  if (errEl) {
    errEl.style.display = 'block';
    errEl.textContent = `🔒 İsim yazmadan giriş yapılamaz! Lütfen kutuya "${hintName}" yazıp Giriş Yap'a bas!`;
  }
  if (inp) {
    inp.focus();
    inp.style.borderColor = '#ef4444';
  }
  playSound('pop');
  speakText(`İsim yazmadan oyuna giremezsin! Lütfen yukarıdaki kutuya ${hintName} yazarak giriş yap!`);
};

window.submitCousinNameLogin = function(ev) {
  ev.preventDefault();
  const inp = document.getElementById('login-name-input');
  const errEl = document.getElementById('login-error-msg');
  const raw = (inp?.value || '').trim().toLocaleLowerCase('tr-TR').replace(/ı/g, 'i');
  const validMap = { umay: 'umay', yusuf: 'yusuf', deren: 'deren', elif: 'elif' };

  if (!validMap[raw]) {
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = '🚫 Üzgünüm! İsim yazmadan girilemez. Sadece Umay, Yusuf, Deren veya Elif yazabilirsin!';
    }
    playSound('moo');
    speakText('Sadece Umay, Yusuf, Deren veya Elif ismiyle giriş yapabilirsin!');
    return;
  }
  if (errEl) errEl.style.display = 'none';
  if (inp) { inp.value = ''; inp.style.borderColor = '#cbd5e1'; }
  window.selectCousin(validMap[raw], true);
};

// PRACTICAL 1-BUTTON PUSH-TO-TALK (Hold to speak, release to send & auto-play!)
let quickPTTActive = false;
window.startQuickPTT = function() {
  if (quickPTTActive) return;
  quickPTTActive = true;
  const b = document.getElementById('quick-ptt-btn');
  if (b) { b.classList.add('recording'); b.textContent = '🔴 KONUŞ...'; }
  window.toggleVoiceRecording();
};
window.stopQuickPTT = function() {
  if (!quickPTTActive) return;
  quickPTTActive = false;
  const b = document.getElementById('quick-ptt-btn');
  if (b) { b.classList.remove('recording'); b.textContent = '🎙️ BAS-KONUŞ'; }
  if (isRecordingVoice) window.toggleVoiceRecording();
};

// DRAG-AND-DROP BABY WIPE & CLEAN DIAPER + AUTOMATIC HUNGER/CRYING & AUTOMATIC BEAR ATTACKS
function initDragBabyCareAndAutonomousLoops() {
  const setupDragTool = (elId, actionType) => {
    const el = document.getElementById(elId);
    if (!el) return;
    let sx = 0, sy = 0;
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY;
      el.style.position = 'relative'; el.style.zIndex = '999';
    });
    el.addEventListener('pointermove', (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      el.style.transform = `translate(${e.clientX - sx}px, ${e.clientY - sy}px) scale(1.15)`;
    });
    el.addEventListener('pointerup', (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      el.releasePointerCapture(e.pointerId);
      el.style.transform = '';
      // If dragged up onto the 3D baby area (or tapped), clean/change diaper!
      window.nursery3DAction(actionType);
    });
  };
  setupDragTool('drag-baby-wipe', 'wipe');
  setupDragTool('drag-baby-diaper', 'diaper');

  // Autonomous Baby Hunger & Crying Loop (Every 22 seconds when in nursery!)
  setInterval(() => {
    if (state.currentMode === 'nursery' && !state.baby.crying) {
      state.baby.hunger = Math.max(0, state.baby.hunger - 15);
      updateBabyStatsUI();
      if (state.baby.hunger <= 25) {
        window.triggerBabyNeed('hungry');
      }
    }
  }, 22000);

  // Autonomous Bear Attack in Yusuf's Farm (Every 38 seconds when in farm!)
  setInterval(() => {
    if (state.currentMode === 'yusuf-farm' && !bearAttackState) {
      window.trigger3DBearAttack();
    }
  }, 38000);
}

window.selectCousin = function(id, viaNameForm = false) {
  if (!viaNameForm) {
    window.requireNameLoginPrompt(COUSINS[id]?.name || 'Umay');
    return;
  }
  const c = COUSINS[id] || COUSINS.umay;
  state.currentPlayer = c.id;
  onlineCousins.add(c.name);
  updateOnlineCousinsBadge();
  sendMultiplayerSync({ type: 'presence_join', name: c.name });
  state.salonConfigs[c.id].petType = state.starterPet;
  state.unlockedForAll['yusuf-farm'] = (c.id === 'yusuf');
  document.getElementById('label-yusuf-farm').textContent = (c.id === 'yusuf') ? '3D Çiftlik & Araba/At' : '🔒 Yusuf Çiftliği';
  document.getElementById('active-player-name').textContent = `${c.name} (${c.age} Yaş)`;
  document.getElementById('active-player-avatar').innerHTML = `<img src="${c.avatar}" style="width:32px;height:32px;object-fit:contain;" />`;
  document.getElementById('character-modal').classList.add('hidden');

  buildExplorerRig();
  window.switch3DRoomOwner(c.id);
  window.switch3DFarmTheme(c.id);
  window.switchSalonModel(c.id, true);
  window.rebuild3DNurseryBaby();
  window.renderBabyWardrobeGrid('all');
  if (chessGame) chessGame.render();
  renderXoxBoard();

  // Enforce strict age-based game area visibility on login (hide the other age group completely!)
  const bigBtn = document.getElementById('cat-big-btn');
  const todBtn = document.getElementById('cat-toddler-btn');
  const navArcLbl = document.getElementById('nav-arcade-label');
  if (c.age === 3) {
    if (bigBtn) bigBtn.style.display = 'none';
    if (todBtn) { todBtn.style.display = 'inline-flex'; todBtn.textContent = `👶 ${c.name} (20 Oyun)`; }
    if (navArcLbl) navArcLbl.textContent = '20 Oyun';
    window.switchArcadeCategory('toddler', true);
  } else {
    if (todBtn) todBtn.style.display = 'none';
    if (bigBtn) { bigBtn.style.display = 'inline-flex'; bigBtn.textContent = `👧👦 8 Yaş (27 Oyun)`; }
    if (navArcLbl) navArcLbl.textContent = 'Oyunlar (27)';
    window.switchArcadeCategory('big', true);
  }
  document.getElementById('label-yusuf-farm').textContent = (c.id === 'yusuf') ? '3D Çiftlik' : '🔒 Çiftlik';

  playSound('win');
  speakText(c.greeting);
};

window.openCharacterModal = () => { playSound('pop'); document.getElementById('character-modal').classList.remove('hidden'); };

// UNIVERSAL COLLAPSIBLE PANELS & AUTO DEVICE RESPONSIVE LAYOUT (PHONE / TABLET / PC!)
let drivePadCollapsed = false;
let hudBarsHidden = false;

function updateFloatingDockVisibility() {
  const dock = document.getElementById('floating-panel-dock');
  if (!dock) return;
  const mode = state.currentMode;
  if (mode === 'arcade') {
    dock.style.display = 'none';
    return;
  }
  dock.style.display = 'flex';
  const hasSidebar = ['rooms', 'salon', 'yusuf-farm', 'nursery'].includes(mode);
  const hasPad = ['map', 'yusuf-farm', 'lunapark'].includes(mode);
  const sbBtn = document.getElementById('dock-btn-sidebar');
  const padBtn = document.getElementById('dock-btn-pad');
  const barBtn = document.getElementById('dock-btn-bars');
  if (sbBtn) {
    sbBtn.style.display = hasSidebar ? 'inline-flex' : 'none';
    const sb = document.querySelector(`#hud-${mode} .hud-sidebar`);
    const isClosed = sb ? sb.classList.contains('collapsed') : false;
    sbBtn.textContent = isClosed ? '📦 Menüyü Aç' : '📦 Menüyü Kapat';
  }
  if (padBtn) {
    padBtn.style.display = hasPad ? 'inline-flex' : 'none';
    padBtn.textContent = drivePadCollapsed ? '🕹️ Kumanda Aç' : '🕹️ Kumanda Kapat';
  }
  if (barBtn) {
    barBtn.textContent = hudBarsHidden ? '👁️ Barları Göster' : '👁️ Barları Gizle';
  }
}

window.toggleActiveSidebar = function(forceCollapse = null) {
  const sb = document.querySelector(`#hud-${state.currentMode} .hud-sidebar`);
  if (!sb) return;
  const next = forceCollapse !== null ? forceCollapse : !sb.classList.contains('collapsed');
  sb.classList.toggle('collapsed', next);
  playSound('pop');
  updateFloatingDockVisibility();
};

window.toggleDrivePadCollapsed = function(forceCollapse = null) {
  drivePadCollapsed = forceCollapse !== null ? forceCollapse : !drivePadCollapsed;
  const pad = document.getElementById('drive-pad');
  if (pad) pad.classList.toggle('collapsed', drivePadCollapsed);
  playSound('pop');
  updateFloatingDockVisibility();
};

window.toggleHudBars = function(forceHide = null) {
  hudBarsHidden = forceHide !== null ? forceHide : !hudBarsHidden;
  document.querySelectorAll('.hud-screen').forEach(s => s.classList.toggle('hud-bars-hidden', hudBarsHidden));
  playSound('pop');
  updateFloatingDockVisibility();
};

window.toggleArcadeGameList = function(forceCollapse = null) {
  const rib = document.getElementById('arcade-games-ribbon');
  const btn = document.getElementById('arcade-list-toggle-btn');
  if (!rib) return;
  const next = forceCollapse !== null ? forceCollapse : !rib.classList.contains('collapsed');
  rib.classList.toggle('collapsed', next);
  if (btn) btn.textContent = next ? '🎮 Oyun Listesini Aç ▼' : '🎮 Oyun Listesini Kapat ▲';
  playSound('pop');
};

function applyAutoDeviceLayout() {
  const w = window.innerWidth;
  const isPhone = w <= 860;
  document.body.dataset.device = isPhone ? 'phone' : (w <= 1120 ? 'tablet' : 'desktop');
  // On phones, start with ALL 3D panels (sidebar, drive-pad, top/bottom bars) cleanly COLLAPSED so nothing overlaps!
  document.querySelectorAll('.hud-sidebar').forEach(sb => sb.classList.toggle('collapsed', isPhone));
  drivePadCollapsed = isPhone;
  hudBarsHidden = isPhone;
  const pad = document.getElementById('drive-pad');
  if (pad) pad.classList.toggle('collapsed', drivePadCollapsed);
  document.querySelectorAll('.hud-screen').forEach(s => s.classList.toggle('hud-bars-hidden', hudBarsHidden));
  updateFloatingDockVisibility();
}

window.switchMode = function(mode) {
  state.currentMode = mode;
  playSound('pop');
  if (mode !== 'arcade') { cleanupMiniGame(); stop3DMiniGame(); }

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.querySelectorAll('.hud-screen, .full-overlay-screen').forEach(s => s.classList.remove('active'));
  const targetHud = document.getElementById(`hud-${mode}`);
  if (targetHud) targetHud.classList.add('active');

  if (mode === 'arcade') {
    // Always open the game list when entering Arcade so all games are immediately visible & clickable!
    window.toggleArcadeGameList(false);
  }

  Object.keys(worldGroups).forEach(k => worldGroups[k].visible = (k === mode));
  attachExplorerToActiveWorld();
  setCameraForMode(mode);
  updateFloatingDockVisibility();
};

function updateInventoryUI() {
  document.getElementById('inv-wheat').textContent = state.inventory.wheat;
  document.getElementById('inv-milk').textContent = state.inventory.milk;
  document.getElementById('inv-stars').textContent = state.inventory.stars;
}

window.toggleChatDrawer = (force = null) => {
  const d = document.getElementById('chat-drawer');
  d.classList.toggle('open', force !== null ? force : !d.classList.contains('open'));
  playSound('pop');
};

function renderChatMessages() {
  const box = document.getElementById('chat-messages'); if (!box) return;
  box.innerHTML = '';
  const myName = COUSINS[state.currentPlayer].name;
  state.chatMessages.forEach(m => {
    const b = document.createElement('div');
    b.className = `chat-bubble ${m.sender === myName ? 'mine' : ''}`;
    b.innerHTML = `
      <div class="sender"><span>${m.emoji || '💬'} ${m.sender}</span><span>🔊 Dinle</span></div>
      <div class="msg-text">${m.text}</div>
      ${m.audio ? `<audio controls src="${m.audio}" style="width:100%;height:34px;margin-top:6px;"></audio>` : ''}
      ${m.drawing ? `<img src="${m.drawing}" class="msg-drawing" alt="Çizim" />` : ''}
    `;
    b.onclick = (e) => { if (e.target.tagName !== 'AUDIO') speakText(`${m.sender} diyor ki: ${m.text}`); };
    box.appendChild(b);
  });
  box.scrollTop = box.scrollHeight;
}

function addChatMessage(sender, emoji, text, drawing = null, audio = null) {
  const msg = { id: Date.now(), sender, emoji, text, drawing, audio };
  state.chatMessages.push(msg);
  renderChatMessages();
  if (syncChannel) syncChannel.postMessage({ type: 'chat_msg', msg });
  fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'chat_msg', msg }) }).catch(() => {});
}

window.sendVoiceSticker = (emoji, text) => { const p = COUSINS[state.currentPlayer]; playSound('win'); speakText(`${p.name}: ${text}`); addChatMessage(p.name, emoji, text); };
window.handleChatSubmit = (ev) => {
  ev.preventDefault(); const inp = document.getElementById('chat-text-input'); const t = inp.value.trim(); if (!t) return;
  const p = COUSINS[state.currentPlayer]; playSound('pop'); speakText(t); addChatMessage(p.name, p.emoji, t); inp.value = '';
};
window.toggleDrawPad = () => { document.getElementById('draw-pad-box').classList.toggle('active'); playSound('pop'); };
window.clearDrawCanvas = () => { const c = document.getElementById('draw-canvas'); c.getContext('2d').clearRect(0,0,c.width,c.height); };
window.sendDrawingMessage = () => { const c = document.getElementById('draw-canvas'); const p = COUSINS[state.currentPlayer]; playSound('win'); addChatMessage(p.name, '🎨', 'Size resim çizdim!', c.toDataURL('image/png')); window.clearDrawCanvas(); window.toggleDrawPad(); };

function initChatDrawPad() {
  const c = document.getElementById('draw-canvas'); if (!c) return;
  const ctx = c.getContext('2d'); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#db2777';
  let dr = false;
  c.addEventListener('pointerdown', (e) => { dr = true; const r = c.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(e.clientX-r.left, e.clientY-r.top); });
  c.addEventListener('pointermove', (e) => { if (!dr) return; const r = c.getBoundingClientRect(); ctx.lineTo(e.clientX-r.left, e.clientY-r.top); ctx.stroke(); });
  window.addEventListener('pointerup', () => dr = false);
}

// Remote 3D Cousin Avatars (Live Multiplayer Presence in 3D Map, Farm & Lunapark!)
const remoteAvatars = {};
let lastPosBroadcast = 0;

function updateRemote3DAvatar(data) {
  const key = data.senderClientId;
  if (!key || key === CLIENT_ID) return;
  const targetWorld = worldGroups[data.mode];
  if (!targetWorld) return;

  if (!remoteAvatars[key]) {
    const cid = data.cousinId || 'yusuf';
    const mesh = createFitted3DCharacter(cid, state.salonConfigs[cid] || state.salonConfigs.yusuf, false);
    mesh.scale.set(0.55, 0.55, 0.55);
    const lbl = create3DTextLabel(`🟢 ${COUSINS[cid]?.name || 'Kuzen'} (Canlı)`, COUSINS[cid]?.color || '#10b981');
    lbl.position.set(0, 6.2, 0);
    mesh.add(lbl);
    remoteAvatars[key] = { mesh, mode: data.mode };
    targetWorld.add(mesh);
  }
  const entry = remoteAvatars[key];
  if (entry.mode !== data.mode) {
    if (entry.mesh.parent) entry.mesh.parent.remove(entry.mesh);
    targetWorld.add(entry.mesh);
    entry.mode = data.mode;
  }
  entry.mesh.position.set(data.x, data.y || 0, data.z);
  entry.mesh.rotation.y = data.rotY || 0;
}

function handleIncomingSync(payload) {
  if (!payload || payload.senderClientId === CLIENT_ID) return;

  if (payload.type === 'chat_msg' && payload.msg && !state.chatMessages.some(m => m.id === payload.msg.id)) {
    state.chatMessages.push(payload.msg);
    renderChatMessages();
    if (payload.msg.audio) {
      try { new Audio(payload.msg.audio).play().catch(() => {}); } catch (e) {}
    }
  } else if (payload.type === 'presence_join' && payload.name) {
    onlineCousins.add(payload.name);
    updateOnlineCousinsBadge();
    playSound('win');
    speakText(`${payload.name} oyuna katıldı! Şu an aktif!`);
  } else if (payload.type === 'chess_sync' && chessGame) {
    chessGame.applyRemoteState(payload.chess);
  } else if (payload.type === 'xox_sync' && payload.xox) {
    state.xox = payload.xox;
    playSound('pop');
    renderXoxBoard();
  } else if (payload.type === 'farm_invite_umay') {
    state.farmUmayInvited = !!payload.allowed;
    state.unlockedForAll['yusuf-farm'] = true;
    playSound('win');
    if (state.currentPlayer === 'umay') {
      speakText('Yusuf seni 3D çiftliğe çağırdı! Artık çiftliğe girip her şeyi sürükle bırak ile düzenleyebilirsin!');
    }
  } else if (payload.type === 'avatar_pos') {
    updateRemote3DAvatar(payload);
  }

  // Forward to any active 2-player mini-game listener (e.g. 2P Car Race)
  multiplayerListeners.forEach(fn => {
    try { fn(payload); } catch (e) {}
  });
}

window.addEventListener('DOMContentLoaded', () => {
  init3DEngine();
  initWallArtCanvas();
  chessGame = new Chess3DGame({
    onSound: playSound,
    onSpeak: speakText,
    onReward: addStars,
    getPlayerId: () => state.currentPlayer,
    onSyncMove: (chessState) => sendMultiplayerSync({ type: 'chess_sync', chess: chessState })
  });
  renderArcadeRibbon();
  initGuessCanvas();
  window.initMemoryGame();
  renderXoxBoard();
  window.startPuzzle('assets/umay/raw_plane.jpg', 'Pembe Barbie Uçağı');
  initPianoKeys();
  window.generateMathQuestion('easy');
  renderChatMessages();
  initChatDrawPad();
  initDragBabyCareAndAutonomousLoops();
  updateInventoryUI();
  applyAutoDeviceLayout();
  window.addEventListener('resize', applyAutoDeviceLayout);

  // Connect to Live LAN/Wi-Fi Server-Sent Events (/api/events) so 2 tablets play together live!
  if ('EventSource' in window) {
    try {
      const es = new EventSource('/api/events');
      es.onmessage = (ev) => {
        try { handleIncomingSync(JSON.parse(ev.data)); } catch (e) {}
      };
    } catch (e) {}
  }
});
