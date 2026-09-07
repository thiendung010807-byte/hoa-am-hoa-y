import crypto from "node:crypto";

export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}

export function hashIp(ip: string) {
  // Reuse the server-only webhook secret as a safe fallback so a missing
  // optional IP salt cannot take the whole registration endpoint down.
  const salt = process.env.IP_HASH_SALT || process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!salt && process.env.NODE_ENV === "production") throw new Error("ip_hash_secret_missing");
  return crypto
    .createHmac("sha256", salt || "local-development-only")
    .update(ip)
    .digest("hex");
}

export function normalizePhone(phone: string) {
  let value = phone.replace(/[^\d+]/g, "");
  if (value.startsWith("+84")) value = `0${value.slice(3)}`;
  if (value.startsWith("84") && value.length >= 11) value = `0${value.slice(2)}`;
  return value;
}

function expectedHostname() {
  try {
    return process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
}

export async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Production must never silently run without bot verification.
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(6_000),
  });
  if (!res.ok) return false;

  const data = (await res.json()) as {
    success?: boolean;
    hostname?: string;
    action?: string;
  };

  if (data.success !== true) return false;
  if (data.action && data.action !== "register") return false;

  const hostname = expectedHostname();
  if (hostname && data.hostname && data.hostname !== hostname && process.env.VERCEL_ENV === "production") {
    return false;
  }

  return true;
}
