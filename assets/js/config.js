/*
 * Cấu hình thiệp mời.
 * rsvpUrl:  URL Web App của Apps Script RSVP      (apps-script/rsvp/Code.gs)
 * notesUrl: URL Web App của Apps Script Lời nhắn  (apps-script/notes/Code.gs)
 * Cách tạo: xem apps-script/README.md.
 * Để trống = chế độ demo: dữ liệu chỉ lưu trong trình duyệt đang xem.
 *
 * sessions: các ca dự lễ. Mã ca nằm trong tham số r của link, ví dụ
 *   https://<ten-mien>/?to=Minh%20Anh&r=k7q2
 * Mã cố ý viết ngẫu nhiên để khách không đoán ra là có nhiều ca.
 * Link không có r (hoặc r sai) sẽ dùng ca defaultSession.
 * label: tên ca ghi vào cột "Ca" của Google Sheet, khách không thấy.
 */
window.INVITE_CONFIG = {
  rsvpUrl: 'https://script.google.com/macros/s/AKfycbwEu3cqoMmeuBepcBIZ0PXUuklUZKkZCCZOVBEz05-DZF0izsVunjkA8aBjZchFV005/exec',
  notesUrl: 'https://script.google.com/macros/s/AKfycbxBIWChbfNAMVjnbPDkl8bjs5_SrcrFQTc6AjSJEZzigFvELr0P6o5fcR-wZPG9ghTbAw/exec',
  sessions: {
    k7q2: { label: 'Ca 1 (15h–16h)', date: '2026-11-27', start: '15:00', end: '16:00' },
    m3x9: { label: 'Ca 2 (16h–17h)', date: '2026-11-27', start: '16:00', end: '17:00' }
  },
  defaultSession: 'k7q2'
};
