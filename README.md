# Thiệp mời tốt nghiệp · Quỳnh Hương · Class of 2026

Website thiệp mời tốt nghiệp dạng tĩnh (HTML/CSS/JS), phong cách doodle, tông blue sky & sunshine.

## Cấu trúc

```
index.html            trang thiệp (doodle SVG vẽ tay nằm trong sprite đầu trang)
assets/css/style.css  giao diện
assets/js/main.js     animation phong bì/postcard (GSAP ScrollTrigger), RSVP, bảng lời nhắn
assets/js/config.js   URL Google Apps Script (để trống = chế độ demo)
assets/img/           ảnh sticker huong1, huong2 (webp, đã thêm viền trắng)
apps-script/          2 Apps Script (rsvp/, notes/) + hướng dẫn kết nối Sheet
share.jpg             ảnh preview khi gửi link qua Zalo/Messenger
```

## Chạy thử

Mở bằng một server tĩnh bất kỳ, ví dụ `npx serve .`, rồi vào `http://localhost:3000`.

## Link cá nhân hoá

Thêm `?to=Tên` vào cuối link, ví dụ `https://quynhhuong-graduation-ceremony.vercel.app/?to=Minh%20Anh`.
Phong bì sẽ hiện "Gửi Minh Anh", tên được điền sẵn vào RSVP và tờ note.

## Ca dự lễ

Có 2 ca, khai báo trong `assets/js/config.js`. Thêm mã ca vào tham số `r`:

| Ca | Giờ | Link mẫu |
|---|---|---|
| Ca 1 | 15:00 – 16:00 | `https://quynhhuong-graduation-ceremony.vercel.app/?to=Minh%20Anh&r=k7q2` |
| Ca 2 | 16:00 – 17:00 | `https://quynhhuong-graduation-ceremony.vercel.app/?to=Minh%20Anh&r=m3x9` |

Link không có `r` (hoặc mã sai) sẽ dùng Ca 1. Giờ trên thiệp, đếm ngược, nút thêm vào lịch
và câu xác nhận RSVP đổi theo ca; cột **Ca** trong sheet RSVP ghi khách thuộc ca nào.
Ảnh preview và mô tả khi gửi link chỉ có ngày, không có giờ, nên dùng chung cho mọi ca.

## Trước khi gửi thiệp

1. Kết nối Google Sheet theo `apps-script/README.md`.
2. Deploy lên Vercel (Framework preset: **Other**, không cần build).
3. Nếu đổi tên miền: sửa `og:url` và `og:image` trong `index.html`.
4. Gửi thử link vào Zalo/Messenger để xem ảnh preview.
