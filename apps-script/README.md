# Kết nối Google Sheet: 2 Apps Script riêng

| Script | File code | Lưu gì | Dán URL vào `config.js` |
|---|---|---|---|
| RSVP | `apps-script/rsvp/Code.gs` | Ai sẽ đến, ca nào | `rsvpUrl` |
| Lời nhắn | `apps-script/notes/Code.gs` | Các tờ note trên bảng | `notesUrl` |

Mỗi script gắn với **một Google Sheet riêng**. Làm bằng tài khoản Google của Hương.
Làm phần A cho RSVP, rồi lặp lại y hệt cho Lời nhắn (phần B chỉ ghi chỗ khác nhau).

---

## A. Apps Script RSVP

### 1. Tạo Google Sheet
1. Vào <https://sheets.new> (tạo Sheet trống mới).
2. Đặt tên, ví dụ `Thiệp QH – RSVP`.

### 2. Dán code
1. Trên menu Sheet: **Tiện ích mở rộng → Apps Script**. Một tab mới mở ra.
2. Đặt tên dự án (góc trên trái), ví dụ `QH RSVP`.
3. Xoá hết code mặc định trong `Code.gs`, dán **toàn bộ** nội dung `apps-script/rsvp/Code.gs`.
4. Bấm biểu tượng **Lưu** (💾) hoặc `Ctrl + S`.

### 3. Chạy `setup` để tạo bảng
1. Ở thanh trên, ô chọn hàm: chọn **`setup`**, bấm **▶ Chạy**.
2. Lần đầu Google hỏi quyền:
   - **Xem xét quyền** → chọn tài khoản của Hương.
   - Nếu hiện "Google chưa xác minh ứng dụng này": bấm **Nâng cao → Đi tới QH RSVP (không an toàn)**.
     Đây là script của chính mình nên an toàn.
   - Bấm **Cho phép**.
3. Quay lại tab Sheet: có tab **RSVP** với các cột `Thời gian | Tên | Tham dự | Ca | Link gửi cho`.

### 4. Triển khai thành Web App
1. Góc trên phải: **Triển khai → Tuỳ chọn triển khai mới**.
2. Bấm bánh răng ⚙ cạnh "Chọn loại" → **Ứng dụng web**.
3. Điền:
   - Mô tả: `v1`
   - Thực thi với tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai** (bắt buộc, không chọn "Bất kỳ ai có tài khoản Google")
4. Bấm **Triển khai**, copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/AKfy.../exec`).

### 5. Kiểm tra nhanh
Mở URL vừa copy trên trình duyệt. Thấy `{"ok":true,"service":"rsvp"}` là được.

---

## B. Apps Script Lời nhắn

Làm lại đúng các bước của phần A, chỉ khác:

| Bước | RSVP | Lời nhắn |
|---|---|---|
| Tên Sheet | `Thiệp QH – RSVP` | `Thiệp QH – Lời nhắn` |
| Tên dự án | `QH RSVP` | `QH Lời nhắn` |
| Code dán vào | `apps-script/rsvp/Code.gs` | `apps-script/notes/Code.gs` |
| Tab tạo ra | `RSVP` | `Notes` (cột `Thời gian \| Tên \| Lời nhắn \| Màu \| Link gửi cho \| Ẩn`) |
| Mở URL để kiểm tra | `{"ok":true,"service":"rsvp"}` | `{"ok":true,"notes":[]}` |

---

## C. Dán 2 URL vào trang thiệp

Mở `assets/js/config.js`, điền:

```js
window.INVITE_CONFIG = {
  rsvpUrl: 'https://script.google.com/macros/s/....RSVP..../exec',
  notesUrl: 'https://script.google.com/macros/s/....LOINHAN..../exec',
  // sessions... giữ nguyên
};
```

Rồi deploy lại web lên Vercel. URL nào còn để trống thì phần đó chạy chế độ demo (chỉ lưu trong trình duyệt).

**Thử thật:** mở thiệp, gửi 1 RSVP và dán 1 tờ note, rồi xem 2 Sheet đã có dòng mới chưa.
Nhớ xoá các dòng thử trước khi gửi thiệp cho khách.

---

## Quản lý sau này

- **Ẩn một lời nhắn:** trong Sheet Lời nhắn, tick ô **Ẩn** ở dòng đó. Note biến mất khỏi bảng ở lần tải trang sau.
  Đừng xoá dòng tiêu đề hay đổi thứ tự cột.
- **Xem ai đến ca nào:** Sheet RSVP, dùng **Dữ liệu → Tạo bộ lọc** rồi lọc cột **Ca** / **Tham dự**.
- **Sửa code rồi:** **Triển khai → Quản lý triển khai → ✏ → Phiên bản: Phiên bản mới → Triển khai**.
  URL giữ nguyên, không cần sửa `config.js`. (Nếu chọn "Tuỳ chọn triển khai mới" sẽ ra URL **khác**.)

## Lỗi hay gặp

| Hiện tượng | Cách sửa |
|---|---|
| Thiệp báo "Chưa gửi được" | Kiểm tra quyền truy cập là **Bất kỳ ai**, URL kết thúc bằng `/exec` (không phải `/dev`) |
| Mở URL thấy trang đăng nhập Google | Triển khai sai quyền truy cập, sửa lại thành **Bất kỳ ai** rồi tạo phiên bản mới |
| Note gửi được nhưng bảng trống | Dán nhầm URL RSVP vào `notesUrl`; kiểm tra lại 2 URL |
| Sửa code mà không thấy thay đổi | Chưa tạo **Phiên bản mới** khi triển khai |
