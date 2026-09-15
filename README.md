# Brochure nhóm 1 — web + mã QR

Web tĩnh nhỏ gọn để **quét mã QR là mở ngay**: xem 2 mặt brochure (bản **tiếng Việt** và bản **tiếng Anh**)
và thông tin các thành viên trong nhóm.

| Thành viên | MSSV |
| --- | --- |
| Tô Thanh Mai | H2200161 |
| Bùi Trần Trà My | H2200004 |
| Nguyễn Ngọc Hoàng Nhi | H2200106 |
| Nguyễn Ngọc Thảo Nguyên | H2200107 |

> **Khung sườn đã xong — bạn chỉ cần chèn ảnh brochure.** Xem mục [Chèn brochure](#2-chèn-brochure-vào-web-việc-duy-nhất-còn-lại).
> Trang đã được tách **chế độ công khai** (mặc định — người ngoài chỉ thấy brochure + thành viên) và **chế độ nội bộ** (mở bằng `?tools=1` để thấy bảng công cụ QR).

---

## 1. Xem thử ngay trên máy

```bash
# Cách 1: có Node.js (khuyến nghị)
npm start            # mở http://localhost:4173

# Cách 2: không cần Node
python3 -m http.server 4173
```

Mở `http://localhost:4173/`. Khi chưa có ảnh, web hiện khung “chưa có ảnh” kèm đúng đường dẫn cần thêm — **không bị lỗi, không vỡ giao diện**.

> Mở trực tiếp file `index.html` bằng `file://` cũng chạy, nhưng nên dùng máy chủ tĩnh để đường dẫn ảnh và các nút tải file hoạt động giống khi deploy.

## 2. Chèn brochure vào web (việc duy nhất còn lại)

Xuất 4 file ảnh (JPG/PNG/WEBP đều được, nền nét, chiều rộng ~1500–2000 px là vừa đẹp) rồi đặt vào đúng thư mục:

```
assets/brochure/vi/mat-truoc.jpg     ← mặt trước, bản tiếng Việt
assets/brochure/vi/mat-sau.jpg       ← mặt sau,   bản tiếng Việt
assets/brochure/en/mat-truoc.jpg     ← mặt trước, bản tiếng Anh
assets/brochure/en/mat-sau.jpg       ← mặt sau,   bản tiếng Anh
```

Tên khác cũng được — web tự dò theo danh sách trong `assets/js/config.js`
(`brochure.fileNames`, mặc định thử `mat-truoc`/`front` và `mat-sau`/`back`, đuôi `.jpg .jpeg .png .webp .avif`).
Xong thì **tải lại trang** (Ctrl/Cmd + Shift + R). Chạy `npm run check` để biết còn thiếu ảnh nào.

Muốn đổi **tên nhóm, tiêu đề, môn học, vai trò thành viên, thứ tự mặt, ghi chú**… → sửa `assets/js/config.js`.

## 3. Cấu trúc dự án

```
.
├── index.html                  Trang chính: hero, brochure, thành viên, mã QR
├── qr-print.html               Trang in mã QR (bấm "Trang in QR" trên web)
├── assets/
│   ├── css/style.css           Toàn bộ giao diện (có dark mode + responsive)
│   ├── js/
│   │   ├── config.js           ⭐ File duy nhất bạn cần sửa: link QR, tên nhóm, thành viên, ảnh
│   │   ├── app.js              Logic: dựng brochure, thành viên, mã QR, lightbox, đổi ngôn ngữ
│   │   └── qr-utils.js         Hàm tạo QR (dùng chung cho web và script Node)
│   ├── img/favicon.svg         Icon tab trình duyệt
│   ├── qr/                     QR xuất sẵn (tạo bằng npm run qr)
│   └── brochure/{vi,en}/       ⭐ Nơi bạn thả ảnh brochure vào
├── vendor/qrcode.js            Thư viện QR (MIT, chạy offline, không cần internet)
├── tools/
│   ├── serve.mjs               Máy chủ tĩnh để xem thử (npm start)
│   ├── generate-qr.mjs         Xuất mã QR ra SVG + PNG (npm run qr)
│   ├── check.mjs               Kiểm tra link / ảnh thiếu / thông tin nhóm (npm run check)
│   └── README-qr.md            Hướng dẫn in & kiểm tra mã QR
└── docs/HUONG-DAN.md           Hướng dẫn chi tiết từng bước (tiếng Việt)
```

## 4. Đưa lên mạng để mã QR quét được

1. Sửa `SITE_CONFIG.url` trong `assets/js/config.js` thành link thật (giữ dấu `/` cuối).
2. Deploy — nhanh nhất là **GitHub Pages**:

   ```bash
   gh repo view --web    # hoặc: Settings → Pages → Source: Deploy from a branch → main / (root)
   ```

   Link sẽ có dạng `https://<tài-khoản>.github.io/Brochure/`. Có thể dùng Netlify/Vercel (kéo–thả thư mục là xong).
3. Chạy `npm run qr` để xuất lại mã QR theo link mới.
4. In QR (xem `tools/README-qr.md`), dán lên brochure và **quét thử bằng điện thoại**.

## 5. Công khai / nội bộ — phần nào ai thấy

Trang mặc định ở **chế độ công khai**. Người ngoài chỉ thấy: phần giới thiệu, 2 mặt brochure, 4 thành viên.

Các phần **chỉ nhóm thấy** (mở bằng `?tools=1`, ví dụ `.../index.html?tools=1`):

| Phần | Vì sao giấu |
| --- | --- |
| Ô nhập link + nút Tải PNG/SVG/Sao chép + Trang in QR | công cụ tạo mã QR của nhóm |
| Mẹo in ấn, mục "Mã QR" trên thanh điều hướng | nội dung nội bộ |
| Khung báo thiếu ảnh kèm đường dẫn file (`assets/brochure/...`) | lộ cấu trúc thư mục; người ngoài chỉ thấy “Nội dung đang được cập nhật” |
| Nút Tải ảnh / Mở ảnh gốc ở mỗi mặt brochure | công cụ làm việc |
| Ghi chú deploy ở chân trang | ghi chú kỹ thuật |

Muốn người ngoài thấy thêm hình mã QR (không kèm công cụ): đặt `ui.showQrSection: true` trong `assets/js/config.js`.
Muốn tắt hẳn `?tools=1`: đặt `ui.allowToolsQuery: false`.

> Lưu ý: ẩn trên **trang web** thôi — mã nguồn, `docs/`, `tools/` vẫn nằm trong repo GitHub nên ai xem repo vẫn thấy. Nếu cần giấu cả mã nguồn, để repo ở chế độ **Private** (GitHub Pages cần gói trả phí) hoặc deploy bằng Netlify/Vercel ở chế độ riêng tư.

## 6. Tính năng đã có

- **Song ngữ VI/EN**: nút VI/EN trên thanh trên cùng; tự nhận ngôn ngữ trình duyệt, ghi nhớ lựa chọn, hỗ trợ `?lang=en`.
- **Mã QR**: tự sinh theo link cấu hình; bảng công cụ (tải PNG/SVG, sao chép link, trang in riêng, xem trước link khác) nằm trong chế độ nội bộ `?tools=1`.
- **Brochure**: 2 mặt cạnh nhau, bấm để xem lớn (lightbox: ← →, ESC, kéo/vuốt, phóng to), tải ảnh gốc; tự dò file ảnh nên chèn ảnh xong là chạy.
- **Thành viên**: thẻ tên + MSSV (avatar chữ cái), hỗ trợ thêm vai trò và link cá nhân.
- **Hai chế độ hiển thị**: công khai (mặc định) / nội bộ (`?tools=1`) — xem mục 5.
- **Khác**: responsive tới 320 px, dark mode, tôn trọng `prefers-reduced-motion`, không phụ thuộc framework, không cần bước build.

## 7. Bản quyền

Mã nguồn của nhóm dùng tự do cho bài tập. `vendor/qrcode.js` là thư viện
[qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) của Kazuhiko Arase, giấy phép MIT.
