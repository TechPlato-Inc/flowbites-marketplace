import Link from 'next/link';
import { DollarSign, Globe, BarChart3, Users, Palette, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Become a Creator — Flowbites',
  description:
    'Turn your design skills into recurring revenue. Join the Flowbites creator program and reach thousands of buyers looking for premium templates.',
  alternates: {
    canonical: '/become-creator',
  },
};

const benefits = [
  { icon: DollarSign, title: 'Earn on Every Sale', desc: 'Keep 70% of every sale. No monthly fees, no hidden costs. Get paid for every template and service purchased through your profile.' },
  { icon: Globe, title: 'Global Marketplace', desc: 'Reach thousands of buyers worldwide — agencies, startups, freelancers, and enterprises searching for premium templates.' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track sales, views, revenue, and conversion rates from your creator dashboard. Understand what sells and optimize your portfolio.' },
  { icon: Users, title: 'Build Your Brand', desc: 'Create a public creator profile with portfolio, bio, and social links. Build a following and become a recognized name in the community.' },
  { icon: Palette, title: 'Creative Freedom', desc: 'Design for Webflow, Framer, or Wix Studio. Choose your niche, set your prices, and publish on your schedule.' },
  { icon: ShieldCheck, title: 'Protected Revenue', desc: 'Secure license enforcement protects your work. Buyers get legitimate licenses, and your intellectual property stays protected.' },
];

const steps = [
  { num: '01', title: 'Apply', desc: 'Fill out the creator application with your portfolio and experience. Our team reviews applications within 48 hours.' },
  { num: '02', title: 'Get Verified', desc: 'Complete identity verification and agree to our creator terms. This protects both you and your future buyers.' },
  { num: '03', title: 'Upload', desc: 'Upload your first template with screenshots, demo URL, description, and pricing. Our quality team reviews every submission.' },
  { num: '04', title: 'Earn', desc: 'Once approved, your template goes live. Start earning revenue from every sale. Get paid monthly via bank transfer or Stripe.' },
];

export default function BecomeCreatorPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="inline-flex items-center px-4 py-1.5 bg-primary-500/10 text-primary-400 text-sm font-semibold rounded-full mb-6">
            Join 200+ Creators
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Sell Your Templates on Flowbites
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Turn your design skills into recurring revenue. Join the Flowbites creator program and reach
            thousands of buyers looking for premium Webflow, Framer, and Wix templates.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors mt-10"
          >
            Apply to Become a Creator
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">
          Why Creators Choose Flowbites
        </h2>
        <p className="text-neutral-500 text-center mb-16 max-w-lg mx-auto">
          Everything you need to build a sustainable template business.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b) => (
            <div key={b.title} className="p-6 border border-neutral-200 rounded-xl">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">{b.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-16">
            How to Get Started
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-5">
                <span className="text-4xl font-bold text-primary-200 shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-neutral-900 text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue split */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
          Transparent Revenue Split
        </h2>
        <p className="text-neutral-500 mb-10 max-w-md mx-auto">
          No surprises. You keep the majority of every sale.
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="p-8 bg-primary-50 border-2 border-primary-200 rounded-2xl">
            <div className="text-5xl font-bold text-primary-600">70%</div>
            <div className="text-sm font-semibold text-primary-600 mt-1">You Keep</div>
          </div>
          <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-2xl">
            <div className="text-5xl font-bold text-neutral-400">30%</div>
            <div className="text-sm font-semibold text-neutral-500 mt-1">Platform Fee</div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-6">
          Platform fee covers hosting, payment processing, support, and marketing.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-neutral-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-neutral-400 mb-8">
            Apply today and join a growing community of creators building the future of web design.
          </p>
          <Link href="/register" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
