import Link from 'next/link';
import { Check, HelpCircle, Sparkles } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Pricing — Flowbites',
  description:
    'Simple, transparent pricing. No subscriptions. No hidden fees. Pay once per template, get lifetime access. Creators keep 70% of every sale.',
  alternates: {
    canonical: '/pricing',
  },
};

const buyerPlans = [
  { name: 'Personal', price: 'Included', priceNote: 'with every template', desc: 'For personal projects, portfolios, and non-commercial use.', features: ['Use in a single personal project', 'Lifetime access to template files', 'Free updates from the creator', 'Basic support'], cta: 'Browse Templates', ctaLink: '/templates', highlight: false },
  { name: 'Commercial', price: '+$20–40', priceNote: 'on top of base price', desc: 'For client projects, startups, and businesses generating revenue.', features: ['Use in a single commercial project', 'Client project delivery allowed', 'Lifetime access to template files', 'Free updates from the creator', 'Priority support'], cta: 'Browse Templates', ctaLink: '/templates', highlight: true },
  { name: 'Extended', price: '+$80–200', priceNote: 'on top of base price', desc: 'For SaaS products, resale applications, and large-scale commercial use.', features: ['Use in unlimited commercial projects', 'SaaS & end-product distribution allowed', 'White-label rights', 'Lifetime access to template files', 'Free updates from the creator', 'Dedicated support'], cta: 'Browse Templates', ctaLink: '/templates', highlight: false },
];

const creatorBenefits = [
  { label: 'Revenue share', value: '70%', desc: 'You keep 70% of every sale' },
  { label: 'Monthly payouts', value: 'Free', desc: 'Via Stripe direct deposit' },
  { label: 'Listing fee', value: '$0', desc: 'No cost to list your templates' },
  { label: 'Template limit', value: 'Unlimited', desc: 'Upload as many as you want' },
];

const faqs = [
  { q: 'Is there a subscription or monthly fee for buyers?', a: 'No. Flowbites uses a one-time purchase model. You pay once per template and get lifetime access — no recurring charges, no subscription required.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and bank transfers in select regions. All payments are processed securely through Stripe.' },
  { q: 'Can I upgrade my license later?', a: 'Yes. If you initially purchase a Personal license and later need a Commercial or Extended license, you can upgrade by paying the difference. Contact our support team to process the upgrade.' },
  { q: 'How do creator payouts work?', a: 'Creators receive 70% of every sale. Payouts are processed monthly via Stripe direct deposit to your bank account. Minimum payout threshold is $50. You can track all earnings in your creator dashboard.' },
  { q: 'Are there any hidden fees?', a: 'None. Buyers pay the listed price. Creators pay 0% listing fee and receive 70% of each sale. The 30% platform fee covers payment processing, hosting, support, and marketing. No surprise charges.' },
  { q: 'Do you offer refunds?', a: "Yes. We offer a 14-day refund policy for templates that don't match their description, have critical bugs, or where the delivery method fails. See our refund policy for full details." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            No subscriptions. No hidden fees. Pay once per template, get lifetime access.
            Creators keep 70% of every sale.
          </p>
        </div>
      </div>

      {/* Buyer License Tiers */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">License Tiers for Buyers</h2>
        <p className="text-neutral-500 text-center mb-12 max-w-lg mx-auto">Every template comes with a Personal license. Upgrade to Commercial or Extended based on your project.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {buyerPlans.map((plan) => (
            <div key={plan.name} className={`relative p-6 rounded-xl border-2 ${plan.highlight ? 'border-primary-500 bg-white shadow-lg' : 'border-neutral-200 bg-white'}`}>
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary-500 text-white text-xs font-semibold rounded-full">Most Popular</span>
              )}
              <h3 className="text-lg font-bold text-neutral-900 mb-1">{plan.name}</h3>
              <div className="mb-1"><span className="text-3xl font-bold text-neutral-900">{plan.price}</span></div>
              <p className="text-xs text-neutral-400 mb-4">{plan.priceNote}</p>
              <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-neutral-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.ctaLink} className={`block text-center py-2.5 text-sm font-semibold rounded-lg transition-colors ${plan.highlight ? 'bg-primary-500 text-white hover:bg-primary-600' : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-neutral-400 mt-6">
          Need a custom license for enterprise use?{' '}
          <Link href="/enterprise" className="text-primary-500 hover:underline">Contact our enterprise team</Link>.
        </p>
      </div>

      {/* Creator Pricing */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">Creator Pricing</h2>
          <p className="text-neutral-500 text-center mb-12 max-w-lg mx-auto">Zero upfront costs. Sell as many templates as you want. Get paid monthly.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {creatorBenefits.map((b) => (
              <div key={b.label} className="text-center p-6 bg-white border border-neutral-200 rounded-xl">
                <div className="text-3xl font-bold text-primary-600 mb-1">{b.value}</div>
                <div className="text-sm font-semibold text-neutral-900 mb-1">{b.label}</div>
                <div className="text-xs text-neutral-500">{b.desc}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/become-creator" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              Start Selling Templates
            </Link>
          </div>
        </div>
      </div>

      {/* Compare */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-12">License Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 pr-4 text-neutral-500 font-medium">Feature</th>
                <th className="text-center py-3 px-4 text-neutral-900 font-semibold">Personal</th>
                <th className="text-center py-3 px-4 text-primary-600 font-semibold">Commercial</th>
                <th className="text-center py-3 px-4 text-neutral-900 font-semibold">Extended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[
                { feature: 'Number of projects', personal: '1', commercial: '1', extended: 'Unlimited' },
                { feature: 'Personal use', personal: true, commercial: true, extended: true },
                { feature: 'Commercial use', personal: false, commercial: true, extended: true },
                { feature: 'Client projects', personal: false, commercial: true, extended: true },
                { feature: 'SaaS / end-product', personal: false, commercial: false, extended: true },
                { feature: 'White-label rights', personal: false, commercial: false, extended: true },
                { feature: 'Lifetime updates', personal: true, commercial: true, extended: true },
                { feature: 'Support level', personal: 'Basic', commercial: 'Priority', extended: 'Dedicated' },
              ].map((row) => (
                <tr key={row.feature}>
                  <td className="py-3 pr-4 text-neutral-700">{row.feature}</td>
                  {[row.personal, row.commercial, row.extended].map((val, i) => (
                    <td key={i} className="text-center py-3 px-4">
                      {typeof val === 'boolean' ? (
                        val ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-neutral-300">&mdash;</span>
                      ) : (
                        <span className="text-neutral-700">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-xs text-neutral-400 mt-6">
          See full license details on our <Link href="/licenses" className="text-primary-500 hover:underline">Licenses page</Link>.
        </p>
      </div>

      {/* FAQ */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <HelpCircle className="w-5 h-5 text-primary-500" />
            <h2 className="font-display text-2xl font-bold text-neutral-900">Pricing FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-5 bg-white border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-2 text-sm">{faq.q}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-neutral-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <Sparkles className="w-8 h-8 text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-neutral-400 mb-8">Browse premium templates or start selling — no subscriptions, no hidden fees.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/templates" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">Browse Templates</Link>
            <Link href="/become-creator" className="inline-flex items-center px-8 py-3 border border-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors">Become a Creator</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
