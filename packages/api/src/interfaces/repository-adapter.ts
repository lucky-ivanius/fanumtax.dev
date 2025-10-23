import type { Issue, IssueDetail } from "@fanumtax/core/issue";
import type { LanguageName } from "@fanumtax/core/language";
import type { LicenseKey } from "@fanumtax/core/license";
import type { Pagination } from "@fanumtax/core/pagination";
import type { Repository } from "@fanumtax/core/repository";
import type { Result } from "@fanumtax/utils/result";

export type ExternalRepository = Omit<Repository, "totalBountyUsd">;
export type ExternalIssue = Omit<Issue, "bounty">;
export type ExternalIssueDetail = Omit<IssueDetail, "bounty">;

export interface SearchRepositoriesOptions {
  query: string;
  languages?: LanguageName[];
  licenses?: LicenseKey[];
  limit?: number;
  offset?: number;
}

export type SearchRepositoriesResult = Result<Pagination<ExternalRepository>>;

export type GetRepositoryResult = Result<ExternalRepository, "repo_not_found">;

export interface SearchIssuesOptions {
  owner: string;
  repo: string;
  query: string;
  limit?: number;
  offset?: number;
}

export type SearchRepoIssuesResult = Result<Pagination<ExternalIssue>>;

export type GetIssueResult = Result<ExternalIssueDetail, "issue_not_found">;

export interface RepositoryAdapter {
  searchRepositories(options: SearchRepositoriesOptions): Promise<SearchRepositoriesResult>;
  searchIssues(options: SearchIssuesOptions): Promise<SearchRepoIssuesResult>;
  getRepository(owner: string, name: string): Promise<GetRepositoryResult>;
  getIssue(owner: string, name: string, number: number): Promise<GetIssueResult>;
}
