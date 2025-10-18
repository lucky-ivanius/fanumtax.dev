import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";
import { WalletProvider } from "@/providers/wallet-provider";

const _geistMono = Geist_Mono({ subsets: ["latin"], preload: true });

export const metadata: Metadata = {
  title: "fanumtax.dev",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`dark font-mono antialiased`}>
        <WalletProvider>
          <SiteHeader />
          <div className="min-h-screen">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
};

export default RootLayout;
