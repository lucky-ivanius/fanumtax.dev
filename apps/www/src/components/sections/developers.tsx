import { CheckCircle, Code2, DollarSign, TrendingUp } from "lucide-react";

import { Button } from "@fanumtax/ui/components/button";
import { CodeBlock } from "@fanumtax/ui/components/code-block";

const codeSample = `import { fanumtax } from '@fanumtax/sdk';

const result = await fanumtax.claim({
  repo: 'fanumtax/fanumtax',
  issue: 1,
  pullRequest: 2,
});
if (!result.success) {
  console.log('Error!', result.error);

  return;
}

console.log('Success!', result.data);
`;

const Developers: React.FC = () => {
  return (
    <section id="developers" className="flex w-full items-center justify-center px-8 py-32">
      <div className="container mx-auto grid w-full items-center gap-16 lg:grid-cols-2">
        <div className="space-y-12">
          <h2 className="font-bold text-4xl uppercase lg:text-5xl">Build. Ship. Earn.</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <DollarSign className="h-10 w-10 text-primary" />
              <h3 className="font-medium text-xl">Get Paid in Crypto</h3>
              <p className="text-muted-foreground">Earn stablecoins (PYUSD/USDC/USDT) for merged PRs</p>
            </div>

            <div className="space-y-3">
              <Code2 className="h-10 w-10 text-primary" />
              <h3 className="font-medium text-xl">Find Your Stack</h3>
              <p className="text-muted-foreground">Discover issues matching your skills</p>
            </div>

            <div className="space-y-3">
              <TrendingUp className="h-10 w-10 text-primary" />
              <h3 className="font-medium text-xl">Build Portfolio</h3>
              <p className="text-muted-foreground">Contribute to real projects, get paid for it</p>
            </div>

            <div className="space-y-3">
              <CheckCircle className="h-10 w-10 text-primary" />
              <h3 className="font-medium text-xl">Trustless Payouts</h3>
              <p className="text-muted-foreground">Smart contracts guarantee payment</p>
            </div>
          </div>

          <Button
            asChild
            size="xl"
            className="border-2 border-primary font-medium text-lg transition-all duration-100 hover:bg-background hover:text-primary active:translate-x-0.5 active:translate-y-0.5"
          >
            <a href={import.meta.env.VITE_APP_URL ?? "/app"}>Start Building</a>
          </Button>
        </div>
        <CodeBlock code={codeSample} language="ts" filename="index.ts" className="hidden shadow md:block" />
      </div>
    </section>
  );
};

export default Developers;
