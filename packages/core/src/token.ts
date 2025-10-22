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
  PYUSD: createToken("PayPal USD", "PYUSD", 18, "0x3c2B8Be99c50593081EAA2A724F0B8285F5aba8f"),
  USDC: createToken("USD Coin", "USDC", 6, "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"),
  USDT: createToken("Tether", "USDT", 6, "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"),
} as const satisfies ChainToken;

export const arbitrumSepoliaTokens = {
  PYUSD: createToken("PayPal USD", "PYUSD", 18, "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681"),
  USDC: createToken("USD Coin", "USDC", 6, "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"),
  USDT: createToken("Tether", "USDT", 6, "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"),
} as const satisfies ChainToken;

export const CHAIN_TOKENS = {
  [arbitrum.id]: arbitrumTokens,
  [arbitrumSepolia.id]: arbitrumSepoliaTokens,
} as const;

export const CHAIN_TOKEN_LIST: (typeof CHAIN_TOKENS)[keyof typeof CHAIN_TOKENS][] = Object.values(CHAIN_TOKENS);
