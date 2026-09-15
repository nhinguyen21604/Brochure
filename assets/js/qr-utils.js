/* =====================================================================
 *  qr-utils.js — bộ hàm tạo mã QR (dùng chung cho web và script Node)
 *  Phụ thuộc: vendor/qrcode.js  (thư viện qrcode-generator, giấy phép MIT)
 *
 *  - Trên web  : window.QRUtils
 *  - Trong Node: require("./qr-utils.js")   (nhớ nạp vendor/qrcode.js trước)
 * ===================================================================== */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module === "object" && module.exports) module.exports = mod;
  if (root) root.QRUtils = mod;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  function lib() {
    if (typeof qrcode === "function") return qrcode; // global của vendor/qrcode.js
    if (root && typeof root.qrcode === "function") return root.qrcode;
    if (typeof require === "function") return require("./vendor/qrcode.js");
    throw new Error("Không tìm thấy thư viện QR (vendor/qrcode.js).");
  }

  /** Ma trận điểm ảnh của mã QR. */
  function matrix(text, ecc) {
    if (!text) throw new Error("Thiếu nội dung để tạo mã QR.");
    const qr = lib()(0, ecc || "M"); // typeNumber 0 = tự chọn kích thước
    qr.addData(String(text), "Byte");
    qr.make();
    return {
      count: qr.getModuleCount(),
      isDark: (row, col) => qr.isDark(row, col),
      createTag: (cellSize, margin) => qr.createImgTag(cellSize, margin),
    };
  }

  /** Xuất mã QR thành ảnh vector SVG. */
  function toSvg(text, options) {
    const o = Object.assign(
      { scale: 8, margin: 4, dark: "#111827", light: "#ffffff", radius: 0 },
      options || {}
    );
    const m = matrix(text, o.ecc);
    const size = (m.count + o.margin * 2) * o.scale;
    const parts = [];
    for (let r = 0; r < m.count; r++) {
      for (let c = 0; c < m.count; c++) {
        if (!m.isDark(r, c)) continue;
        const x = (c + o.margin) * o.scale;
        const y = (r + o.margin) * o.scale;
        parts.push(
          `<rect x="${x}" y="${y}" width="${o.scale}" height="${o.scale}"${
            o.radius ? ` rx="${o.radius}"` : ""
          }/>`
        );
      }
    }
    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
      `viewBox="0 0 ${size} ${size}" role="img" aria-label="QR code: ${escapeXml(
        text
      )}" shape-rendering="crispEdges">\n` +
      `  <title>${escapeXml(text)}</title>\n` +
      `  <rect width="${size}" height="${size}" fill="${o.light}"/>\n` +
      `  <g fill="${o.dark}">\n    ${parts.join("\n    ")}\n  </g>\n` +
      `</svg>\n`
    );
  }

  /** Vẽ mã QR lên một <canvas> có sẵn. */
  function toCanvas(canvas, text, options) {
    const o = Object.assign(
      { scale: 8, margin: 4, dark: "#111827", light: "#ffffff" },
      options || {}
    );
    const m = matrix(text, o.ecc);
    const size = (m.count + o.margin * 2) * o.scale;
    const dpr = (root && root.devicePixelRatio) || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.fillStyle = o.light;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = o.dark;
    for (let r = 0; r < m.count; r++) {
      for (let c = 0; c < m.count; c++) {
        if (!m.isDark(r, c)) continue;
        ctx.fillRect(
          (c + o.margin) * o.scale,
          (r + o.margin) * o.scale,
          o.scale,
          o.scale
        );
      }
    }
    return { size, count: m.count };
  }

  function escapeXml(s) {
    return String(s).replace(/[<>&"']/g, (ch) => {
      return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[ch];
    });
  }

  return { matrix, toSvg, toCanvas, escapeXml };
});
