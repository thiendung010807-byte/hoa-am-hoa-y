import type { Metadata } from "next";
import { RegistrationExperience } from "@/components/RegistrationExperience";

export const metadata: Metadata = {
  title: "Đăng ký Hòa Âm Hỏa Ý | Đội SVTN Đồng Hương Bắc Ninh",
  description: "Đăng ký tham gia Hòa Âm Hỏa Ý của Đội Sinh viên Tình nguyện Đồng hương Bắc Ninh.",
};

export default function RegistrationPage() {
  return <RegistrationExperience />;
}
