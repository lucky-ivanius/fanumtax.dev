import type { NextPage } from "next";

import NotFoundPage from "@/components/not-found-page";

const RepoNotFound: NextPage = () => (
  <NotFoundPage message="The repository you are looking for does not exist or you do not have access to it." />
);

export default RepoNotFound;
