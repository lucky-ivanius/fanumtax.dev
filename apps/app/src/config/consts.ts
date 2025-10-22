import { LANGUAGE_LIST } from "@fanumtax/core/language";
import { LICENSE_LIST } from "@fanumtax/core/license";

import type { Selection } from "@/utils/selection";
import { createSelection } from "@/utils/selection";

export const LANGUAGE_OPTIONS = LANGUAGE_LIST.map(({ name }) => createSelection(name, name)) satisfies Selection[];
export const LICENSE_OPTIONS = LICENSE_LIST.map(({ key, name }) => createSelection(key, name)) satisfies Selection[];

export const REPO_SORT_OPTIONS = [
  createSelection("highest_bounty", "Highest Bounty"),
  createSelection("lowest_bounty", "Lowest Bounty"),
  createSelection("stars", "Stars"),
  createSelection("forks", "Forks"),
] satisfies Selection[];
