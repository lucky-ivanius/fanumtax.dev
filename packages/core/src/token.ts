import { arbitrum, arbitrumSepolia } from "./chain";

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address: string | null;
}

export const createToken = <TName extends string, TSymbol extends string, TDecimals extends number>(
  name: TName,
  symbol: TSymbol,
  decimals: TDecimals,
  address: string | null
) =>
  ({
    name,
    symbol,
    decimals,
    address,
  }) as const satisfies Token;

export const SUPPORTED_TOKENS = ["PYUSD", "USDC", "USDT"] as const;
export type SupportedToken = (typeof SUPPORTED_TOKENS)[number];

export type ChainToken = {
  [key in SupportedToken]?: Token;
};

export const arbitrumTokens = {
  PYUSD: createToken("PayPal USD", "PYUSD", 6, "0x46850aD61C2B7d64d08c9C754F45254596696984"),
  USDC: createToken("Circle USD", "USDC", 6, "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"),
} as const satisfies ChainToken;

export const arbitrumSepoliaTokens = {
  PYUSD: createToken("PayPal USD", "PYUSD", 6, "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1"),
  USDC: createToken("Circle USD", "USDC", 6, "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"),
} as const satisfies ChainToken;

export const CHAIN_TOKENS = {
  [arbitrum.id]: arbitrumTokens,
  [arbitrumSepolia.id]: arbitrumSepoliaTokens,
} as const;

export const CHAIN_TOKEN_LIST: (typeof CHAIN_TOKENS)[keyof typeof CHAIN_TOKENS][] = Object.values(CHAIN_TOKENS);
