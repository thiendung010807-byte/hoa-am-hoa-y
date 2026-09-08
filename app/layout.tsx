import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://hoa-am-hoa-y.vercel.app";

const title = "Hòa Âm Hỏa Ý | Đội SVTN Đồng Hương Bắc Ninh";

const description =
  "Một buổi gặp mặt để làm quen, nghe lại những giai điệu quê mình, chơi cùng nhau và có thêm những người bạn mới.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title,
  description,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Hòa Âm Hỏa Ý",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Hòa Âm Hỏa Ý — Đội SVTN Đồng Hương Bắc Ninh",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-preview.jpg"],
  },

  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#07152f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
