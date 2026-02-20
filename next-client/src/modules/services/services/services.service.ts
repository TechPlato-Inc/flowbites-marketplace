'use client';

import { api } from '@/lib/api/client';
import type { ServicePackage } from '@/types';

interface ServicePackagesResponse {
  packages: ServicePackage[];
}

export async function fetchServicePackages(params: Record<string, string> = {}): Promise<ServicePackagesResponse> {
  const { data } = await api.get('/services/packages/browse', { params });
  return data.data;
}

export async function fetchServiceBySlug(slug: string): Promise<ServicePackage> {
  const { data } = await api.get(`/services/packages/${slug}`);
  return data.data;
}

export async function orderService(packageId: string, requirements: string): Promise<{ sessionUrl: string }> {
  const { data } = await api.post('/checkout/service', {
    packageId,
    requirements: requirements.trim(),
  });
  return data.data;
}

export async function createServicePackage(payload: {
  templateId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
  requirements?: string;
}): Promise<ServicePackage> {
  const { data } = await api.post('/services/packages', payload);
  return data.data;
}
