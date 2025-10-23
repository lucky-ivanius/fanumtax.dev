import type { Bounty } from "@fanumtax/core/bounty";
import { Button } from "@fanumtax/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@fanumtax/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@fanumtax/ui/components/dialog";

import { BountyAmount } from "./bounty-amount";

interface BountyCardProps {
  bounty: Bounty | null;
}

export const BountyCard: React.FC<BountyCardProps> = ({ bounty }) => {
  return (
    <Card className="h-max w-full md:w-3/12">
      <CardHeader>
        <CardTitle className="text-lg">Bounty</CardTitle>
      </CardHeader>

      <CardContent>
        {bounty ? (
          <BountyAmount amount={bounty.amount} token={bounty.token} />
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">No bounty has been set for this issue yet.</p>
            <p className="text-muted-foreground text-sm">Fund this issue to incentivize developers to work on it.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full">Add Bounty</Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Solve this issue
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-min">
            <DialogHeader>
              <DialogTitle>How to solve this issue</DialogTitle>
              <DialogDescription>Follow these steps to contribute and earn the bounty</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ol className="list-inside list-decimal space-y-3 text-sm">
                <li>
                  <strong>Fork the repository</strong> to your account
                </li>
                <li>
                  <strong>Create a new branch</strong> for your fix (e.g.,{" "}
                  <code className="rounded bg-muted px-1 py-0.5">fix/issue-123</code>)
                </li>
                <li>
                  <strong>Write your code</strong> to solve the issue
                </li>
                <li>
                  <strong>Test your changes</strong> to ensure they work correctly
                </li>
                <li>
                  <strong>Create a Pull Request</strong> linking this issue number in the description
                </li>
                <li>
                  <strong>Request a review</strong> from the repository maintainers
                </li>
                <li>
                  <strong>Get paid</strong> once your PR is merged and approved!
                </li>
              </ol>
              <div className="space-y-2 border bg-muted/50 p-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>Tip:</strong> Make sure to reference the issue number in your PR description using{" "}
                  <code className="bg-muted px-1 py-0.5">Fixes #123</code> or{" "}
                  <code className="bg-muted px-1 py-0.5">Closes #123</code>
                </p>
                <p className="text-muted-foreground text-xs">
                  You can verify the PR is linked by checking the <strong>"Development"</strong> section on the issue
                  page.{" "}
                  <a
                    href="https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
