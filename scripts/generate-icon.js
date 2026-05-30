const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const width = 256;
const height = 256;
const data = Buffer.alloc((width * 4 + 1) * height);

function setPixel(x, y, r, g, b, a = 255) {
  const rowOffset = y * (width * 4 + 1);
  const offset = rowOffset + 1 + x * 4;
  data[offset] = r;
  data[offset + 1] = g;
  data[offset + 2] = b;
  data[offset + 3] = a;
}

function fillRect(x1, y1, x2, y2, color) {
  for (let y = y1; y < y2; y += 1) {
    for (let x = x1; x < x2; x += 1) {
      setPixel(x, y, color[0], color[1], color[2], color[3] ?? 255);
    }
  }
}

function strokeCircle(cx, cy, radius, thickness, color, gapStart, gapEnd) {
  const min = radius - thickness / 2;
  const max = radius + thickness / 2;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      let angle = Math.atan2(dy, dx);
      if (angle < 0) {
        angle += Math.PI * 2;
      }

      const inGap = angle > gapStart && angle < gapEnd;
      if (distance >= min && distance <= max && !inGap) {
        setPixel(x, y, color[0], color[1], color[2], color[3] ?? 255);
      }
    }
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, payload) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(payload.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, payload])), 0);

  return Buffer.concat([length, typeBuffer, payload, crc]);
}

for (let y = 0; y < height; y += 1) {
  data[y * (width * 4 + 1)] = 0;
}

fillRect(0, 0, width, height, [11, 15, 25]);
strokeCircle(128, 128, 72, 18, [215, 255, 100], 5.55, 0.74);
fillRect(83, 116, 137, 132, [248, 250, 252]);
fillRect(119, 104, 137, 144, [248, 250, 252]);
fillRect(142, 150, 183, 166, [125, 211, 252]);

const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;
header[10] = 0;
header[11] = 0;
header[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', header),
  chunk('IDAT', zlib.deflateSync(data)),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.mkdirSync(path.resolve(__dirname, '..', 'media'), { recursive: true });
fs.writeFileSync(path.resolve(__dirname, '..', 'media', 'icon.png'), png);
