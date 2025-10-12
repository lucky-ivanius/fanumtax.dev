import { useLenis } from "lenis/react";
import { Rocket } from "lucide-react";
import { useState } from "react";

import { Button } from "@fanumtax/ui/components/button";
import { cn } from "@fanumtax/utils/class-name";

const Header: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  useLenis((lenis) => {
    const newIsLoading = lenis.progress !== 0;
    const newIsEnded = lenis.progress >= 0.98;

    setIsLoading((prev) => (prev !== newIsLoading ? newIsLoading : prev));
    setIsEnded((prev) => (prev !== newIsEnded ? newIsEnded : prev));
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center border-transparent border-b bg-background/80 px-4 py-6 backdrop-blur transition-all duration-150",
        isLoading && "border-primary/20",
        isEnded && "-translate-y-full"
      )}
    >
      <nav className="container mx-auto flex items-center justify-between gap-8">
        <a href="/" className="font-medium text-primary text-xl leading-tight transition-colors duration-100">
          {"<fanumtax.dev/>"}
        </a>
        <div className="hidden items-center gap-12 md:flex">
          <a href="/explore" className="text-sm">
            Explore
          </a>
          <a href="#how-it-works" className="text-sm">
            How it works
          </a>
          <a href="#developers" className="text-sm">
            For Developers
          </a>
          <a href="#funders" className="text-sm">
            For Funders
          </a>
        </div>
        <Button
          asChild
          size="lg"
          className="border-2 border-primary transition-all duration-100 hover:bg-background hover:text-primary"
        >
          <a href="/app">
            Build <Rocket />
          </a>
        </Button>
      </nav>
    </header>
  );
};

export default Header;
