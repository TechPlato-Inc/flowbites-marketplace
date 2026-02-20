import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeContent } from '@/modules/home/components/HomeContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/utils/seo';
import { serverFetch } from '@/lib/api/server';
import type { Template, Category } from '@/types';

export const metadata: Metadata = {
  title: 'Flowbites — Premium Template Marketplace',
  description:
    'Browse premium Webflow, Framer, and Wix templates. Find the perfect template for your next project from verified creators.',
};

async function getFeaturedTemplates(): Promise<Template[]> {
  try {
    const data = await serverFetch<{ templates: Template[] }>(
      '/templates?featured=true&limit=8',
      { cache: 'no-store' }
    );
    return data.templates || [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const data = await serverFetch<Category[]>('/categories', {
      revalidate: 3600,
      tags: ['categories'],
    });
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredTemplates, categories] = await Promise.all([
    getFeaturedTemplates(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20">
        <HomeContent
          initialFeatured={featuredTemplates}
          initialCategories={categories}
        />
      </main>
      <Footer />
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
    </div>
  );
}
