import { serverFetch } from '@/lib/api/server';
import type { Template, Category } from '@/types';

interface TemplatesResponse {
  templates: Template[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export async function getTemplates(params: Record<string, string> = {}): Promise<TemplatesResponse> {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/templates${query ? `?${query}` : ''}`;
  return serverFetch<TemplatesResponse>(endpoint, { cache: 'no-store' });
}

export async function getTemplateBySlug(slug: string): Promise<Template> {
  return serverFetch<Template>(`/templates/${slug}`, {
    revalidate: 3600,
    tags: [`template-${slug}`],
  });
}

export async function getCategories(): Promise<Category[]> {
  return serverFetch<Category[]>('/categories', {
    revalidate: 3600,
    tags: ['categories'],
  });
}

export async function getAllTemplateSlugs(): Promise<string[]> {
  const data = await serverFetch<TemplatesResponse>('/templates?limit=1000&fields=slug', {
    revalidate: 3600,
    tags: ['template-slugs'],
  });
  return data.templates.map((t) => t.slug);
}
