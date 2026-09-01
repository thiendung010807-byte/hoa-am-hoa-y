import crypto from "node:crypto";

export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}
export function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || "hoa-am-hoa-y-2026-server-ip-hash-v1";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}
export function normalizePhone(phone: string) { return phone.replace(/[^\d+]/g, ""); }
export async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store" });
  if (!res.ok) return false;
  const data = await res.json() as { success?: boolean };
  return data.success === true;
}
