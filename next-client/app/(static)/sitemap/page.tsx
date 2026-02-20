import Link from 'next/link';
import { Map, ChevronRight } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Sitemap — Flowbites',
  description:
    'A complete overview of all pages on Flowbites Marketplace. Navigate to any section of the site quickly.',
  alternates: {
    canonical: '/sitemap',
  },
};

const sitemapSections = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Browse Templates', href: '/templates' },
      { label: 'Webflow Templates', href: '/templates?platform=webflow' },
      { label: 'Framer Templates', href: '/templates?platform=framer' },
      { label: 'Wix Templates', href: '/templates?platform=wix' },
      { label: 'Services', href: '/services' },
      { label: 'UI Shorts', href: '/ui-shorts' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Business & Corporate', href: '/templates?category=business' },
      { label: 'Portfolio & Agency', href: '/templates?category=portfolio' },
      { label: 'E-commerce & Store', href: '/templates?category=ecommerce' },
      { label: 'Blog & Magazine', href: '/templates?category=blog' },
      { label: 'Landing Pages', href: '/templates?category=landing' },
      { label: 'SaaS & Technology', href: '/templates?category=saas' },
      { label: 'Personal & Resume', href: '/templates?category=personal' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/register' },
      { label: 'Buyer Dashboard', href: '/dashboard/buyer' },
      { label: 'Creator Dashboard', href: '/dashboard/creator' },
      { label: 'Account Settings', href: '/settings' },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Community Forum', href: '/community' },
      { label: 'Contact Support', href: '/help' },
      { label: 'Licenses Explained', href: '/licenses' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Flowbites', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Affiliate Program', href: '/affiliate' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookies Policy', href: '/cookies' },
      { label: 'Licenses', href: '/licenses' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Map className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-neutral-900">Sitemap</h1>
      </div>
      <p className="text-neutral-500 mb-10 max-w-2xl">
        A complete overview of all pages on Flowbites Marketplace. Use this page to quickly navigate
        to any section of the site.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sitemapSections.map((section) => (
          <div key={section.title}>
            <h2 className="font-semibold text-neutral-900 mb-4 text-lg">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-500 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
