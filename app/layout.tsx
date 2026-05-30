import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nhachung-dashboard.niandemo.site",
  ),
  title: "Nhà Chung Quản Trị",
  description:
    "Nhà Chung giúp Ban quản trị công bố thông tin minh bạch, kết nối cư dân dễ dàng và quản lý tòa nhà hiệu quả.",
  // openGraph: {
  //   title: "Nhà Chung Quản Trị",
  //   description:
  //     "Nhà Chung giúp Ban quản trị công bố thông tin minh bạch, kết nối cư dân dễ dàng và quản lý tòa nhà hiệu quả.",
  //   type: "website",
  //   locale: "vi_VN",
  //   images: [
  //     {
  //       url: "/thumbnail.jpeg",
  //       width: 1152,
  //       height: 837,
  //       alt: "Nhà Chung",
  //     },
  //   ],
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Nhà Chung Quản Trị",
  //   description:
  //     "Nhà Chung giúp Ban quản trị công bố thông tin minh bạch, kết nối cư dân dễ dàng và quản lý tòa nhà hiệu quả.",
  //   images: ["/thumbnail.jpeg"],
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
