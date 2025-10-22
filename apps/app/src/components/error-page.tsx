"use client";

import type { NextPage } from "next";

import { Button } from "@fanumtax/ui/components/button";

import type { ErrorProps } from "@/types/error";

const ErrorPage: NextPage<ErrorProps> = ({ reset }) => {
  return (
    <section className="container mx-auto flex flex-1 flex-col items-center justify-center gap-4 md:gap-8">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-center font-bold text-3xl text-foreground">Error</h1>
        <p className="text-center text-muted-foreground text-sm">Something went wrong. Please try again later.</p>
        <Button variant="secondary" onClick={reset} className="mt-4">
          Retry
        </Button>
      </div>
    </section>
  );
};

export default ErrorPage;
