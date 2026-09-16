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

// Bản .webp (nếu có) giúp điện thoại mở nhanh hơn 3–4 lần — nhưng chỉ đúng khi
// nó được tạo SAU ảnh gốc. Ảnh gốc mới hơn nghĩa là bản .webp đang lỗi thời.
{
  const dirs = themes.map((t) => path.join(ROOT, b.root || "assets/brochure", t)).filter((d) => fs.existsSync(d));
  let checked = 0;
  let stale = 0;
  for (const dir of dirs) {
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(jpe?g|png|avif)$/i.test(file)) continue;
      const src = path.join(dir, file);
      const webp = path.join(dir, file.replace(/\.[^.]+$/, ".webp"));
      checked++;
      if (!fs.existsSync(webp)) {
        console.log(warn(`[webp] ${path.relative(ROOT, webp)} chưa có → chạy: npm run images -- --write (nhẹ hơn ~70%)`));
        continue;
      }
      if (fs.statSync(webp).mtimeMs < fs.statSync(src).mtimeMs) {
        stale++;
        console.log(warn(`[webp] ${path.relative(ROOT, webp)} CŨ hơn ảnh gốc → chạy lại: npm run images -- --write`));
      }
    }
  }
  if (checked && !stale) {
    console.log(ok(`Bản .webp đều mới hơn ảnh gốc — web sẽ tải bản nhẹ cho điện thoại.`));
  }
  if (stale) problems.push(bad("Có bản .webp cũ hơn ảnh gốc — người xem sẽ thấy ảnh phiên bản cũ. Chạy: npm run images -- --write"));
}

console.log("\n=== 3. Mã QR cố định (assets/qr) ===");
{
  const qrDir = path.join(ROOT, "assets", "qr");
  const svgPath = path.join(qrDir, "qr-brochure.svg");
  const pngPath = path.join(qrDir, "qr-brochure.png");
  const metaPath = path.join(qrDir, "qr-brochure.json");
  const ageDays = (f) => (Date.now() - fs.statSync(f).mtimeMs) / 86400000;

  if (fs.existsSync(pngPath)) {
    console.log(ok(`qr-brochure.png — dán vào Word/slide (${(fs.statSync(pngPath).size / 1024).toFixed(0)} KB)`));
  } else {
    problems.push(bad("Thiếu assets/qr/qr-brochure.png — chạy: npm run qr"));
  }

  if (fs.existsSync(svgPath)) {
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

  // file mô tả: biết mã QR được tạo từ link nào, lúc nào
  if (fs.existsSync(metaPath)) {
    let meta = null;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch (err) {
      problems.push(bad("assets/qr/qr-brochure.json bị hỏng — chạy lại: npm run qr"));
    }
    if (meta) {
      if (meta.url === cfg.url) {
        console.log(ok(`qr-brochure.json — tạo lúc ${meta.generatedAt.slice(0, 16).replace("T", " ")}`));
      } else {
        console.log(bad(`qr-brochure.json ghi link khác: ${meta.url}`));
        problems.push(bad("Mã QR lệch link — chạy lại: npm run qr"));
      }
    }
  } else {
    console.log(warn("Chưa có assets/qr/qr-brochure.json (bản QR cũ) — nên chạy lại: npm run qr"));
  }

  // link trong config mới sửa mà chưa xuất lại QR?
  const configAge = ageDays(configFile);
  if (fs.existsSync(svgPath) && configAge < ageDays(svgPath) - 0.001) {
    console.log(warn("config.js mới được sửa SAU khi tạo mã QR — kiểm tra lại link rồi chạy: npm run qr"));
  }

  // ảnh chia sẻ mạng xã hội
  const ogPath = path.join(ROOT, "assets", "img", "og-cover.png");
  if (fs.existsSync(ogPath)) {
    console.log(ok(`og-cover.png — ảnh xem trước khi chia sẻ link (${(fs.statSync(ogPath).size / 1024).toFixed(0)} KB)`));
    if (configAge < ageDays(ogPath) - 0.001) {
      console.log(warn("config.js mới được sửa sau khi làm ảnh og-cover.png — ảnh có thể còn mã QR cũ"));
    }
  } else {
    console.log(warn("Chưa có assets/img/og-cover.png — link chia sẻ sẽ không có ảnh xem trước"));
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
  "tools/optimize-images.mjs",
  "vendor/qrcode.js",
].forEach((rel) => {
  if (fs.existsSync(path.join(ROOT, rel))) {
    console.log(ok(rel));
  } else {
    console.log(bad(`${rel} — không tìm thấy`));
    problems.push(bad(`Thiếu ${rel}`));
  }
});

console.log("\n=== 6. Chặn Google đánh chỉ mục (noindex) ===");
{
  const files = ["index.html", "qr-print.html"];
  const needRe = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i;
  const needGoogle = /<meta[^>]+name=["']googlebot["'][^>]*content=["'][^"']*noindex/i;
  for (const rel of files) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) {
      problems.push(bad(`Thiếu ${rel} — không kiểm tra được noindex`));
      continue;
    }
    const txt = fs.readFileSync(p, "utf8");
    const hasRobots = needRe.test(txt);
    const hasGoogle = needGoogle.test(txt);
    if (hasRobots && hasGoogle) {
      console.log(ok(`${rel} có thẻ noindex (robots + googlebot) — Google sẽ không đánh chỉ mục trang này`));
    } else if (hasRobots) {
      console.log(warn(`${rel} có robots=noindex nhưng thiếu thẻ googlebot — nên thêm cho đồng bộ`));
    } else {
      console.log(bad(`${rel} THIẾU thẻ noindex — Google có thể đánh chỉ mục trang này`));
      problems.push(
        bad(
          `${rel} thiếu <meta name="robots" content="noindex, nofollow"> — thêm vào <head> để trang không hiện trên Google (xem README mục chặn Google)`
        )
      );
    }
  }
  console.log("   → Nếu muốn trang được Google tìm thấy, hãy xóa 2 thẻ noindex này.");
}

console.log("\n=== 7. Giao diện điện thoại (mobile-first) ===");
{
  const indexPath = path.join(ROOT, "index.html");
  const cssPath = path.join(ROOT, "assets", "css", "style.css");
  const html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
  const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";

  // 1) luôn sáng: không tự chuyển tối theo cài đặt của điện thoại
  if (/<meta[^>]+name=["']color-scheme["'][^>]*content=["']light["']/i.test(html)) {
    console.log(ok('index.html — color-scheme="light": trang luôn ở giao diện sáng'));
  } else {
    console.log(bad('index.html thiếu <meta name="color-scheme" content="light"> — trang có thể tự chuyển tối'));
    problems.push(bad('Thiếu thẻ color-scheme "light" trong index.html'));
  }
  if (/prefers-color-scheme:\s*dark/.test(css)) {
    console.log(bad("style.css còn khối @media (prefers-color-scheme: dark) — trang sẽ tối trên máy bật dark mode"));
    problems.push(bad("style.css còn khối dark mode — xoá nếu muốn trang luôn sáng"));
  } else {
    console.log(ok("style.css — không còn khối dark mode"));
  }

  // 2) các phần chỉ dành cho điện thoại phải còn nguyên
  const pieces = [
    ["index.html", 'id="faceJump"', "dải chọn mặt brochure"],
    ["index.html", 'id="teamBox"', "accordion thành viên"],
    ["assets/css/style.css", ".faceJump", "kiểu dáng dải chọn mặt"],
    ["assets/js/app.js", "renderFaceJump", "logic dải chọn mặt"],
    ["assets/js/app.js", "initTeamBox", "logic accordion thành viên"],
  ];
  for (const [rel, needle, what] of pieces) {
    const txt = rel.endsWith(".css") ? css : rel.endsWith(".js")
      ? (fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : "")
      : html;
    if (txt.includes(needle)) console.log(ok(`${rel} — ${what}`));
    else {
      console.log(warn(`${rel} thiếu "${needle}" (${what}) — giao diện điện thoại có thể đã bị sửa mất`));
    }
  }

  // 3) ô nhập trên điện thoại phải ≥16px, nếu không iOS sẽ tự phóng to trang
  if (/@media \(max-width: 720px\)[\s\S]{0,4000}?\.field__input \{ font-size: 1rem/.test(css)) {
    console.log(ok("Ô nhập link đủ 16px trên điện thoại — iOS không tự phóng to"));
  } else {
    console.log(warn("Chưa thấy quy tắc font-size 1rem cho .field__input trên điện thoại (iOS có thể tự phóng to)"));
  }
}

console.log("\n=== Kết luận ===");
if (problems.length) {
  problems.forEach((p) => console.log(p));
  console.log("\n→ Sửa các mục ✖ ở trên rồi chạy lại: npm run check\n");
} else {
  console.log(ok("Mọi thứ sẵn sàng!"));
  console.log("   Chưa có ảnh brochure thì thêm vào assets/brochure/{vi,en}/ rồi kiểm tra lại.\n");
}
process.exit(problems.length ? 1 : 0);
