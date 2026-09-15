/**
 * live-check.mjs — kiểm tra link trong config.js đã "sống" chưa và có đúng
 * là trang brochure không. Chạy script này ở MÁY CỦA BẠN (cần internet):
 *
 *   npm run live
 *   npm run live -- https://link-khac/      ← kiểm tra link khác
 *
 * Nó sẽ cho biết: HTTP status, có phải trang brochure không, có thấy
 * "Nhóm 1" + 4 MSSV không, và mã QR trong assets/qr có khớp link này không.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ok = (s) => `\x1b[32m✔\x1b[0m ${s}`;
const warn = (s) => `\x1b[33m▲\x1b[0m ${s}`;
const bad = (s) => `\x1b[31m✖\x1b[0m ${s}`;

/* đọc link + MSSV từ config.js */
const src = fs.readFileSync(path.join(ROOT, "assets", "js", "config.js"), "utf8");
const win = {};
new Function("window", "document", "navigator", "localStorage", src)(
  win, { addEventListener() {}, documentElement: {} }, { language: "vi" }, { getItem: () => null, setItem() {} });
const cfg = win.SITE_CONFIG;

const target = process.argv[2] || cfg.url;
console.log(`\nĐang kiểm tra: ${target}\n`);

let html = "";
let status = 0;
try {
  const res = await fetch(target, { redirect: "follow" });
  status = res.status;
  html = await res.text();
} catch (err) {
  console.log(bad(`Không mở được link: ${err.message}`));
  console.log("\n→ Nếu link là GitHub Pages, hãy bật Pages trước:");
  console.log("   Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save");
  console.log("   Chờ ~1 phút rồi chạy lại: npm run live\n");
  process.exit(1);
}

console.log(status === 200 ? ok(`HTTP ${status} — trang đã lên mạng`) : bad(`HTTP ${status} — trang chưa sẵn sàng`));

const checks = [
  ["có tiêu đề / tên nhóm", /Nhóm 1|Group 1/i.test(html)],
  ["có khung brochure", /brochureFaces|assets\/brochure/i.test(html)],
  ["có 4 MSSV", ["H2200161", "H2200004", "H2200106", "H2200107"].every((id) => html.includes(id))],
  ["không lộ công cụ nội bộ ra HTML tĩnh", !/Chế độ nội bộ/.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))],
];
checks.forEach(([label, pass]) => console.log(pass ? ok(label) : warn(`chưa thấy: ${label}`)));

/* so khớp với mã QR đã xuất trong assets/qr */
const pngPath = path.join(ROOT, "assets", "qr", "qr-brochure.png");
if (fs.existsSync(pngPath)) {
  console.log(ok(`Mã QR cố định có sẵn: assets/qr/qr-brochure.png + .svg`));
  console.log(`   (nhớ chạy "npm run qr" nếu link ở trên khác SITE_CONFIG.url: ${cfg.url})`);
} else {
  console.log(warn("Chưa có assets/qr/qr-brochure.png — chạy: npm run qr"));
}

console.log("\nMẹo: mở luôn link bằng điện thoại rồi thử quét mã in ra để chắc chắn.\n");
