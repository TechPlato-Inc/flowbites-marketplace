import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Share2,
  Gift,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Zap,
  Globe,
} from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Affiliate Program — Flowbites',
  description:
    'Earn 30% commission for every template sale you refer. Join the Flowbites affiliate program and get paid for sharing templates you love.',
  alternates: {
    canonical: '/affiliate',
  },
};

const steps = [
  { step: '1', title: 'Sign Up', description: 'Create your free affiliate account. No approval wait — start immediately.' },
  { step: '2', title: 'Share Your Link', description: 'Get your unique referral link and share it on your blog, social media, YouTube, or newsletter.' },
  { step: '3', title: 'Earn Commission', description: 'Earn 30% commission on every sale made through your referral link. Payouts monthly via Stripe.' },
];

const benefits = [
  { icon: DollarSign, title: '30% Commission', description: 'Earn 30% on every template sale through your link. No caps or limits.' },
  { icon: TrendingUp, title: '90-Day Cookie', description: 'Your referral cookie lasts 90 days. Earn even if the buyer returns later.' },
  { icon: BarChart3, title: 'Real-Time Dashboard', description: 'Track clicks, conversions, and earnings in your affiliate dashboard.' },
  { icon: Globe, title: 'Global Audience', description: 'Flowbites serves buyers in 120+ countries. Your audience converts anywhere.' },
  { icon: Gift, title: 'Exclusive Promos', description: 'Access affiliate-exclusive discounts and promotions to boost conversions.' },
  { icon: Users, title: 'Dedicated Support', description: 'Our affiliate team helps you succeed with resources, tips, and fast support.' },
];

const idealFor = [
  'Web design bloggers and YouTubers',
  'No-code community leaders and educators',
  'Webflow, Framer, and Wix tutorial creators',
  'Freelance web designers recommending tools to clients',
  'Newsletter operators in the design and tech space',
  'Social media influencers in the design niche',
];

export default function AffiliatePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Share2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Flowbites Affiliate Program
          </h1>
          <p className="text-lg text-emerald-100 max-w-xl mx-auto mb-8">
            Earn 30% commission for every template sale you refer. Share templates you love and
            get paid for every purchase.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-lg"
          >
            Join the Program
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">{s.title}</h3>
              <p className="text-sm text-neutral-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">Program Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                  <b.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{b.title}</h3>
                <p className="text-sm text-neutral-500">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ideal For */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8">Who Is This For?</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {idealFor.map((item) => (
            <div key={item} className="flex items-center gap-3 p-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-neutral-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Calculator */}
      <div className="bg-emerald-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Zap className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Earnings Potential</h2>
          <p className="text-neutral-500 mb-8">
            See how much you could earn as a Flowbites affiliate.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-emerald-200">
              <p className="text-sm text-neutral-500 mb-1">10 sales/month</p>
              <p className="text-2xl font-bold text-emerald-600">$150</p>
              <p className="text-xs text-neutral-400 mt-1">avg. $50 template</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-emerald-200">
              <p className="text-sm text-neutral-500 mb-1">50 sales/month</p>
              <p className="text-2xl font-bold text-emerald-600">$750</p>
              <p className="text-xs text-neutral-400 mt-1">avg. $50 template</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-emerald-200">
              <p className="text-sm text-neutral-500 mb-1">200 sales/month</p>
              <p className="text-2xl font-bold text-emerald-600">$3,000</p>
              <p className="text-xs text-neutral-400 mt-1">avg. $50 template</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">When do I get paid?</h3>
            <p className="text-sm text-neutral-500">Payouts are processed monthly via Stripe. Minimum payout threshold is $50. You&apos;ll receive payment on the 15th of each month for the previous month&apos;s earnings.</p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">Do I need to be a Flowbites customer?</h3>
            <p className="text-sm text-neutral-500">No! Anyone can join the affiliate program. You just need a Flowbites account (free to create) to access your affiliate dashboard and referral link.</p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">Can I promote specific templates?</h3>
            <p className="text-sm text-neutral-500">Yes, you can create referral links to specific templates, categories, or the homepage. Deep linking helps you target your audience with relevant templates.</p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">Are there any restrictions?</h3>
            <p className="text-sm text-neutral-500">You cannot use paid ads that bid on the &ldquo;Flowbites&rdquo; brand name. Self-referrals are not allowed. All other marketing channels (blogs, social media, email, YouTube) are welcome.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-16 -mb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Earning Today</h2>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
            Sign up in minutes and start earning 30% commission on every sale you refer.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            Join the Affiliate Program
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
