# Hòa Âm Hỏa Ý — Google Sheets only

Kiến trúc production:

`Browser → Next.js /api/register (Vercel) → Google Apps Script Web App → Google Sheet`

Supabase đã được loại bỏ hoàn toàn. Browser không biết URL Apps Script, webhook secret hay IP hash salt.

## 1. Google Sheet

Tạo một Google Sheet mới (hoặc dùng sheet hiện tại), sau đó mở **Extensions → Apps Script**.

Dán toàn bộ file:

```text
google-sheets/google-apps-script.gs
```

Trong **Apps Script → Project Settings → Script Properties**, thêm:

```text
WEBHOOK_SECRET=<chuỗi ngẫu nhiên dài ít nhất 32 ký tự>
```

Chạy thủ công hàm `setupSheet()` một lần và cấp quyền. Script sẽ tạo tab `Đăng ký` với các cột:

- Thời gian đăng ký (giờ Việt Nam)
- Họ và tên
- SĐT
- Email
- Trường
- MSV NEU
- Trường khác
- Link Facebook
- Lớp chuyên ngành
- Kĩ năng / Biệt tài / Sở thích
- Đăng ký văn nghệ
- Chi tiết tiết mục
- Lời nhắn / Thắc mắc

Ô `O1/O2` hiển thị tổng số người tham gia. Không có Submission ID, IP, IP hash hay User-Agent trong Sheet.

Sau đó **Deploy → New deployment → Web app**:

- Execute as: **Me**
- Who has access: **Anyone**

Copy URL kết thúc bằng `/exec`.

Mỗi lần sửa Apps Script: **Deploy → Manage deployments → Edit → New version → Deploy**.

## 2. Cloudflare Turnstile

Tạo Turnstile widget tại Cloudflare và thêm domain production. Lấy:

- Site key
- Secret key

Production được cấu hình fail-closed: nếu thiếu `TURNSTILE_SECRET_KEY`, API đăng ký sẽ từ chối submit thay vì tự bỏ CAPTCHA.

## 3. Vercel Environment Variables

Trong Vercel → Project → Settings → Environment Variables:

```text
NEXT_PUBLIC_SITE_URL=https://TEN-MIEN-CUA-BAN
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
GOOGLE_SHEETS_WEBHOOK_SECRET=<giống WEBHOOK_SECRET trong Apps Script>
IP_HASH_SALT=<chuỗi random khác, ít nhất 32 bytes>
```

`GOOGLE_SHEETS_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, `IP_HASH_SALT` tuyệt đối không được có tiền tố `NEXT_PUBLIC_`.

Có thể tạo secret bằng:

```bash
openssl rand -hex 32
```

Tạo hai chuỗi khác nhau cho webhook secret và IP salt.

## 4. Deploy

```bash
npm install
npm run build
git add .
git commit -m "Switch registration to secure Google Sheets only"
git push
```

Vercel sẽ tự deploy lại.

## 5. Bảo mật đã có trong source

- Không có Supabase key/dependency/code.
- Apps Script URL + webhook secret chỉ tồn tại server-side.
- Strict production Origin check.
- `Sec-Fetch-Site` check.
- Chỉ chấp nhận `application/json`.
- Body được đọc thành text và giới hạn 20 KB kể cả request chunked.
- Zod validation ở Next.js server.
- Validate lần hai trong Apps Script.
- Honeypot field chống bot cơ bản.
- Cloudflare Turnstile, production fail-closed.
- Turnstile `action=register` và hostname check ở production.
- Rate limit 5 lần / 10 phút / HMAC(IP) bằng Apps Script CacheService.
- Raw IP và IP hash không ghi vào Google Sheet.
- Duplicate check theo SĐT hoặc email dưới `LockService`, giảm race condition khi submit đồng thời.
- Spreadsheet formula injection protection cho chuỗi bắt đầu bằng `=`, `+`, `-`, `@`.
- Google Sheet lưu thời gian bằng `Asia/Ho_Chi_Minh`.
- Security headers: CSP, HSTS, frame deny, nosniff, Permissions-Policy, COOP/CORP.
- Không trả stack trace / lỗi nội bộ cho browser.
- API responses `no-store`.

## 6. Checklist production rất quan trọng

1. Bật MFA/2FA cho Google, GitHub và Vercel.
2. Không commit `.env.local` hoặc secret vào GitHub.
3. Không gửi URL Apps Script kèm secret cho người khác. Bản này không đặt secret trên URL.
4. Chỉ chia sẻ Google Sheet cho tài khoản BTC thật sự cần truy cập; người xem chỉ Viewer nếu không cần sửa.
5. Trong Google Account kiểm tra định kỳ **Security → Your connections / Third-party access**.
6. Trong Vercel chỉ cấp quyền project cho thành viên cần thiết.
7. Turnstile phải whitelist đúng domain production.
8. Sau khi đổi secret, redeploy Apps Script/Vercel nếu cần và test lại form.
9. Không thêm HTML người dùng nhập bằng `dangerouslySetInnerHTML` ở frontend/admin sau này.
10. Nếu sau này cần quy mô lớn, audit log, admin nhiều quyền hoặc hàng nghìn submit đồng thời, nên quay lại database/backend chuyên dụng thay vì mở rộng Apps Script.

## 7. Test sau deploy

- Submit bình thường → xuất hiện đúng một dòng trong Sheet.
- Timestamp phải là giờ Việt Nam.
- Chọn NEU → cột MSV NEU có dữ liệu.
- Chọn Trường khác → cột Trường khác có dữ liệu.
- Chọn Có văn nghệ → Chi tiết tiết mục có dữ liệu.
- Gửi lại cùng email/SĐT → web báo đã đăng ký.
- Tắt/xóa Turnstile secret ở production để kiểm thử cấu hình → submit phải bị từ chối (sau đó khôi phục ngay).
- Nhập thử `=1+1` vào lời nhắn → Sheet phải hiển thị như text, không chạy công thức.

## Giới hạn cần hiểu

Không website công khai nào có thể bảo đảm “không bị hack 100%”. Google Apps Script + Sheets phù hợp với form sự kiện nhỏ/vừa, nhưng rate-limit dựa trên CacheService là lớp giảm abuse chứ không phải WAF cấp doanh nghiệp. Turnstile + origin validation + server-only secret là các lớp bảo vệ quan trọng nhất trong kiến trúc này.
