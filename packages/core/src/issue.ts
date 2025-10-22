import type { Bounty } from "./bounty";

export type IssueState = "open" | "closed";

export interface Issue {
  /* Repository */
  owner: string;
  repo: string;

  /* Issue */
  number: number;
  title: string;
  body: string;
  state: IssueState;

  /* Bounty */
  bounty: Bounty;
}
