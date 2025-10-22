import type { NextPage } from "next";
import Link from "next/link";

import { Button } from "@fanumtax/ui/components/button";

interface NotFoundProps {
  message: string;
}

const NotFoundPage: NextPage<NotFoundProps> = ({ message }) => {
  return (
    <section className="container mx-auto flex flex-1 flex-col items-center justify-center gap-4 md:gap-8">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-center font-bold text-3xl text-foreground">Not Found</h1>
        <p className="text-center text-muted-foreground text-sm">{message}</p>
        <Button variant="secondary" asChild className="mt-4">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
};

export default NotFoundPage;
