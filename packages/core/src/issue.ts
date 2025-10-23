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

  url: string;

  bounty: Bounty | null;

  createdAt: number;
}

export interface IssueDetail extends Issue {
  body: string;
  author: IssueAuthor | null;
}

export const DEFAULT_ISSUE_LABEL_COLOR = "#6a737d";
