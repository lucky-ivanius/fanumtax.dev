export const github = "github" as const;
export type Github = typeof github;

export const PLATFORMS = {
  [github]: github,
} as const;

export type PlatformName = keyof typeof PLATFORMS;

export const PLATFORM_LIST: (typeof PLATFORMS)[keyof typeof PLATFORMS][] = Object.values(PLATFORMS);
