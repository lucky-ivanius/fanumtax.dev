import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

import type { Env } from "../env";
import type { AuthUser } from "../types/auth";
import { unauthorized } from "../utils/response";

export type OptionalAuthenticatedEnv = Env & {
  Variables: {
    auth?: AuthUser;
  };
};

export type AuthenticatedEnv = Env & {
  Variables: {
    auth: AuthUser;
  };
};

export interface AuthMiddlewareOptions<TOptional extends boolean = false> {
  verify: (token: string, c: Context<Env>) => Promise<AuthUser | null>;
  optional?: TOptional;
}

export const authMiddleware = <TOptional extends boolean = false>({
  verify,
  optional,
}: AuthMiddlewareOptions<TOptional>) => {
  return createMiddleware(
    async (c: Context<TOptional extends true ? OptionalAuthenticatedEnv : AuthenticatedEnv>, next) => {
      const authorization = c.req.header("Authorization");
      if (!authorization) {
        if (optional) return next();

        return unauthorized(c, { message: "Missing authorization header" });
      }

      const token = authorization.slice(7);
      if (!token) {
        if (optional) return next();

        return unauthorized(c, { message: "Invalid authorization header" });
      }

      const authUser = await verify(token, c as Context);
      if (!authUser) {
        if (optional) return next();

        return unauthorized(c, { message: "Invalid token" });
      }

      c.set("auth", authUser);

      return next();
    }
  );
};
