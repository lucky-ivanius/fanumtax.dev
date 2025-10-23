import type { NextPage } from "next";
import { ExternalLinkIcon, GitForkIcon, ScaleIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@fanumtax/ui/components/badge";
import { Button } from "@fanumtax/ui/components/button";
import { Separator } from "@fanumtax/ui/components/separator";
import { cn } from "@fanumtax/utils/class-name";

import type { SearchParamsValue } from "@/utils/search-params";
import { IssueList } from "@/components/repo/issue-list";
import { SearchFilter } from "@/components/repo-details/search-filter";
import { getRepo, searchIssues } from "@/lib/api";
import { forceArrays } from "@/utils/search-params";
import { compactFormatter } from "@/utils/strings";

interface RepoPageProps {
  params: Promise<{
    owner: string;
    name: string;
  }>;
  searchParams: Promise<{
    q?: SearchParamsValue;
  }>;
}

const RepoPage: NextPage<RepoPageProps> = async ({ params, searchParams }) => {
  const _params = await params;
  const _searchParams = forceArrays(await searchParams);

  const [q] = _searchParams.q ?? [];

  const getRepoResult = await getRepo(_params.owner, _params.name, "github");
  if (!getRepoResult.success)
    switch (getRepoResult.error) {
      case "repo_not_found":
        return notFound();
      case "unexpected_error":
        throw new Error("Internal server error");
    }

  const searchIssuesResult = await searchIssues({
    platform: "github",
    owner: _params.owner,
    repo: _params.name,
    q,
    limit: 15,
  });
  if (!searchIssuesResult.success)
    switch (searchIssuesResult.error) {
      case "unexpected_error":
        throw new Error("Internal server error");
    }

  const { owner, name, description, stars, forks, totalBountyUsd, url, license } = getRepoResult.data;

  const { items: issues, total: totalIssues } = searchIssuesResult.data;

  return (
    <section className="container mx-auto flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-foreground text-xl md:text-3xl">
          {owner}/{name}
        </h1>
        <div className="w-full md:w-1/2">
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

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
        <h2 className="font-semibold text-foreground text-xl">Issues</h2>

        <SearchFilter defaultOpen={!!Object.keys(_searchParams).length} values={{ q }} />

        <IssueList owner={_params.owner} repo={_params.name} initialIssues={issues} findMoreOptions={{ q }} />
      </div>
    </section>
  );
};

export default RepoPage;
