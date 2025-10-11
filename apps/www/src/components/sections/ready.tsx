import { useLenis } from "lenis/react";
import Snap from "lenis/snap";
import { useEffect, useRef } from "react";

import { Button } from "@fanumtax/ui/components/button";

import Footer from "../footer";

const Ready: React.FC = () => {
  const ref = useRef<HTMLElement>(null);

  const lenis = useLenis();

  useEffect(() => {
    if (!ref.current) return;
    if (!lenis) return;

    const snap = new Snap(lenis, {
      debounce: 0,
      distanceThreshold: "40%",
    });

    const cleanUp = snap.addElement(ref.current);

    return () => {
      cleanUp();
    };
  }, [lenis]);

  return (
    <section ref={ref} id="ready" className="flex min-h-screen flex-col items-center justify-between bg-primary px-8">
      <div className="container mx-auto flex w-full flex-1 items-center justify-center">
        <div className="space-y-8">
          <h2 className="text-center font-bold text-5xl text-primary-foreground uppercase lg:text-7xl">
            Ready to Ship Code?
          </h2>
          <p className="text-center text-primary-foreground text-xl opacity-80">
            join the future of open source development
          </p>

          <div className="flex flex-col justify-center gap-6 pt-8 sm:flex-row">
            <Button
              asChild
              size="xl"
              className="border-2 border-secondary bg-secondary font-medium text-lg text-primary transition-all duration-100 hover:bg-primary hover:text-secondary active:translate-x-0.5 active:translate-y-0.5"
            >
              <a href="/app">Start Building</a>
            </Button>
            <Button
              asChild
              size="xl"
              className="border-2 border-secondary font-medium text-lg transition-all duration-100 hover:bg-secondary hover:text-primary active:translate-x-0.5 active:translate-y-0.5"
            >
              <a href="/app">Fund Project</a>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default Ready;
