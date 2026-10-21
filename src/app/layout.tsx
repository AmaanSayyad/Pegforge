import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.domain} - Stocks, gold, oil → borrow MUSD`,
  description:
    "Post tokenized stocks, gold, silver, or oil as collateral and borrow MUSD under LTV on Mezo.",
  applicationName: SITE.domain,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/pegforge-mark.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: `${SITE.domain} - Stocks, gold, oil → borrow MUSD`,
    description:
      "Lock RWA collateral on Mezo the way BTC locks into a CDP. Borrow Bitcoin-backed MUSD.",
    url: SITE.url,
    siteName: SITE.domain,
    type: "website",
    images: [{ url: "/pegforge-mark.png", width: 512, height: 512, alt: SITE.domain }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
