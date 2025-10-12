import { Card, CardContent, CardHeader } from "@fanumtax/ui/components/card";

const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="flex w-full items-center justify-center px-8 py-32">
    <div className="container mx-auto flex w-full flex-col gap-16">
      <h2 className="text-center font-bold text-5xl lg:text-6xl">How It Works</h2>
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="px-4 py-10">
          <CardHeader className="gap-4">
            <span className="font-bold text-7xl text-primary">01</span>
            <h3 className="font-bold text-2xl">Browse & Fund</h3>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">Supporters fund issues (bugs, features, improvements)</p>
          </CardContent>
        </Card>

        <Card className="px-4 py-10">
          <CardHeader className="gap-4">
            <span className="font-bold text-7xl text-primary">02</span>
            <h3 className="font-bold text-2xl">Build & Submit</h3>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">Developers solve issues and create PRs</p>
          </CardContent>
        </Card>

        <Card className="px-4 py-10">
          <CardHeader className="gap-4">
            <span className="font-bold text-7xl text-primary">03</span>
            <h3 className="font-bold text-2xl">Merge & Claim</h3>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">PR gets merged, developer claims crypto rewards</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

export default HowItWorks;
