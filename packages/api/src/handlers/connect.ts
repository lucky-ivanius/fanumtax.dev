import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { validator } from "hono/validator";
import z from "zod";

import type { Env } from "../env";
import { createGithubConnectionAdapter } from "../lib/connections/github";
import * as tables from "../lib/db/schema";
import { authMiddleware } from "../middlewares/auth";
import { badRequest, ok } from "../utils/response";
import { verify } from "../utils/token";
import { schema } from "../utils/validation";

const connectHandlers = new Hono<Env>();

connectHandlers.post(
  "/github",
  authMiddleware({
    verify: async (token, c) => verify(token, c.env.JWT_SECRET),
  }),
  validator(
    "json",
    schema(
      z.object({
        code: z.string({
          error: ({ input }) => (input ? "Code must be a string" : "Code is required"),
        }),
        state: z
          .string({
            error: () => "State must be a string",
          })
          .optional(),
      })
    )
  ),
  async (c) => {
    const db = drizzle(c.env.D1);

    const [connectedGithub] = await db
      .select()
      .from(tables.connections)
      .where(and(eq(tables.connections.type, "github"), eq(tables.connections.userId, c.var.auth.sub)));
    if (connectedGithub)
      return badRequest(c, { error: "github_already_connected", message: "GitHub is already connected" });

    // const githubClient = createGithubClient(c.env.GITHUB_CLIENT_ID, c.env.GITHUB_CLIENT_SECRET);
    const githubConnectionAdapter = createGithubConnectionAdapter(c.env.GITHUB_CLIENT_ID, c.env.GITHUB_CLIENT_SECRET);
    const { code, state } = c.req.valid("json");

    const createAccessTokenResult = await githubConnectionAdapter.createAccessToken({
      code,
      state,
    });
    if (!createAccessTokenResult.success)
      return badRequest(c, { error: "invalid_github_code", message: "Invalid GitHub code" });

    const accessToken = createAccessTokenResult.data;

    const getCurrentUserResult = await githubConnectionAdapter.getCurrentUser(accessToken);
    if (!getCurrentUserResult.success)
      return badRequest(c, { error: "invalid_github_user", message: "Invalid GitHub user" });

    const githubUser = getCurrentUserResult.data;

    await db.insert(tables.connections).values({
      type: "github",
      externalUserId: githubUser.id,
      externalUsername: githubUser.username,
      token: accessToken,
      userId: c.var.auth.sub,
    });

    return ok(c);
  }
);

export { connectHandlers };
