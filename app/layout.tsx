import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { WEDDING } from "@/data/wedding";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 배포 주소. 카카오톡 미리보기 이미지의 절대 경로를 만드는 데 쓰인다.
 * 배포할 때 환경변수 NEXT_PUBLIC_SITE_URL을 실제 주소로 지정한다.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const TITLE = `${WEDDING.groom} ♥ ${WEDDING.bride} 결혼합니다`;
const DESCRIPTION = `${WEDDING.date} ${WEDDING.time} · ${WEDDING.venue}`;

/**
 * 카카오톡으로 링크를 보냈을 때 뜨는 미리보기는 여기서 결정된다.
 * 하객은 마을을 보기 전에 이 카드부터 본다.
 *
 * 미리보기 이미지는 app/opengraph-image.tsx 가 코드로 그린다.
 * 파일 이름만 맞으면 Next.js가 알아서 태그에 넣어준다.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Pixel Memories",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
