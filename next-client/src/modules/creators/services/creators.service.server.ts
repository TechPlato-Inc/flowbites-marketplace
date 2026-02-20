import { serverFetch } from '@/lib/api/server';
import type { CreatorProfile, Template, UIShot, ServicePackage } from '@/types';

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
