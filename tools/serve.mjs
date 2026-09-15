/**
 * serve.mjs — máy chủ tĩnh siêu nhỏ để xem web tại máy (không cần cài gì).
 *
 *   node tools/serve.mjs            → http://localhost:4173
 *   PORT=8080 node tools/serve.mjs  → đổi cổng
 *
 * Chỉ dùng cho việc xem thử ở máy, KHÔNG dùng để đưa lên internet.
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

/** Chỉ cho phép file nằm trong thư mục dự án (chặn cả thư mục "anh em" cùng tiền tố). */
function isInsideRoot(filePath) {
  const rel = path.relative(ROOT, filePath);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

function send(res, status, body, type = "text/html; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Chỉ hỗ trợ GET/HEAD", "text/plain; charset=utf-8");
  }
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch (err) {
    return send(res, 400, "Đường dẫn không hợp lệ", "text/plain; charset=utf-8");
  }

  const filePath = path.join(ROOT, urlPath);

  // Chặn mọi đường dẫn trỏ ra ngoài thư mục dự án:
  // path.join + path.relative xử lý đúng cả "..", "%2e%2e" và thư mục cùng tiền tố tên.
  if (!isInsideRoot(filePath)) {
    console.warn(`⚠ Từ chối truy cập ngoài thư mục dự án: ${urlPath}`);
    return send(res, 403, "Forbidden");
  }

  let target = filePath;
  try {
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, "index.html");
    }
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      return send(
        res,
        404,
        `<h1>404</h1><p>Không tìm thấy <code>${urlPath.replace(/[<>&]/g, "")}</code></p><p><a href="/">Về trang chủ</a></p>`
      );
    }
    const body = fs.readFileSync(target);
    const type = MIME[path.extname(target).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "content-type": type,
      "content-length": body.length,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (err) {
    send(res, 500, String(err), "text/plain; charset=utf-8");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`▶ Đang chạy tại http://localhost:${PORT}/  (thư mục: ${ROOT})`);
  console.log("  Ctrl + C để dừng.");
});
