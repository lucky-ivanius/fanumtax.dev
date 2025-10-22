import type { NextPage } from "next";

import type { SearchParamsValue } from "@/utils/search-params";
import { RepoList } from "@/components/discover/repo-list";
import { SearchFilter } from "@/components/discover/search-filter";
import { searchRepos } from "@/lib/api";
import { forceArrays } from "@/utils/search-params";

interface DiscoverProps {
  searchParams: Promise<{
    q?: SearchParamsValue;
    lang?: SearchParamsValue;
    license?: SearchParamsValue;
  }>;
}

const Discover: NextPage<DiscoverProps> = async ({ searchParams }) => {
  const _searchParams = forceArrays(await searchParams);

  const [q] = _searchParams.q ?? [];
  const [lang] = _searchParams.lang ?? [];
  const [license] = _searchParams.license ?? [];

  const languages = lang?.split(",");
  const licenses = license?.split(",");

  const searchReposResult = await searchRepos({
    q,
    languages,
    licenses,
  });
  if (!searchReposResult.success)
    switch (searchReposResult.error) {
      case "unexpected_error":
        throw new Error("Internal server error");
    }

  const { items: repos, total: _total } = searchReposResult.data;

  return (
    <section className="container mx-auto flex flex-col gap-6">
      <div className="flex flex-col space-y-2 md:space-y-3">
        <h1 className="text-balance font-bold text-3xl text-foreground">Discover</h1>
        <p className="text-muted-foreground">Discover and solve issues</p>
      </div>
      <SearchFilter
        defaultOpen={!!Object.keys(_searchParams).length}
        values={{
          q,
          lang: languages,
          license: licenses,
        }}
      />
      <RepoList initialRepos={repos} findMoreOptions={{ q, languages, licenses }} />
    </section>
  );
};

export default Discover;
