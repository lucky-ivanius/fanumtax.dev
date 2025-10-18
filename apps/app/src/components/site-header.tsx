import Link from "next/link";

import { ConnectWallet } from "./connect-wallet";

export const SiteHeader: React.FC = () => {
  return (
    <header className="sticky top-0 w-full bg-background px-4 py-4 shadow md:px-8">
      <div className="container mx-auto flex w-full items-center justify-between gap-8">
        <h1 className="text-lg">fanumtax.dev</h1>

        <div className="flex items-center justify-center gap-8">
          <Link href="/" className="font-medium">
            Explore
          </Link>
          <Link href="/claim" className="font-medium">
            Claim
          </Link>
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};
