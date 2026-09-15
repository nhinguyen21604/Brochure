/**
 * generate-qr.mjs — xuất mã QR (SVG + PNG) từ link trong assets/js/config.js
 *
 *   node tools/generate-qr.mjs
 *   node tools/generate-qr.mjs --url https://vi-du.com/brochure/
 *   node tools/generate-qr.mjs --scale 20 --name qr-in-lon
 *
 * Không cần cài thêm thư viện nào (chỉ dùng module có sẵn của Node).
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VENDOR = path.join(ROOT, "vendor", "qrcode.js");

/* ---------------------------------------------------------- đọc tham số */
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const outDir = path.resolve(ROOT, arg("out", "assets/qr"));
const name = arg("name", "qr-brochure");
const scale = Number(arg("scale", 12));
const margin = Number(arg("margin", 4));
const dark = arg("dark", "#0f172a");
const light = arg("light", "#ffffff");
const ecc = arg("ecc", "M");

/* ------------------------------------------- lấy link từ config.js */
function readConfiguredUrl() {
  const file = path.join(ROOT, "assets", "js", "config.js");
  try {
    const src = fs.readFileSync(file, "utf8");
    const win = {};
    new Function("window", "document", "navigator", "localStorage", src)(
      win,
      { addEventListener() {}, documentElement: {} },
      { language: "vi" },
      { getItem: () => null, setItem() {} }
    );
    return win.SITE_CONFIG && win.SITE_CONFIG.url;
  } catch (err) {
    console.warn("⚠ Không đọc được config.js, dùng giá trị mặc định:", err.message);
    return null;
  }
}

const url = arg("url", readConfiguredUrl());
if (!url) {
  console.error("✖ Không tìm thấy link. Truyền vào bằng --url https://…");
  process.exit(1);
}

/* ------------------------------------------------- QR: lấy ma trận điểm
 * vendor/qrcode.js là file UMD (CommonJS/AMD). Vì package.json khai báo
 * "type": "module", ta nạp nó trong một ngữ cảnh CommonJS riêng bằng node:vm.
 */
function loadQrLib() {
  const vm = require("node:vm");
  const sandbox = { module: { exports: {} }, exports: {}, console, define: undefined };
  sandbox.exports = sandbox.module.exports;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(VENDOR, "utf8"), sandbox, { filename: VENDOR });
  const lib = sandbox.module.exports && Object.keys(sandbox.module.exports).length
    ? sandbox.module.exports
    : sandbox.qrcode;
  if (typeof lib !== "function") throw new Error("Không nạp được vendor/qrcode.js");
  return lib;
}

const qrcode = loadQrLib();

const qr = qrcode(0, ecc);
qr.addData(url, "Byte");
qr.make();
const count = qr.getModuleCount();

/* ------------------------------------------------------------ SVG */
function buildSvg() {
  const size = (count + margin * 2) * scale;
  const rects = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!qr.isDark(r, c)) continue;
      rects.push(
        `<rect x="${(c + margin) * scale}" y="${(r + margin) * scale}" width="${scale}" height="${scale}"/>`
      );
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR code: ${url}" shape-rendering="crispEdges">
  <title>${url}</title>
  <rect width="${size}" height="${size}" fill="${light}"/>
  <g fill="${dark}">
    ${rects.join("\n    ")}
  </g>
</svg>
`;
}

/* ------------------------------------------------------------ PNG (tự mã hoá, không cần thư viện) */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function buildPng() {
  const px = (count + margin * 2) * scale;
  const [dr, dg, db] = hexToRgb(dark);
  const [lr, lg, lb] = hexToRgb(light);
  const stride = px * 3 + 1;
  const raw = Buffer.alloc(stride * px);
  for (let y = 0; y < px; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0; // filter: none
    const r = Math.floor(y / scale) - margin;
    for (let x = 0; x < px; x++) {
      const c = Math.floor(x / scale) - margin;
      const on = r >= 0 && c >= 0 && r < count && c < count && qr.isDark(r, c);
      const o = rowStart + 1 + x * 3;
      raw[o] = on ? dr : lr;
      raw[o + 1] = on ? dg : lg;
      raw[o + 2] = on ? db : lb;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(px, 0);
  ihdr.writeUInt32BE(px, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor RGB
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/* -------------------------------------------------------------- ghi file */
fs.mkdirSync(outDir, { recursive: true });
const svgFile = path.join(outDir, `${name}.svg`);
const pngFile = path.join(outDir, `${name}.png`);
fs.writeFileSync(svgFile, buildSvg(), "utf8");
fs.writeFileSync(pngFile, buildPng());

const px = (count + margin * 2) * scale;
console.log(`✔ Nội dung mã QR : ${url}`);
console.log(`✔ Số ô (modules): ${count} × ${count}  (+ viền ${margin} ô)`);
console.log(`✔ ${path.relative(ROOT, svgFile)}  (vector — dùng khi in)`);
console.log(`✔ ${path.relative(ROOT, pngFile)}  (${px} × ${px} px — dùng cho slide/mạng xã hội)`);
if (/example\.com|localhost|127\.0\.0\.1|your-domain|\/$/.test(url) && !/^https:\/\/[^/]+\/[^/]*\/$/.test(url)) {
  console.log("\n⚠ Link này trông chưa phải link thật. Sửa SITE_CONFIG.url trong assets/js/config.js rồi chạy lại lệnh này.");
} else {
  console.log("\n→ Nhớ kiểm tra link sống trước khi in: npm run live");
}
