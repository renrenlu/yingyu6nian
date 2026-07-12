import type { Metadata } from "next";
import "./globals.css";

const assetBase = process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://english-playbook-p78-90.renren49.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "English Playbook｜六上英语 P.78–90 互动复习",
  description: "沪教牛津英语六年级上册第 78–90 页互动学习站：词汇点读、不规则动词、语法地图、数字日历与即时练习。",
  icons: { icon: `${assetBase}/favicon.svg`, shortcut: `${assetBase}/favicon.svg` },
  openGraph: {
    title: "English Playbook",
    description: "六上英语 · 78–90 页互动复习",
    type: "website",
    locale: "zh_CN",
    images: [{ url: `${assetBase}/og.png`, width: 1672, height: 941, alt: "English Playbook 六上英语互动复习" }],
  },
  twitter: { card: "summary_large_image", title: "English Playbook", description: "六上英语 · 78–90 页互动复习", images: [`${assetBase}/og.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
