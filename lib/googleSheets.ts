export async function mirrorToGoogleSheets(payload: Record<string, unknown>) {
  const base = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!base || !secret) return { skipped: true };
  const url = new URL(base);
  url.searchParams.set("key", secret);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store"
    });
    if (!res.ok) throw new Error(`Sheets webhook failed: ${res.status}`);
    return { skipped: false };
  } finally { clearTimeout(timer); }
}
