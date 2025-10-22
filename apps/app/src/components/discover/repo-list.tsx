"use client";

import { useEffect, useState, useTransition } from "react";

import type { Repository } from "@fanumtax/core/repository";
import { Button } from "@fanumtax/ui/components/button";

import { searchRepos } from "@/lib/api";

import { RepoCard } from "../repo-card";

interface RepoListProps {
  initialRepos: Repository[];
  findMoreOptions: {
    q?: string;
    languages?: string[];
    licenses?: string[];
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
      const searchReposResult = await searchRepos({ ...findMoreOptions, offset: repos.length, limit: defaultLimit });
      if (!searchReposResult.success)
        switch (searchReposResult.error) {
          case "unexpected_error":
            throw new Error("Internal server error");
        }

      const { items } = searchReposResult.data;

      setRepos((prevRepos) => [...prevRepos, ...items]);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {repos.length ? (
        <div className="grid w-full auto-cols-fr grid-cols-1 gap-4 md:grid-cols-3">
          {repos.map((repo) => (
            <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} />
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-4 py-12">
          <h2 className="text-center text-3xl text-foreground">No results</h2>
          <p className="text-center text-muted-foreground text-sm">
            We couldn't find any repositories that match your search criteria.
          </p>
        </div>
      )}
      {!(repos.length < defaultLimit || repos.length >= 1000 - defaultLimit) && (
        <Button variant="secondary" onClick={findMoreRepos} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
};
