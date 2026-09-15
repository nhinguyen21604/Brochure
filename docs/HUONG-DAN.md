# Hướng dẫn chi tiết (tiếng Việt)

Tài liệu này dành cho nhóm 1 — làm theo thứ tự là xong.

## Bước 0 — Xem web đang có gì

```bash
npm start          # rồi mở http://localhost:4173/
```

Bạn sẽ thấy: phần giới thiệu → 2 khung brochure (đang là “chưa có ảnh”) → 4 thẻ thành viên → khối mã QR.
Nút **VI / EN** ở góc phải thanh trên cùng đổi ngôn ngữ cho phần giao diện.

## Bước 1 — Sửa thông tin nhóm (1 phút)

Mở `assets/js/config.js`, sửa các mục:

- `group`: tên nhóm (mặc định “Nhóm 1”).
- `title`, `subtitle`: tiêu đề và mô tả ngắn.
- `course`, `className`, `lecturer`, `period`: điền nếu muốn hiện ở khối đầu trang (để `""` nếu không cần).
- `members`: tên + MSSV (đã điền sẵn 4 thành viên). Thêm `role` (vai trò) hoặc `link` (trang cá nhân) nếu muốn.

## Bước 2 — Chèn ảnh brochure

1. Xuất 2 mặt brochure thành ảnh (File → Export trong Canva/Photoshop/Illustrator/Figma):
   - Định dạng JPG hoặc PNG, **chiều rộng 1500–2000 px**, nên nén để mỗi file dưới ~1,5 MB cho đường truyền lớp học.
   - Nếu brochure là bản gấp đôi: xuất **mỗi mặt thành 1 ảnh riêng** (mặt ngoài / mặt trong) để dễ xem.
2. Bỏ vào đúng thư mục:

   | File | Ý nghĩa |
   | --- | --- |
   | `assets/brochure/vi/mat-truoc.jpg` | Mặt trước — tiếng Việt |
   | `assets/brochure/vi/mat-sau.jpg` | Mặt sau — tiếng Việt |
   | `assets/brochure/en/mat-truoc.jpg` | Mặt trước — tiếng Anh |
   | `assets/brochure/en/mat-sau.jpg` | Mặt sau — tiếng Anh |

3. Tải lại trang (Ctrl/Cmd + Shift + R). Chạy `npm run check` nếu muốn kiểm tra còn thiếu file nào.

**Nếu muốn tên file khác:** sửa `brochure.fileNames` trong `config.js`, ví dụ:

```js
fileNames: {
  vi: { front: ["trang-1", "mat-truoc"], back: ["trang-2", "mat-sau"] },
  en: { front: ["page-1", "mat-truoc"], back: ["page-2", "mat-sau"] },
},
```

**Nếu brochure chỉ có 1 mặt:** xoá bớt một mục trong `brochure.faces` — web tự dựng lại giao diện theo số mặt.

## Bước 3 — Lấy link thật và tạo mã QR

1. Đưa web lên mạng. Cách nhanh với GitHub (repo này đã có sẵn):
   - Vào **Settings → Pages**, chọn **Source: Deploy from a branch**, **Branch: `main` / `(root)`** → Save.
   - Sau ~1 phút, web có tại `https://nhinguyen21604.github.io/Brochure/`.
   - *Lưu ý:* nếu repo là riêng tư, GitHub Pages chỉ chạy khi tài khoản có gói hỗ trợ — nhóm có thể đổi sang Netlify/Vercel (kéo–thả thư mục) hoặc để repo ở chế độ công khai.
2. Sửa `SITE_CONFIG.url` trong `assets/js/config.js` thành link thật (giữ `/` ở cuối).
3. Xuất lại mã QR và mở trang in:

   ```bash
   npm run qr                 # → assets/qr/qr-brochure.svg + .png
   ```

   Trên web, mở chế độ nội bộ `index.html?tools=1` → bấm **Trang in QR** (hoặc mở thẳng `qr-print.html`) rồi in ở khổ A4.
4. Dán mã lên brochure (gợi ý 3 × 3 cm, xem `tools/README-qr.md`) và **quét thử bằng ít nhất 2 điện thoại**.

## Bước 4 — Kiểm tra cuối cùng

- [ ] Mở link bằng điện thoại: trang hiển thị đúng, ảnh brochure rõ, không tràn ngang.
- [ ] Nút VI/EN đổi đúng nội dung giao diện; nút phóng to ảnh hoạt động.
- [ ] 4 thẻ thành viên hiện đủ tên + MSSV, đúng chính tả (nhớ dấu tiếng Việt).
- [ ] Quét mã QR từ **bản in giấy** → mở đúng trang.
- [ ] Không còn chữ “chưa có ảnh” nào trên trang.
- [ ] `npm run check` báo “Mọi thứ sẵn sàng!”.

## Ai thấy gì trên trang?

**Người ngoài (link thường)** chỉ thấy: phần giới thiệu, 2 mặt brochure, 4 thành viên.

**Chỉ nhóm (link có `?tools=1`)** mới thấy: ô nhập link QR, nút tải PNG/SVG, nút sao chép link, trang in QR, mẹo in ấn, đường dẫn file ảnh cần thả vào, ghi chú deploy.

Muốn người ngoài thấy thêm hình mã QR (không kèm công cụ): đặt `ui.showQrSection: true` trong `assets/js/config.js`.
Muốn tắt hẳn `?tools=1`: đặt `ui.allowToolsQuery: false`.

*Lưu ý:* cách này chỉ ẩn trên **trang web đã deploy**. Mã nguồn và thư mục `tools/`, `docs/` vẫn nằm trong repo GitHub — nếu cần giấu cả mã nguồn thì để repo ở chế độ **Private** hoặc deploy bằng Netlify/Vercel ở chế độ riêng tư.

## Câu hỏi thường gặp

**Ảnh chụp bị mờ / nặng?**
Nén tại [squoosh.app](https://squoosh.app) (chọn WebP chất lượng 80–85%) rồi lưu lại với đuôi `.webp` — web đã hỗ trợ sẵn định dạng này.

**Muốn đổi màu chủ đạo (xanh ngọc → màu khác)?**
Mở `assets/css/style.css`, sửa biến `--brand` và `--accent` ở khối `:root` (đầu file). Chỉ cần đổi 2 dòng là cả trang đổi theo.

**Mã QR quét không ra?**
Xem `tools/README-qr.md` — thường là do in quá nhỏ, mất vùng trắng quanh mã, hoặc in mã nhạt.

**Sao tôi mở link mà không thấy nút tải QR?**
Đúng như thiết kế — công cụ chỉ hiện ở chế độ nội bộ: thêm `?tools=1` vào cuối link (ví dụ `.../index.html?tools=1`).

**Có cần cài gì không?**
Không. Web chạy bằng HTML/CSS/JS thuần, thư viện QR đã để sẵn trong `vendor/`. Các script trong `tools/` chỉ dùng module có sẵn của Node (không cần `npm install`).
