import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

// CRC32 table for PNG generation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const toCrc = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(toCrc), 8 + len);
  return buf;
}

function generatePng(size) {
  const width = size;
  const height = size;

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6: RGBA
  ihdr.writeUInt8(0, 10); // compression 0
  ihdr.writeUInt8(0, 11); // filter 0
  ihdr.writeUInt8(0, 12); // interlace 0

  // Raw RGBA pixels with scanline filter byte (0)
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const rCorner = size * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Check rounded rectangle
      const dx = Math.max(0, Math.abs(x - cx) - (cx - rCorner));
      const dy = Math.max(0, Math.abs(y - cy) - (cy - rCorner));
      const distFromCorner = Math.sqrt(dx * dx + dy * dy);

      if (distFromCorner > rCorner) {
        // Transparent outside
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Base Wine/Bordeaux Gradient
      const gradRatio = (x + y) / (width + height);
      let r = Math.round(114 * (1 - gradRatio) + 60 * gradRatio);
      let g = Math.round(27 * (1 - gradRatio) + 12 * gradRatio);
      let b = Math.round(41 * (1 - gradRatio) + 21 * gradRatio);
      let a = 255;

      // Draw Gold Accent Border
      const borderWidth = Math.max(2, Math.round(size * 0.015));
      const isNearEdge = (distFromCorner > rCorner - borderWidth) || 
                         (dx > 0 && Math.abs(dx - (cx - rCorner)) < borderWidth) ||
                         (dy > 0 && Math.abs(dy - (cy - rCorner)) < borderWidth) ||
                         (x < borderWidth || x >= width - borderWidth || y < borderWidth || y >= height - borderWidth);

      if (isNearEdge && distFromCorner <= rCorner) {
        r = 212; g = 175; b = 55; // #D4AF37 Gold
      }

      // Draw stylized Wine Glass in the center
      const nx = (x - cx) / (size * 0.5);
      const ny = (y - cy) / (size * 0.5);

      // Glass bowl: -0.35 to 0.15 in ny
      const inBowlX = Math.abs(nx) < 0.28 * (1 - (ny + 0.35) * 0.4);
      const inBowlY = ny >= -0.35 && ny <= 0.15;
      const isBowl = inBowlX && inBowlY;

      // Glass stem: 0.15 to 0.45 in ny
      const inStem = Math.abs(nx) < 0.03 && ny > 0.15 && ny < 0.45;

      // Glass base: 0.45 to 0.50 in ny
      const inBase = Math.abs(nx) < 0.22 && ny >= 0.45 && ny <= 0.50;

      if (isBowl || inStem || inBase) {
        if (isBowl && ny > -0.15) {
          // Liquid inside (deep crimson ruby)
          r = 170; g = 30; b = 45;
        } else {
          // Glass rim / stem (gold)
          r = 243; g = 229; b = 171; // #F3E5AB
        }
      }

      // Sparkle near top right
      const spDx = Math.abs(nx - 0.25);
      const spDy = Math.abs(ny - (-0.3));
      if ((spDx < 0.04 && spDy < 0.01) || (spDy < 0.04 && spDx < 0.01)) {
        r = 255; g = 245; b = 200;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
const pwa192 = generatePng(192);
const pwa512 = generatePng(512);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'maskable-icon.png'), pwa512);

console.log('PNG PWA icons (192, 512, apple-touch-icon, maskable) created successfully!');
