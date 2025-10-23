import { formatRelative } from "date-fns";
import Link from "next/link";

import type { Issue } from "@fanumtax/core/issue";
import { Badge } from "@fanumtax/ui/components/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@fanumtax/ui/components/card";

interface IssueCardProps {
  owner: string;
  repo: string;
  issue: Issue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ owner, repo, issue }) => {
  const { number, title, labels, createdAt } = issue;

  return (
    <Card className="relative h-full border shadow-none transition-all hover:border-primary active:border-primary">
      <CardHeader>
        <CardTitle className="line-clamp-2">
          <Link
            href={`/${owner}/${repo}/issues/${number}`}
            className="after:absolute after:inset-0 after:z-0 after:content-['']"
          >
            {title}
            <span className="text-muted-foreground text-sm"> #{number}</span>
          </Link>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1">
            {labels.map(({ name, color }) => (
              <Badge
                key={name}
                variant="outline"
                style={{
                  borderColor: color,
                }}
              >
                {name}
              </Badge>
            ))}
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <span className="text-muted-foreground text-sm">Opened {formatRelative(createdAt, new Date())}</span>
      </CardFooter>
    </Card>
  );
};
