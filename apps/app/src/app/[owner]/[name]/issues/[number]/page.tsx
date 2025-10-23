import type { NextPage } from "next";
import { formatRelative } from "date-fns";
import { ArrowLeftIcon, ExternalLinkIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@fanumtax/ui/components/avatar";
import { Badge } from "@fanumtax/ui/components/badge";
import { Button } from "@fanumtax/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader } from "@fanumtax/ui/components/card";
import { Markdown } from "@fanumtax/ui/components/markdown";
import { Separator } from "@fanumtax/ui/components/separator";

import { BountyCard } from "@/components/issue-detail/bounty-card";
import { getIssue } from "@/lib/api";

interface RepoIssuePageProps {
  params: Promise<{
    owner: string;
    name: string;
    number: string;
  }>;
}

const RepoIssuePage: NextPage<RepoIssuePageProps> = async ({ params }) => {
  const _params = await params;

  const issueNumber = parseInt(_params.number, 10);
  if (Number.isNaN(issueNumber)) return notFound();

  const getIssueResult = await getIssue(_params.owner, _params.name, issueNumber);
  if (!getIssueResult.success)
    switch (getIssueResult.error) {
      case "issue_not_found":
        return notFound();
      case "unexpected_error":
        throw new Error("Internal server error");
    }

  const { number, title, body, state, labels, author, url, createdAt, bounty } = getIssueResult.data;

  return (
    <section className="container mx-auto flex flex-col gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="link" className="text-primary">
          <Link href={`/${_params.owner}/${_params.name}`}>
            <ArrowLeftIcon />
            Back to {_params.owner}/{_params.name}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {state === "open" ? <Badge>Open</Badge> : <Badge variant="secondary">Closed</Badge>}
        <span className="font-bold text-muted-foreground">#{number}</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <h1 className="font-bold text-2xl text-foreground md:text-3xl">{title}</h1>
          <Button variant="secondary" asChild>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              View on GitHub
              <ExternalLinkIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex w-full flex-col-reverse gap-4 md:flex-row md:gap-8">
        <Card className="w-full md:w-9/12">
          {!!author && (
            <>
              <CardHeader className="flex items-center gap-4">
                <Avatar className="size-12 border-2 border-primary/40">
                  <AvatarImage src={author.avatarUrl} alt={author.username} />
                  <AvatarFallback>
                    <UserIcon className="text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-4">
                  <Link href={author.url} className="font-bold text-sm">
                    @{author.username}
                  </Link>
                  <p className="text-muted-foreground text-sm">Opened {formatRelative(createdAt, new Date())}</p>
                </div>
              </CardHeader>
              <Separator />
            </>
          )}

          <CardContent>
            <Markdown content={body} />
          </CardContent>

          {!!labels.length && (
            <CardFooter className="flex items-center gap-1">
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
            </CardFooter>
          )}
        </Card>

        <BountyCard bounty={bounty} />
      </div>
    </section>
  );
};

export default RepoIssuePage;
