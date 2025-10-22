import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";

import type { Env } from "../env";
import * as tables from "../lib/db/schema";
import { authMiddleware } from "../middlewares/auth";
import { ok } from "../utils/response";
import { verify } from "../utils/token";

const settingsHandlers = new Hono<Env>();

settingsHandlers.get(
  "/connections",
  authMiddleware({
    verify: async (token, c) => verify(token, c.env.JWT_SECRET),
  }),
  async (c) => {
    const db = drizzle(c.env.D1);

    const connections = await db.select().from(tables.connections).where(eq(tables.connections.userId, c.var.auth.sub));

    const connected = Object.fromEntries(
      connections.map(({ type, externalUsername }) => {
        return [type, externalUsername];
      })
    );

    return ok(c, {
      connected,
    });
  }
);

export { settingsHandlers };
