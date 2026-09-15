# Brochure nhóm 1 — web + mã QR

Web tĩnh để **quét mã QR là mở ngay trang brochure**: 2 mặt brochure là phần lớn nhất, rõ nhất trên trang;
bên dưới chỉ là một dải gọn ghi thông tin thành viên.

| Thành viên | MSSV |
| --- | --- |
| Tô Thanh Mai | H2200161 |
| Bùi Trần Trà My | H2200004 |
| Nguyễn Ngọc Hoàng Nhi | H2200106 |
| Nguyễn Ngọc Thảo Nguyên | H2200107 |

> **Khung sườn đã xong — bạn chỉ cần chèn ảnh brochure.** Xem mục [Chèn brochure](#2-chèn-brochure-vào-web-việc-duy-nhất-còn-lại).
> Trang có **chế độ công khai** (mặc định — người ngoài chỉ thấy brochure + thành viên) và **chế độ nội bộ** (mở bằng `?tools=1` để thấy công cụ QR).

---

## 1. Xem thử ngay trên máy

```bash
npm start            # mở http://localhost:4173
```

Khi chưa có ảnh, mỗi mặt brochure hiện khung “Nội dung đang được cập nhật” — **không lỗi, không vỡ giao diện**.

## 2. Chèn brochure vào web (việc duy nhất còn lại)

Xuất 4 file ảnh rồi đặt vào đúng thư mục:

```
assets/brochure/vi/mat-truoc.jpg     ← mặt trước, bản tiếng Việt
assets/brochure/vi/mat-sau.jpg       ← mặt sau,   bản tiếng Việt
assets/brochure/en/mat-truoc.jpg     ← mặt trước, bản tiếng Anh
assets/brochure/en/mat-sau.jpg       ← mặt sau,   bản tiếng Anh
```

Ảnh chiếm gần trọn màn hình nên hãy xuất **dài cạnh 1600–2400 px**, JPG/PNG/WEBP đều được
(web tự dò đuôi `.jpg .jpeg .png .webp .avif`; muốn đổi tên file thì sửa `brochure.fileNames` trong `assets/js/config.js`).
Xong thì tải lại trang. `npm run check` cho biết còn thiếu ảnh nào.

## 3. Đưa lên mạng để mã QR quét được

> ⚠️ **Repo hiện đang ở chế độ Private.** GitHub Pages **không chạy được với repo private trên gói miễn phí** —
> nên đây là việc đầu tiên cần xử lý, làm một trong hai cách:
>
> - **Cách A (đơn giản nhất):** đổi repo sang Public — **Settings → General → cuối trang (Danger zone) →
>   Change repository visibility → Public**. Nội dung repo chỉ gồm trang brochure + tên và MSSV của 4 thành viên
>   (những thông tin này vốn đã in trên brochure nộp cho giảng viên).
> - **Cách B:** giữ repo private nếu tài khoản có **GitHub Pro** (bản Student Pack được miễn phí) — khi đó Pages
>   chạy được với repo private; hoặc deploy bằng **Netlify/Vercel** (hai dịch vụ này cho phép deploy từ repo private).

Sau đó chỉ cần làm **một lần**:

1. **Merge PR** (nút *Merge pull request* trên GitHub) để nội dung vào nhánh `main`.
   *Muốn thử ngay không cần merge:* vào **Settings → Pages → Source: Deploy from a branch → Branch: `arena/01a0a585-brochure` / `(root)` → Save*.
2. Vào **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
3. Chờ khoảng 1 phút, rồi kiểm tra link trên máy bạn:

   ```bash
   npm run live        # báo HTTP 200 + có thấy Nhóm 1, khung brochure, 4 MSSV
   ```

4. Link chuẩn của trang là `https://nhinguyen21604.github.io/Brochure/` — đã được điền sẵn trong
   `assets/js/config.js` và **đã in cố định vào mã QR** trong `assets/qr/`.

Nếu bạn dùng link khác (domain riêng, Netlify, Vercel…): sửa `SITE_CONFIG.url`, chạy `npm run qr`, rồi `npm run live`.

## 4. Mã QR cố định

| File | Dùng khi nào |
| --- | --- |
| `assets/qr/qr-brochure.svg` | **In brochure** — vector, phóng to bao nhiêu cũng nét |
| `assets/qr/qr-brochure.png` | 740 × 740 px — dán vào Word/slide, đăng mạng xã hội |
| `qr-print.html` | Mở trên web (nút *Trang in QR*) → có sẵn khung in A4 |

Cả hai file đều được kiểm chứng: **giải mã lại ra đúng link** `https://nhinguyen21604.github.io/Brochure/`.
Chi tiết cách in & kiểm tra: `tools/README-qr.md`.

## 5. Cấu trúc dự án

```
.
├── index.html                  Trang chính: brochure (lớn nhất) + dải thành viên + khối QR nội bộ
├── qr-print.html               Trang in QR (dùng luôn file QR cố định)
├── assets/
│   ├── css/style.css           Giao diện (dark mode, responsive, chế độ in)
│   ├── js/
│   │   ├── config.js           ⭐ File duy nhất bạn cần sửa: link QR, tên nhóm, thành viên, ảnh
│   │   ├── app.js              Logic: dựng brochure, thành viên, mã QR, lightbox, đổi ngôn ngữ
│   │   └── qr-utils.js         Hàm tạo QR (dùng chung cho web và script Node)
│   ├── img/favicon.svg         Icon tab trình duyệt (+ og-cover.png cho mạng xã hội)
│   ├── qr/                     ⭐ Mã QR cố định để in
│   └── brochure/{vi,en}/       ⭐ Nơi bạn thả ảnh brochure vào
├── vendor/qrcode.js            Thư viện QR (MIT, chạy offline)
├── tools/
│   ├── serve.mjs               Máy chủ tĩnh để xem thử (npm start)
│   ├── generate-qr.mjs         Xuất mã QR ra SVG + PNG (npm run qr)
│   ├── live-check.mjs          Kiểm tra link đã lên mạng chưa (npm run live)
│   ├── check.mjs               Kiểm tra link / ảnh thiếu / thông tin nhóm (npm run check)
│   └── README-qr.md            Hướng dẫn in & kiểm tra mã QR
└── docs/HUONG-DAN.md           Hướng dẫn chi tiết từng bước (tiếng Việt)
```

## 6. Ai thấy gì — công khai / nội bộ

Trang mặc định ở **chế độ công khai**: người ngoài chỉ thấy **2 mặt brochure** (lớn nhất, rõ nhất) và
**dải thông tin 4 thành viên**.

Các phần **chỉ nhóm thấy** (mở bằng `?tools=1`, ví dụ `.../index.html?tools=1`):

| Phần | Vì sao giấu |
| --- | --- |
| Khối QR: ô nhập link, nút Tải PNG/SVG/Sao chép, Trang in QR | công cụ tạo mã QR của nhóm |
| Mẹo in ấn, mục "Mã QR" trên thanh điều hướng | nội dung nội bộ |
| Khung báo thiếu ảnh kèm đường dẫn file (`assets/brochure/...`) | người ngoài chỉ thấy “Nội dung đang được cập nhật” |
| Nút Tải ảnh / Mở ảnh gốc ở mỗi mặt brochure | công cụ làm việc |
| Ghi chú kỹ thuật ở chân trang | ghi chú nội bộ |

Phần nội bộ được giữ kín **cả khi người xem tắt JavaScript** (xem `docs/HUONG-DAN.md`).
Muốn người ngoài thấy thêm hình mã QR: đặt `ui.showQrSection: true`. Muốn tắt hẳn `?tools=1`: đặt `ui.allowToolsQuery: false`.

## 7. Tính năng

- **Brochure là nhân vật chính**: 2 mặt chiếm gần trọn màn hình, bấm vào ảnh là mở xem lớn (← →, ESC, kéo/vuốt, phóng to).
- **Song ngữ VI/EN**: nút VI/EN ở góc trên, tự nhận ngôn ngữ trình duyệt, ghi nhớ lựa chọn, hỗ trợ `?lang=en`; ảnh brochure đổi theo bản VI/EN.
- **Mã QR cố định**: file SVG/PNG trong `assets/qr/`, trang in riêng, có công cụ xem trước link khác.
- **Biết link đã sống chưa**: `npm run live` kiểm tra HTTP + nội dung trang.
- **Thành viên**: tên + MSSV (hỗ trợ thêm vai trò và link cá nhân) dạng dải gọn.
- **Khác**: responsive tới 320 px, dark mode, tôn trọng `prefers-reduced-motion`, không framework, không bước build.

## 8. Bản quyền

Mã nguồn của nhóm dùng tự do cho bài tập. `vendor/qrcode.js` là thư viện
[qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) của Kazuhiko Arase, giấy phép MIT.
