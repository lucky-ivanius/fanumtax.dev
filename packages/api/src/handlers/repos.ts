import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { z } from "zod";

import type { Issue, IssueDetail } from "@fanumtax/core/issue";
import type { LanguageName } from "@fanumtax/core/language";
import type { LicenseKey } from "@fanumtax/core/license";
import type { Pagination } from "@fanumtax/core/pagination";
import type { Repository } from "@fanumtax/core/repository";
import { LANGUAGE_LIST, LANGUAGES } from "@fanumtax/core/language";
import { LICENSE_LIST, LICENSES } from "@fanumtax/core/license";

import type { Env } from "../env";
import * as tables from "../lib/db/schema";
import { createGithubRepositoryAdapter } from "../lib/repositories/github";
import { authMiddleware } from "../middlewares/auth";
import { notFound, ok, unexpectedError } from "../utils/response";
import { verify } from "../utils/token";
import { schema } from "../utils/validation";

const reposHandlers = new Hono<Env>();

reposHandlers
  .get(
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
                  error: ({ input }) =>
                    input ? "Licenses must be an array of valid licenses" : "Licenses is required",
                }
              ),
            ])
            .optional(),
          sort: z.enum(["highest_bounty", "lowest_bounty", "stars", "forks"]).default("highest_bounty"),
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
      const { platform, language: languages, license: licenses, sort, limit, offset } = c.req.valid("query");

      const db = drizzle(c.env.D1);

      const where = [
        eq(tables.repositories.platform, platform),
        gt(tables.repositories.totalBountyUsd, 0),
        languages?.length ? inArray(tables.repositories.language, languages) : null,
        licenses?.length ? inArray(tables.repositories.license, licenses) : null,
      ].filter(Boolean);

      const orderBy = (() => {
        switch (sort) {
          case "highest_bounty":
            return [desc(tables.repositories.totalBountyUsd), desc(tables.repositories.stars)];
          case "lowest_bounty":
            return [asc(tables.repositories.totalBountyUsd), desc(tables.repositories.stars)];
          case "forks":
            return [desc(tables.repositories.forks), asc(tables.repositories.owner), asc(tables.repositories.name)];
          default:
            return [desc(tables.repositories.stars), asc(tables.repositories.owner), asc(tables.repositories.name)];
        }
      })();

      const [repoCount] = await db
        .select({
          count: sql<number>`count(id)`,
        })
        .from(tables.repositories)
        .where(and(...where));

      const repos = await db
        .select()
        .from(tables.repositories)
        .where(and(...where))
        .limit(limit)
        .offset(offset)
        .orderBy(...orderBy);

      return ok<typeof c, Pagination<Repository>>(c, {
        items: repos.map(
          ({ repoId, owner, name, description, url, stars, forks, license, language, totalBountyUsd }) =>
            ({
              repoId,
              owner,
              name,
              description,
              url: url,
              stars,
              forks,
              license: LICENSES[license as LicenseKey],
              language: LANGUAGES[language as LanguageName],
              totalBountyUsd,
            }) satisfies Repository
        ),
        total: repoCount?.count ?? 0,
      });
    }
  )
  .get(
    "/github/:owner/:name",
    authMiddleware({
      verify: async (token, c) => verify(token, c.env.JWT_SECRET),
      optional: true,
    }),
    async (c) => {
      const { owner, name } = c.req.param();

      const db = drizzle(c.env.D1);

      const [repo] = await db
        .select()
        .from(tables.repositories)
        .where(
          and(
            eq(tables.repositories.platform, "github"),
            eq(tables.repositories.owner, owner),
            eq(tables.repositories.name, name)
          )
        );

      if (!repo) {
        const [connectedGithub] = c.var.auth
          ? await db.select().from(tables.connections).where(eq(tables.connections.userId, c.var.auth.sub))
          : [null];

        const githubRepositoryDiscovery = createGithubRepositoryAdapter(
          connectedGithub?.token ?? c.env.GITHUB_DEFAULT_ACCESS_TOKEN
        );

        const searchRepositoriesResult = await githubRepositoryDiscovery.getRepository(owner, name);
        if (!searchRepositoriesResult.success) {
          switch (searchRepositoriesResult.error) {
            case "repo_not_found":
              return notFound(c, { error: "repo_not_found", message: `Repository ${owner}/${name} not found` });
            case "unexpected_error":
              return unexpectedError(c);
          }
        }

        const githubRepo = searchRepositoriesResult.data;

        const repo = {
          ...githubRepo,
          totalBountyUsd: 0,
        } satisfies Repository;

        await db
          .insert(tables.repositories)
          .values({
            platform: "github",
            ...repo,
            license: repo.license?.key,
            language: repo.language?.name,
            totalBountyUsd: 0, // TODO: Update total bounty
          })
          .onConflictDoUpdate({
            target: [tables.repositories.platform, tables.repositories.owner, tables.repositories.name],
            set: {
              ...repo,
              license: repo.license?.key,
              language: repo.language?.name,
              totalBountyUsd: 0, // TODO: Update total bounty
            },
          });

        return ok<typeof c, Repository>(c, repo);
      }

      return ok<typeof c, Repository>(c, {
        repoId: repo.repoId,
        owner,
        name,
        description: repo.description,
        url: repo.url,
        stars: repo.stars,
        forks: repo.forks,
        license: LICENSES[repo.license as LicenseKey],
        language: LANGUAGES[repo.language as LanguageName],
        totalBountyUsd: repo.totalBountyUsd,
      } satisfies Repository);
    }
  )
  .get(
    "/github/:owner/:name/issues",
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
      const { owner, name } = c.req.param();
      const { q, limit, offset } = c.req.valid("query");

      const db = drizzle(c.env.D1);

      const [connectedGithub] = c.var.auth
        ? await db.select().from(tables.connections).where(eq(tables.connections.userId, c.var.auth.sub))
        : [null];

      const githubRepositoryDiscovery = createGithubRepositoryAdapter(
        connectedGithub?.token ?? c.env.GITHUB_DEFAULT_ACCESS_TOKEN
      );

      const searchIssuesResult = await githubRepositoryDiscovery.searchIssues({
        query: q,
        owner,
        repo: name,
        limit,
        offset,
      });
      if (!searchIssuesResult.success) {
        switch (searchIssuesResult.error) {
          case "unexpected_error":
            return unexpectedError(c);
        }
      }

      const { items, total } = searchIssuesResult.data;

      return ok<typeof c, Pagination<Issue>>(c, {
        items: items.map((item) => ({
          ...item,
          bounty: null, // TODO: Get bounty from blockchain
        })),
        total,
      });
    }
  )
  .get(
    "/github/:owner/:name/issues/:number",
    authMiddleware({
      verify: async (token, c) => verify(token, c.env.JWT_SECRET),
      optional: true,
    }),
    async (c) => {
      const { owner, name, number } = c.req.param();

      const issueNumber = parseInt(number, 10);
      if (Number.isNaN(issueNumber))
        return notFound(c, { error: "issue_not_found", message: `Issue ${owner}/${name} #${number} not found` });

      const db = drizzle(c.env.D1);

      const [connectedGithub] = c.var.auth
        ? await db.select().from(tables.connections).where(eq(tables.connections.userId, c.var.auth.sub))
        : [null];

      const githubRepositoryDiscovery = createGithubRepositoryAdapter(
        connectedGithub?.token ?? c.env.GITHUB_DEFAULT_ACCESS_TOKEN
      );
      const getIssueResult = await githubRepositoryDiscovery.getIssue(owner, name, issueNumber);
      if (!getIssueResult.success) {
        switch (getIssueResult.error) {
          case "issue_not_found":
            return notFound(c, { error: "issue_not_found", message: `Issue ${owner}/${name} #${number} not found` });
          case "unexpected_error":
            return unexpectedError(c);
        }
      }

      const githubIssue = getIssueResult.data;

      const issueDetail = {
        ...githubIssue,
        bounty: null, // TODO: Get bounty from blockchain
      } satisfies IssueDetail;

      return ok<typeof c, IssueDetail>(c, issueDetail);
    }
  );

export { reposHandlers };
