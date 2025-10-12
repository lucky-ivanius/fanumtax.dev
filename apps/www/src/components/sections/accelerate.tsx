import { DollarSign, GitPullRequest, Shield, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@fanumtax/ui/components/card";

const Accelerate: React.FC = () => {
  return (
    <section id="accelerate" className="bg-muted px-8 py-64">
      <div className="container mx-auto w-full space-y-12 text-center">
        <h2 className="font-bold text-4xl uppercase lg:text-6xl">Accelerate Your Roadmap</h2>

        <div className="grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-background">
            <CardHeader>
              <GitPullRequest className="h-10 w-10 text-primary" />
              <CardTitle className="font-medium text-xl">Get Issues Solved Faster</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Bounties attract skilled developers</p>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary" />
              <CardTitle className="font-medium text-xl">No Cost to List</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Free for open source projects</p>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary" />
              <CardTitle className="font-medium text-xl">Keep Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Maintainer review and merge PRs as always</p>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader>
              <Users className="h-10 w-10 text-primary" />
              <CardTitle className="font-medium text-xl">Grow Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Attract quality contributors</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Accelerate;
