import type { Issue as GitHubIssue, Repository as GitHubRepository } from "@octokit/graphql-schema";
import { Octokit, RequestError } from "octokit";

import type { LanguageName } from "@fanumtax/core/language";
import type { LicenseKey } from "@fanumtax/core/license";
import { DEFAULT_ISSUE_LABEL_COLOR } from "@fanumtax/core/issue";
import { DEFAULT_LANGUAGE_COLOR, LANGUAGE_LIST, LANGUAGES } from "@fanumtax/core/language";
import { LICENSE_LIST, LICENSES } from "@fanumtax/core/license";
import { err, ok } from "@fanumtax/utils/result";

import type {
  ExternalIssue,
  ExternalIssueDetail,
  ExternalRepository,
  RepositoryAdapter,
} from "../../interfaces/repository-adapter";

export const createGithubRepositoryAdapter = (accessToken: string): RepositoryAdapter => {
  const octokit = new Octokit({
    auth: accessToken,
  });

  const parseArrayQualifiers = <TValue extends string>(name: string, value: TValue[]) => {
    if (value.length === 0) return null;
    const valueQuery = value.map((lang) => `${name}:${lang}`).join(" ");

    return valueQuery;
  };

  const defaultLanguages = LANGUAGE_LIST.map(({ name }) => name);
  const defaultLicenses = LICENSE_LIST.map(({ key }) => key);

  return {
    getRepository: async (owner, name) => {
      try {
        const getRepoResponse = await octokit.rest.repos.get({
          owner,
          repo: name,
        });

        const repo = getRepoResponse.data;

        return ok({
          owner: repo.owner.login,
          name: repo.name,
          description: repo.description ? repo.description : "",
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          license: repo.license ? LICENSES[repo.license.key as LicenseKey] : null,
          language: repo.language ? LANGUAGES[repo.language as LanguageName] : null,
        } satisfies ExternalRepository);
      } catch (error) {
        if (error instanceof RequestError)
          switch (error.status) {
            case 404:
              return err("repo_not_found", "Repository not found");
            default:
              return err("unexpected_error", "Unexpected error");
          }

        return err("unexpected_error", (error as Error).message);
      }
    },
    getIssue: async (owner, name, number) => {
      try {
        const issueResponse = await octokit.rest.issues.get({
          owner,
          repo: name,
          issue_number: number,
        });

        const issue = issueResponse.data;

        return ok({
          number: issue.number,
          title: issue.title,
          state: issue.state === "OPEN" ? "open" : "closed",
          labels: issue.labels.reduce(
            (acc, label) => {
              if (typeof label === "string") {
                acc.push({ name: label, color: DEFAULT_ISSUE_LABEL_COLOR });

                return acc;
              }

              if (!label) return acc;

              acc.push({
                name: label.name ?? "Unknown",
                color: label.color ?? DEFAULT_ISSUE_LABEL_COLOR,
              });

              return acc;
            },
            [] as ExternalIssue["labels"]
          ),
          createdAt: new Date(issue.created_at).getTime(),
          body: issue.body ?? "",
          author: issue.user
            ? {
                username: issue.user.login,
                avatarUrl: issue.user.avatar_url,
                url: issue.user.html_url,
              }
            : null,
        } satisfies ExternalIssueDetail);
      } catch (error) {
        if (error instanceof RequestError)
          switch (error.status) {
            case 404:
              return err("issue_not_found", "Issue not found");
            default:
              return err("unexpected_error", "Unexpected error");
          }

        return err("unexpected_error", (error as Error).message);
      }
    },
    searchRepositories: async ({ query, languages, licenses, limit = 10, offset = 0 }) => {
      try {
        const languagesQuery = parseArrayQualifiers("language", languages ?? defaultLanguages);
        const licensesQuery = parseArrayQualifiers("license", licenses ?? defaultLicenses);

        const formattedQuery = [`is:public`, `sort:stars`, query, languagesQuery, licensesQuery]
          .filter(Boolean)
          .join(" ");

        const results = await octokit.graphql<{
          search: {
            nodes: GitHubRepository[];
            repositoryCount: number;
          };
        }>(
          `
            query SearchRepos($q: String!, $type: SearchType!, $first: Int!, $after: String) {
              search (query: $q, type: $type, first: $first, after: $after) {
                nodes {
                  ... on Repository {
                    name
                    owner {
                      login
                    }
                    description
                    url
                    stargazerCount
                    forkCount
                    primaryLanguage {
                      name
                      color
                    }
                    licenseInfo {
                      key
                      name
                    }
                  }
                }
                repositoryCount
              }
            }
          `,
          {
            q: formattedQuery,
            type: "REPOSITORY",
            first: limit,
            after: btoa(`cursor:${offset}`),
          }
        );

        return ok({
          items: results.search.nodes.map(
            (node) =>
              ({
                owner: node.owner.login,
                name: node.name,
                description: node.description ? node.description : "",
                url: node.url as string,
                stars: node.stargazerCount,
                forks: node.forkCount,
                license: node.licenseInfo ? node.licenseInfo : null,
                language: node.primaryLanguage
                  ? {
                      ...node.primaryLanguage,
                      color: node.primaryLanguage.color ?? DEFAULT_LANGUAGE_COLOR,
                    }
                  : null,
              }) satisfies ExternalRepository
          ),
          total: results.search.repositoryCount,
        });
      } catch (error) {
        return err("unexpected_error", (error as Error).message);
      }
    },
    searchIssues: async ({ owner, repo, query, limit = 10, offset = 0 }) => {
      try {
        const formattedQuery = [`repo:${owner}/${repo}`, "is:issue", "is:open", query].filter(Boolean).join(" ");

        const results = await octokit.graphql<{
          search: {
            nodes: GitHubIssue[];
            issueCount: number;
          };
        }>(
          `
            query SearchIssues($q: String!, $type: SearchType!, $first: Int!, $after: String) {
              search (query: $q, type: $type, first: $first, after: $after) {
                nodes {
                  ... on Issue {
                    number
                    title
                    labels(first: 10) {
                      nodes {
                        name
                        color
                      }
                    }
                    state
                    createdAt
                  }
                }
                issueCount
              }
            }
          `,
          {
            q: formattedQuery,
            type: "ISSUE",
            first: limit,
            after: btoa(`cursor:${offset}`),
          }
        );

        return ok({
          items: results.search.nodes.map((node) => {
            const labels = (node.labels?.nodes ?? []).filter(Boolean);

            return {
              number: node.number,
              title: node.title,
              state: "open", // Handled by query string
              labels: labels.map(({ name, color }) => ({ name, color: `#${color}` })),
              createdAt: new Date(node.createdAt).getTime(),
            } satisfies ExternalIssue;
          }),
          total: results.search.issueCount,
        });
      } catch (error) {
        return err("unexpected_error", (error as Error).message);
      }
    },
  };
};
