import type { Bounty } from "./bounty";

export type IssueState = "open" | "closed";

export interface IssueAuthor {
  username: string;
  avatarUrl: string;
  url: string;
}

export interface Issue {
  number: number;
  title: string;
  body: string;
  state: IssueState;
  author: IssueAuthor | null;
  bounty: Bounty | null;
}
