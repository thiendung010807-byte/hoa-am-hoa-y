import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validation";
import { clientIp, hashIp, normalizePhone, verifyTurnstile } from "@/lib/security";
import { submitToGoogleSheets } from "@/lib/googleSheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 20_000;

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function allowedOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (process.env.NODE_ENV !== "production") return true;
  if (!origin) return false;

  const allowed = new Set<string>();
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) allowed.add(configured);
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);

  return allowed.has(origin);
}

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return response({ error: "Định dạng yêu cầu không hợp lệ." }, 415);
    }

    if (!allowedOrigin(req)) {
      return response({ error: "Nguồn yêu cầu không được phép." }, 403);
    }

    const fetchSite = req.headers.get("sec-fetch-site");
    if (process.env.NODE_ENV === "production" && fetchSite && !["same-origin", "same-site"].includes(fetchSite)) {
      return response({ error: "Yêu cầu không hợp lệ." }, 403);
    }

    // Read text first so chunked requests cannot bypass the size limit.
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      return response({ error: "Dữ liệu quá lớn." }, 413);
    }

    let input: unknown;
    try {
      input = JSON.parse(raw);
    } catch {
      return response({ error: "JSON không hợp lệ." }, 400);
    }

    const parsed = registrationSchema.safeParse(input);
    if (!parsed.success) {
      return response({
        error: "Vui lòng kiểm tra lại các trường thông tin.",
        fields: parsed.error.flatten().fieldErrors,
      }, 400);
    }

    // Honeypot: do not tell bots that they were detected.
    if (parsed.data.website) return response({ ok: true });

    const ip = clientIp(req.headers);
    if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
      return response({ error: "Xác minh chống bot chưa thành công. Vui lòng thử lại." }, 403);
    }

    const result = await submitToGoogleSheets({
      fullName: parsed.data.fullName,
      phone: normalizePhone(parsed.data.phone),
      email: parsed.data.email.trim().toLowerCase(),
      school: parsed.data.school,
      studentId: String(parsed.data.extraAnswers.studentId || "").trim(),
      otherSchool: String(parsed.data.extraAnswers.otherSchool || "").trim(),
      facebook: parsed.data.facebook.trim(),
      classMajor: parsed.data.classMajor.trim(),
      skills: parsed.data.skills.trim(),
      performance: parsed.data.performance,
      performanceDetails: String(parsed.data.extraAnswers.performanceDetails || "").trim(),
      note: parsed.data.note.trim(),
      ipHash: hashIp(ip), // used only for short-lived rate limiting; never written to the sheet.
    });

    if (!result.ok && result.reason === "duplicate") {
      return response({ error: "Email hoặc số điện thoại này đã được đăng ký rồi." }, 409);
    }
    if (!result.ok && result.reason === "rate_limited") {
      return response({ error: "Bạn thao tác hơi nhanh. Vui lòng thử lại sau một lúc." }, 429);
    }

    return response({ ok: true });
  } catch (error) {
    console.error("registration_error", error instanceof Error ? error.message : "unknown");
    return response({ error: "Hệ thống đang bận một chút. Vui lòng thử lại." }, 500);
  }
}
