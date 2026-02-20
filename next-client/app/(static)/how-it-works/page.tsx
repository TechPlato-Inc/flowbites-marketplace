import Link from 'next/link';
import { Search, CreditCard, Download, ShieldCheck, Star, Zap } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'How It Works — Flowbites',
  description:
    'Find, buy, and launch premium website templates in minutes. Learn the step-by-step process of using Flowbites Marketplace.',
  alternates: {
    canonical: '/how-it-works',
  },
};

const steps = [
  { icon: Search, title: 'Browse & Discover', description: 'Explore thousands of premium website templates built for Webflow, Framer, and Wix Studio. Filter by platform, category, price, and style to find the perfect match.' },
  { icon: Star, title: 'Preview & Compare', description: 'View live demos of every template before you buy. Check responsive behavior, interactions, page speed, and CMS structure. Compare multiple options side by side.' },
  { icon: CreditCard, title: 'Purchase Securely', description: 'Buy with confidence using our secure checkout powered by Stripe. Choose from Personal, Commercial, or Extended licenses depending on your project needs.' },
  { icon: Download, title: 'Get Instant Access', description: 'Receive your template immediately after purchase. Webflow templates arrive as clone links, Framer as remix links, and Wix Studio as downloadable files.' },
  { icon: Zap, title: 'Customize & Launch', description: 'Make the template yours — change colors, fonts, images, and content. Add your brand, connect your domain, and launch your site in hours instead of weeks.' },
  { icon: ShieldCheck, title: 'Lifetime Access & Updates', description: 'Your license is perpetual. Get free lifetime updates from the creator, ongoing access to your template files, and support when you need it.' },
];

const buyerBenefits = [
  { stat: '500+', label: 'Premium Templates' },
  { stat: '100%', label: 'Quality Reviewed' },
  { stat: '14-Day', label: 'Refund Policy' },
  { stat: '24/7', label: 'Support Available' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            How Flowbites Works
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Find, buy, and launch premium website templates in minutes. No coding required. No subscriptions.
            Just one-time purchases with lifetime access.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/templates" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              Browse Templates
            </Link>
            <Link href="/become-creator" className="inline-flex items-center px-8 py-3 border border-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors">
              Become a Creator
            </Link>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">
          6 Simple Steps
        </h2>
        <p className="text-neutral-500 text-center mb-16 max-w-lg mx-auto">
          From discovery to launch — here&apos;s how thousands of businesses build beautiful websites with Flowbites.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-primary-500" />
              </div>
              <span className="absolute top-6 right-6 text-4xl font-bold text-neutral-100">
                {i + 1}
              </span>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {buyerBenefits.map((b) => (
              <div key={b.label}>
                <div className="text-3xl font-bold text-neutral-900">{b.stat}</div>
                <div className="text-sm text-neutral-500 mt-1">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">
          Templates for Every Platform
        </h2>
        <p className="text-neutral-500 text-center mb-12 max-w-lg mx-auto">
          Flowbites supports the three most popular no-code website builders.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Webflow', desc: 'Clone the template directly into your Webflow workspace. Full access to the Designer for unlimited customization.', delivery: 'Clone Link' },
            { name: 'Framer', desc: 'Remix the template into your Framer account. Built with Framer components, interactions, and CMS.', delivery: 'Remix Link' },
            { name: 'Wix Studio', desc: 'Download and import into Wix Studio. Professional templates with responsive design and dynamic pages.', delivery: 'File Download' },
          ].map((p) => (
            <div key={p.name} className="p-6 bg-white border border-neutral-200 rounded-xl">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{p.name}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">{p.desc}</p>
              <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full">
                {p.delivery}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-neutral-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-neutral-400 mb-8">
            Browse our curated collection of premium templates and launch your website today.
          </p>
          <Link href="/templates" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
            Browse Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
