import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Minimal PNG builder using built-in zlib
function createPngBuffer(width, height, r, g, b, isMaskable = false) {
  // A raw uncompressed RGBA pixel buffer
  const rowSize = 1 + width * 4; // 1 filter byte + RGBA per pixel
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.35 : 0.42);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Create a sleek rounded / circle emblem with wave styling
      if (isMaskable) {
        // Full bleed background for maskable
        const bgR = 14;  // dark navy slate #0e1726
        const bgG = 23;
        const bgB = 38;

        if (dist < radius) {
          // Inside wave crest circle
          rawData[pxOffset] = r;     // Cyan/teal wave
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = bgR;
          rawData[pxOffset + 1] = bgG;
          rawData[pxOffset + 2] = bgB;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        if (dist < radius) {
          // Inner icon
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        } else if (dist < radius + 3) {
          // Smooth edge
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 120;
        } else {
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0; // Transparent
        }
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // Compression method
  ihdrData.writeUInt8(0, 11); // Filter method
  ihdrData.writeUInt8(0, 12); // Interlace method

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(4 + 4 + len + 4);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);

    // CRC32 calculation
    const crc = crc32(chunk.subarray(4, 8 + len));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngBuffer(192, 192, 6, 182, 212)); // Cyan #06b6d4
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngBuffer(512, 512, 6, 182, 212));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPngBuffer(512, 512, 6, 182, 212, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngBuffer(180, 180, 6, 182, 212, true));

// Create SVG icon for desktop tabs
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#0f172a"/>
  <path d="M96 280C140 280 160 230 208 230C256 230 276 280 320 280C364 280 384 230 416 230" stroke="#06b6d4" stroke-width="36" stroke-linecap="round"/>
  <path d="M96 350C140 350 160 300 208 300C256 300 276 350 320 350C364 350 384 300 416 300" stroke="#38bdf8" stroke-width="36" stroke-linecap="round"/>
  <circle cx="256" cy="160" r="48" fill="#38bdf8"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

console.log('Successfully generated all PWA icons in /public!');
