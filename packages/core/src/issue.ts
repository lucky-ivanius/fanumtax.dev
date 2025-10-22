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
  state: IssueState;
  labels: IssueLabel[];

  bounty: Bounty | null;

  createdAt: number;
}

export interface IssueDetail extends Issue {
  body: string;
  author: IssueAuthor | null;
}
