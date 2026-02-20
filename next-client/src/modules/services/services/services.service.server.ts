import { serverFetch } from '@/lib/api/server';
import type { ServicePackage } from '@/types';

interface ServicePackagesResponse {
  packages: ServicePackage[];
}

export async function getServicePackages(params: Record<string, string> = {}): Promise<ServicePackagesResponse> {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/services/packages/browse${query ? `?${query}` : ''}`;
  return serverFetch<ServicePackagesResponse>(endpoint, { cache: 'no-store' });
}

export async function getServiceBySlug(slug: string): Promise<ServicePackage> {
  return serverFetch<ServicePackage>(`/services/packages/${slug}`, {
    revalidate: 3600,
    tags: [`service-${slug}`],
  });
}

export async function getAllServiceSlugs(): Promise<string[]> {
  const data = await serverFetch<ServicePackagesResponse>('/services/packages/browse?limit=1000&fields=slug', {
    revalidate: 3600,
    tags: ['service-slugs'],
  });
  return data.packages.map((p) => p.slug);
}
