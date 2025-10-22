import type { Chain } from "./chain";
import type { Token } from "./token";

export interface Bounty {
  id: string;

  /* Token */
  chain: Chain;
  token: Token;
  amount: string; // in hex string

  /* User */
  createdBy: string;
}
