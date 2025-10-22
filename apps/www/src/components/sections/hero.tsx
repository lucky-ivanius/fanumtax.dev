import { Check, Clock } from "lucide-react";

import { Button } from "@fanumtax/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@fanumtax/ui/components/card";

const Hero: React.FC = () => (
  <section id="hero" className="-mt-16 flex min-h-screen w-full items-center justify-center px-8 py-32">
    <div className="container mx-auto grid w-full items-center gap-16 md:grid-cols-2">
      <div className="space-y-8">
        <h1 className="font-bold text-6xl uppercase leading-tight md:text-7xl">
          Open Source That <span className="text-primary">Actually</span> Pays
        </h1>
        <p className="font-normal text-lg text-muted-foreground md:text-xl">
          fix bugs. ship features. claim rewards. no middleman, no cap.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            size="xl"
            className="border-2 border-primary font-medium text-lg transition-all duration-100 hover:bg-background hover:text-primary active:translate-x-0.5 active:translate-y-0.5"
          >
            <a href={import.meta.env.VITE_APP_URL ?? "/app"}>Start Building</a>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="xl"
            className="border-2 border-border bg-background font-medium text-lg transition-all duration-100 hover:border-primary hover:text-primary active:translate-x-0.5 active:translate-y-0.5"
          >
            <a href={import.meta.env.VITE_APP_URL ?? "/app"}>Fund Project</a>
          </Button>
        </div>
      </div>
      <div className="hidden w-full flex-col items-center justify-center gap-6 py-12 lg:flex">
        <Card className="bg-muted">
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

          <CardFooter className="flex items-center justify-between gap-4">
            <span className="font-bold text-3xl text-primary">$5,000</span>
            <Button size="lg" disabled variant="secondary">
              <Clock />
              PENDING REVIEW
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-muted">
          <CardHeader className="space-y-1">
            <div className="text-muted-foreground text-xs">facebook/react</div>
            <CardTitle className="text-balance text-lg">
              <span>Fix Suspense fallback flash during concurrent updates</span>
              <span className="text-muted-foreground"> #285</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
              High priority: In concurrent rendering, certain transitions cause Suspense fallbacks to flash unexpectedly
              when nested boundaries resolve out of order. We should refine heuristics for revealing the primary UI to
              avoid visual jank and double renders. Add tests covering nested boundaries and streaming server rendering
              cases.
            </p>
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-4">
            <span className="font-bold text-3xl text-primary">$600</span>
            <div className="flex items-center justify-end gap-8">
              <span className="text-muted-foreground text-sm">
                Your PR has been merged <Check className="inline size-4" />
              </span>
              <Button size="lg">CLAIM</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  </section>
);

export default Hero;
