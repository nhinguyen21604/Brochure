/**
 * optimize-images.mjs — kiểm tra & nén ảnh brochure trong assets/brochure/.
 *
 *   npm run images                       → chỉ BÁO CÁO (không sửa gì)
 *   npm run images -- --write            → nén thật + tạo bản .webp nhẹ cho web
 *   npm run images -- --write --no-webp  → chỉ nén, không tạo .webp
 *
 * Bản .webp cùng tên (mat-truoc.png → mat-truoc.webp) được web ưu tiên dùng
 * vì nhẹ hơn PNG 3–4 lần — quan trọng với người xem bằng 4G. Nhớ chạy lại
 * --write mỗi khi thay ảnh mới, để bản .webp không bị cũ.
 *   npm run images -- --write --max 2000 --quality 84
 *
 * Phần báo cáo chạy bằng Node thuần (không cần cài gì).
 * Phần nén cần sharp — nếu chưa có, chạy: npm i --no-save sharp
 * (thêm --no-save để không làm bẩn package.json của dự án)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const WRITE = argv.includes("--write");
const MAX_SIDE = Number(arg("max", 2400));
const MIN_SIDE = Number(arg("min", 1200));
const QUALITY = Number(arg("quality", 82));
const BUDGET_KB = Number(arg("budget", 1500));
const WEBP_QUALITY = Number(arg("webp-quality", 84));
const NO_WEBP = argv.includes("--no-webp");
const FORCE = argv.includes("--force");

const ok = (s) => `\x1b[32m✔\x1b[0m ${s}`;
const warn = (s) => `\x1b[33m▲\x1b[0m ${s}`;
const bad = (s) => `\x1b[31m✖\x1b[0m ${s}`;

/* ---------------------------------------- đọc kích thước ảnh bằng Node thuần */
function imageSize(file) {
  const buf = fs.readFileSync(file);
  // PNG
  if (buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), format: "png" };
  }
  // JPEG: quét các marker SOF
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5), format: "jpeg" };
      }
      i += 2 + len;
    }
    return null;
  }
  // WebP (VP8 / VP8L / VP8X)
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const kind = buf.toString("ascii", 12, 16);
    if (kind === "VP8X") {
      const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { width: w, height: h, format: "webp" };
    }
    if (kind === "VP8 ") {
      // khung VP8 lossy: 3 byte frame tag, 3 byte start code, rồi width/height 14 bit (little-endian)
      const startOk = buf[23] === 0x9d && buf[24] === 0x01 && buf[25] === 0x2a;
      if (!startOk) return { width: 0, height: 0, format: "webp" };
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, format: "webp" };
    }
    if (kind === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, format: "webp" };
    }
  }
  return null;
}

/* ---------------------------------------- quét thư mục brochure */
const langs = ["vi", "en"];
const found = [];
for (const lang of langs) {
  const dir = path.join(ROOT, "assets", "brochure", lang);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(file)) continue;
    const full = path.join(dir, file);
    const size = fs.statSync(full).size;
    const dims = imageSize(full);
    found.push({ lang, rel: path.relative(ROOT, full), full, size, dims });
  }
}

console.log(`\n=== Ảnh brochure trong assets/brochure/ ===`);
if (!found.length) {
  console.log(warn("Chưa có ảnh nào. Thêm vào assets/brochure/{vi,en}/ rồi chạy lại: npm run images"));
  console.log("   (ảnh nên có dài cạnh " + MIN_SIDE + "–" + MAX_SIDE + " px)\n");
  process.exit(0);
}

const isWebp = (f) => /\.webp$/i.test(f);
const webpOf = (f) => f.replace(/\.[^.]+$/, ".webp");
const byPath = new Map(found.map((f) => [f.full, f]));

let advice = 0;
for (const item of found) {
  // bản .webp do script tạo (có ảnh gốc cùng tên) sẽ được in chung với ảnh gốc
  const companion = !isWebp(item.full) ? byPath.get(webpOf(item.full)) : null;
  if (isWebp(item.full) && byPath.has(item.full.replace(/\.webp$/i, ".png"))) continue;

  const kb = item.size / 1024;
  const dims = item.dims ? `${item.dims.width}×${item.dims.height}` : "không đọc được kích thước";
  const notes = [];
  if (kb > BUDGET_KB) { notes.push(`nặng ${kb.toFixed(0)} KB (ngân sách ${BUDGET_KB} KB) → nên nén`); advice++; }
  if (item.dims) {
    const long = Math.max(item.dims.width, item.dims.height);
    if (long > MAX_SIDE) { notes.push(`dài cạnh ${long} px > ${MAX_SIDE} → nên thu nhỏ`); advice++; }
    else if (long < MIN_SIDE) { notes.push(`dài cạnh ${long} px < ${MIN_SIDE} → hơi mờ khi bấm xem lớn`); }
  }
  const line = `${item.rel.padEnd(34)} ${kb.toFixed(0).padStart(5)} KB  ${dims}`;
  if (companion) {
    const webpKb = companion.size / 1024;
    const saved = kb > 0 ? Math.round((1 - webpKb / kb) * 100) : 0;
    console.log(
      (notes.length ? warn(line + "  → " + notes.join("; ")) : ok(line)) +
      `\n${" ".repeat(3)}└─ .webp dùng khi xem web: ${webpKb.toFixed(0)} KB (nhẹ hơn ${saved}%)`
    );
  } else if (!isWebp(item.full)) {
    notes.push("chưa có bản .webp nhẹ hơn → chạy: npm run images -- --write");
    console.log(warn(line + "  → " + notes.join("; ")));
  } else {
    console.log(notes.length ? warn(line + "  → " + notes.join("; ")) : ok(line));
  }
}

console.log(
  advice
    ? `\n▲ ${advice} điểm nên xử lý. Nén bằng: npm i --no-save sharp && npm run images -- --write`
    : `\n✔ Kích thước ảnh ổn cho lớp học (tải nhanh trên wifi yếu).`
);

if (!WRITE) {
  console.log("\n(Đây là bước báo cáo — chưa sửa file nào. Thêm --write để nén thật.)\n");
  process.exit(0);
}

/* ---------------------------------------- nén thật (cần sharp) */
let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch (err) {
  console.log(bad("Chưa cài sharp nên không nén được. Chạy lệnh sau rồi thử lại:"));
  console.log("   npm i --no-save sharp\n");
  process.exit(1);
}

/* Ảnh nguồn = ảnh do nhóm xuất ra (png/jpg), bỏ qua file .webp do script tạo */
const sources = found.filter((it) => !(isWebp(it.full) && byPath.has(it.full.replace(/\.webp$/i, ".png"))));

console.log(`\n=== Nén ảnh (dài cạnh tối đa ${MAX_SIDE} px, chất lượng ${QUALITY}) ===`);
for (const item of sources) {
  const kbBefore = item.size / 1024;
  if (kbBefore <= BUDGET_KB && item.dims && Math.max(item.dims.width, item.dims.height) <= MAX_SIDE) {
    console.log(ok(`${item.rel} — đã ổn, bỏ qua`));
    continue;
  }
  const backup = `${item.full}.orig`;
  if (!fs.existsSync(backup)) fs.copyFileSync(item.full, backup);
  const ext = path.extname(item.full).toLowerCase();
  let pipeline = sharp(backup).rotate().resize({
    width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true,
  });
  pipeline = ext === ".png" ? pipeline.png({ compressionLevel: 9, palette: true, quality: QUALITY })
    : ext === ".webp" ? pipeline.webp({ quality: QUALITY })
    : pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
  await pipeline.toFile(item.full);
  const kbAfter = fs.statSync(item.full).size / 1024;
  console.log(ok(`${item.rel}: ${kbBefore.toFixed(0)} KB → ${kbAfter.toFixed(0)} KB  (bản gốc: ${path.basename(backup)})`));
}

/* Bản .webp cho web: nhẹ hơn hẳn PNG nên điện thoại mở nhanh hơn. */
if (NO_WEBP) {
  console.log(warn("\nBỏ qua bản .webp (--no-webp)."));
} else {
  console.log(`\n=== Bản .webp cho web (chất lượng ${WEBP_QUALITY}) ===`);
  for (const item of sources) {
    if (isWebp(item.full)) continue;                 // đã là webp sẵn
    const target = webpOf(item.full);
    const fresh = fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(item.full).mtimeMs;
    if (fresh && !FORCE) {
      console.log(ok(`${path.relative(ROOT, target)} — đã mới, bỏ qua`));
      continue;
    }
    await sharp(item.full).rotate().webp({ quality: WEBP_QUALITY, effort: 6 }).toFile(target);
    const kbAfter = fs.statSync(target).size / 1024;
    const saved = Math.round((1 - fs.statSync(target).size / fs.statSync(item.full).size) * 100);
    console.log(ok(`${path.relative(ROOT, target)}: ${kbAfter.toFixed(0)} KB (nhẹ hơn ${saved}% so với ảnh gốc)`));
  }
}

console.log("\n✔ Xong. Mở lại trang để xem: npm start\n");
