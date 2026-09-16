/**
 * live-check.mjs — kiểm tra link trong config.js đã "sống" chưa và có đúng
 * là trang brochure không. Chạy script này ở MÁY CỦA BẠN (cần internet):
 *
 *   npm run live
 *   npm run live -- https://link-khac/      ← kiểm tra link khác
 *
 * Nó sẽ cho biết: HTTP status, có phải trang brochure không, có thấy
 * nội dung chính theo config không, và mã QR trong assets/qr có khớp link này không.
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

/* đọc link và nội dung công khai từ config.js */
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

/* kiểm tra thẻ noindex có thật sự được phục vụ qua HTTP (không chỉ nằm trong file nguồn) */
{
  const hasRobots = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const hasGoogle = /<meta[^>]+name=["']googlebot["'][^>]*content=["'][^"']*noindex/i.test(html);
  if (hasRobots && hasGoogle) {
    console.log(ok("trang KHÔNG bị Google đánh chỉ mục (có thẻ noindex + googlebot) — người có link/QR vẫn mở được"));
  } else if (hasRobots) {
    console.log(warn("trang có robots=noindex nhưng thiếu thẻ googlebot — vẫn chặn được Google, nên thêm cho đồng bộ"));
  } else {
    console.log(warn("trang KHÔNG có thẻ noindex — Google có thể đánh chỉ mục trang này (nếu muốn chặn, thêm <meta name=\"robots\" content=\"noindex, nofollow\"> vào index.html)"));
  }
}

const base = new URL(target);
const configRes = await fetch(new URL("assets/js/config.js", base).href, { redirect: "follow" });
const configText = configRes.ok ? await configRes.text() : "";

const groupNames = [cfg.group?.vi, cfg.group?.en].filter(Boolean);
const memberNames = (cfg.members || []).map((m) => m.name).filter(Boolean);
const memberIds = (cfg.members || []).map((m) => m.id).filter(Boolean);
const checks = [
  ["trang có tên nhóm / tiêu đề theo config", groupNames.length ? groupNames.some((name) => html.includes(name)) : /brochure/i.test(html)],
  ["trang có khung brochure", /brochureFaces|assets\/brochure/i.test(html)],
  ["config.js có danh sách thành viên", memberNames.length > 0 && memberNames.every((name) => configText.includes(name))],
  ["config.js có mã/ID thành viên nếu đã khai báo", memberIds.length === 0 || memberIds.every((id) => configText.includes(id))],
];

/* Phần nội bộ nằm trong HTML nhưng bị ẩn bằng CSS khi chưa có JS:
   kiểm tra đúng luật đó trong style.css, thay vì tìm chuỗi trong HTML. */
const cssRes = await fetch(new URL("assets/css/style.css", base).href, { redirect: "follow" });
const cssText = cssRes.ok ? await cssRes.text() : "";
checks.push([
  "công cụ nội bộ bị ẩn khi chưa có JS (luật CSS còn nguyên)",
  /html:not\(\.js\)[^{]*\[data-internal\]/.test(cssText) && /html:not\(\.js\)[^{]*\[data-qr-section\]/.test(cssText),
]);
checks.forEach(([label, pass]) => console.log(pass ? ok(label) : warn(`chưa thấy: ${label}`)));

/* các tệp phải tải được từ internet, nếu không thì mã QR in ra cũng vô ích */
async function headOk(url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return { status: res.status, type: res.headers.get("content-type") || "", size: (await res.arrayBuffer()).byteLength };
  } catch (err) {
    return { status: 0, type: "", size: 0 };
  }
}

const assets = [
  ["mã QR cố định (PNG)", new URL("assets/qr/qr-brochure.png", base).href, "image/"],
  ["mã QR cố định (SVG)", new URL("assets/qr/qr-brochure.svg", base).href, "image/svg"],
  ["trang in QR", new URL("qr-print.html", base).href, "text/html"],
];
for (const [label, url, wantType] of assets) {
  const r = await headOk(url);
  const good = r.status === 200 && r.type.includes(wantType);
  console.log(good ? ok(`${label}: ${r.status} (${(r.size / 1024).toFixed(0)} KB)`) : bad(`${label}: HTTP ${r.status} — ${url}`));
  if (!good) process.exitCode = 1;
}

/* ảnh xem trước khi chia sẻ link (og:image) — phải là link tuyệt đối và tải được */
const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
if (!ogMatch) {
  console.log(warn("Trang chưa khai báo og:image → dán link lên Facebook/Zalo sẽ không có ảnh xem trước"));
} else {
  const ogUrl = ogMatch[1];
  let sameHost = false;
  try { sameHost = new URL(ogUrl).host === base.host; } catch (err) { sameHost = false; }
  if (!sameHost) {
    console.log(warn(`og:image đang trỏ tới domain khác (link production): ${ogUrl}`));
    console.log("   → Sau khi deploy lên đúng domain đó, chạy lại lệnh này để kiểm tra ảnh.");
  } else {
    const og = await headOk(ogUrl);
    const okOg = og.status === 200 && og.type.includes("image");
    console.log(okOg ? ok(`ảnh chia sẻ (og:image): ${og.status} (${(og.size / 1024).toFixed(0)} KB)`) : bad(`og:image lỗi: HTTP ${og.status} — ${ogUrl}`));
    if (!okOg) process.exitCode = 1;
  }
}

/* so khớp với mã QR đã xuất trong assets/qr */
const pngPath = path.join(ROOT, "assets", "qr", "qr-brochure.png");
if (fs.existsSync(pngPath)) {
  console.log(ok("Mã QR cố định có sẵn: assets/qr/qr-brochure.png + .svg"));
  const metaPath = path.join(ROOT, "assets", "qr", "qr-brochure.json");
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      console.log(
        meta.url === cfg.url
          ? ok(`Mã QR được tạo từ đúng link này (${meta.generatedAt.slice(0, 16).replace("T", " ")})`)
          : bad(`Mã QR đang chứa link khác: ${meta.url} → chạy lại: npm run qr`)
      );
    } catch (err) {
      console.log(warn("Không đọc được assets/qr/qr-brochure.json"));
    }
  } else {
    console.log(warn("Chưa có assets/qr/qr-brochure.json — chạy: npm run qr"));
  }
} else {
  console.log(warn("Chưa có assets/qr/qr-brochure.png — chạy: npm run qr"));
}

console.log("\nMẹo: mở luôn link bằng điện thoại rồi thử quét mã in ra để chắc chắn.");
console.log("     Mã QR phải chứa đúng link này:", cfg.url, "\n");
