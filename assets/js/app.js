/* =====================================================================
 *  app.js — toàn bộ logic của trang (không cần build, không framework)
 *  Đọc cấu hình từ assets/js/config.js và dựng:
 *    · 2 mặt brochure theo ngôn ngữ đang chọn (+ tự dò đuôi file ảnh)
 *    · danh sách thành viên nhóm
 *    · mã QR + link, tải PNG/SVG, sao chép link
 * ===================================================================== */
(function () {
  "use strict";

  const CFG = window.SITE_CONFIG || {};
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const LANG_KEY = "brochure-lang";
  const URL_KEY = "brochure-qr-url";

  /* Bọc localStorage: trình duyệt ở chế độ riêng tư hoặc mở bằng file:// có thể
     chặn hẳn — lúc đó trang vẫn phải chạy bình thường. */
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch (err) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); return true; } catch (err) { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (err) { /* bỏ qua */ }
    },
  };

  /* ------------------------------------------------- Chế độ công khai / nội bộ
   * Người ngoài chỉ thấy brochure + thành viên. Các phần đánh dấu
   * [data-internal] (bảng công cụ QR, ghi chú kỹ thuật, đường dẫn file ảnh)
   * chỉ hiện khi mở bằng ?tools=1 — dùng cho nhóm. */
  const UI = CFG.ui || {};
  const isTools = !!(
    UI.allowToolsQuery !== false &&
    new URLSearchParams(location.search).get("tools")
  );

  /* ---------------------------------------- Ẩn/hiện phần nội bộ của nhóm */
  function applyVisibility() {
    const showQrSection = isTools || UI.showQrSection === true;

    $$("[data-internal]").forEach((el) => {
      el.hidden = !isTools;
    });

    const qrSection = $("[data-qr-section]");
    if (qrSection) qrSection.hidden = !showQrSection;

    // khi bảng công cụ bị ẩn, khối QR chỉ còn hình mã → canh giữa cho gọn
    const card = $(".qrCard");
    const side = $(".qrCard__side", card || document);
    if (card && side) card.classList.toggle("qrCard--solo", side.hidden);

    document.body.classList.toggle("is-tools", isTools);
  }

  /* ---------------------------------------------------------------- Đa ngữ */
  const DICTS = CFG.i18n || {};
  let lang = detectLang();

  function detectLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && DICTS[q]) return q;
    const saved = store.get(LANG_KEY);
    if (saved && DICTS[saved]) return saved;
    const nav = (navigator.language || "vi").slice(0, 2);
    return DICTS[nav] ? nav : "vi";
  }

  function t(key) {
    const dict = DICTS[lang] || {};
    const fallback = DICTS.vi || {};
    return dict[key] != null ? dict[key] : fallback[key] != null ? fallback[key] : key;
  }

  /** Chuỗi theo ngôn ngữ từ một object dạng {vi, en}. */
  function tr(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.vi || value.en || "";
  }

  function applyLanguage(next) {
    lang = DICTS[next] ? next : "vi";
    store.set(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.title = t("meta.title");

    $$("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    $$("[data-i18n-attr]").forEach((el) => {
      // định dạng: "aria-label:lightbox.close; title:qr.title"
      el.getAttribute("data-i18n-attr")
        .split(";")
        .forEach((pair) => {
          const [attr, key] = pair.split(":").map((s) => s && s.trim());
          if (attr && key) el.setAttribute(attr, t(key));
        });
    });
    $$("[data-lang-btn]").forEach((btn) => {
      const on = btn.getAttribute("data-lang-btn") === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    renderHero();
    renderMembers();
    renderFooter();
    renderBrochure();
    renderQrSection();
    // đang mở ảnh xem lớn mà đổi ngôn ngữ → cập nhật luôn nhãn trong hộp thoại
    if (lightbox.el && !lightbox.el.hidden) lightbox.paint();
  }

  /* ------------------------------------------------- Phần đầu & chân trang */
  function renderHero() {
    setText("#heroTitle", tr(CFG.title));
    setText("#heroGroup", tr(CFG.group));
    setText("#heroSub", tr(CFG.subtitle));

    const meta = $("#heroMeta");
    if (meta) {
      const rows = [
        [t("info.course"), tr(CFG.course)],
        [t("info.class"), tr(CFG.className)],
        [t("info.lecturer"), tr(CFG.lecturer)],
        [t("info.period"), tr(CFG.period)],
      ].filter((row) => row[1]);
      meta.innerHTML = rows
        .map(([label, value]) => `<li><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></li>`)
        .join("");
      meta.hidden = rows.length === 0;
    }
  }

  function renderFooter() {
    const names = $("#footerNames");
    if (names) {
      names.textContent = (CFG.members || [])
        .map((m) => `${m.name} (${m.id})`)
        .join(" · ");
    }
  }

  function setText(selector, value) {
    const el = $(selector);
    if (el && value) el.textContent = value;
  }

  /* ------------------------------------------------------- Dò file ảnh */
  const resolved = {};   // cache: "vi:front" -> đường dẫn ảnh tìm được
  const probing = {};    // "vi:front" -> đang dò (tránh dò trùng khi đổi ngôn ngữ liên tục)

  function imageCandidates(langKey, faceKey) {
    const b = CFG.brochure || {};
    const names = ((b.fileNames || {})[langKey] || {})[faceKey] || [faceKey];
    const exts = b.extensions || ["jpg", "jpeg", "png", "webp"];
    const out = [];
    names.forEach((name) => {
      exts.forEach((ext) => {
        out.push(`${b.root || "assets/brochure"}/${langKey}/${name}.${ext}`);
      });
    });
    return out;
  }

  /** Thử lần lượt các đường dẫn, gọi onOk(src) hoặc onFail(tried). */
  function resolveImage(candidates, onOk, onFail) {
    let i = 0;
    (function next() {
      if (i >= candidates.length) return onFail(candidates);
      const src = candidates[i++];
      const probe = new Image();
      probe.onload = () => onOk(src);
      probe.onerror = next;
      probe.src = src;
    })();
  }

  /* ---------------------------------------------------------- Brochure */
  const state = { faces: [], index: 0 };

  function renderBrochure() {
    const host = $("#brochureFaces");
    if (!host) return;
    const faces = (CFG.brochure && CFG.brochure.faces) || [];
    state.faces = faces.map((f) => ({
      key: f.key,
      label: tr(f.label),
      note: tr(f.note),
      src: null,
      candidates: imageCandidates(lang, f.key),
    }));
    host.innerHTML = "";
    host.dataset.count = String(state.faces.length);
    host.style.setProperty("--faces", String(Math.max(state.faces.length, 1)));

    state.faces.forEach((face, idx) => {
      const card = document.createElement("figure");
      card.className = "face";
      card.dataset.index = String(idx);

      const label = document.createElement("figcaption");
      label.className = "face__label";
      label.innerHTML =
        `<span class="face__tag">${escapeHtml(t("brochure.langTag"))} ${lang.toUpperCase()}</span>` +
        `<span class="face__name">${escapeHtml(face.label)}</span>`;

      const frame = document.createElement("div");
      frame.className = "face__frame";
      frame.innerHTML = `<div class="face__loading" role="status" aria-live="polite">…</div>`;

      const actions = document.createElement("div");
      actions.className = "face__actions";
      actions.setAttribute("data-internal", ""); // công cụ tải ảnh: chỉ nhóm thấy
      actions.hidden = !isTools;

      card.append(label, frame, actions);
      host.appendChild(card);

      const cacheKey = `${lang}:${face.key}`;

      // đã biết kết quả trước đó?
      if (resolved[cacheKey]) return paint(card, face, resolved[cacheKey]);
      if (resolved[cacheKey] === null) return paintMissing(card, face);

      // đang dò rồi thì chờ kết quả đó, không tạo thêm một loạt yêu cầu nữa
      if (probing[cacheKey]) {
        probing[cacheKey].push({ card, face });
        return;
      }
      probing[cacheKey] = [{ card, face }];

      resolveImage(
        face.candidates,
        (src) => {
          resolved[cacheKey] = src;
          probing[cacheKey].forEach(({ card: c, face: f }) => paint(c, f, src));
          delete probing[cacheKey];
        },
        () => {
          resolved[cacheKey] = null;   // nhớ là không có ảnh → lần sau khỏi dò lại
          probing[cacheKey].forEach(({ card: c, face: f }) => paintMissing(c, f));
          delete probing[cacheKey];
        }
      );
    });
  }

  function paint(card, face, src) {
    face.src = src;
    const frame = $(".face__frame", card);
    frame.innerHTML = "";

    // Cả tấm ảnh là một nút: bấm (hoặc Enter/Space) để mở xem lớn
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "face__open";
    openBtn.setAttribute("aria-label", `${t("brochure.zoom")} — ${face.label}`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = `${face.label} — ${tr(CFG.title)}`;
    img.loading = "lazy";
    img.decoding = "async";

    const hint = document.createElement("span");
    hint.className = "face__hint";
    hint.setAttribute("aria-hidden", "true");
    hint.textContent = `⤢ ${t("brochure.zoom")}`;

    openBtn.append(img, hint);
    openBtn.addEventListener("click", () => lightbox.open(Number(card.dataset.index)));
    frame.appendChild(openBtn);

    const actions = $(".face__actions", card);
    actions.setAttribute("data-internal", "");   // công cụ tải ảnh: chỉ nhóm thấy
    actions.hidden = !isTools;
    const dl = document.createElement("a");
    dl.className = "btn btn--ghost btn--sm";
    dl.href = src;
    dl.download = src.split("/").pop();
    dl.textContent = t("brochure.download");
    const open = document.createElement("a");
    open.className = "btn btn--ghost btn--sm";
    open.href = src;
    open.target = "_blank";
    open.rel = "noopener";
    open.textContent = t("lightbox.openRaw");
    if (face.note) {
      const note = document.createElement("p");
      note.className = "face__note";
      note.textContent = face.note;
      actions.appendChild(note);
    }
    actions.append(dl, open);
  }

  function paintMissing(card, face) {
    const frame = $(".face__frame", card);
    if (!isTools) {
      // người ngoài chỉ thấy thông báo trung tính, không lộ cấu trúc file
      frame.innerHTML =
        `<div class="ph">` +
        `<div class="ph__icon" aria-hidden="true">📄</div>` +
        `<p class="ph__title">${escapeHtml(t("brochure.pending.title"))}</p>` +
        `<p class="ph__desc">${escapeHtml(t("brochure.pending.desc"))}</p>` +
        `</div>`;
      return;
    }
    const expected = face.candidates[0] || "";
    frame.innerHTML =
      `<div class="ph">` +
      `<div class="ph__icon" aria-hidden="true">🖼️</div>` +
      `<p class="ph__title">${escapeHtml(t("brochure.missing.title"))} — ${escapeHtml(face.label)}</p>` +
      `<p class="ph__desc">${escapeHtml(t("brochure.missing.desc"))}</p>` +
      `<code class="ph__path">${escapeHtml(expected)}</code>` +
      `<p class="ph__alt">…${escapeHtml(
        face.candidates.slice(1, 4).map((c) => c.split("/").pop()).join(" / ")
      )}</p>` +
      `</div>`;
  }

  /* --------------------------------------------------------- Lightbox */
  const lightbox = {
    el: null,
    lastFocus: null,
    init() {
      this.el = $("#lightbox");
      if (!this.el) return;
      const close = () => this.close();
      this.el.addEventListener("click", (e) => {
        if (e.target.dataset.close != null || e.target === this.el) close();
      });
      $("[data-lb-prev]", this.el).addEventListener("click", () => this.step(-1));
      $("[data-lb-next]", this.el).addEventListener("click", () => this.step(1));
      $("[data-lb-zoom]", this.el).addEventListener("click", () => this.toggleZoom());
      // bấm/gõ vào ảnh đang xem cũng thu nhỏ lại — thao tác quen thuộc của người dùng
      $(".lb__stage", this.el).addEventListener("click", (e) => {
        if (e.target.tagName === "IMG") this.toggleZoom();
      });
      document.addEventListener("keydown", (e) => {
        if (this.el.hidden) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") this.step(-1);
        if (e.key === "ArrowRight") this.step(1);
        if (e.key === "Tab") this.trapFocus(e);
      });
      // vuốt ngang trên điện thoại
      let x0 = null;
      const stage = $(".lb__stage", this.el);
      stage.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
      stage.addEventListener(
        "touchend",
        (e) => {
          if (x0 == null) return;
          const dx = e.changedTouches[0].clientX - x0;
          if (Math.abs(dx) > 45) this.step(dx < 0 ? 1 : -1);
          x0 = null;
        },
        { passive: true }
      );
    },
    open(index) {
      state.index = index;
      this.lastFocus = document.activeElement;
      this.el.hidden = false;
      document.body.classList.add("no-scroll");
      this.paint();
      // đưa tiêu điểm vào hộp thoại để bàn phím/trình đọc màn hình dùng được ngay
      const target = $("[data-close]", this.el);
      if (target) target.focus();
    },
    close() {
      this.el.hidden = true;
      document.body.classList.remove("no-scroll");
      $(".lb__stage", this.el).classList.remove("is-zoomed");
      if (this.lastFocus && this.lastFocus.isConnected && typeof this.lastFocus.focus === "function") {
        this.lastFocus.focus();
      }
      this.lastFocus = null;
    },
    /** Bật/tắt phóng to (con trỏ chuột đổi theo class .is-zoomed trong CSS). */
    toggleZoom() {
      $(".lb__stage", this.el).classList.toggle("is-zoomed");
    },
    /** Giữ phím Tab trong hộp thoại, không cho chạy ra sau lưng.
     *  Lưu ý: KHÔNG lọc bằng offsetParent — các nút này nằm trong khối
     *  position: fixed nên offsetParent luôn là null và sẽ bị lọc sạch. */
    trapFocus(e) {
      const focusables = $$(".lb__btn", this.el).filter((el) => !el.hidden);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !this.el.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !this.el.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    },
    step(dir) {
      const n = state.faces.length;
      if (!n) return;
      state.index = (state.index + dir + n) % n;
      const stage = $(".lb__stage", this.el);
      stage.classList.remove("is-zoomed");
      this.paint();
    },
    paint() {
      const face = state.faces[state.index];
      if (!face) return;
      const stage = $(".lb__stage", this.el);
      stage.innerHTML = "";
      if (face.src) {
        const img = document.createElement("img");
        img.src = face.src;
        img.alt = face.label;
        stage.appendChild(img);
        const open = $("[data-lb-open]", this.el);
        open.href = face.src;
        open.hidden = !isTools;
      } else {
        stage.innerHTML = `<div class="lb__empty">${escapeHtml(
          t(isTools ? "brochure.missing.title" : "brochure.pending.title")
        )}</div>`;
        $("[data-lb-open]", this.el).hidden = true;
      }
      $(".lb__caption", this.el).textContent = `${state.index + 1}/${state.faces.length} · ${face.label}`;
    },
  };

  /* ---------------------------------------------------------- Thành viên */
  function renderMembers() {
    const host = $("#memberGrid");
    if (!host) return;
    host.innerHTML = "";
    (CFG.members || []).forEach((m, i) => {
      const card = document.createElement("article");
      card.className = "member";
      card.style.setProperty("--i", String(i));
      const initials = (m.name || "?")
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

      const inner = document.createElement("div");
      inner.className = "member__inner";
      inner.innerHTML =
        `<div class="member__avatar" aria-hidden="true">${escapeHtml(initials)}</div>` +
        `<div class="member__body">` +
        `<h3 class="member__name">${escapeHtml(m.name || "")}</h3>` +
        `<p class="member__id"><span class="member__idLabel">${escapeHtml(
          t("team.idLabel")
        )}</span> ${escapeHtml(m.id || "")}</p>` +
        (tr(m.role) ? `<p class="member__role">${escapeHtml(tr(m.role))}</p>` : "") +
        `</div>`;

      if (m.link) {
        const a = document.createElement("a");
        a.className = "member__link";
        a.href = m.link;
        a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute(
          "aria-label",
          `${m.name} — ${lang === "vi" ? "mở trang cá nhân" : "open personal page"}`
        );
        a.textContent = "↗";
        inner.appendChild(a);
      }

      card.appendChild(inner);
      host.appendChild(card);
    });
  }

  /* --------------------------------------------------------------- QR */
  const qr = { url: "", init: false };

  /* Link dùng để vẽ mã QR: ưu tiên ?u= (xem trước), còn lại LUÔN lấy link
     chính thức trong config. Không dùng lại link xem trước của lần trước —
     để nhóm không vô tình in ra mã QR dẫn sai chỗ. */
  function currentQrUrl() {
    const fromQuery = new URLSearchParams(location.search).get("u");
    return fromQuery || CFG.url || location.href.split("?")[0];
  }

  function renderQrSection() {
    const canvas = $("#qrCanvas");
    if (!canvas || typeof QRUtils === "undefined") return;
    // người ngoài không thấy khối QR (trừ khi ui.showQrSection = true) → khỏi vẽ
    if (canvas.closest("[hidden]")) return;
    const card = canvas.closest(".qrCard");
    const side = card && $(".qrCard__side", card);
    if (card && side) card.classList.toggle("qrCard--solo", side.hidden);
    const input = $("#qrUrl");
    if (input && !qr.init) {
      input.value = currentQrUrl();
      input.addEventListener("input", () => {
        const value = input.value.trim();
        if (value) drawQr(value);   // chỉ xem trước tại chỗ, không lưu lại
      });
      qr.init = true;
    }
    const reset = $("#qrReset");
    if (reset) {
      reset.addEventListener("click", () => {
        store.remove(URL_KEY);
        if (input) input.value = CFG.url || "";
        drawQr(input ? input.value.trim() : CFG.url);
      });
    }
    drawQr((input && input.value.trim()) || currentQrUrl());
  }

  function drawQr(text) {
    qr.url = text;
    const canvas = $("#qrCanvas");
    if (!canvas) return;
    // tính scale để ảnh hiển thị ~ 300–360px, luôn là số nguyên cho nét
    let scale = 8;
    try {
      const count = QRUtils.matrix(text).count;
      const isSmall = typeof window.matchMedia === "function"
        ? window.matchMedia("(max-width: 520px)").matches
        : window.innerWidth < 520;
      const target = isSmall ? 240 : 320;
      scale = Math.max(3, Math.floor(target / (count + 8)));
    } catch (err) {
      console.warn("Không vẽ được mã QR:", err);
      return;
    }
    QRUtils.toCanvas(canvas, text, {
      scale,
      margin: 4,
      dark: "#0f172a",
      light: "#ffffff",
      ecc: "M",
    });
    const link = $("#qrLink");
    if (link) {
      link.textContent = text;
      link.href = text;
    }
    // Trang in: chỉ truyền ?u= khi link khác link chính thức, để lúc in dùng
    // đúng file QR cố định trong assets/qr (nét hơn hẳn bản vẽ bằng canvas).
    const isOfficial = text === CFG.url;
    $$("[data-qr-print]").forEach((a) => {
      a.href = isOfficial ? "qr-print.html" : `qr-print.html?u=${encodeURIComponent(text)}`;
    });
    // Cảnh báo để không in nhầm mã QR của link xem trước
    const warn = $("#qrWarn");
    if (warn) warn.hidden = isOfficial;
  }

  function initQrControls() {
    const png = $("#qrPng");
    if (png)
      png.addEventListener("click", () => {
        const canvas = $("#qrCanvas");
        canvas.toBlob((blob) => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "qr-brochure.png";
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1500);
        }, "image/png");
      });

    const svg = $("#qrSvg");
    if (svg)
      svg.addEventListener("click", () => {
        const str = QRUtils.toSvg(qr.url, { scale: 12, margin: 4, dark: "#0f172a" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([str], { type: "image/svg+xml" }));
        a.download = "qr-brochure.svg";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      });

    const copy = $("#qrCopy");
    if (copy)
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(qr.url);
        } catch (err) {
          const tmp = document.createElement("textarea");
          tmp.value = qr.url;
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand("copy");
          tmp.remove();
        }
        const original = t("qr.copy");
        copy.textContent = t("qr.copied");
        copy.classList.add("is-done");
        setTimeout(() => {
          copy.textContent = original;
          copy.classList.remove("is-done");
        }, 1600);
      });

    // chỉ vẽ lại khi đã có nội dung mã (chế độ công khai không có khối QR)
    window.addEventListener("resize", debounce(() => {
      if (qr.url) drawQr(qr.url);
    }, 200));
  }

  /* ------------------------------------------------------------ Tiện ích */
  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (ch) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function debounce(fn, wait) {
    let id;
    return function () {
      clearTimeout(id);
      id = setTimeout(() => fn.apply(this, arguments), wait);
    };
  }

  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  }

  function initScrollSpy() {
    const links = $$("[data-nav]");
    const sections = links
      .map((a) => $(a.getAttribute("href")))
      .filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => {
            const on = a.getAttribute("href") === "#" + entry.target.id;
            a.classList.toggle("is-current", on);
            if (on) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  function initHeaderState() {
    const header = $(".topbar");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------- Khởi động */
  function boot() {
    lightbox.init();
    initQrControls();
    applyVisibility();
    applyLanguage(lang);
    $$("[data-lang-btn]").forEach((btn) =>
      btn.addEventListener("click", () => applyLanguage(btn.getAttribute("data-lang-btn")))
    );
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
    initReveal();
    initScrollSpy();
    initHeaderState();
    // nếu ảnh hoặc cấu hình đổi trong lúc đang xem
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) renderQrSection();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
