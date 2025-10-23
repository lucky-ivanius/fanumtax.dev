"use client";

import { useEffect, useState, useTransition } from "react";

import type { Issue } from "@fanumtax/core/issue";
import { Button } from "@fanumtax/ui/components/button";

import { searchIssues } from "@/lib/api";

import { IssueCard } from "./issue-card";

interface IssueListProps {
  owner: string;
  repo: string;
  initialIssues: Issue[];
  findMoreOptions?: {
    q?: string;
  };
}

const defaultLimit = 15;

export const IssueList: React.FC<IssueListProps> = ({ owner, repo, initialIssues, findMoreOptions = {} }) => {
  const [issues, setIssues] = useState(initialIssues);

  const isSearch = !!Object.keys(findMoreOptions).length;

  useEffect(() => {
    setIssues(initialIssues);
  }, [initialIssues]);

  const [isLoading, startTransition] = useTransition();

  const findMoreIssues = () => {
    startTransition(async () => {
      const searchIssuesResult = await searchIssues({
        platform: "github",
        owner,
        repo,
        ...findMoreOptions,
        offset: issues.length,
        limit: defaultLimit,
      });
      if (!searchIssuesResult.success)
        switch (searchIssuesResult.error) {
          case "unexpected_error":
            throw new Error("Internal server error");
        }

      const { items } = searchIssuesResult.data;

      setIssues((prevIssues) => [...prevIssues, ...items]);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {issues.length ? (
        <div className="grid w-full auto-cols-fr grid-cols-1 gap-4">
          {issues.map((issue) => (
            <IssueCard key={issue.number} owner={owner} repo={repo} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-4 py-12">
          <h2 className="text-center font-bold text-3xl text-foreground">
            {isSearch ? "No issues found" : "All Clear!"}
          </h2>
          {isSearch ? (
            <p className="text-center text-muted-foreground text-sm">
              We couldn't find any issues that match your search criteria.
            </p>
          ) : (
            <>
              <p className="text-center text-muted-foreground text-sm">
                Have an issue to report? Open one and set a bounty to attract contributors!
              </p>
              <Button asChild>
                <a href={`https://github.com/${owner}/${repo}/issues/new`} target="_blank" rel="noopener noreferrer">
                  Open New Issue
                </a>
              </Button>
            </>
          )}
        </div>
      )}
      {!(issues.length < defaultLimit || issues.length >= 1000 - defaultLimit) && (
        <Button variant="secondary" onClick={findMoreIssues} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
};
