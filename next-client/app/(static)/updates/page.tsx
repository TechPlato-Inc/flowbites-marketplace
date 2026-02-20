import Link from 'next/link';
import { Sparkles, Zap, Bug, Star, Rocket, Wrench } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Updates — Flowbites',
  description:
    'Every feature, improvement, and fix we ship. Stay up to date with the latest changes to the Flowbites marketplace.',
  alternates: {
    canonical: '/updates',
  },
};

type UpdateType = 'feature' | 'improvement' | 'fix' | 'announcement';

interface Update {
  date: string;
  type: UpdateType;
  title: string;
  desc: string;
  tag?: string;
}

const typeConfig: Record<UpdateType, { icon: typeof Sparkles; color: string; bg: string; label: string }> = {
  feature: { icon: Sparkles, color: 'text-primary-500', bg: 'bg-primary-50', label: 'New Feature' },
  improvement: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Improvement' },
  fix: { icon: Bug, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Bug Fix' },
  announcement: { icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Announcement' },
};

const updates: Update[] = [
  { date: 'Feb 14, 2026', type: 'feature', title: 'AI-Powered Search', desc: 'Search templates using natural language. Describe what you need — "dark SaaS landing page with pricing section" — and our AI returns precise, relevant results.', tag: 'AI' },
  { date: 'Feb 12, 2026', type: 'feature', title: 'Upwork-Style Footer Navigation', desc: 'Redesigned footer with organized columns for Buyers, Creators, Resources, and Company. Easy access to every page on the platform.' },
  { date: 'Feb 10, 2026', type: 'feature', title: 'Success Stories Page', desc: 'Read how real creators and buyers use Flowbites to build businesses, earn passive income, and launch beautiful websites faster.' },
  { date: 'Feb 8, 2026', type: 'improvement', title: 'Template Card Redesign', desc: 'Redesigned template cards with larger thumbnails, clearer pricing, creator avatars, and platform badges. Better visual hierarchy makes browsing faster.' },
  { date: 'Feb 6, 2026', type: 'feature', title: 'Hero Showcase Animation', desc: 'The homepage hero section now features an animated template showcase that auto-rotates through featured templates with smooth transitions.' },
  { date: 'Feb 4, 2026', type: 'feature', title: 'Creator Guidelines Page', desc: 'Comprehensive guidelines for template creators — design quality standards, technical requirements, listing best practices, and common rejection reasons.' },
  { date: 'Feb 2, 2026', type: 'improvement', title: 'Envato-Style License System', desc: 'Revamped license page with clear numbered clauses, license type comparison table, definitions, and FAQ. Inspired by industry-standard licensing frameworks.' },
  { date: 'Jan 30, 2026', type: 'feature', title: 'Blog Platform Launch', desc: 'Launched the Flowbites blog with 150+ articles covering Webflow, Framer, Wix Studio, design trends, and marketplace tips. Filterable by platform and category.' },
  { date: 'Jan 28, 2026', type: 'feature', title: 'Featured Templates Filter', desc: 'Browse staff-picked featured templates from the homepage and templates page. Curated selections updated weekly by our editorial team.' },
  { date: 'Jan 25, 2026', type: 'improvement', title: 'Browse by Category', desc: 'Filter templates by category with a visual category grid. Updated category cards with template counts and hover previews.' },
  { date: 'Jan 22, 2026', type: 'fix', title: 'Logo Rendering Fix', desc: 'Fixed an issue where the footer logo appeared as a white circle instead of the Flowbites gradient icon. Updated logo component for consistent rendering across all variants.' },
  { date: 'Jan 20, 2026', type: 'feature', title: 'Creator Profiles', desc: 'Public creator profiles with portfolio, bio, social links, and sales stats. Build your brand and let buyers discover your full template collection.' },
  { date: 'Jan 18, 2026', type: 'feature', title: 'Service Marketplace', desc: 'Creators can now offer custom design and development services alongside templates. Hire verified creators for bespoke projects with built-in messaging.' },
  { date: 'Jan 15, 2026', type: 'improvement', title: 'Performance Optimization', desc: 'Reduced initial page load by 40% with code splitting, image optimization, and lazy loading. Lighthouse scores now 90+ across all pages.' },
  { date: 'Jan 10, 2026', type: 'announcement', title: 'Flowbites Beta Launch', desc: 'Flowbites marketplace is now live in public beta. Browse, buy, and sell premium Webflow, Framer, and Wix Studio templates. Join 200+ creators already on the platform.' },
];

export default function UpdatesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold rounded-full mb-6">
            <Rocket className="w-4 h-4" />
            Changelog
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            What&apos;s New
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Every feature, improvement, and fix we ship. Stay up to date with the latest
            changes to the Flowbites marketplace.
          </p>
        </div>
      </div>

      {/* Updates Timeline */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="space-y-6">
          {updates.map((update, i) => {
            const config = typeConfig[update.type];
            const Icon = config.icon;
            return (
              <div key={i} className="flex gap-4 md:gap-6">
                {/* Timeline dot */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  {i < updates.length - 1 && <div className="w-px flex-1 bg-neutral-200 mt-2" />}
                </div>
                {/* Content */}
                <div className="pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-neutral-400">{update.date}</span>
                    <span className={`px-2 py-0.5 ${config.bg} ${config.color} text-[10px] font-semibold rounded-full`}>
                      {config.label}
                    </span>
                    {update.tag && (
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-semibold rounded-full">
                        {update.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-1">{update.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{update.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscribe CTA */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-12">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <Wrench className="w-6 h-6 text-primary-500 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-neutral-900 mb-2">Stay in the Loop</h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">Follow our blog for in-depth feature announcements and product updates.</p>
          <Link href="/blog" className="inline-flex items-center px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors">
            Read the Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
