import type { JWTPayload } from "hono/utils/jwt/types";
import { sign as jwtSign, verify as jwtVerify } from "hono/jwt";

import type { AuthUser } from "../types/auth";

export const sign = async (user: AuthUser, secret: string): Promise<string | null> => {
  try {
    const { sub, ...rest } = user;
    if (!sub) return null;

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3; // 3 days

    return jwtSign({ sub, exp, ...rest }, secret);
  } catch (_error) {
    return null;
  }
};

export const verify = async (token: string, secret: string): Promise<AuthUser | null> => {
  try {
    const user = (await jwtVerify(token, secret)) as JWTPayload & AuthUser;
    if (!user) return null;

    return {
      sub: user.sub,
      address: user.address,
    };
  } catch (_error) {
    return null;
  }
};
