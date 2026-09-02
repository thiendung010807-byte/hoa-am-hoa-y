import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hòa Âm Hỏa Ý | Đội SVTN Đồng Hương Bắc Ninh",
  description: "Có một chiếc hẹn đang chờ bạn — Hòa Âm Hỏa Ý của Đội Sinh viên Tình nguyện Đồng hương Bắc Ninh.",
  openGraph: {
    title: "Hòa Âm Hỏa Ý | Đội SVTN Đồng Hương Bắc Ninh",
    description: "Mở thiệp và gặp chúng mình tại Hòa Âm Hỏa Ý!",
    type: "website"
  }
};

export const viewport: Viewport = { themeColor: "#07152f", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
