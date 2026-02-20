import type { Metadata } from 'next';

const SITE_NAME = 'Flowbites';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flowbites.com';
const DEFAULT_DESCRIPTION = 'The modern marketplace where designers sell premium Webflow, Framer, and Wix templates and grow their creative business.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

export function generateSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
}: SEOOptions = {}): Metadata {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Premium Template Marketplace`;
  const url = canonical || SITE_URL;

  return {
    title: fullTitle,
    description,
    ...(noindex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: ogType === 'article' ? 'article' : 'website',
      url,
      title: fullTitle,
      description,
      images: [{ url: ogImage }],
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  JSON-LD Schema Helpers                                             */
/* ------------------------------------------------------------------ */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    description: DEFAULT_DESCRIPTION,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/templates?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function templateProductSchema(template: {
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail: string;
  platform: string;
  creator?: string;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: template.title,
    url: `${SITE_URL}/templates/${template.slug}`,
    description: template.description?.slice(0, 300),
    image: template.thumbnail,
    brand: {
      '@type': 'Brand',
      name: template.platform.charAt(0).toUpperCase() + template.platform.slice(1),
    },
    ...(template.creator && {
      manufacturer: { '@type': 'Person', name: template.creator },
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: template.price,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/templates/${template.slug}`,
    },
    ...(template.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: template.rating,
        reviewCount: template.reviewCount || 0,
      },
    }),
  };
}

export function blogArticleSchema(post: {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  authorName: string;
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url: `${SITE_URL}/blog/${post.slug}`,
    description: post.excerpt,
    ...(post.coverImage && { image: post.coverImage }),
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.publishedAt,
    ...(post.updatedAt && { dateModified: post.updatedAt }),
    ...(post.tags && { keywords: post.tags.join(', ') }),
  };
}

export function serviceSchema(service: {
  name: string;
  slug: string;
  description: string;
  price: number;
  creator?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    url: `${SITE_URL}/services/${service.slug}`,
    description: service.description?.slice(0, 300),
    ...(service.creator && {
      provider: { '@type': 'Person', name: service.creator },
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: service.price,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
