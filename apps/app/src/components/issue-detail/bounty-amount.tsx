import { parseUnits } from "viem";

import type { Token } from "@fanumtax/core/token";
import { cn } from "@fanumtax/utils/class-name";

interface BountyAmountProps {
  amount: string;
  token: Token;
}

export const BountyAmount: React.FC<BountyAmountProps> = ({ amount, token }) => {
  const bountyAmount = parseUnits(amount, token.decimals);

  return (
    <span className={cn("font-bold text-4xl text-primary/40", bountyAmount > BigInt(0) && "text-primary")}>
      {bountyAmount.toLocaleString()} {token.symbol}
    </span>
  );
};
