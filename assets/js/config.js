/* =====================================================================
 *  config.js — CẤU HÌNH DUY NHẤT CỦA WEB
 * ---------------------------------------------------------------------
 *  Mọi thứ cần sửa đều nằm trong file này:
 *    1. Link website (chính là nội dung được in trong mã QR)
 *    2. Chế độ công khai / nội bộ
 *    3. Tên nhóm, tiêu đề, thông tin lớp, thành viên
 *    4. Vị trí / tên file ảnh brochure (2 mặt, 2 ngôn ngữ)
 *  Sửa xong chỉ cần lưu file rồi tải lại trang (Ctrl/Cmd + Shift + R).
 * ===================================================================== */
window.SITE_CONFIG = {
  /* ------------------------------------------------------------------
   * 1) LINK WEBSITE — chính là nội dung được mã hoá trong mã QR.
   *    Đây là link cố định dùng để in QR: sau khi bật GitHub Pages,
   *    chạy `npm run qr` để xuất lại ảnh QR theo link này.
   * ------------------------------------------------------------------ */
  url: "https://nhinguyen21604.github.io/Brochure/",

  /* ------------------------------------------------------------------
   * 1b) CHẾ ĐỘ HIỂN THỊ — phần nào cho người ngoài xem, phần nào giấu đi
   * ------------------------------------------------------------------
   *  Mặc định web ở "chế độ công khai": người ngoài chỉ thấy
   *  brochure + thành viên, KHÔNG thấy các công cụ nội bộ của nhóm
   *  (ô nhập link QR, nút tải/ in QR, đường dẫn file ảnh, ghi chú deploy).
   *
   *  Cần dùng công cụ nội bộ? Mở link có thêm  ?tools=1
   *      ví dụ: .../index.html?tools=1
   * ------------------------------------------------------------------ */
  ui: {
    // true = cho người ngoài thấy luôn khối "Mã QR" (chỉ hình QR, không kèm
    // công cụ). Đặt false nếu không muốn hiện khối này.
    showQrSection: false,
    // Cho phép mở chế độ nội bộ bằng tham số ?tools=1 trên URL
    allowToolsQuery: true,
  },

  /* ------------------------------------------------------------------
   * 2) THÔNG TIN CHUNG
   * ------------------------------------------------------------------ */
  group: { vi: "Nhóm 1", en: "Group 1" },

  title: {
    vi: "Brochure giới thiệu",
    en: "Introduction Brochure",
  },

  // Một dòng mô tả ngắn dưới tiêu đề (để "" nếu không cần)
  subtitle: {
    vi: "Brochure 2 mặt song ngữ — bản tiếng Việt và bản tiếng Anh.",
    en: "A two-sided bilingual brochure — Vietnamese and English editions.",
  },

  // Điền nếu muốn hiện (để "" thì web tự ẩn dòng đó)
  course: { vi: "", en: "" },
  className: { vi: "", en: "" },
  lecturer: { vi: "", en: "" },
  period: { vi: "", en: "" },

  /* ------------------------------------------------------------------
   * 3) THÀNH VIÊN NHÓM
   *    - name : tên hiển thị
   *    - id   : MSSV
   *    - role : vai trò (tuỳ chọn, để "" nếu không cần)
   *    - link : link cá nhân (tuỳ chọn, để "" nếu không cần)
   * ------------------------------------------------------------------ */
  members: [
    { name: "Tô Thanh Mai", id: "H2200161", role: { vi: "", en: "" }, link: "" },
    { name: "Bùi Trần Trà My", id: "H2200004", role: { vi: "", en: "" }, link: "" },
    { name: "Nguyễn Ngọc Hoàng Nhi", id: "H2200106", role: { vi: "", en: "" }, link: "" },
    { name: "Nguyễn Ngọc Thảo Nguyên", id: "H2200107", role: { vi: "", en: "" }, link: "" },
  ],

  /* ------------------------------------------------------------------
   * 4) ẢNH BROCHURE — CHỖ BẠN CHÈN ẢNH VÀO
   * ------------------------------------------------------------------
   *  Thư mục:  assets/brochure/<ngôn ngữ>/<tên file>.<đuôi>
   *  Web tự dò các đuôi: .jpg .jpeg .png .webp .avif
   *
   *  Cách nhanh nhất: copy 4 file ảnh vào đúng thư mục với đúng tên:
   *
   *      assets/brochure/vi/mat-truoc.jpg   ← mặt trước (tiếng Việt)
   *      assets/brochure/vi/mat-sau.jpg     ← mặt sau   (tiếng Việt)
   *      assets/brochure/en/mat-truoc.jpg   ← mặt trước (tiếng Anh)
   *      assets/brochure/en/mat-sau.jpg     ← mặt sau   (tiếng Anh)
   *
   *  Mẹo: ảnh brochure chiếm gần trọn màn hình, nên xuất ảnh dài cạnh
   *  ~1600–2400 px cho nét khi bấm xem lớn.
   * ------------------------------------------------------------------ */
  brochure: {
    root: "assets/brochure",

    // Các đuôi file sẽ được thử lần lượt
    extensions: ["jpg", "jpeg", "png", "webp", "avif"],

    // Tên file (không kèm đuôi) được thử lần lượt cho từng mặt
    fileNames: {
      vi: { front: ["mat-truoc", "front"], back: ["mat-sau", "back"] },
      en: { front: ["mat-truoc", "front"], back: ["mat-sau", "back"] },
    },

    // 2 mặt brochure (thêm/bớt mặt cũng được, web tự dựng giao diện)
    faces: [
      { key: "front", label: { vi: "Mặt trước", en: "Front side" }, note: { vi: "", en: "" } },
      { key: "back", label: { vi: "Mặt sau", en: "Back side" }, note: { vi: "", en: "" } },
    ],
  },

  /* ------------------------------------------------------------------
   * 5) CHỮ HIỂN THỊ TRÊN WEB (2 ngôn ngữ)
   * ------------------------------------------------------------------ */
  i18n: {
    vi: {
      "meta.title": "Brochure nhóm 1 — bản tiếng Việt & tiếng Anh",
      "brand.name": "Nhóm 1",
      "brand.sub": "Brochure song ngữ",
      "nav.brochure": "Brochure",
      "nav.team": "Thành viên",
      "nav.qr": "Mã QR",

      "info.course": "Môn học",
      "info.class": "Lớp",
      "info.lecturer": "Giảng viên",
      "info.period": "Thời gian",

      "brochure.desc": "Bấm vào ảnh để xem lớn.",
      "brochure.viewerHint": "Kéo ngang để xem mặt còn lại",
      "brochure.langTag": "Bản",
      "brochure.zoom": "Xem lớn",
      "brochure.download": "Tải ảnh",
      "brochure.pending.title": "Nội dung đang được cập nhật",
      "brochure.pending.desc": "Hình ảnh brochure sẽ được nhóm bổ sung trong thời gian tới.",
      "brochure.missing.title": "Chưa có ảnh",
      "brochure.missing.desc": "Chèn ảnh vào thư mục sau rồi tải lại trang:",

      "team.title": "Thành viên nhóm",
      "team.idLabel": "MSSV",

      "qr.title": "Mã QR mở trang này",
      "qr.desc": "In mã này lên brochure — người xem quét là mở ngay trang web.",
      "qr.scan": "Quét để mở brochure",
      "qr.fixedNote": "Bản QR cố định để dán vào brochure: assets/qr/qr-brochure.png (để in) và .svg (nét vô hạn).",
      "qr.urlLabel": "Link đang gán trong mã QR",
      "qr.urlHelp": "Đổi link ở đây chỉ để xem trước (không lưu lại). Muốn đổi vĩnh viễn: sửa assets/js/config.js rồi chạy npm run qr.",
      "qr.warnPreview": "Đang xem trước một link khác — đừng in mã này lên brochure.",
      "qr.reset": "Về link chính thức",
      "qr.downloadPng": "Tải PNG",
      "qr.downloadSvg": "Tải SVG",
      "qr.copy": "Sao chép link",
      "qr.copied": "Đã sao chép!",
      "qr.print": "Trang in QR",
      "qr.tip1": "Giữ vùng trắng quanh mã, in tương phản tốt.",
      "qr.tip2": "Kích thước in gợi ý: 2 × 2 cm trở lên, tốt nhất 3 × 3 cm.",
      "qr.tip3": "Sau khi deploy, chạy npm run qr để xuất lại mã theo link mới.",
      "qr.toolsNote": "Chế độ nội bộ (chỉ nhóm thấy) — mở bằng ?tools=1. Người ngoài không thấy khối này.",
      "qr.toolsExit": "Xem như người ngoài",

      "footer.madeBy": "Thực hiện bởi Nhóm 1",
      "footer.note": "Trang tĩnh — chạy npm start để xem tại máy, xem ?tools=1 để mở công cụ nội bộ.",
      "footer.top": "Về đầu trang",

      "lightbox.title": "Xem brochure",
      "lightbox.close": "Đóng",
      "lightbox.prev": "Mặt trước",
      "lightbox.next": "Mặt sau",
      "lightbox.openRaw": "Mở ảnh gốc",
    },

    en: {
      "meta.title": "Group 1 brochure — Vietnamese & English editions",
      "brand.name": "Group 1",
      "brand.sub": "Bilingual brochure",
      "nav.brochure": "Brochure",
      "nav.team": "Team",
      "nav.qr": "QR code",

      "info.course": "Course",
      "info.class": "Class",
      "info.lecturer": "Lecturer",
      "info.period": "Period",

      "brochure.desc": "Click an image to view it larger.",
      "brochure.viewerHint": "Swipe to see the other side",
      "brochure.langTag": "Edition",
      "brochure.zoom": "Enlarge",
      "brochure.download": "Download image",
      "brochure.pending.title": "Content coming soon",
      "brochure.pending.desc": "The brochure images will be added very soon.",
      "brochure.missing.title": "Image not added yet",
      "brochure.missing.desc": "Drop the image into this folder, then reload the page:",

      "team.title": "Team members",
      "team.idLabel": "Student ID",

      "qr.title": "QR code for this page",
      "qr.desc": "Print this code on the brochure — one scan opens the website.",
      "qr.scan": "Scan to open the brochure",
      "qr.fixedNote": "Fixed QR files to place on the brochure: assets/qr/qr-brochure.png (for print) and .svg (vector).",
      "qr.urlLabel": "Link encoded in the QR code",
      "qr.urlHelp": "Changing it here is only a temporary preview. To change it for good: edit assets/js/config.js and run npm run qr.",
      "qr.warnPreview": "You are previewing a different link — do not print this code on the brochure.",
      "qr.reset": "Back to official link",
      "qr.downloadPng": "Download PNG",
      "qr.downloadSvg": "Download SVG",
      "qr.copy": "Copy link",
      "qr.copied": "Copied!",
      "qr.print": "Printable QR",
      "qr.tip1": "Keep the white margin around the code and print with strong contrast.",
      "qr.tip2": "Suggested print size: from 2 × 2 cm, ideally 3 × 3 cm.",
      "qr.tip3": "After deploying, run npm run qr to export the code with the new link.",
      "qr.toolsNote": "Internal mode (team only) — opened with ?tools=1. Visitors never see this panel.",
      "qr.toolsExit": "View as visitor",

      "footer.madeBy": "Made by Group 1",
      "footer.note": "Static site — run npm start to preview locally, open ?tools=1 for internal tools.",
      "footer.top": "Back to top",

      "lightbox.title": "View brochure",
      "lightbox.close": "Close",
      "lightbox.prev": "Previous",
      "lightbox.next": "Next",
      "lightbox.openRaw": "Open original image",
    },
  },
};
