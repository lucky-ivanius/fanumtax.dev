import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
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
      <body className="dark bg-background font-mono antialiased">
        <WalletProvider>
          <SiteHeader />
          <div className="flex min-h-[calc(100vh-4.5rem)] flex-col">
            <main className="flex flex-1 flex-col px-4 py-6 md:px-8">{children}</main>
            <SiteFooter />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
};

export default RootLayout;
