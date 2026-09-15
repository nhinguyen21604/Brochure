# Hướng dẫn chi tiết (tiếng Việt)

Tài liệu này dành cho nhóm 1 — làm theo thứ tự là xong.

## Bước 0 — Xem web đang có gì

```bash
npm start          # rồi mở http://localhost:4173/
```

Bạn sẽ thấy đúng thứ tự: một khối giới thiệu rất gọn (tên nhóm + tiêu đề) → **2 mặt brochure chiếm gần trọn màn hình** → dải gọn 4 thành viên → *(chỉ ở chế độ nội bộ)* khối mã QR.
Nút **VI / EN** ở góc phải thanh trên cùng đổi ngôn ngữ; ảnh brochure cũng đổi theo bản tiếng Việt / tiếng Anh.
Bấm vào bất kỳ ảnh brochure nào để mở xem lớn (phím ← → để đổi mặt, ESC để đóng, kéo/vuốt trên điện thoại).

## Bước 1 — Sửa thông tin nhóm (1 phút)

Mở `assets/js/config.js`, sửa các mục:

- `group`: tên nhóm (mặc định “Nhóm 1”).
- `title`, `subtitle`: tiêu đề và mô tả ngắn.
- `course`, `className`, `lecturer`, `period`: điền nếu muốn hiện ở khối đầu trang (để `""` nếu không cần).
- `members`: tên + MSSV (đã điền sẵn 4 thành viên). Thêm `role` (vai trò) hoặc `link` (trang cá nhân) nếu muốn.

## Bước 2 — Chèn ảnh brochure

1. Xuất 2 mặt brochure thành ảnh (File → Export trong Canva/Photoshop/Illustrator/Figma):
   - Định dạng JPG hoặc PNG, **dài cạnh 1600–2400 px** (ảnh sẽ hiển thị gần trọn màn hình, và còn dùng khi bấm xem lớn), nên nén để mỗi file dưới ~1,5 MB cho đường truyền lớp học.
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

1. Đưa web lên mạng (làm một lần, khoảng 1 phút):
   - **Xử lý repo private trước:** GitHub Pages không chạy với repo private trên gói miễn phí. Chọn một trong hai:
     đổi repo sang **Public** (*Settings → General → Danger zone → Change repository visibility → Public*) —
     trong repo chỉ có trang brochure + tên/MSSV của nhóm; hoặc giữ private nếu tài khoản có **GitHub Pro**
     (Student Pack miễn phí) / deploy bằng Netlify – Vercel.
   - **Merge PR** trên GitHub để nội dung vào nhánh `main`.
     *Muốn thử ngay không cần merge:* **Settings → Pages → Source: Deploy from a branch → Branch: `arena/01a0a585-brochure` / `(root)` → Save*.
   - Vào **Settings → Pages**, chọn **Source: Deploy from a branch**, **Branch: `main` / `(root)`** → Save.
   - Kiểm tra lại trên máy bạn: `npm run live` (báo HTTP 200 và thấy đúng “Nhóm 1”, khung brochure, 4 MSSV).
     Lệnh này cần internet nên hãy chạy ở máy bạn, không chạy trong môi trường sandbox.
   - *Lưu ý:* nếu repo là riêng tư, GitHub Pages chỉ chạy khi tài khoản có gói hỗ trợ — nhóm có thể đổi sang Netlify/Vercel (kéo–thả thư mục) hoặc để repo ở chế độ công khai.
2. Sửa `SITE_CONFIG.url` trong `assets/js/config.js` thành link thật (giữ `/` ở cuối).
3. Xuất lại mã QR và mở trang in:

   ```bash
   npm run qr                 # → assets/qr/qr-brochure.svg + .png
   ```

   Trên web, mở chế độ nội bộ `index.html?tools=1` → bấm **Trang in QR** (hoặc mở thẳng `qr-print.html`) rồi in ở khổ A4.
4. Dán mã lên brochure (gợi ý 3 × 3 cm, xem `tools/README-qr.md`) và **quét thử bằng ít nhất 2 điện thoại**.
   File để dán là `assets/qr/qr-brochure.svg` (in) hoặc `assets/qr/qr-brochure.png` (dán vào Word/slide) —
   cả hai đã được kiểm tra là giải mã ra đúng link.

## Bước 4 — Kiểm tra cuối cùng

- [ ] Mở link bằng điện thoại: trang hiển thị đúng, ảnh brochure rõ, không tràn ngang.
- [ ] Nút VI/EN đổi đúng nội dung giao diện; nút phóng to ảnh hoạt động.
- [ ] 4 thành viên hiện đủ tên + MSSV, đúng chính tả (nhớ dấu tiếng Việt).
- [ ] Quét mã QR từ **bản in giấy** → mở đúng trang (thử 2 điện thoại, 2 app camera khác nhau).
- [ ] `npm run live` báo HTTP 200 — link QR thật sự mở được.
- [ ] `npm run check` không còn mục ✖ nào (báo cả trường hợp mã QR lệch link).
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

**Vì sao mã QR quét không mở được?**
Kiểm tra theo thứ tự: (0) repo còn ở chế độ **Private** thì GitHub Pages không chạy trên gói miễn phí — đổi sang Public hoặc dùng GitHub Pro / Netlify – Vercel; (1) `npm run live` xem link đã lên mạng chưa — nếu chưa thì bật GitHub Pages; (2) link trong `assets/js/config.js` có khớp link thật không, nếu khác thì chạy lại `npm run qr`; (3) mã in có bị nhỏ quá (< 2 cm) hoặc mất vùng trắng quanh mã không.

**Nhập link xem trước trong ô QR rồi lỡ tay in?**
Trang chỉ hiện cảnh báo "Đang xem trước một link khác — đừng in mã này", và link xem trước **không được lưu lại** —
mở lại trang là tự về link chính thức. Bấm **Về link chính thức** để quay lại ngay.

**Sao tôi mở link mà không thấy nút tải QR?**
Đúng như thiết kế — công cụ chỉ hiện ở chế độ nội bộ: thêm `?tools=1` vào cuối link (ví dụ `.../index.html?tools=1`).

**Có cần cài gì không?**
Không. Web chạy bằng HTML/CSS/JS thuần, thư viện QR đã để sẵn trong `vendor/`. Các script trong `tools/` chỉ dùng module có sẵn của Node (không cần `npm install`).
