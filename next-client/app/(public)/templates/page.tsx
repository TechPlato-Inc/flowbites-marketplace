import type { Metadata } from "next";
import {
  getTemplates,
  getCategories,
} from "@/modules/templates/services/templates.service.server";
import { TemplateListingContent } from "@/modules/templates/components/TemplateListingContent";

export const metadata: Metadata = {
  title: "Premium Webflow Templates — Flowbites",
  description:
    "Browse our collection of premium Webflow templates, UI kits, and Figma designs. Each template is carefully crafted to help you build stunning projects faster.",
  alternates: {
    canonical: "/templates",
  },
};

interface TemplatesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TemplatesPage({
  searchParams,
}: TemplatesPageProps) {
  const params = await searchParams;

  // Build API query params from search params
  const apiParams: Record<string, string> = {};
  if (params.sort && typeof params.sort === "string")
    apiParams.sort = params.sort;
  if (params.page && typeof params.page === "string")
    apiParams.page = params.page;
  if (params.madeBy && typeof params.madeBy === "string")
    apiParams.madeBy = params.madeBy;
  if (params.category && typeof params.category === "string")
    apiParams.category = params.category;
  if (params.platform && typeof params.platform === "string")
    apiParams.platform = params.platform;
  if (params.q && typeof params.q === "string") apiParams.q = params.q;

  // Parallel data fetching on the server
  const [templatesData, categories] = await Promise.all([
    getTemplates(apiParams).catch(() => ({
      templates: [],
      pagination: { total: 0, pages: 1, page: 1, limit: 20 },
    })),
    getCategories().catch(() => []),
  ]);

  return (
    <TemplateListingContent
      initialTemplates={templatesData.templates}
      initialTotal={templatesData.pagination.total}
      initialPages={templatesData.pagination.pages}
      categories={categories}
    />
  );
}
