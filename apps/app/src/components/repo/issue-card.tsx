import Link from "next/link";

import type { Issue } from "@fanumtax/core/issue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fanumtax/ui/components/card";

interface IssueCardProps {
  issue: Issue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { owner, repo, number, title, body, bounty } = issue;

  return (
    <Card className="relative h-full border shadow-none transition-all hover:border-primary active:border-primary">
      <CardHeader>
        <CardTitle className="text-lg">
          <Link
            href={`/${owner}/${repo}/issue/${number}`}
            className="after:absolute after:inset-0 after:z-0 after:content-['']"
          >
            {title}
            <span className="text-muted-foreground text-sm"> #{number}</span>
          </Link>
        </CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};
