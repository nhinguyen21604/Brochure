/* =====================================================================
 *  config.js — CẤU HÌNH DUY NHẤT CỦA WEB
 * ---------------------------------------------------------------------
 *  Mọi thứ bạn cần sửa đều nằm trong file này:
 *    1. Thông tin nhóm, tên thành viên, MSSV
 *    2. Đường dẫn website (link sẽ được in trong mã QR)
 *    3. Vị trí / tên file ảnh brochure (2 mặt, 2 ngôn ngữ)
 *  Sửa xong chỉ cần lưu file (Ctrl/Cmd + S) rồi tải lại trang.
 * ===================================================================== */
window.SITE_CONFIG = {
  /* ------------------------------------------------------------------
   * 1) LINK WEBSITE — chính là nội dung được mã hoá trong mã QR.
   *    Đổi thành link thật sau khi bạn deploy (GitHub Pages / Vercel /
   *    Netlify…). Nhớ giữ dấu "/" ở cuối.
   * ------------------------------------------------------------------ */
  url: "https://nhinguyen21604.github.io/Brochure/",

  /* ------------------------------------------------------------------
   * 2) THÔNG TIN CHUNG
   * ------------------------------------------------------------------ */
  group: { vi: "Nhóm 4", en: "Group 4" },

  title: {
    vi: "Brochure giới thiệu",
    en: "Introduction Brochure",
  },

  // Dòng mô tả ngắn dưới tiêu đề (có thể để "" nếu không cần)
  subtitle: {
    vi: "Sản phẩm brochure 2 mặt — bản tiếng Việt & bản tiếng Anh, kèm thông tin các thành viên trong nhóm.",
    en: "A two-sided brochure — available in Vietnamese and English, with the team member information.",
  },

  // Môn học / lớp / giảng viên… (để "" nếu không muốn hiển thị)
  course: { vi: "", en: "" },
  className: { vi: "", en: "" },
  lecturer: { vi: "", en: "" },
  // Mốc thời gian hiển thị ở phần chân trang, ví dụ "Học kỳ 1 · 2025–2026"
  period: { vi: "", en: "" },

  /* ------------------------------------------------------------------
   * 3) THÀNH VIÊN NHÓM
   *    - name : tên hiển thị
   *    - id   : MSSV
   *    - role : vai trò (tuỳ chọn, để "" nếu không cần)
   *    - link : link cá nhân (tuỳ chọn, để "" nếu không cần)
   * ------------------------------------------------------------------ */
  members: [
    {
      name: "Tô Thanh Mai",
      id: "H2200161",
      role: { vi: "", en: "" },
      link: "",
    },
    {
      name: "Bùi Trần Trà My",
      id: "H2200004",
      role: { vi: "", en: "" },
      link: "",
    },
    {
      name: "Nguyễn Ngọc Hoàng Nhi",
      id: "H2200106",
      role: { vi: "", en: "" },
      link: "",
    },
    {
      name: "Nguyễn Ngọc Thảo Nguyên",
      id: "H2200107",
      role: { vi: "", en: "" },
      link: "",
    },
  ],

  /* ------------------------------------------------------------------
   * 4) ẢNH BROCHURE — CHỖ BẠN CHÈN ẢNH VÀO
   * ------------------------------------------------------------------
   *  Thư mục:  assets/brochure/<ngôn ngữ>/<tên file>.<đuôi>
   *  Web tự dò các đuôi: .jpg .jpeg .png .webp .avif  (đặt tên nào
   *  cũng được, miễn là nằm trong danh sách "fileNames" bên dưới).
   *
   *  Cách nhanh nhất: chỉ cần copy 4 file ảnh vào đúng thư mục với
   *  đúng tên (tự tạo thư mục nếu chưa có):
   *
   *      assets/brochure/vi/mat-truoc.jpg   ← mặt trước (tiếng Việt)
   *      assets/brochure/vi/mat-sau.jpg     ← mặt sau   (tiếng Việt)
   *      assets/brochure/en/mat-truoc.jpg   ← mặt trước (tiếng Anh)
   *      assets/brochure/en/mat-sau.jpg     ← mặt sau   (tiếng Anh)
   *
   *  Chưa có ảnh thì web hiện khung "chưa có ảnh" — không bị lỗi.
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
      {
        key: "front",
        label: { vi: "Mặt trước", en: "Front side" },
        note: { vi: "", en: "" },
      },
      {
        key: "back",
        label: { vi: "Mặt sau", en: "Back side" },
        note: { vi: "", en: "" },
      },
    ],
  },

  /* ------------------------------------------------------------------
   * 5) CHỮ HIỂN THỊ TRÊN WEB (2 ngôn ngữ)
   *    Sửa thoải mái — đây chỉ là phần giao diện, không phải brochure.
   * ------------------------------------------------------------------ */
  i18n: {
    vi: {
      "meta.title": "Brochure nhóm 4 — bản tiếng Việt & tiếng Anh",
      "brand.name": "Nhóm 4",
      "brand.sub": "Brochure song ngữ",
      "nav.brochure": "Brochure",
      "nav.team": "Thành viên",
      "nav.qr": "Mã QR",

      "hero.badge": "Brochure 2 mặt · Song ngữ",
      "hero.cta": "Xem brochure",
      "hero.cta2": "Lấy mã QR",
      "hero.note": "Quét mã QR để mở đúng trang này trên điện thoại.",
      "info.course": "Môn học",
      "info.class": "Lớp",
      "info.lecturer": "Giảng viên",
      "info.period": "Thời gian",

      "brochure.eyebrow": "Sản phẩm",
      "brochure.title": "Brochure của nhóm",
      "brochure.desc": "Bấm vào ảnh để xem lớn. Dùng nút chuyển ngôn ngữ ở trên để xem bản tiếng Việt hoặc tiếng Anh.",
      "brochure.zoom": "Xem lớn",
      "brochure.download": "Tải ảnh",
      "brochure.langTag": "Bản",
      "brochure.missing.title": "Chưa có ảnh",
      "brochure.missing.desc": "Chèn ảnh vào thư mục sau rồi tải lại trang:",
      "brochure.viewerHint": "Kéo ngang để xem mặt còn lại",

      "team.eyebrow": "Nhóm thực hiện",
      "team.title": "Thành viên nhóm",
      "team.desc": "Nhóm 4 thành viên cùng thực hiện nội dung, thiết kế và bản dịch brochure.",
      "team.idLabel": "MSSV",
      "team.count": "4 thành viên",

      "qr.eyebrow": "Chia sẻ",
      "qr.title": "Mã QR mở trang này",
      "qr.desc": "In mã này lên brochure hoặc trình chiếu trên lớp — người xem quét là mở ngay trang web.",
      "qr.scan": "Quét để mở brochure",
      "qr.urlLabel": "Link đang gán trong mã QR",
      "qr.urlHelp": "Đổi link ở đây để xem trước, hoặc sửa trong assets/js/config.js để lưu cố định.",
      "qr.downloadPng": "Tải PNG",
      "qr.downloadSvg": "Tải SVG",
      "qr.copy": "Sao chép link",
      "qr.copied": "Đã sao chép!",
      "qr.print": "Trang in QR",
      "qr.tip1": "Giữ khoảng trắng (vùng trắng) quanh mã khi in, mã cần tương phản tốt.",
      "qr.tip2": "Kích thước in gợi ý: tối thiểu 2 × 2 cm, tốt nhất 3 × 3 cm.",
      "qr.tip3": "Sau khi deploy, mở tools/README-qr.md để xuất lại mã QR với link mới.",

      "footer.madeBy": "Thực hiện bởi nhóm 4",
      "footer.note": "Trang web tĩnh — có thể đưa lên GitHub Pages, Netlify hoặc Vercel.",
      "footer.top": "Về đầu trang",

      "lightbox.close": "Đóng",
      "lightbox.prev": "Mặt trước",
      "lightbox.next": "Mặt sau",
      "lightbox.openRaw": "Mở ảnh gốc",
    },

    en: {
      "meta.title": "Group 4 brochure — Vietnamese & English editions",
      "brand.name": "Group 4",
      "brand.sub": "Bilingual brochure",
      "nav.brochure": "Brochure",
      "nav.team": "Team",
      "nav.qr": "QR code",

      "hero.badge": "Two-sided · Bilingual brochure",
      "hero.cta": "View brochure",
      "hero.cta2": "Get the QR code",
      "hero.note": "Scan the QR code to open this exact page on a phone.",
      "info.course": "Course",
      "info.class": "Class",
      "info.lecturer": "Lecturer",
      "info.period": "Period",

      "brochure.eyebrow": "Deliverable",
      "brochure.title": "Our brochure",
      "brochure.desc": "Click an image to enlarge it. Use the language switch above to view the Vietnamese or the English edition.",
      "brochure.zoom": "Enlarge",
      "brochure.download": "Download image",
      "brochure.langTag": "Edition",
      "brochure.missing.title": "Image not added yet",
      "brochure.missing.desc": "Drop the image into this folder, then reload the page:",
      "brochure.viewerHint": "Swipe to see the other side",

      "team.eyebrow": "The team",
      "team.title": "Team members",
      "team.desc": "Four members working together on the content, the design and the translation.",
      "team.idLabel": "Student ID",
      "team.count": "4 members",

      "qr.eyebrow": "Share",
      "qr.title": "QR code for this page",
      "qr.desc": "Print this code on the brochure or show it in class — one scan opens the website.",
      "qr.scan": "Scan to open the brochure",
      "qr.urlLabel": "Link encoded in the QR code",
      "qr.urlHelp": "Change it here for a preview, or edit assets/js/config.js to make it permanent.",
      "qr.downloadPng": "Download PNG",
      "qr.downloadSvg": "Download SVG",
      "qr.copy": "Copy link",
      "qr.copied": "Copied!",
      "qr.print": "Printable QR",
      "qr.tip1": "Keep the white margin around the code and print it with strong contrast.",
      "qr.tip2": "Suggested print size: at least 2 × 2 cm, ideally 3 × 3 cm.",
      "qr.tip3": "After deploying, see tools/README-qr.md to export the QR code with your final link.",

      "footer.madeBy": "Made by Group 4",
      "footer.note": "Static website — host it on GitHub Pages, Netlify or Vercel.",
      "footer.top": "Back to top",

      "lightbox.close": "Close",
      "lightbox.prev": "Previous",
      "lightbox.next": "Next",
      "lightbox.openRaw": "Open original image",
    },
  },
};
