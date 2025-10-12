import type { Language } from "prism-react-renderer";
import { Highlight, themes } from "prism-react-renderer";

import { cn } from "@fanumtax/utils/class-name";

type CodeBlockProps = {
  code: string;
  language?: Language | string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightedLines?: number[];
  startingLineNumber?: number;
  wrapLongLines?: boolean;
  className?: string;
};

function normalizeLanguage(lang?: string): Language {
  const fallback: Language = "tsx";
  if (!lang) return fallback;
  const cleaned = lang.toLowerCase();
  const supported: Language[] = [
    "tsx",
    "ts",
    "jsx",
    "js",
    "bash",
    "json",
    "css",
    "scss",
    "markdown",
    "md",
    "html",
    "graphql",
    "yaml",
    "yml",
    "python",
    "go",
    "rust",
    "sql",
    "java",
    "c",
    "cpp",
    "csharp",
    "php",
    "shell",
    "powershell",
    "ruby",
    "swift",
    "kotlin",
  ] as Language[];
  return (supported as unknown as string[]).includes(cleaned) ? (cleaned as Language) : fallback;
}

function CodeBlock({
  code,
  language = "tsx",
  filename,
  showLineNumbers = true,
  highlightedLines = [],
  startingLineNumber = 1,
  wrapLongLines = false,
  className,
}: CodeBlockProps) {
  const lang = normalizeLanguage(String(language));

  return (
    <div className={cn("w-full overflow-hidden border bg-card text-foreground", className)}>
      {(filename || language) && (
        <div className="flex items-center justify-between border-b bg-secondary px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            {filename ? <span className="truncate text-foreground text-sm">{filename}</span> : null}
            <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-muted-foreground text-xs">{lang}</span>
          </div>
        </div>
      )}

      <Highlight theme={themes.vsDark} code={code} language={lang}>
        {({ className: highlightClass, tokens, style, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              "m-0 max-h-[600px] overflow-auto bg-background p-4 font-mono text-sm leading-6",
              wrapLongLines ? "whitespace-pre-wrap break-words" : "whitespace-pre",
              highlightClass
            )}
            style={style}
          >
            {tokens.map((line, i) => {
              const lineNumber = startingLineNumber + i;
              const isHighlighted = highlightedLines?.includes(lineNumber);
              return (
                <div
                  key={i.toString()}
                  {...getLineProps({ line, key: i })}
                  className={cn("relative flex w-full", isHighlighted && "bg-accent")}
                >
                  {showLineNumbers && (
                    <span
                      className="w-10 shrink-0 select-none pr-4 text-right text-muted-foreground/70 text-xs"
                      aria-hidden="true"
                    >
                      {lineNumber}
                    </span>
                  )}
                  <span className="block w-full">
                    {line.map((token, key) => (
                      <span key={key.toString()} {...getTokenProps({ token, key })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export { CodeBlock };
