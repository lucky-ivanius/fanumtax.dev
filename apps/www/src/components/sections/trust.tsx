import { Code2, Link2, Lock, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@fanumtax/ui/components/card";

const Trust: React.FC = () => {
  return (
    <section id="trust" className="px-8 py-64">
      <div className="container mx-auto w-full">
        <div className="space-y-12">
          <h2 className="text-center font-bold text-4xl uppercase leading-tight lg:text-6xl">
            Built on Trust.
            <br />
            Powered by Smart Contracts.
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Lock className="h-12 w-12 text-primary" />
                <CardTitle className="font-medium text-xl">Automated Escrow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funds locked until PR merges</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary" />
                <CardTitle className="font-medium text-xl">Proof of Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">On-chain verification of merged PRs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Link2 className="h-12 w-12 text-primary" />
                <CardTitle className="font-medium text-xl">No Middleman</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Direct peer-to-peer payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code2 className="h-12 w-12 text-primary" />
                <CardTitle className="font-medium text-xl">Open Source</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Platform code is public</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;
