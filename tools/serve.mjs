/**
 * serve.mjs — máy chủ tĩnh siêu nhỏ để xem web tại máy (không cần cài gì).
 *
 *   node tools/serve.mjs            → http://localhost:4173
 *   PORT=8080 node tools/serve.mjs  → đổi cổng
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(`<h1>404</h1><p>Không tìm thấy <code>${urlPath}</code></p><p><a href="/">Về trang chủ</a></p>`);
      return;
    }
    const body = fs.readFileSync(filePath);
    res.writeHead(200, {
      "content-type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" }).end(String(err));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`▶ Đang chạy tại http://localhost:${PORT}/  (thư mục: ${ROOT})`);
  console.log("  Ctrl + C để dừng.");
});
