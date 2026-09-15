/**
 * check.mjs — kiểm tra nhanh trước khi nộp / trước khi in QR.
 *
 *   node tools/check.mjs
 *
 * Cho biết: link QR đã đổi chưa, ảnh brochure nào còn thiếu, thông tin nhóm.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ok = (s) => `\x1b[32m✔\x1b[0m ${s}`;
const warn = (s) => `\x1b[33m▲\x1b[0m ${s}`;
const bad = (s) => `\x1b[31m✖\x1b[0m ${s}`;

const configFile = path.join(ROOT, "assets", "js", "config.js");
const src = fs.readFileSync(configFile, "utf8");
const win = {};
new Function("window", "document", "navigator", "localStorage", src)(
  win,
  { addEventListener() {}, documentElement: {} },
  { language: "vi" },
  { getItem: () => null, setItem() {} }
);
const cfg = win.SITE_CONFIG;
const b = cfg.brochure || {};
const problems = [];

console.log("\n=== 1. Link gán trong mã QR ===");
if (!cfg.url) {
  problems.push(bad("Chưa có SITE_CONFIG.url — mã QR sẽ không có nội dung."));
} else if (/example\.com|localhost|127\.0\.0\.1/.test(cfg.url)) {
  console.log(warn(`Link hiện tại là link mẫu: ${cfg.url}`));
  console.log("   → Sau khi deploy, đổi thành link thật rồi chạy: node tools/generate-qr.mjs");
} else {
  console.log(ok(`Link: ${cfg.url}`));
  console.log("   → Kiểm tra link đã thật sự mở được chưa: npm run live");
}

console.log("\n=== 2. Ảnh brochure ===");
const exts = b.extensions || ["jpg", "jpeg", "png", "webp"];
const themes = ["vi", "en"];
let missing = 0;
let found = 0;
for (const theme of themes) {
  for (const face of b.faces || []) {
    const names = ((b.fileNames || {})[theme] || {})[face.key] || [face.key];
    const hit = names
      .flatMap((n) => exts.map((e) => `${b.root || "assets/brochure"}/${theme}/${n}.${e}`))
      .find((rel) => fs.existsSync(path.join(ROOT, rel)));
    if (hit) {
      found++;
      console.log(ok(`[${theme}/${face.key}] ${hit}`));
    } else {
      missing++;
      const suggestion = `${b.root || "assets/brochure"}/${theme}/${names[0]}.jpg`;
      console.log(warn(`[${theme}/${face.key}] chưa có ảnh — hãy thêm: ${suggestion}`));
    }
  }
}
console.log(`   → ${found} ảnh đã có, ${missing} ảnh còn thiếu.`);

console.log("\n=== 3. Mã QR cố định (assets/qr) ===");
{
  const svgPath = path.join(ROOT, "assets", "qr", "qr-brochure.svg");
  const pngPath = path.join(ROOT, "assets", "qr", "qr-brochure.png");
  const hasPng = fs.existsSync(pngPath);
  const hasSvg = fs.existsSync(svgPath);
  if (hasPng) console.log(ok("qr-brochure.png — để dán vào Word/slide"));
  else problems.push(bad("Thiếu assets/qr/qr-brochure.png — chạy: npm run qr"));
  if (hasSvg) {
    const svg = fs.readFileSync(svgPath, "utf8");
    const inside = (svg.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
    if (inside === cfg.url) {
      console.log(ok("qr-brochure.svg — để in, nội dung khớp link trong config.js"));
    } else {
      console.log(bad(`qr-brochure.svg chứa link CŨ: ${inside}`));
      console.log(`   → Link hiện tại là: ${cfg.url}`);
      problems.push(bad("Mã QR lệch link — chạy lại: npm run qr (nếu không, mã in ra sẽ dẫn sai chỗ)"));
    }
  } else {
    problems.push(bad("Thiếu assets/qr/qr-brochure.svg — chạy: npm run qr"));
  }
}

console.log("\n=== 4. Thành viên nhóm ===");
const members = cfg.members || [];
members.forEach((m, i) => console.log(ok(`${i + 1}. ${m.name} — ${m.id}`)));
if (members.length !== 4) problems.push(warn(`Cấu hình đang có ${members.length} thành viên (nhóm cần 4).`));
const dupes = members.map((m) => m.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupes.length) problems.push(bad(`MSSV bị lặp: ${dupes.join(", ")}`));

console.log("\n=== 5. Cấu trúc bắt buộc ===");
[
  "index.html",
  "qr-print.html",
  "assets/css/style.css",
  "assets/js/config.js",
  "assets/js/app.js",
  "assets/js/qr-utils.js",
  "tools/live-check.mjs",
  "vendor/qrcode.js",
].forEach((rel) => {
  if (fs.existsSync(path.join(ROOT, rel))) {
    console.log(ok(rel));
  } else {
    console.log(bad(`${rel} — không tìm thấy`));
    problems.push(bad(`Thiếu ${rel}`));
  }
});

console.log("\n=== Kết luận ===");
if (problems.length) {
  problems.forEach((p) => console.log(p));
  console.log("\n→ Sửa các mục ✖ ở trên rồi chạy lại: npm run check\n");
} else {
  console.log(ok("Mọi thứ sẵn sàng!"));
  console.log("   Chưa có ảnh brochure thì thêm vào assets/brochure/{vi,en}/ rồi kiểm tra lại.\n");
}
process.exit(problems.length ? 1 : 0);
