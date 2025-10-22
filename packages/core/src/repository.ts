import type { Language } from "./language";
import type { License } from "./license";

export interface Repository {
  /* Repository */
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  url: string;
  license: License | null;
  language: Language | null;

  /* Bounty */
  totalBountyUsd: number;
}
