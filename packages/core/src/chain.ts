import type { Network } from "./network";
import { EVM } from "./network";

export interface Chain {
  id: number;
  name: string;
  network: Network;
}

const createChain = <TId extends number, TName extends string>(id: TId, name: TName, network: Network) =>
  ({
    id,
    name,
    network,
  }) as const satisfies Chain;

export const arbitrum = createChain(42161, "Arbitrum One", EVM);
export const arbitrumSepolia = createChain(421614, "Arbitrum Sepolia", EVM);

export const CHAINS = {
  [arbitrum.id]: arbitrum,
  [arbitrumSepolia.id]: arbitrumSepolia,
} as const;

export const CHAIN_LIST: (typeof CHAINS)[keyof typeof CHAINS][] = Object.values(CHAINS);
