const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createPng(width, height, isMaskable = false) {
  // RGBA buffer with scanline filter bytes (1 extra byte per row)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const nx = x / width;
      const ny = y / height;
      const cx = nx - 0.5;
      const cy = ny - 0.5;
      const distFromCenter = Math.sqrt(cx * cx + cy * cy);

      // Default dark slate background
      let r = 15; // #0f172a
      let g = 23;
      let b = 42;
      let a = 255;

      // Inner card bounds (center 60%)
      const inInnerBox = Math.abs(cx) < 0.32 && Math.abs(cy) < 0.32;
      if (inInnerBox) {
        // Emerald gradient: #10b981 to #0d9488
        const t = (nx + ny) / 2;
        r = Math.round(16 * (1 - t) + 13 * t);
        g = Math.round(185 * (1 - t) + 148 * t);
        b = Math.round(129 * (1 - t) + 136 * t);

        // Draw document stripes / chart accents
        if (ny > 0.35 && ny < 0.40 && nx > 0.28 && nx < 0.55) {
          r = 255; g = 255; b = 255; // Document header bar
        } else if (ny > 0.44 && ny < 0.48 && nx > 0.28 && nx < 0.68) {
          r = 240; g = 253; b = 244; // Document text line
        } else if (ny > 0.52 && ny < 0.56 && nx > 0.28 && nx < 0.60) {
          r = 240; g = 253; b = 244; // Document text line 2
        } else if (ny > 0.62 && ny < 0.74 && nx > 0.30 && nx < 0.36) {
          r = 255; g = 255; b = 255; // Bar chart 1
        } else if (ny > 0.58 && ny < 0.74 && nx > 0.40 && nx < 0.46) {
          r = 255; g = 255; b = 255; // Bar chart 2
        } else if (ny > 0.50 && ny < 0.74 && nx > 0.50 && nx < 0.56) {
          r = 255; g = 255; b = 255; // Bar chart 3
        }

        // Circular badge bottom right
        const checkCx = nx - 0.68;
        const checkCy = ny - 0.68;
        if (Math.sqrt(checkCx * checkCx + checkCy * checkCy) < 0.12) {
          r = 15; g = 23; b = 42; // dark badge
          // check mark
          if (Math.abs(checkCx + checkCy) < 0.03 || Math.abs(checkCx - checkCy) < 0.03) {
            r = 16; g = 185; b = 129; // emerald mark
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Compress data
  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression method
  ihdrData[11] = 0; // Filter method
  ihdrData[12] = 0; // Interlace method

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Generate files in public/
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64));

console.log('Successfully generated PWA icon assets in public/');
