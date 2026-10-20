// Generates the PWA PNG icons (golden crescent on night blue) without dependencies.
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

function icon(size, padding) {
  const bg = [0x1f, 0x2a, 0x44];
  const gold = [0xe8, 0xb9, 0x4a];
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const r = (size / 2) * (1 - padding) * 0.62;
  const cx = size / 2;
  const cy = size / 2;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const inMoon = (x - cx) ** 2 + (y - cy) ** 2 < r ** 2;
      const inShadow = (x - cx - r * 0.45) ** 2 + (y - cy + r * 0.3) ** 2 < (r * 0.85) ** 2;
      const color = inMoon && !inShadow ? gold : bg;
      raw.set(color, y * (size * 3 + 1) + 1 + x * 3);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", icon(192, 0));
writeFileSync("public/icons/icon-512.png", icon(512, 0));
writeFileSync("public/icons/icon-maskable-512.png", icon(512, 0.3));
