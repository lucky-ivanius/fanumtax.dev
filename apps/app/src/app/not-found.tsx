import type { NextPage } from "next";

import NotFoundPage from "@/components/not-found-page";

const NotFound: NextPage = () => (
  <NotFoundPage message="The page you are looking for does not exist or you do not have access to it." />
);

export default NotFound;
