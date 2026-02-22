import type { Metadata } from "next";
import { getServicePackages } from "@/modules/services/services/services.service.server";
import { ServiceListingContent } from "@/modules/services/components/ServiceListingContent";
import type { ServicePackage } from "@/types";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Find professional web design and development services from expert creators on Flowbites.",
  alternates: {
    canonical: "/services",
  },
};

interface ServicesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const params = await searchParams;

  const queryParams: Record<string, string> = {};
  if (params.category && typeof params.category === "string")
    queryParams.category = params.category;
  if (params.q && typeof params.q === "string") queryParams.q = params.q;

  let initialPackages: ServicePackage[] = [];
  try {
    const data = await getServicePackages(queryParams);
    initialPackages = data.packages;
  } catch {
    initialPackages = [];
  }

  return <ServiceListingContent initialPackages={initialPackages} />;
}
