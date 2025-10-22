export const compactFormatter = (locales?: Intl.LocalesArgument) =>
  new Intl.NumberFormat(locales ?? "en", {
    notation: "compact",
    compactDisplay: "short",
  });
