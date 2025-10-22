"use client";

import { useEffect, useState, useTransition } from "react";

import type { Repository } from "@fanumtax/core/repository";
import { Button } from "@fanumtax/ui/components/button";

import { searchFundedRepos } from "@/lib/api";

import { RepoCard } from "../repo-card";

interface RepoListProps {
  initialRepos: Repository[];
  findMoreOptions: {
    languages?: string[];
    licenses?: string[];
    sort?: string;
  };
}

const defaultLimit = 18;

export const RepoList: React.FC<RepoListProps> = ({ initialRepos, findMoreOptions }) => {
  const [repos, setRepos] = useState(initialRepos);

  useEffect(() => {
    setRepos(initialRepos);
  }, [initialRepos]);

  const [isLoading, startTransition] = useTransition();

  const findMoreRepos = () => {
    startTransition(async () => {
      const searchFundedReposResult = await searchFundedRepos({
        ...findMoreOptions,
        offset: repos.length,
        limit: defaultLimit,
      });
      if (!searchFundedReposResult.success)
        switch (searchFundedReposResult.error) {
          case "unexpected_error":
            throw new Error("Internal server error");
        }

      const { items } = searchFundedReposResult.data;

      setRepos((prevRepos) => [...prevRepos, ...items]);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="grid w-full auto-cols-fr grid-cols-1 gap-4 md:grid-cols-3">
        {repos.map((repo) => (
          <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} />
        ))}
      </div>
      {!(repos.length < defaultLimit || repos.length >= 1000 - defaultLimit) && (
        <Button variant="secondary" onClick={findMoreRepos} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
};
