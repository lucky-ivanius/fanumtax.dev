import type { NextPage } from "next";

import type { SearchParamsValue } from "@/utils/search-params";
import { SearchFilter } from "@/components/explore/search-filter";
import { forceArrays } from "@/utils/search-params";

interface ExploreProps {
  searchParams: Promise<{
    q?: SearchParamsValue;
    lang?: SearchParamsValue;
    sort?: SearchParamsValue;
  }>;
}

const Explore: NextPage<ExploreProps> = async ({ searchParams }) => {
  const _searchParams = forceArrays(await searchParams);

  const [q] = _searchParams.q ?? [];
  const [lang] = _searchParams.lang ?? [];
  const [sort] = _searchParams.sort ?? [];

  return (
    <main className="bg-background px-4 py-4 md:px-8">
      <section className="container mx-auto flex flex-col gap-4 md:gap-2">
        <div className="flex flex-col space-y-2 md:space-y-3 md:py-4">
          <h1 className="text-balance font-bold text-3xl text-foreground">Explore</h1>
          <p className="text-muted-foreground">Discover and solve issues</p>
        </div>
        <SearchFilter
          defaultOpen={!!Object.keys(_searchParams).length}
          values={{
            q,
            lang: lang?.split(","),
            sort,
          }}
        />
      </section>
    </main>
  );
};

export default Explore;
