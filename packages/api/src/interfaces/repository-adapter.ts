import type { LanguageName } from "@fanumtax/core/language";
import type { LicenseKey } from "@fanumtax/core/license";
import type { Pagination } from "@fanumtax/core/pagination";
import type { Repository } from "@fanumtax/core/repository";
import type { Result } from "@fanumtax/utils/result";

export interface SearchRepositoriesOptions {
  query: string;
  languages?: LanguageName[];
  licenses?: LicenseKey[];
  limit?: number;
  offset?: number;
}

export type ExternalRepository = Omit<Repository, "totalBountyUsd">;

export type SearchRepositoriesResult = Result<Pagination<ExternalRepository>>;

export type GetRepositoryResult = Result<ExternalRepository, "repo_not_found">;

export interface RepositoryAdapter {
  searchRepositories(options: SearchRepositoriesOptions): Promise<SearchRepositoriesResult>;
  getRepository(owner: string, name: string): Promise<GetRepositoryResult>;
}
