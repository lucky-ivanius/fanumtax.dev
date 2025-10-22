import { ExternalLinkIcon, GitForkIcon, StarIcon } from "lucide-react";
import Link from "next/link";

import type { Repository } from "@fanumtax/core/repository";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@fanumtax/ui/components/card";
import { cn } from "@fanumtax/utils/class-name";

import { compactFormatter } from "@/utils/strings";

interface RepoCardProps {
  repo: Repository;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  const { owner, name, description, stars, forks, totalBountyUsd, url, language, license } = repo;

  return (
    <Card className="relative h-full border shadow-none transition-all hover:border-primary active:border-primary">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg">
              <Link href={`/${owner}/${name}`} className="after:absolute after:inset-0 after:z-0 after:content-['']">
                {owner}/{name}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </div>
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 p-1 transition-colors hover:text-primary active:text-primary"
          >
            <ExternalLinkIcon className="size-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex h-full items-end justify-between gap-4">
        <span className={cn("font-bold text-2xl text-primary/40", totalBountyUsd > 0 && "text-primary")}>
          ${totalBountyUsd.toLocaleString()}
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <StarIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              {compactFormatter().format(stars).toLocaleLowerCase()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <GitForkIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              {compactFormatter().format(forks).toLocaleLowerCase()}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-12">
        <div className="flex items-center gap-1.5">
          {language && (
            <>
              <div
                className={"size-3 rounded-full"}
                style={{
                  backgroundColor: language.color,
                }}
              />
              <span className="text-muted-foreground text-sm">{language.name}</span>
            </>
          )}
        </div>
        {license && <span className="truncate text-muted-foreground text-sm">{license.name}</span>}
      </CardFooter>
    </Card>
  );
};
