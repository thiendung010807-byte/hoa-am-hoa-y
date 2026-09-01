import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { registrationSchema } from "@/lib/validation";
import { clientIp, hashIp, normalizePhone, verifyTurnstile } from "@/lib/security";
import { getAdminSupabase } from "@/lib/supabase";
import { mirrorToGoogleSheets } from "@/lib/googleSheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get("content-type")?.includes("application/json")) return response({ error: "Định dạng yêu cầu không hợp lệ." }, 415);
    const origin = req.headers.get("origin");
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const vercelOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
    if (process.env.NODE_ENV === "production" && origin && origin !== configuredOrigin && origin !== vercelOrigin) return response({ error: "Nguồn yêu cầu không được phép." }, 403);
    const length = Number(req.headers.get("content-length") || "0");
    if (length > 30_000) return response({ error: "Dữ liệu quá lớn." }, 413);

    const parsed = registrationSchema.safeParse(await req.json());
    if (!parsed.success) return response({ error: "Vui lòng kiểm tra lại các trường thông tin.", fields: parsed.error.flatten().fieldErrors }, 400);
    if (parsed.data.website) return response({ ok: true }); // honeypot: quietly absorb bots

    const ip = clientIp(req.headers);
    const ipHash = hashIp(ip);
    if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) return response({ error: "Xác minh chống bot chưa thành công. Vui lòng thử lại." }, 403);

    const supabase = getAdminSupabase();
    const { data: allowed, error: rateError } = await supabase.rpc("check_registration_rate_limit", { p_ip_hash: ipHash });
    if (rateError) throw rateError;
    if (!allowed) return response({ error: "Bạn thao tác hơi nhanh. Vui lòng thử lại sau một lúc." }, 429);

    const submissionId = crypto.randomUUID();
    const row = {
      submission_id: submissionId,
      full_name: parsed.data.fullName,
      phone: normalizePhone(parsed.data.phone),
      email: parsed.data.email.toLowerCase(),
      school: parsed.data.school,
      year: parsed.data.year,
      source: parsed.data.source,
      expectation: parsed.data.expectation,
      join_future: parsed.data.joinFuture,
      note: parsed.data.note,
      extra_answers: parsed.data.extraAnswers,
      ip_hash: ipHash,
      user_agent: (req.headers.get("user-agent") || "").slice(0, 500)
    };

    const { error } = await supabase.from("registrations").insert(row);
    if (error) {
      if (error.code === "23505") return response({ error: "Email hoặc số điện thoại này đã được đăng ký rồi." }, 409);
      throw error;
    }

    // Google Sheets is a mirror, never allowed to make a successful registration fail.
    await mirrorToGoogleSheets({ timestamp: new Date().toISOString(), ...row, ip_hash: undefined, user_agent: undefined }).catch(() => undefined);
    return response({ ok: true, submissionId });
  } catch (error) {
    console.error("registration_error", error instanceof Error ? error.message : "unknown");
    return response({ error: "Hệ thống đang bận một chút. Vui lòng thử lại." }, 500);
  }
}
