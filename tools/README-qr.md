# Mã QR — cách tạo, in và kiểm tra

Trang web tự sinh mã QR (nút **Tải PNG / Tải SVG** ở mục *Mã QR* trên trang chủ).
Nội dung mã = `SITE_CONFIG.url` trong `assets/js/config.js` — bạn có thể đổi ngay trên web
bằng ô nhập link (chỉ để xem trước), nhưng muốn cố định thì phải sửa trong `config.js`.

## 1. Xuất lại mã QR sau khi có link thật

```bash
# 1) sửa SITE_CONFIG.url trong assets/js/config.js
# 2) chạy:
node tools/generate-qr.mjs
# → assets/qr/qr-brochure.svg  (in ấn, nét vô hạn)
# → assets/qr/qr-brochure.png  (dán vào slide, Word, mạng xã hội)

# hoặc chỉ định link trực tiếp, tên file khác và độ phân giải lớn hơn:
node tools/generate-qr.mjs --url "https://vi-du.com/brochure/" --name qr-in-a5 --scale 20
```

Tuỳ chọn: `--url --out --name --scale --margin --dark --light --ecc`
(`--ecc` = mức sửa lỗi `L|M|Q|H`; mặc định `M` — cân bằng giữa độ bền và độ nét).

## 2. In lên brochure

- Mở `qr-print.html?u=<link>` (hoặc bấm nút **Trang in QR** trên web) → **In trang này**.
- Kích thước gợi ý: **3 × 3 cm** là lý tưởng, **tối thiểu 2 × 2 cm**. Nhỏ hơn dễ quét trượt.
- Luôn giữ **vùng trắng (quiet zone) 4 ô** quanh mã — đừng cắt sát mã, đừng đặt mã lên ảnh nền rối.
- Tương phản: mã **đậm** trên nền **sáng** (không đảo màu, không in mã nhạt trên nền tối nếu máy in kém).
- Tránh in ở vị trí gấp/giáp mí của brochure (giấy gấp làm méo mã).

## 3. Kiểm tra trước khi nộp

```bash
node tools/check.mjs      # link QR, mã QR có lệch link không, ảnh brochure còn thiếu, thông tin nhóm
npm run live              # link đã thật sự mở được chưa (cần internet, chạy ở máy bạn)
```

`check.mjs` thoát với mã lỗi **1** nếu còn mục ✖ — tiện để cắm vào công cụ tự động hoá.

Nó cũng đọc file “lý lịch” `assets/qr/qr-brochure.json` (link + số ô + thời điểm tạo) để so với
`SITE_CONFIG.url`: khác nhau → báo **mã QR lệch link** ngay, tránh in ra mã dẫn sai chỗ.
File này do `npm run qr` tự sinh, bạn không cần sửa tay.

1. Mở `qr-print.html`, in ra giấy nháp rồi quét thử bằng 2–3 điện thoại khác nhau.
2. Thử quét trong điều kiện thật: ánh sáng lớp học, mã hơi cong, khoảng cách 15–30 cm.
3. Quét xong phải mở đúng trang web (không bị chuyển hướng), và trên điện thoại phải xem được cả 2 mặt brochure.
4. Nhớ dùng link **https** — nếu trang chưa có HTTPS, một số máy sẽ cảnh báo.

## 4. Ảnh xem trước khi chia sẻ link

`assets/img/og-cover.png` (1200 × 630) là ảnh hiện ra khi dán link lên Facebook/Zalo/Messenger.
Trong ảnh **đã nhúng sẵn mã QR thật** trỏ về đúng trang — người xem thấy ảnh là quét được luôn.
Nếu bạn đổi link, nhớ tạo lại ảnh này (hoặc chỉ cần đổi `assets/img/og-cover.png` bằng ảnh khác).

## 5. Xem thử tại máy

```bash
npm start        # http://localhost:4173  (Ctrl+C để dừng)
```

Máy chủ xem thử chỉ phục vụ trong thư mục dự án: mọi đường dẫn kiểu `../` đều bị chặn (**403**),
phương thức khác `GET`/`HEAD` bị trả **405**, và không cache để bạn sửa file là thấy ngay.
Đây chỉ là chuyện của môi trường xem thử — không liên quan tới trang thật trên GitHub Pages.

## 6. Ghi chú kỹ thuật

- Mã QR dùng thư viện `vendor/qrcode.js` ([qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), giấy phép MIT), chạy hoàn toàn phía trình duyệt — không cần internet, không gửi dữ liệu đi đâu.
- `tools/generate-qr.mjs` cũng dùng cùng thư viện đó trong Node, kèm bộ mã hoá PNG viết tay nên **không cần `npm install`**.
- Mức sửa lỗi `M` cho phép mã vẫn đọc được khi bị xước/bẩn ~15% diện tích. Nếu mã cần dán ở vị trí hay bị mờ, dùng `--ecc Q` hoặc `--ecc H` (mã dày hơn một chút).
