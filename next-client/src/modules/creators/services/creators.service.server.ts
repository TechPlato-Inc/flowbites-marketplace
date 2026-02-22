import { serverFetch } from "@/lib/api/server";
import type { CreatorProfile, Template, UIShot, ServicePackage } from "@/types";

interface CreatorData {
  profile: CreatorProfile;
  templates: Template[];
  shots: UIShot[];
  services: ServicePackage[];
}

export async function getCreatorById(id: string): Promise<CreatorData> {
  return serverFetch<CreatorData>(`/creators/${id}`, {
    revalidate: 600,
  });
}

interface CreatorListItem {
  _id: string;
  displayName: string;
  username: string;
  bio?: string;
  stats: {
    templateCount: number;
    totalSales: number;
  };
  isFeatured: boolean;
  isOfficial: boolean;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface CreatorsListData {
  creators: CreatorListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getCreators(
  params: Record<string, string> = {},
): Promise<CreatorsListData> {
  const query = new URLSearchParams(params).toString();
  return serverFetch<CreatorsListData>(`/creators${query ? `?${query}` : ""}`, {
    revalidate: 300,
  });
}
