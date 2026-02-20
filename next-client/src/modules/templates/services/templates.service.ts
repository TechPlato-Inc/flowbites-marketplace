'use client';

import { api } from '@/lib/api/client';
import type { Template, ServicePackage } from '@/types';

interface TemplatesResponse {
  templates: Template[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export async function fetchTemplates(params: Record<string, string> = {}): Promise<TemplatesResponse> {
  const { data } = await api.get('/templates', { params });
  return data.data;
}

export async function fetchTemplateBySlug(slug: string): Promise<Template> {
  const { data } = await api.get(`/templates/${slug}`);
  return data.data;
}

export async function fetchServicesByTemplate(templateId: string): Promise<ServicePackage[]> {
  const { data } = await api.get(`/services/packages?templateId=${templateId}`);
  return data.data || [];
}

export async function purchaseTemplate(templateId: string): Promise<{ sessionUrl: string }> {
  const { data } = await api.post('/checkout/template', {
    items: [{ templateId }],
  });
  return data.data;
}

export async function requestCustomization(templateId: string, requirements: string): Promise<void> {
  await api.post('/services/request-customization', {
    templateId,
    requirements: requirements.trim(),
  });
}
