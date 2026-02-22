import type { Metadata } from "next";
import { getCreators } from "@/modules/creators/services/creators.service.server";
import { CreatorsListingContent } from "@/modules/creators/components/CreatorsListingContent";

export const metadata: Metadata = {
  title: "Creators — Flowbites",
  description:
    "Browse talented creators on Flowbites. Find designers and developers building premium templates for Webflow, Framer, and Wix.",
  alternates: {
    canonical: "/creators",
  },
};

interface CreatorsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CreatorsPage({
  searchParams,
}: CreatorsPageProps) {
  const params = await searchParams;

  const apiParams: Record<string, string> = {};
  if (params.sort && typeof params.sort === "string")
    apiParams.sort = params.sort;
  if (params.page && typeof params.page === "string")
    apiParams.page = params.page;
  if (params.q && typeof params.q === "string") apiParams.q = params.q;

  const data = await getCreators(apiParams).catch(() => ({
    creators: [],
    pagination: { total: 0, pages: 1, page: 1, limit: 24 },
  }));

  return (
    <CreatorsListingContent
      initialCreators={data.creators}
      initialTotal={data.pagination.total}
      initialPages={data.pagination.pages}
    />
  );
}
