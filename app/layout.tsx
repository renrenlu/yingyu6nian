import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "English Playbook｜六上英语 P.78–90 互动复习",
    description: "沪教牛津英语六年级上册第 78–90 页互动学习站：词汇点读、不规则动词、语法地图、数字日历与即时练习。",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "English Playbook",
      description: "六上英语 · 78–90 页互动复习",
      type: "website",
      locale: "zh_CN",
      images: [{ url: "/og.png", width: 1672, height: 941, alt: "English Playbook 六上英语互动复习" }],
    },
    twitter: { card: "summary_large_image", title: "English Playbook", description: "六上英语 · 78–90 页互动复习", images: ["/og.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
