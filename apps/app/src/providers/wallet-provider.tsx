"use client";

import "@rainbow-me/rainbowkit/styles.css";

import type { PropsWithChildren } from "react";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { config } from "@/lib/wagmi";

const queryClient = new QueryClient();

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#01ffaa",
            accentColorForeground: "#0a0a0a",
            borderRadius: "none",
            fontStack: "system",
            overlayBlur: "none",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
