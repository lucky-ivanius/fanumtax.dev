import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { z } from "zod";

import type { Pagination } from "@fanumtax/core/pagination";
import type { Repository } from "@fanumtax/core/repository";
import { LANGUAGE_LIST } from "@fanumtax/core/language";
import { LICENSE_LIST } from "@fanumtax/core/license";

import type { Env } from "../env";
import * as tables from "../lib/db/schema";
import { createGithubRepositoryAdapter } from "../lib/repositories/github";
import { authMiddleware } from "../middlewares/auth";
import { ok, unexpectedError } from "../utils/response";
import { verify } from "../utils/token";
import { schema } from "../utils/validation";

const discoverHandlers = new Hono<Env>();

discoverHandlers.get(
  "/",
  authMiddleware({
    verify: async (token, c) => verify(token, c.env.JWT_SECRET),
    optional: true,
  }),
  validator(
    "query",
    schema(
      z.object({
        platform: z.enum(["github"]).default("github"),
        q: z.string().default(""),
        language: z
          .union([
            z
              .enum(
                LANGUAGE_LIST.map(({ name }) => name),
                {
                  error: ({ input }) => (input ? "Language must contain a valid language" : "Language is required"),
                }
              )
              .transform((value) => [value]),
            z.array(
              z.enum(
                LANGUAGE_LIST.map(({ name }) => name),
                {
                  error: ({ input }) => (input ? "Language must contain a valid language" : "Language is required"),
                }
              ),
              {
                error: ({ input }) =>
                  input ? "Languages must be an array of valid languages" : "Languages is required",
              }
            ),
          ])
          .optional(),
        license: z
          .union([
            z
              .enum(
                LICENSE_LIST.map(({ key }) => key),
                {
                  error: ({ input }) => (input ? "License must contain a valid license" : "License is required"),
                }
              )
              .transform((value) => [value]),
            z.array(
              z.enum(
                LICENSE_LIST.map(({ key }) => key),
                {
                  error: ({ input }) => (input ? "License must contain a valid license" : "License is required"),
                }
              ),
              {
                error: ({ input }) => (input ? "Licenses must be an array of valid licenses" : "Licenses is required"),
              }
            ),
          ])
          .optional(),
        limit: z.coerce
          .number({
            error: ({ input }) => (input ? "Limit must be an integer number" : "Limit is required"),
          })
          .min(1, { message: "Limit must be greater than or equal to 1" })
          .max(100, { message: "Limit must be less than or equal to 100" })
          .int({
            error: "Limit must be an integer number",
          })
          .default(10),
        offset: z.coerce
          .number({
            error: ({ input }) => (input ? "Offset must be an integer number" : "Offset is required"),
          })
          .min(0, { message: "Offset must be greater than or equal to 0" })
          .int({
            error: "Offset must be an integer number",
          })
          .default(0),
      })
    )
  ),
  async (c) => {
    const { q, language: languages, license: licenses, limit, offset } = c.req.valid("query");

    const db = drizzle(c.env.D1);

    const [connectedGithub] = c.var.auth
      ? await db.select().from(tables.connections).where(eq(tables.connections.userId, c.var.auth.sub))
      : [null];

    const githubRepositoryDiscovery = createGithubRepositoryAdapter(
      connectedGithub?.token ?? c.env.GITHUB_DEFAULT_ACCESS_TOKEN
    );

    const searchRepositoriesResult = await githubRepositoryDiscovery.searchRepositories({
      query: q,
      languages,
      licenses,
      limit,
      offset,
    });
    if (!searchRepositoriesResult.success) {
      switch (searchRepositoriesResult.error) {
        case "unexpected_error":
          return unexpectedError(c);
      }
    }

    const { items, total } = searchRepositoriesResult.data;

    return ok<typeof c, Pagination<Repository>>(c, {
      items: items.map((item) => ({
        ...item,
        totalBountyUsd: 0,
      })),
      total,
    });
  }
);

export { discoverHandlers };
