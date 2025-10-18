export interface Selection {
  value: string;
  label: string;
}

export const LANG_OPTIONS = [
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "rust", label: "Rust" },
  { value: "python", label: "Python" },
] as const satisfies Selection[];

export const SORT_OPTIONS = [
  { value: "highest_bounty", label: "Highest Bounty" },
  { value: "lowest_bounty", label: "Lowest Bounty" },
  { value: "most_issues", label: "Most Issues" },
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
] as const satisfies Selection[];
