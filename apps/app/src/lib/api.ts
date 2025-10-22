import type { Pagination } from "@fanumtax/core/pagination";
import type { Repository } from "@fanumtax/core/repository";
import type { Result } from "@fanumtax/utils/result";
import { err, ok } from "@fanumtax/utils/result";

import { env } from "@/env";

export const API_URL = env.NEXT_PUBLIC_API_BASE_URL || "https://api.fanumtax.dev";

export const platforms = ["github"] as const;
export type PlatformName = (typeof platforms)[number];

export type GetRepoResult = Result<Repository, "repo_not_found">;

export const getRepo = async (
  owner: string,
  name: string,
  platform: PlatformName = "github"
): Promise<GetRepoResult> => {
  const res = await fetch(`${API_URL}/v1/repos/${platform}/${owner}/${name}`);

  switch (res.status) {
    case 200: {
      const repo = (await res.json()) as Repository;

      return ok(repo);
    }
    case 404:
      return err("repo_not_found", "Repository not found");
    default:
      return err("unexpected_error", "Unexpected error");
  }
};

export type SearchFundedReposRequest = {
  sort?: string;
  languages?: string[];
  licenses?: string[];
  limit?: number;
  offset?: number;
};

export type SearchFundedReposResult = Result<Pagination<Repository>>;

export const searchFundedRepos = async ({
  sort,
  languages,
  licenses,
  limit = 18,
  offset = 0,
}: SearchFundedReposRequest): Promise<SearchFundedReposResult> => {
  const searchParams = new URLSearchParams();

  if (sort) searchParams.set("sort", sort);
  if (languages)
    languages.forEach((language) => {
      searchParams.append("language", language);
    });
  if (licenses)
    licenses.forEach((license) => {
      searchParams.append("license", license);
    });
  if (limit) searchParams.set("limit", limit.toString());
  if (offset) searchParams.set("offset", offset.toString());

  const res = await fetch(`${API_URL}/v1/repos?${searchParams.toString()}`);

  switch (res.status) {
    case 200: {
      const result = (await res.json()) as Pagination<Repository>;

      return ok(result);
    }
    default:
      return err("unexpected_error", "Unexpected error");
  }
};

export type SearchReposRequest = {
  q?: string;
  languages?: string[];
  licenses?: string[];
  limit?: number;
  offset?: number;
};

export type SearchReposResult = Result<Pagination<Repository>>;

export const searchRepos = async ({
  q,
  languages,
  licenses,
  limit = 18,
  offset = 0,
}: SearchReposRequest): Promise<SearchReposResult> => {
  const searchParams = new URLSearchParams();

  if (q) searchParams.set("q", q);
  if (languages)
    languages.forEach((language) => {
      searchParams.append("language", language);
    });
  if (licenses)
    licenses.forEach((license) => {
      searchParams.append("license", license);
    });
  if (limit) searchParams.set("limit", limit.toString());
  if (offset) searchParams.set("offset", offset.toString());

  const res = await fetch(`${API_URL}/v1/discover?${searchParams.toString()}`);

  switch (res.status) {
    case 200: {
      const result = (await res.json()) as Pagination<Repository>;

      return ok(result);
    }
    default:
      return err("unexpected_error", "Unexpected error");
  }
};
