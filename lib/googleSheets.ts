export type GoogleSheetsRegistration = {
  fullName: string;
  phone: string;
  email: string;
  school: string;
  studentId: string;
  otherSchool: string;
  facebook: string;
  classMajor: string;
  skills: string;
  performance: "Có" | "Không";
  performanceDetails: string;
  note: string;
  ipHash: string;
};

type SheetResponse = {
  ok?: boolean;
  error?: string;
  duplicate?: boolean;
  rateLimited?: boolean;
};

export async function submitToGoogleSheets(payload: GoogleSheetsRegistration) {
  const endpoint = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!endpoint || !secret) {
    throw new Error("google_sheets_not_configured");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
      body: JSON.stringify({
        secret,
        ...payload,
      }),
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) throw new Error(`google_sheets_http_${res.status}`);

    const data = (await res.json().catch(() => null)) as SheetResponse | null;
    if (!data?.ok) {
      if (data?.duplicate) return { ok: false as const, reason: "duplicate" as const };
      if (data?.rateLimited) return { ok: false as const, reason: "rate_limited" as const };
      throw new Error(`google_sheets_rejected:${data?.error || "unknown"}`);
    }

    return { ok: true as const };
  } finally {
    clearTimeout(timer);
  }
}
