import Link from 'next/link';
import { Shield, Lock, Eye, CreditCard, FileCheck, AlertTriangle, Users, Scale } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Trust & Safety — Flowbites',
  description:
    'Your security and satisfaction are our top priorities. Learn how Flowbites protects buyers, creators, and the integrity of the marketplace.',
  alternates: {
    canonical: '/trust-safety',
  },
};

const pillars = [
  { icon: Lock, title: 'Secure Payments', desc: 'All transactions are processed through Stripe with PCI DSS Level 1 compliance. We never store credit card details on our servers. Every payment is encrypted end-to-end.' },
  { icon: FileCheck, title: 'Quality Review', desc: 'Every template undergoes manual quality review before it goes live. Our team checks design quality, code standards, responsiveness, performance, and browser compatibility.' },
  { icon: Eye, title: 'Transparent Licensing', desc: "Clear, simple license terms protect both buyers and creators. You always know exactly what you can and can't do with a purchased template." },
  { icon: CreditCard, title: '14-Day Refund Policy', desc: "If a template doesn't match its description, has critical bugs, or the delivery link doesn't work, we'll issue a full refund within 14 days of purchase." },
  { icon: Users, title: 'Verified Creators', desc: 'Every creator goes through an identity verification process. We verify their portfolio, experience, and identity before they can sell on the platform.' },
  { icon: Scale, title: 'Fair Dispute Resolution', desc: 'If an issue arises between a buyer and creator, our support team mediates. We review evidence from both sides and reach a fair resolution.' },
];

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <Shield className="w-12 h-12 text-primary-400 mx-auto mb-6" />
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Trust &amp; Safety
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Your security and satisfaction are our top priorities. Here&apos;s how we protect
            buyers, creators, and the integrity of the Flowbites marketplace.
          </p>
        </div>
      </div>

      {/* Pillars */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div key={p.title} className="p-6 border border-neutral-200 rounded-xl">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">{p.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* For Buyers */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-12">
            How We Protect Buyers
          </h2>
          <div className="space-y-6">
            {[
              { title: 'Every template is manually reviewed', desc: "Before a template appears on the marketplace, our quality team checks it for design quality, code standards, responsiveness, performance, and functionality. Templates that don't meet our standards are sent back with feedback." },
              { title: 'Live demos you can trust', desc: "Every template listing includes a live demo URL that accurately represents what you'll receive. We verify that demos match the actual template and flag any discrepancies." },
              { title: 'Secure, instant delivery', desc: 'After purchase, you receive immediate access to your template via a secure download link, Webflow clone link, or Framer remix link. No waiting, no manual fulfillment.' },
              { title: 'Refunds when things go wrong', desc: 'If a template is significantly different from its listing, has critical bugs that make it unusable, or the delivery method fails, we issue full refunds within 14 days.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 bg-white border border-neutral-200 rounded-xl">
                <Shield className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Creators */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-12">
          How We Protect Creators
        </h2>
        <div className="space-y-6">
          {[
            { title: 'License enforcement', desc: "Our licensing system ensures buyers use templates within the terms of their purchased license. Each purchase generates a unique license key tied to the buyer's account." },
            { title: 'Intellectual property protection', desc: 'Creators retain full ownership of their templates. If we detect unauthorized redistribution, we take swift action including DMCA takedowns and account suspension.' },
            { title: 'Reliable payments', desc: 'Creators receive 70% of every sale, paid monthly via Stripe direct deposit. Payment processing is transparent, with full reporting in the creator dashboard.' },
            { title: 'Fair review process', desc: 'Template reviews are conducted by experienced designers. If your template is rejected, you receive detailed, actionable feedback so you can improve and resubmit.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-5 bg-white border border-neutral-200 rounded-xl">
              <Shield className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report */}
      <div className="bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-neutral-900 mb-2">
            Report a Problem
          </h2>
          <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
            If you encounter a security issue, fraudulent listing, or license violation,
            please report it immediately. We investigate all reports within 24 hours.
          </p>
          <Link href="/help" className="inline-flex items-center px-6 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">
            Contact Trust &amp; Safety Team
          </Link>
        </div>
      </div>
    </div>
  );
}
