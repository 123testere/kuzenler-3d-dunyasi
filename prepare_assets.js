const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const UMAY_DIR = path.join(__dirname, 'assets', 'umay');
const SPRITES_DIR = path.join(__dirname, 'assets', 'sprites');

/**
 * Flood-fill background removal starting from all 4 borders.
 * Preserves internal white details (like Hello Kitty's face or the plane's white tail)
 * while removing the outer studio background.
 */
async function removeBackgroundAndCrop(inputPath, outputPath, cropRegion = null, tolerance = 28) {
  let img = sharp(inputPath);
  const meta = await img.metadata();
  if (cropRegion) {
    img = img.extract({
      left: Math.round(cropRegion.left * meta.width),
      top: Math.round(cropRegion.top * meta.height),
      width: Math.round(cropRegion.width * meta.width),
      height: Math.round(cropRegion.height * meta.height),
    });
  }

  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const visited = new Uint8Array(w * h);

  // Sample corner pixels to determine background color
  function getPixel(x, y) {
    const idx = (y * w + x) * 4;
    return [data[idx], data[idx + 1], data[idx + 2]];
  }

  const bgSamples = [
    getPixel(0, 0),
    getPixel(w - 1, 0),
    getPixel(0, h - 1),
    getPixel(w - 1, h - 1),
    getPixel(Math.floor(w / 2), 0),
    getPixel(Math.floor(w / 2), h - 1)
  ];

  function isBgColor(r, g, b) {
    // Check if near any corner background sample or near pure white/light gray
    for (const [br, bg, bb] of bgSamples) {
      const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
      if (dist <= tolerance * 3) return true;
    }
    return (r > 240 && g > 240 && b > 240);
  }

  const queue = [];
  for (let x = 0; x < w; x++) {
    queue.push(x, 0);
    queue.push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    queue.push(0, y);
    queue.push(w - 1, y);
  }

  while (queue.length > 0) {
    const y = queue.pop();
    const x = queue.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const pos = y * w + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    const idx = pos * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    if (isBgColor(r, g, b)) {
      data[idx + 3] = 0; // Transparent
      queue.push(x + 1, y);
      queue.push(x - 1, y);
      queue.push(x, y + 1);
      queue.push(x, y - 1);
    }
  }

  // Soften edges (1px feathering)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 0) {
        let transparentNeighbors = 0;
        if (data[((y - 1) * w + x) * 4 + 3] === 0) transparentNeighbors++;
        if (data[((y + 1) * w + x) * 4 + 3] === 0) transparentNeighbors++;
        if (data[(y * w + (x - 1)) * 4 + 3] === 0) transparentNeighbors++;
        if (data[(y * w + (x + 1)) * 4 + 3] === 0) transparentNeighbors++;
        if (transparentNeighbors >= 2) {
          data[idx + 3] = 160;
        }
      }
    }
  }

  // Auto-trim transparent borders so draggable sprites fit tightly
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent sprite: ${path.basename(outputPath)}`);
}

// Download helper for free open-source animated/vector game assets (Twemoji / Fluent / OpenGameArt style SVGs)
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Free open-source CC-BY-4.0 / MIT Twemoji high-res vector sprites for farm, room, baby care, and toys
const FREE_SPRITES = {
  // Farm animals & items for Yusuf's Farm
  'cow.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f404.svg',
  'cow_face.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f42e.svg',
  'horse.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f40e.svg',
  'sheep.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f411.svg',
  'chick.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f424.svg',
  'hen.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f414.svg',
  'dog.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f415.svg',
  'cat.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f408.svg',
  'rabbit.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f407.svg',
  'tractor.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f69c.svg',
  'barn.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3e1.svg',
  'tree.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f333.svg',
  'pine.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f332.svg',
  'sunflower.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f33b.svg',
  'tulip.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f337.svg',
  'corn.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f33d.svg',
  'carrot.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f955.svg',
  'apple.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f34e.svg',
  'milk.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f95b.svg',
  'bucket.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1faa3.svg',
  'water.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4a7.svg',
  'soap.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fc.svg',
  'sponge.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fd.svg',
  'egg.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f95a.svg',

  // Room Furniture & Dress-up items for Umay's Room & Deren/Elif's Nursery
  'bed.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6cf.svg',
  'couch.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6cb.svg',
  'chair.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa91.svg',
  'mirror.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa9e.svg',
  'window.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa9f.svg',
  'plant.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fab4.svg',
  'teddy.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f8.svg',
  'unicorn.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f984.svg',
  'balloon.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f388.svg',
  'ribbon.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f380.svg',
  'crown.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f451.svg',
  'dress.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f457.svg',
  'tshirt.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f455.svg',
  'jeans.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f456.svg',
  'glasses.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f576.svg',
  'handbag.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f45c.svg',
  'baby.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f476.svg',
  'bottle.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f37c.svg',
  'bath.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6c1.svg',
  'music.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3b5.svg',
  'star.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2b50.svg',
  'heart.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2764.svg',
  'sparkles.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2728.svg',
  'gift.svg': 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f381.svg'
};

async function main() {
  console.log('1) Processing Umay\'s special photos into transparent game sprites...');
  await removeBackgroundAndCrop(
    path.join(UMAY_DIR, 'raw_plane.jpg'),
    path.join(UMAY_DIR, 'plane.png'),
    null,
    24
  );

  await removeBackgroundAndCrop(
    path.join(UMAY_DIR, 'raw_sweater.jpg'),
    path.join(UMAY_DIR, 'sweater.png'),
    null,
    22
  );

  await removeBackgroundAndCrop(
    path.join(UMAY_DIR, 'raw_boots.jpg'),
    path.join(UMAY_DIR, 'boots.png'),
    null,
    24
  );

  // Full Chelsea + Pony + Helmet set
  await removeBackgroundAndCrop(
    path.join(UMAY_DIR, 'raw_chelsea.jpg'),
    path.join(UMAY_DIR, 'chelsea_set.png'),
    null,
    22
  );

  // Also split raw_chelsea.jpg into 3 individual interactive sprites:
  // 1. Pink Helmet (bottom-left)
  await removeBackgroundAndCrop(
    path.join(UMAY_DIR, 'raw_chelsea.jpg'),
    path.join(UMAY_DIR, 'helmet.png'),
    { left: 0.0, top: 0.58, width: 0.16, height: 0.28 },
    22
  );
  // Clear inner white visor inside helmet strap
  {
    const hp = path.join(UMAY_DIR, 'helmet.png');
    const { data, info } = await sharp(hp).raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240 && data[i] - data[i + 1] < 10) {
        data[i + 3] = 0;
      }
    }
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(hp);
  }

  // 2. Chelsea Doll (left-center)
  await removeBackgroundAndCrop(
    path.join(UMAY_DIR, 'raw_chelsea.jpg'),
    path.join(UMAY_DIR, 'chelsea_doll.png'),
    { left: 0.15, top: 0.20, width: 0.24, height: 0.65 },
    22
  );

  // 3. Pony Horse (right half)
  await removeBackgroundAndCrop(
    path.join(UMAY_DIR, 'raw_chelsea.jpg'),
    path.join(UMAY_DIR, 'pony.png'),
    { left: 0.38, top: 0.18, width: 0.62, height: 0.66 },
    22
  );

  console.log('2) Downloading free high-res vector game assets...');
  const entries = Object.entries(FREE_SPRITES);
  for (const [filename, url] of entries) {
    const dest = path.join(SPRITES_DIR, filename);
    try {
      await downloadFile(url, dest);
      process.stdout.write('.');
    } catch (e) {
      console.error(`\nFailed to download ${filename}:`, e.message);
    }
  }
  console.log('\nAll assets prepared successfully!');
}

main().catch(console.error);
