# Brochure

Trang tĩnh dùng để xem brochure qua link/QR.

> Repo này chỉ phục vụ bài làm của nhóm. Vui lòng không sao chép, chỉnh sửa lại, hoặc dùng lại nội dung/ảnh khi chưa được phép.

## Chạy thử

```bash
npm start
```

Sau đó mở địa chỉ local được in ra trong terminal.
Muốn xem trước giao diện điện thoại ngay trên máy tính: mở `/tools/mobile-preview.html`
(3 khung 360 / 390 / 430 px, có nút đổi chế độ người ngoài / `?tools=1` / bản tiếng Anh).

## Thiết kế cho điện thoại trước

Người xem chủ yếu quét QR bằng điện thoại, nên giao diện ưu tiên màn hẹp:

- Trang **luôn ở giao diện sáng** (`color-scheme: light`), không tự chuyển tối theo cài đặt máy —
  giữ đúng màu bản in brochure và dễ đọc ngoài trời.
- Header thấp ~56 px, phần giới thiệu thu thành mini card, ảnh brochure rộng ~96% màn hình.
- Có dải `[1 Mặt trước] [2 Mặt sau]` dính dưới header để đổi mặt không phải cuộn tay.
- Danh sách thành viên thu thành accordion (mặc định đóng); chân trang rút còn 2 dòng.
- Ảnh ưu tiên bản `.webp` (nhẹ hơn PNG ~70%) và mặt đầu tiên được tải trước.

Chi tiết đầy đủ: `docs/HUONG-DAN.md`.

## Kiểm tra nhanh

```bash
npm run check      # kiểm tra link QR, ảnh, .webp, giao diện điện thoại, noindex…
npm run images     # báo cáo dung lượng ảnh brochure
```

## Ghi chú riêng tư

- Trang web đã đặt `noindex, nofollow` để hạn chế bị công cụ tìm kiếm lập chỉ mục.
- Các công cụ nội bộ chỉ mở khi dùng chế độ riêng của nhóm.
- Nếu cần kín hơn nữa, nên chuyển repository sang **Private** hoặc deploy qua dịch vụ hỗ trợ private repo.

## License / sử dụng

Mã nguồn và nội dung trong repo này không dành cho việc tái sử dụng công khai nếu chưa có sự đồng ý của nhóm.
