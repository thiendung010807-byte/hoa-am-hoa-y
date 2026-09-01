import "server-only";

const fallbackUrl = "https://ncouzmdgchaobsrxswti.supabase.co";
const fallbackAnonJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jb3V6bWRnY2hhb2Jzcnhzd3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzc3NzAsImV4cCI6MjEwMzg1Mzc3MH0.VRDHJtEcIZ3MAcJ6xy96E15nmJ7ZZpKzwmT4uMm4cXY";

export function getRegistrationEdgeConfig() {
  return {
    url: process.env.SUPABASE_URL || fallbackUrl,
    anonJwt: process.env.SUPABASE_ANON_JWT || fallbackAnonJwt,
  };
}
