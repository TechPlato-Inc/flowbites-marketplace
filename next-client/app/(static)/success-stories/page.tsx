import Link from 'next/link';
import { Star, TrendingUp, Globe, Briefcase } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Success Stories — Flowbites',
  description:
    'Real creators and buyers sharing how Flowbites helped them build businesses, save time, and launch beautiful websites.',
  alternates: {
    canonical: '/success-stories',
  },
};

const stories = [
  { name: 'Daniel Park', role: 'Webflow Template Creator', quote: 'Flowbites gave me a platform to turn my side project into a full-time income. In 6 months, I went from uploading my first template to earning over $12,000 a month.', stat: '$72K+', statLabel: 'Annual Revenue', templates: 8, topTemplate: 'Zenith Creative Agency' },
  { name: 'Aisha Patel', role: 'UI/UX Designer', quote: 'As a freelance designer, I was looking for passive income. Flowbites templates now generate more revenue than my client work. The marketplace exposure is incredible.', stat: '$45K+', statLabel: 'Total Earnings', templates: 5, topTemplate: 'Nova AI Startup' },
  { name: 'Marcus Chen', role: 'Agency Founder', quote: 'We use Flowbites templates as starting points for 80% of our client projects. It cut our delivery time in half and our clients love the quality. We save 20+ hours per project.', stat: '150+', statLabel: 'Client Projects', templates: 0, topTemplate: '' },
  { name: 'Lina Nakamura', role: 'Framer & Wix Creator', quote: 'I specialize in Framer and Wix templates — niches that other marketplaces overlook. Flowbites gives equal visibility to all platforms, and my Framer templates consistently sell.', stat: '$28K+', statLabel: 'Total Earnings', templates: 6, topTemplate: 'Verde Eco Nonprofit' },
  { name: 'Sarah Mitchell', role: 'Design Lead at StartupCo', quote: 'We needed a professional website fast. Found a perfect SaaS template on Flowbites, customized it in a weekend, and launched Monday morning. Our investors were impressed.', stat: '3 Days', statLabel: 'To Launch', templates: 0, topTemplate: '' },
  { name: 'James Park', role: 'Freelance Developer', quote: 'I sell both templates and custom services on Flowbites. Templates bring in passive income, and the service requests come from buyers who want additional customization.', stat: '$8K/mo', statLabel: 'Combined Revenue', templates: 4, topTemplate: 'Finova Dashboard' },
];

const stats = [
  { icon: TrendingUp, value: '$500K+', label: 'Paid to Creators' },
  { icon: Globe, value: '10,000+', label: 'Templates Sold' },
  { icon: Star, value: '4.8/5', label: 'Average Rating' },
  { icon: Briefcase, value: '200+', label: 'Active Creators' },
];

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Success Stories
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Real creators and buyers sharing how Flowbites helped them build businesses,
            save time, and launch beautiful websites.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">{s.value}</div>
                <div className="text-sm text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story) => (
            <div key={story.name} className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                  {story.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{story.name}</h3>
                  <p className="text-xs text-neutral-500">{story.role}</p>
                </div>
              </div>
              <blockquote className="text-sm text-neutral-600 leading-relaxed mb-5 italic">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div>
                  <div className="text-xl font-bold text-primary-600">{story.stat}</div>
                  <div className="text-xs text-neutral-500">{story.statLabel}</div>
                </div>
                {story.templates > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neutral-700">{story.templates} Templates</div>
                    <div className="text-xs text-neutral-500">Top: {story.topTemplate}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-neutral-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Write Your Own Success Story</h2>
          <p className="text-neutral-400 mb-8">
            Whether you&apos;re a creator looking to earn or a buyer looking to build — Flowbites is where it happens.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/become-creator" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              Become a Creator
            </Link>
            <Link href="/templates" className="inline-flex items-center px-8 py-3 border border-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors">
              Browse Templates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
