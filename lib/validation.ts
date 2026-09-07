import { z } from "zod";

const answerValue = z.union([z.string().max(3000), z.array(z.string().max(300)).max(20), z.number()]);

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^(?:\+84|0)(?:\d[ .-]?){8,10}$/),
  email: z.string().trim().email().max(160),
  school: z.enum(["NEU", "HUST", "HUCE", "Trường khác"]),
  facebook: z.string().trim().min(3).max(500),
  classMajor: z.string().trim().min(1).max(200),
  skills: z.string().trim().min(1).max(3000),
  performance: z.enum(["Có", "Không"]),
  note: z.string().trim().max(3000).optional().default(""),
  extraAnswers: z.record(z.string(), answerValue).optional().default({}),
  turnstileToken: z.string().max(4096).optional().default(""),
  website: z.string().max(0).optional().default("")
}).superRefine((data, ctx) => {
  const studentId = String(data.extraAnswers.studentId || "").trim();
  const otherSchool = String(data.extraAnswers.otherSchool || "").trim();
  const performanceDetails = String(data.extraAnswers.performanceDetails || "").trim();

  if (data.school === "NEU" && !studentId) {
    ctx.addIssue({ code: "custom", path: ["extraAnswers", "studentId"], message: "Thiếu MSV" });
  }
  if (data.school === "Trường khác" && !otherSchool) {
    ctx.addIssue({ code: "custom", path: ["extraAnswers", "otherSchool"], message: "Thiếu tên trường" });
  }
  if (data.performance === "Có" && !performanceDetails) {
    ctx.addIssue({ code: "custom", path: ["extraAnswers", "performanceDetails"], message: "Thiếu thông tin tiết mục" });
  }
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
