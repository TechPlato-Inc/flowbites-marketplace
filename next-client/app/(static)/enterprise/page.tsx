import Link from 'next/link';
import { Building2, ShieldCheck, Users, Zap, Headphones, Lock, Globe, BarChart3, FileCheck, Layers } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Enterprise — Flowbites',
  description:
    'Unlimited licenses, dedicated support, custom terms, and volume pricing for agencies, enterprises, and growing teams who need premium templates at scale.',
  alternates: {
    canonical: '/enterprise',
  },
};

const benefits = [
  { icon: Layers, title: 'Unlimited Licenses', desc: 'Enterprise licenses cover unlimited projects, team members, and domains. No per-seat pricing. No per-project restrictions.' },
  { icon: Users, title: 'Team Workspaces', desc: "Centralized workspace for your entire team. Shared template library, unified billing, role-based access controls, and usage reporting." },
  { icon: ShieldCheck, title: 'Custom Legal Terms', desc: "Work with our legal team to create custom license agreements that meet your organization's compliance and IP requirements." },
  { icon: Lock, title: 'SSO & Security', desc: 'Enterprise SSO integration (SAML, OAuth), two-factor authentication, audit logs, and SOC 2 Type II compliance for regulated industries.' },
  { icon: Headphones, title: 'Dedicated Account Manager', desc: 'A named account manager who understands your business, provides onboarding support, and handles escalations directly.' },
  { icon: BarChart3, title: 'Usage Analytics', desc: 'Detailed reporting on template usage across your organization — which teams use what, license utilization, and cost optimization insights.' },
  { icon: Zap, title: 'Priority Access', desc: 'Early access to new templates, beta features, and AI tools. Your team gets first look at trending templates before they go public.' },
  { icon: Globe, title: 'Volume Discounts', desc: "Custom pricing based on your organization's scale. The more you buy, the more you save. Flexible annual or project-based billing." },
  { icon: FileCheck, title: 'Custom Template Development', desc: 'Need something specific? Our network of verified creators can build bespoke templates for your brand, design system, and requirements.' },
];

const logos = ['Fortune 500 Agencies', 'Y Combinator Startups', 'Design Studios', 'SaaS Companies', 'Digital Agencies', 'Marketing Teams'];

const useCases = [
  { title: 'Digital Agencies', desc: 'Use Flowbites templates as starting points for client projects. Deliver faster without sacrificing quality. Enterprise licenses let your entire team access the full library.', stat: '50%', statLabel: 'Faster Delivery' },
  { title: 'Enterprise Marketing', desc: 'Launch campaign landing pages, microsites, and product pages in days instead of months. Keep brand consistency with customizable templates across departments.', stat: '10x', statLabel: 'Faster to Market' },
  { title: 'Startup Programs', desc: 'Y Combinator, Techstars, and 500 Global portfolio companies get special startup pricing. Launch your MVP with a professional template in a weekend.', stat: '$0', statLabel: 'For Qualified Startups' },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold rounded-full mb-6">
            <Building2 className="w-4 h-4" />
            Enterprise
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Flowbites for Teams
            <br />
            <span className="text-neutral-400">&amp; Organizations</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Unlimited licenses, dedicated support, custom terms, and volume pricing for
            agencies, enterprises, and growing teams who need premium templates at scale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/help" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">Contact Sales</Link>
            <Link href="/pricing" className="inline-flex items-center px-8 py-3 border border-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors">View Pricing</Link>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          <p className="text-xs text-neutral-400 text-center mb-4 uppercase tracking-wider font-semibold">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {logos.map((name) => (<span key={name} className="text-sm font-semibold text-neutral-300">{name}</span>))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">Built for Scale</h2>
        <p className="text-neutral-500 text-center mb-16 max-w-lg mx-auto">Everything individual plans offer, plus enterprise-grade features for your organization.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">{b.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-12">Who Uses Enterprise?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((uc) => (
              <div key={uc.title} className="p-6 bg-white border border-neutral-200 rounded-xl">
                <div className="text-4xl font-bold text-primary-500 mb-1">{uc.stat}</div>
                <div className="text-xs text-neutral-500 mb-4">{uc.statLabel}</div>
                <h3 className="font-bold text-neutral-900 text-lg mb-2">{uc.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-12">Getting Started</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { num: '01', title: 'Talk to Sales', desc: "Tell us about your team size, use case, and requirements. We'll recommend the right plan." },
            { num: '02', title: 'Custom Agreement', desc: 'Our team prepares a custom license and pricing proposal tailored to your organization.' },
            { num: '03', title: 'Onboarding', desc: 'Your dedicated account manager sets up your team workspace, SSO, and access controls.' },
            { num: '04', title: 'Build & Scale', desc: 'Your team starts using templates immediately. Scale usage as your organization grows.' },
          ].map((s) => (
            <div key={s.num} className="text-center">
              <span className="text-4xl font-bold text-primary-200 block mb-3">{s.num}</span>
              <h3 className="font-bold text-neutral-900 mb-2">{s.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-neutral-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <Building2 className="w-8 h-8 text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Scale?</h2>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            Join hundreds of teams using Flowbites to build beautiful websites faster.
            Let&apos;s find the right plan for your organization.
          </p>
          <Link href="/help" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
            Contact Enterprise Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
