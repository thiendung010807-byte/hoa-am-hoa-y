import { z } from "zod";

const answerValue = z.union([z.string().max(2000), z.array(z.string().max(200)).max(20), z.number()]);
export const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^(?:\+84|0)(?:\d[ .-]?){8,10}$/),
  email: z.string().trim().email().max(160),
  school: z.string().trim().min(2).max(160),
  year: z.string().trim().min(1).max(100),
  source: z.string().trim().min(1).max(100),
  expectation: z.string().trim().min(2).max(2000),
  joinFuture: z.string().trim().min(1).max(20),
  note: z.string().trim().max(2000).optional().default(""),
  extraAnswers: z.record(z.string(), answerValue).optional().default({}),
  turnstileToken: z.string().max(4096).optional().default(""),
  website: z.string().max(0).optional().default("")
});
export type RegistrationInput = z.infer<typeof registrationSchema>;
