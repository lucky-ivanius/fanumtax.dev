export interface Language {
  name: string;
  color: string;
}

const createLanguage = <TName extends string, TColor extends `#${string}`>(name: TName, color: TColor) =>
  ({
    name,
    color,
  }) as const satisfies Language;

export const ts = createLanguage("TypeScript", "#3178c6");
export const js = createLanguage("JavaScript", "#f1e05a");
export const rs = createLanguage("Rust", "#ce422b");
export const py = createLanguage("Python", "#3572A5");
export const go = createLanguage("Go", "#00ADD8");

export const LANGUAGES = {
  [ts.name]: ts,
  [js.name]: js,
  [rs.name]: rs,
  [py.name]: py,
  [go.name]: go,
} as const;

export type LanguageName = keyof typeof LANGUAGES;

export const LANGUAGE_LIST: (typeof LANGUAGES)[keyof typeof LANGUAGES][] = Object.values(LANGUAGES);

export const DEFAULT_LANGUAGE_COLOR = "#fff" as const;
