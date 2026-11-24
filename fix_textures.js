const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const dir = path.join(__dirname, 'assets', 'sprites');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

  for (const f of files) {
    const p = path.join(dir, f);
    let svg = fs.readFileSync(p, 'utf8');
    if (!svg.includes('width=')) {
      svg = svg.replace('<svg ', '<svg width="512" height="512" ');
      fs.writeFileSync(p, svg, 'utf8');
    }
    const pngPath = path.join(dir, f.replace('.svg', '.png'));
    await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(pngPath);
  }
  console.log(`Fixed ${files.length} SVGs and generated crisp 256x256 PNGs!`);

  // Extract the "TREND HUNTERS + 3 dogs" chest graphic from Umay's yellow sweater
  // so it maps seamlessly onto the 3D knit sweater torso without background artifacts
  const sweaterPath = path.join(__dirname, 'assets', 'umay', 'sweater.png');
  const swMeta = await sharp(sweaterPath).metadata();
  await sharp(sweaterPath)
    .extract({
      left: Math.round(swMeta.width * 0.18),
      top: Math.round(swMeta.height * 0.22),
      width: Math.round(swMeta.width * 0.64),
      height: Math.round(swMeta.height * 0.26)
    })
    .png()
    .toFile(path.join(__dirname, 'assets', 'umay', 'sweater_chest.png'));

  console.log('Extracted seamless 3D chest texture from Umay sweater!');
}

main().catch(console.error);
