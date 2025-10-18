"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Button } from "@fanumtax/ui/components/button";
import { cn } from "@fanumtax/utils/class-name";

export const ConnectWallet: React.FC = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            aria-hidden={!mounted}
            className={cn({
              "pointer-events-none select-none opacity-0": !mounted,
            })}
          >
            {(() => {
              if (!connected)
                return (
                  <Button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </Button>
                );

              if (chain.unsupported)
                return (
                  <Button onClick={openChainModal} type="button" variant="destructive">
                    Wrong network
                  </Button>
                );

              return (
                <div className="flex items-center gap-2">
                  <Button onClick={openAccountModal} type="button" variant="outline">
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
