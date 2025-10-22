export type PullRequestState = "open" | "closed" | "merged";

export interface PullRequest {
  id: string;

  /* Repository */
  owner: string;
  repo: string;

  /* Pull Request */
  number: number;
  title: string;
  state: PullRequestState;
  author: string;

  /* Issue */
  solvedIssueNumbers: number[];
}
