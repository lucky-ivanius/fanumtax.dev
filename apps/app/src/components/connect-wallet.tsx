"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useDisconnect } from "wagmi";

import { Button } from "@fanumtax/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@fanumtax/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fanumtax/ui/components/dropdown-menu";
import { cn } from "@fanumtax/utils/class-name";

export const ConnectWallet: React.FC = () => {
  const { disconnect } = useDisconnect();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
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
                    <span className="hidden md:inline">Connect Wallet</span>
                    <span className="md:hidden">Connect</span>
                  </Button>
                );

              if (chain.unsupported)
                return (
                  <Button onClick={openChainModal} type="button" variant="destructive">
                    Wrong network
                  </Button>
                );

              return (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="hidden md:flex">
                      <Button type="button" variant="outline">
                        {account.displayName}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => disconnect()}>Disconnect</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog>
                    <DialogTrigger asChild className="flex md:hidden">
                      <Button type="button" variant="outline">
                        {account.displayName}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connected Wallet</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 pt-6">
                        <div className="grid gap-3">
                          <h2 className="font-bold text-sm">Wallet</h2>
                          <p className="text-muted-foreground text-sm">{account.displayName}</p>
                        </div>
                        <div className="grid gap-3">
                          <h2 className="font-bold text-sm">Balance</h2>
                          <p className="text-muted-foreground text-sm">{account.displayBalance}</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="destructive" className="w-full" onClick={() => disconnect()}>
                            Disconnect
                          </Button>
                        </DialogClose>
                        <Button variant="secondary" className="w-full" asChild>
                          <Link href="/settings">Settings</Link>
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
