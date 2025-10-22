import type { NextPage } from "next";

import type { SearchParamsValue } from "@/utils/search-params";
import { FilterSort } from "@/components/home/filter-sort";
import { RepoList } from "@/components/home/repo-list";
import { searchFundedRepos } from "@/lib/api";
import { forceArrays } from "@/utils/search-params";

interface DiscoverProps {
  searchParams: Promise<{
    lang?: SearchParamsValue;
    license?: SearchParamsValue;
  }>;
}

const HomePage: NextPage<DiscoverProps> = async ({ searchParams }) => {
  const _searchParams = forceArrays(await searchParams);

  const [sort] = _searchParams.license ?? [];
  const [lang] = _searchParams.lang ?? [];
  const [license] = _searchParams.license ?? [];

  const languages = lang?.split(",");
  const licenses = license?.split(",");

  const searchFundedReposResult = await searchFundedRepos({
    sort,
    languages,
    licenses,
  });
  if (!searchFundedReposResult.success)
    switch (searchFundedReposResult.error) {
      case "unexpected_error":
        throw new Error("Internal server error");
    }

  const { items: repos, total: _total } = searchFundedReposResult.data;

  return (
    <section className="container mx-auto flex flex-col gap-6">
      <div className="flex flex-col space-y-2 md:space-y-3">
        <h1 className="text-balance font-bold text-3xl text-foreground">Available Bounties</h1>
        <p className="text-muted-foreground">Browse funded repositories and start solving issues</p>
      </div>

      <FilterSort
        values={{
          sort,
          lang: languages,
          license: licenses,
        }}
      />
      <RepoList initialRepos={repos} findMoreOptions={{ sort, languages, licenses }} />
    </section>
  );
};

export default HomePage;
