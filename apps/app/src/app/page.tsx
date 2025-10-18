import type { NextPage } from "next";

import { SearchFilter } from "@/components/explore/search-filter";

interface ExploreProps {
  searchParams: Promise<{
    q?: string;
    lang?: string;
    sort?: string;
  }>;
}

const Explore: NextPage<ExploreProps> = async ({ searchParams }) => {
  const _searchParams = await searchParams;

  return (
    <main className="bg-background px-4 py-4 md:px-8">
      <section className="container mx-auto flex flex-col gap-8">
        <div className="flex flex-col space-y-2 md:space-y-3 md:py-4">
          <h1 className="text-balance font-bold text-3xl text-foreground">Explore</h1>
          <p className="text-muted-foreground">Discover and solve issues</p>
        </div>
        <SearchFilter
          defaultOpen={!!Object.keys(_searchParams).length}
          values={{
            q: _searchParams.q,
            lang: _searchParams.lang?.split(","),
            sort: _searchParams.sort,
          }}
        />
      </section>
    </main>
  );
};

export default Explore;
