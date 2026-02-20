import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTemplateBySlug, getAllTemplateSlugs } from '@/modules/templates/services/templates.service.server';
import { getUploadUrl } from '@/lib/api/server';
import { TemplateDetailView } from '@/modules/templates/components/TemplateDetailView';
import { JsonLd } from '@/components/seo/JsonLd';
import { templateProductSchema, breadcrumbSchema } from '@/lib/utils/seo';

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllTemplateSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const template = await getTemplateBySlug(slug);
    const creator = typeof template.creatorProfileId === 'object' ? template.creatorProfileId : null;

    return {
      title: template.title,
      description: (template.metaDescription || template.description || '').slice(0, 160),
      alternates: {
        canonical: `/templates/${slug}`,
      },
      openGraph: {
        type: 'website',
        title: `${template.title} — Flowbites`,
        description: (template.metaDescription || template.description || '').slice(0, 160),
        images: [{ url: getUploadUrl(`images/${template.thumbnail}`) }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${template.title} — Flowbites`,
        description: (template.metaDescription || template.description || '').slice(0, 160),
        images: [getUploadUrl(`images/${template.thumbnail}`)],
      },
    };
  } catch {
    return { title: 'Template Not Found' };
  }
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { slug } = await params;

  let template;
  try {
    template = await getTemplateBySlug(slug);
  } catch {
    notFound();
  }

  const creator = typeof template.creatorProfileId === 'object' ? template.creatorProfileId : null;
  const creatorName = creator?.displayName || 'Creator';

  return (
    <>
      <JsonLd
        data={[
          templateProductSchema({
            title: template.title,
            slug: template.slug,
            description: template.description || '',
            price: template.price,
            thumbnail: getUploadUrl(`images/${template.thumbnail}`),
            platform: template.platform,
            creator: creatorName,
          }),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Templates', url: '/templates' },
            { name: template.title, url: `/templates/${template.slug}` },
          ]),
        ]}
      />
      <TemplateDetailView template={template} />
    </>
  );
}
