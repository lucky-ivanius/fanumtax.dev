import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum } from "wagmi/chains";

import { env } from "@/env";

export const config = getDefaultConfig({
  appName: "fanumtax.dev",
  projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [arbitrum],
  ssr: true,
});
