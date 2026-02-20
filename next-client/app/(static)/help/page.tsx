import Link from 'next/link';
import {
  HelpCircle,
  ShoppingCart,
  Upload,
  CreditCard,
  Download,
  UserCircle,
  MessageCircle,
  Scale,
  Search,
  ChevronRight,
  Mail,
} from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Help Center — Flowbites',
  description:
    'Find answers about buying templates, selling on Flowbites, payments, licenses, and more. Browse help articles or contact support.',
  alternates: {
    canonical: '/help',
  },
};

const categories = [
  {
    icon: ShoppingCart,
    title: 'Buying Templates',
    description: 'How to browse, purchase, and access templates',
    articles: [
      'How to purchase a template',
      'Accessing your purchased templates',
      'Cloning a Webflow template',
      'Remixing a Framer template',
      'Downloading Wix template files',
      'Understanding license types',
    ],
  },
  {
    icon: Upload,
    title: 'Selling on Flowbites',
    description: 'Everything about uploading and selling your templates',
    articles: [
      'How to become a creator',
      'Uploading your first template',
      'Setting up clone and remix links',
      'Pricing your templates',
      'Template review process',
      'Creator dashboard overview',
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    description: 'Purchases, refunds, and creator payouts',
    articles: [
      'Accepted payment methods',
      'How to request a refund',
      'Creator payout schedule',
      'Setting up Stripe Connect',
      'Tax information and invoices',
      'Failed payment troubleshooting',
    ],
  },
  {
    icon: Download,
    title: 'Template Delivery',
    description: 'How templates are delivered across platforms',
    articles: [
      'Webflow clone link delivery',
      'Framer remix link delivery',
      'Wix file download process',
      'Re-accessing purchased templates',
      'Template not working — troubleshooting',
      'Contacting the template creator',
    ],
  },
  {
    icon: UserCircle,
    title: 'Account & Settings',
    description: 'Managing your Flowbites account',
    articles: [
      'Creating your account',
      'Updating your profile',
      'Changing your password',
      'Email notification settings',
      'Deleting your account',
      'Two-factor authentication',
    ],
  },
  {
    icon: Scale,
    title: 'Licenses & Legal',
    description: 'Understanding template licenses and usage rights',
    articles: [
      'Personal vs Commercial vs Extended license',
      'Can I use a template for a client?',
      'Multi-site usage rules',
      'DMCA and copyright claims',
      'Reporting a policy violation',
      'Terms of Service overview',
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Find answers about buying templates, selling on Flowbites, payments, licenses, and more.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-neutral-900 bg-white shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.title} className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <cat.icon className="w-5 h-5 text-primary-500" />
                </div>
                <h2 className="font-semibold text-neutral-900">{cat.title}</h2>
              </div>
              <p className="text-sm text-neutral-500 mb-4">{cat.description}</p>
              <ul className="space-y-2">
                {cat.articles.map((article) => (
                  <li key={article}>
                    <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-500 transition-colors w-full text-left">
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      {article}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular Topics */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Popular Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: 'How do I clone a Webflow template after purchase?', a: 'After purchasing, go to your dashboard and click "Clone to Webflow." This will open the template in your Webflow workspace where you can customize it.' },
              { q: "What's the difference between license types?", a: 'Personal licenses are for non-commercial use, Commercial licenses are for one client/business project, and Extended licenses allow unlimited projects and white-labeling.' },
              { q: 'How do creator payouts work?', a: 'Creators earn a percentage of each sale. Payouts are processed monthly via Stripe Connect. You need to set up your Stripe Connect account in your creator dashboard.' },
              { q: 'Can I get a refund on a purchased template?', a: "Refund requests are handled within 14 days of purchase on a case-by-case basis. If the template doesn't match its description or is non-functional, you'll receive a full refund." },
            ].map((item, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-5">
                <h3 className="font-medium text-neutral-900 mb-2">{item.q}</h3>
                <p className="text-sm text-neutral-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-neutral-50 rounded-2xl p-8 md:p-12 text-center">
          <MessageCircle className="w-10 h-10 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Still need help?</h2>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any
            questions about Flowbites Marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:support@flowbites.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Community Forum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
