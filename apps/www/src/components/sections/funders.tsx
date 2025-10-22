import { CheckCircle, DollarSign, TrendingUp, Wallet, Zap } from "lucide-react";

import { Button } from "@fanumtax/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@fanumtax/ui/components/card";

const Funders: React.FC = () => (
  <section id="funders" className="flex w-full items-center justify-center px-8 py-32">
    <div className="container mx-auto grid w-full items-center gap-16 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-10">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-start gap-4">
              <Wallet className="h-8 w-8 text-warning" />
              <div className="flex-1">
                <div className="text-muted-foreground text-sm">Wallet Connected</div>
                <div className="text-primary">0x742d...3f9a</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 border-2 p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-bold text-primary">$50,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Funded Issues:</span>
                <span className="font-bold">120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resolved:</span>
                <span className="font-bold text-primary">89</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="text-muted-foreground text-xs">vercel/nextjs</div>
            <CardTitle className="text-balance text-lg">
              <span>Improve RSC hydration warnings</span>
              <span className="text-muted-foreground"> #543</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
              When hydrating complex server components in nested layouts, users encounter warnings that are difficult to
              interpret. We need clearer messaging and possibly actionable hints for developers to resolve mismatches
              faster. Also consider adding docs links.
            </p>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-4">
            <Button className="w-full">FUND</Button>
          </CardFooter>
        </Card>
      </div>
      <div className="space-y-12">
        <h2 className="font-bold text-4xl uppercase lg:text-5xl">Fund. See Results.</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Zap className="h-10 w-10 text-warning" />
            <h3 className="font-medium text-xl">Support Projects You Use</h3>
            <p className="text-muted-foreground">Put money where your dependencies are</p>
          </div>

          <div className="space-y-3">
            <DollarSign className="h-10 w-10 text-warning" />
            <h3 className="font-medium text-xl">Set Your Bounties</h3>
            <p className="text-muted-foreground">Choose which features/fixes matter most</p>
          </div>

          <div className="space-y-3">
            <TrendingUp className="h-10 w-10 text-warning" />
            <h3 className="font-medium text-xl">Track Progress</h3>
            <p className="text-muted-foreground">See when issues get solved</p>
          </div>

          <div className="space-y-3">
            <CheckCircle className="h-10 w-10 text-warning" />
            <h3 className="font-medium text-xl">Zero Platform Fee</h3>
            <p className="text-muted-foreground">No platform fees, always</p>
          </div>
        </div>

        <Button
          asChild
          size="xl"
          className="border-2 border-warning bg-warning font-medium text-lg transition-all duration-100 hover:bg-background hover:text-warning active:translate-x-0.5 active:translate-y-0.5"
        >
          <a href={import.meta.env.VITE_APP_URL ?? "/app"}>Fund Project</a>
        </Button>
      </div>
    </div>
  </section>
);

export default Funders;
