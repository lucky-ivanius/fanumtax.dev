import type { Bounty } from "./bounty";

export type IssueState = "open" | "closed";

export type IssueLabel = {
  name: string;
  color: string;
};

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
  labels: IssueLabel[];

  bounty: Bounty | null;
}
