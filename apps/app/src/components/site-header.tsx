"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { Button } from "@fanumtax/ui/components/button";
import { Input } from "@fanumtax/ui/components/input";
import { Label } from "@fanumtax/ui/components/label";

import { ConnectWallet } from "./connect-wallet";

export const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <header className="sticky top-0 z-50 w-full bg-background px-4 py-4 shadow-xs md:px-8">
      <div className="container relative mx-auto flex w-full items-center justify-between gap-8">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-4 md:hidden">
            <Input type="checkbox" className="peer hidden" id={menuId} checked={open} onChange={() => setOpen(!open)} />

            <Button asChild variant="ghost" size="icon" className="cursor-pointer border md:hidden">
              <Label htmlFor={menuId}>
                <MenuIcon className="block peer-checked:hidden" />
                <XIcon className="hidden peer-checked:block" />
              </Label>
            </Button>

            <nav className="invisible fixed inset-x-0 top-18 bottom-0 flex w-full flex-col gap-4 bg-background px-10 py-6 peer-checked:visible md:hidden">
              <Link href="/" className="font-medium" onClick={() => setOpen(false)}>
                Home
              </Link>
              <Link href="/discover" className="font-medium" onClick={() => setOpen(false)}>
                Discover
              </Link>
              <Link href="/claim" className="font-medium" onClick={() => setOpen(false)}>
                Claim
              </Link>
            </nav>
          </div>

          <h1 className="font-medium text-primary text-xl leading-tight transition-colors duration-100">
            <Link href="/" className="hidden md:inline">
              {"<fanumtax.dev/>"}
            </Link>
            <Link href="/" className="md:hidden">
              {"<f/>"}
            </Link>
          </h1>
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="hidden items-center justify-center gap-8 md:flex">
            <Link href="/" className="font-medium">
              Home
            </Link>
            <Link href="/discover" className="font-medium">
              Discover
            </Link>
            <Link href="/claim" className="font-medium">
              Claim
            </Link>
          </div>

          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};
