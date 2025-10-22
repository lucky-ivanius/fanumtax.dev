import type { NextPage } from "next";
import { ExternalLinkIcon, GitForkIcon, ScaleIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@fanumtax/ui/components/badge";
import { Button } from "@fanumtax/ui/components/button";
import { Separator } from "@fanumtax/ui/components/separator";
import { cn } from "@fanumtax/utils/class-name";

import { IssueList } from "@/components/repo/issue-list";
import { getRepo } from "@/lib/api";
import { compactFormatter } from "@/utils/strings";

interface RepoPageProps {
  params: Promise<{
    owner: string;
    name: string;
  }>;
}

const RepoPage: NextPage<RepoPageProps> = async ({ params }) => {
  const _params = await params;

  const getRepoResult = await getRepo(_params.owner, _params.name, "github");
  if (!getRepoResult.success)
    switch (getRepoResult.error) {
      case "repo_not_found":
        return notFound();
      case "unexpected_error":
        throw new Error("Internal server error");
    }

  const { owner, name, description, stars, forks, totalBountyUsd, url, license } = getRepoResult.data;

  return (
    <section className="container mx-auto flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-foreground text-xl md:text-3xl">
          {owner}/{name}
        </h1>
        <p className="line-clamp-2 text-muted-foreground text-sm">{description}</p>

        <div className="flex w-full flex-col-reverse justify-between gap-4 md:flex-row md:items-center">
          <span className={cn("font-bold text-4xl text-primary/40", totalBountyUsd > 0 && "text-primary")}>
            ${totalBountyUsd.toLocaleString()}
          </span>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
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

            {license && (
              <div className="flex items-center gap-1">
                <ScaleIcon className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">{license.name}</span>
              </div>
            )}

            <Button asChild variant="secondary">
              <Link href={url} target="_blank" rel="noopener noreferrer">
                View on GitHub
                <ExternalLinkIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-foreground text-xl">Open Issues</h2>
          <Badge>{0}</Badge>
        </div>

        <IssueList issues={[]} />
      </div>
    </section>
  );
};

export default RepoPage;
