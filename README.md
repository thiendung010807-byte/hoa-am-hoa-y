# Hòa Âm Hỏa Ý – Đội SVTN Đồng Hương Bắc Ninh

Website **Interactive Invitation + Event Landing Page + Registration Form**, tối ưu để deploy trên **Vercel**. Backend ghi đăng ký vào **Supabase Postgres** (nguồn dữ liệu chính) và có thể **mirror sang Google Sheets**.

## Có gì trong project

- Màn mở đầu phong thư + dấu sáp + icon rain + animation mở thiệp + confetti.
- Hero, marquee, storytelling, typing/delete Unicode-safe bằng `Intl.Segmenter`.
- Countdown realtime, mini calendar, event cards, dresscode, timeline, Google Maps embed.
- Form 3 bước, progress, validation, radio/checkbox/select/yes-no/rating/scale/other answer.
- Success fullscreen + confetti.
- Responsive mobile-first + `prefers-reduced-motion`.
- Next.js Route Handler; **browser không có quyền ghi trực tiếp Supabase**.
- Supabase RLS, unique email/phone, rate limit server-side, hashed IP, honeypot, Cloudflare Turnstile, origin check, body-size guard.
- CSP + HSTS + anti-clickjacking + nosniff + Permissions Policy.
- Optional Google Sheets mirror sau khi Supabase ghi thành công.

> Không hệ thống web nào có thể cam kết “chống hack 100%”. Project này dùng defense-in-depth và secure-by-default; vẫn cần cập nhật dependency, giữ secret an toàn và theo dõi log khi chạy production.

## 1. Cài đặt local

Yêu cầu Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở `http://localhost:3000`.

## 2. Cấu hình nội dung sự kiện

Sửa `data/event.ts`:

- `date`: ISO datetime kèm `+07:00`.
- `dateLabel`, `timeLabel`.
- `location`, `address`, `mapsUrl`, `mapsEmbedUrl`.
- `dressCode`, `timeline`, `questions`.
- `musicUrl`: URL MP3 HTTPS. Để `""` nếu chưa dùng nhạc.

Không tách từng ký tự tiếng Việt bằng `split("")`; component typing hiện tại dùng `Intl.Segmenter` để giữ grapheme/dấu tiếng Việt đúng.

## 3. Tạo Supabase

Tạo project Supabase → SQL Editor → chạy toàn bộ file:

```text
supabase/schema.sql
```

Sau đó vào **Project Settings / API** lấy:

- Project URL → `SUPABASE_URL`
- Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

**Service Role Key tuyệt đối không được đặt tên `NEXT_PUBLIC_*`, không commit Git, không dùng ở Client Component.**

### Vì sao bảng không có public policy?

`registrations` chứa PII (họ tên, phone, email). RLS được bật và `anon`/`authenticated` bị revoke. Chỉ API server-side sử dụng service role mới được ghi/đọc.

## 4. Chống bot bằng Cloudflare Turnstile

Tạo Turnstile widget cho domain production và localhost (nếu cần test), sau đó thêm:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

Ở production, nếu không có secret Turnstile, API được thiết kế **fail-closed** và từ chối submit thay vì âm thầm bỏ bảo vệ.

## 5. Google Sheets mirror (optional)

Supabase là nguồn chính để chống duplicate/rate limit ổn định. Nếu BTC vẫn cần Sheet:

1. Tạo Google Sheet.
2. Extensions → Apps Script.
3. Paste `supabase/google-apps-script.gs`.
4. Project Settings → Script Properties → tạo `WEBHOOK_SECRET` là chuỗi random dài.
5. Deploy → New deployment → Web app → Execute as **Me** → access **Anyone**.
6. Copy Web App URL vào Vercel env `GOOGLE_SHEETS_WEBHOOK_URL`.
7. Dùng đúng secret ở `GOOGLE_SHEETS_WEBHOOK_SECRET`.

Secret chỉ được nối vào request **ở server**, không xuất hiện trong browser bundle.

## 6. Environment variables

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
TURNSTILE_SECRET_KEY=...
IP_HASH_SALT=<random-64-char-secret>
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
GOOGLE_SHEETS_WEBHOOK_SECRET=<random-secret>
```

Tạo secret nhanh:

```bash
openssl rand -hex 32
```

## 7. Deploy Vercel

### Cách UI

1. Push folder này lên GitHub.
2. Vercel → Add New → Project → Import repository.
3. Framework tự nhận Next.js.
4. Add toàn bộ env ở mục **Environment Variables**.
5. Deploy.
6. Sau deploy, đổi `NEXT_PUBLIC_SITE_URL` thành domain thật rồi Redeploy.
7. Trong Cloudflare Turnstile, thêm domain Vercel/custom domain vào allowed hostnames.

### Cách CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

## 8. Security checklist trước khi public

- [ ] Không commit `.env.local` / service role key.
- [ ] Supabase RLS đang bật; không tạo policy public cho `registrations`.
- [ ] Turnstile site key + secret đã cấu hình production.
- [ ] `NEXT_PUBLIC_SITE_URL` đúng origin production.
- [ ] `IP_HASH_SALT` random mạnh.
- [ ] Test duplicate email/phone trả HTTP 409.
- [ ] Test >5 request/10 phút cùng IP trả HTTP 429.
- [ ] Test request không có Turnstile production trả HTTP 403.
- [ ] Test request cross-origin bị chặn.
- [ ] Security headers hiện trên response production.
- [ ] Bật MFA cho Vercel, Supabase, Google account.
- [ ] Chỉ cấp quyền project cho người cần thiết.
- [ ] Bật dependency/security alerts trên GitHub.
- [ ] Không ghi full phone/email vào application logs.

## 9. Kiểm tra flow

1. Vào trang → phong thư đóng.
2. Click → seal/flap/letter animation + confetti.
3. Scroll toàn bộ landing page.
4. Countdown dùng `event.date`.
5. Map mở đúng địa điểm.
6. Form không cho next khi trường bắt buộc thiếu.
7. Submit → Turnstile → rate limit → Supabase insert.
8. Submit trùng email/phone → thông báo đã đăng ký.
9. Nếu có Sheets webhook → row xuất hiện trong tab `Registrations`.
10. Thành công → success fullscreen + confetti.

## 10. Cấu trúc chính

```text
app/
  api/register/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  HoaAmHoaYPage.tsx
data/event.ts
lib/
  googleSheets.ts
  security.ts
  supabase.ts
  validation.ts
supabase/
  schema.sql
  google-apps-script.gs
next.config.ts
vercel.json
```

## Ghi chú production

- Google Apps Script mirror là tiện ích cho BTC; dữ liệu chuẩn vẫn nên lấy từ Supabase.
- Nếu traffic lớn, thay rate-limit table bằng Redis/KV chuyên dụng và thêm WAF/bot rules ở CDN.
- Nếu làm `/admin`, nên dùng Supabase Auth + allowlist email/role, route server-side và audit log; **không bao giờ** cho admin key xuống client.


## Trang đăng ký riêng

Form đăng ký nằm tại `/dang-ky`, mỗi câu hỏi hiển thị theo dạng full-screen onboarding một câu/màn hình. CTA trên trang chính dẫn sang route này.


## Google Sheets mirror + tổng số người tham gia

Mỗi đăng ký được lưu vào Supabase trước. Sau khi Supabase xác nhận thành công, server sẽ mirror dữ liệu sang Google Sheets qua Apps Script. Google Sheets không quyết định việc đăng ký có thành công hay không, vì vậy lỗi Sheets tạm thời sẽ không làm mất đăng ký trong Supabase.

1. Tạo một Google Sheet mới.
2. Vào **Extensions → Apps Script** và dán toàn bộ file `supabase/google-apps-script.gs`.
3. Vào **Project Settings → Script Properties** và tạo `WEBHOOK_SECRET` với một chuỗi ngẫu nhiên dài.
4. Chạy hàm `setupSheet()` một lần và cấp quyền cho script.
5. Chọn **Deploy → New deployment → Web app**; `Execute as: Me`, `Who has access: Anyone`.
6. Sao chép URL kết thúc bằng `/exec`.
7. Trong Vercel → Project → Settings → Environment Variables, thêm:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
GOOGLE_SHEETS_WEBHOOK_SECRET=CHUOI_BI_MAT_GIONG_TRONG_SCRIPT_PROPERTIES
```

Tab `Registrations` sẽ chứa từng lượt đăng ký. Ô `N1` có nhãn **TỔNG SỐ NGƯỜI THAM GIA**, còn `N2` tự động đếm số Submission ID đã ghi. Script có lock và kiểm tra Submission ID để tránh webhook retry tạo dòng trùng.
