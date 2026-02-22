import Link from "next/link";
import {
  HelpCircle,
  ShoppingCart,
  Palette,
  CreditCard,
  Download,
  Scale,
  MessageCircle,
  Search,
  ChevronRight,
  Mail,
} from "lucide-react";

export const dynamic = "force-static";

export const metadata = {
  title: "Frequently Asked Questions — Flowbites",
  description:
    "Find answers to common questions about Flowbites templates, licensing, support, and more.",
  alternates: {
    canonical: "/help",
  },
};

const categories = [
  {
    icon: ShoppingCart,
    title: "Getting Started",
    description: "Learn how to purchase and use Flowbites templates",
    articles: [
      "How do I purchase a template?",
      "What platforms do you support?",
      "How do I access my purchased templates?",
      "Do I need a Webflow account?",
      "Can I try templates before buying?",
    ],
  },
  {
    icon: Scale,
    title: "Licensing",
    description: "Understanding how you can use our templates",
    articles: [
      "What license types are available?",
      "Can I use templates for client projects?",
      "Can I resell the templates?",
      "What is the difference between Personal and Commercial licenses?",
      "Do licenses include future updates?",
    ],
  },
  {
    icon: Download,
    title: "Template Delivery",
    description: "How to get and use your templates",
    articles: [
      "How do I clone a Webflow template?",
      "How do I access Figma files?",
      "Can I download source files?",
      "How do I get template updates?",
      "What if I need help customizing?",
    ],
  },
  {
    icon: Palette,
    title: "Customization",
    description: "Making the template your own",
    articles: [
      "Do I need coding knowledge?",
      "Can I customize colors and fonts?",
      "How do I add my own content?",
      "Are the templates responsive?",
      "Can I remove Flowbites branding?",
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & Refunds",
    description: "Billing and payment information",
    articles: [
      "What payment methods do you accept?",
      "Is my payment information secure?",
      "Can I get a refund?",
      "Do you offer discounts?",
      "How do I get an invoice?",
    ],
  },
  {
    icon: MessageCircle,
    title: "Support",
    description: "Getting help when you need it",
    articles: [
      "How do I contact support?",
      "What does support cover?",
      "How quickly do you respond?",
      "Do you offer custom development?",
      "Where can I find documentation?",
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Find answers to common questions about Flowbites templates,
            licensing, and support.
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
            <div
              key={cat.title}
              className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
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
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Popular Topics
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                q: "How do I clone a Webflow template after purchase?",
                a: 'After purchasing, go to your dashboard and click "Clone to Webflow." This will open the template in your Webflow workspace where you can customize it.',
              },
              {
                q: "What's the difference between license types?",
                a: "Personal licenses are for non-commercial use, Commercial licenses are for one client/business project, and Extended licenses allow unlimited projects and white-labeling.",
              },
              {
                q: "How do creator payouts work?",
                a: "Creators earn a percentage of each sale. Payouts are processed monthly via Stripe Connect. You need to set up your Stripe Connect account in your creator dashboard.",
              },
              {
                q: "Can I get a refund on a purchased template?",
                a: "Refund requests are handled within 14 days of purchase on a case-by-case basis. If the template doesn't match its description or is non-functional, you'll receive a full refund.",
              },
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
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            Still need help?
          </h2>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is
            here to help you with any questions about Flowbites Marketplace.
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
