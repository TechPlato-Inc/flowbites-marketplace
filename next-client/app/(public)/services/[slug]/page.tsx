import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServiceBySlug, getAllServiceSlugs } from '@/modules/services/services/services.service.server';
import { ServiceDetailView } from '@/modules/services/components/ServiceDetailView';
import { JsonLd } from '@/components/seo/JsonLd';
import { serviceSchema, breadcrumbSchema } from '@/lib/utils/seo';

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllServiceSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const service = await getServiceBySlug(slug);

    return {
      title: service.name,
      description: (service.description || '').slice(0, 160),
      alternates: {
        canonical: `/services/${slug}`,
      },
      openGraph: {
        type: 'website',
        title: `${service.name} — Flowbites`,
        description: (service.description || '').slice(0, 160),
      },
      twitter: {
        card: 'summary',
        title: `${service.name} — Flowbites`,
        description: (service.description || '').slice(0, 160),
      },
    };
  } catch {
    return { title: 'Service Not Found' };
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;

  let service;
  try {
    service = await getServiceBySlug(slug);
  } catch {
    notFound();
  }

  const creatorName = typeof service.creatorId === 'object' ? service.creatorId.name : 'Creator';

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: service.name,
            slug: service.slug,
            description: service.description || '',
            price: service.price,
            creator: creatorName,
          }),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Services', url: '/services' },
            { name: service.name, url: `/services/${service.slug}` },
          ]),
        ]}
      />
      <ServiceDetailView service={service} />
    </>
  );
}
