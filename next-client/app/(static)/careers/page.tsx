import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Laptop,
  Coffee,
  GraduationCap,
  Globe,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Careers — Flowbites',
  description:
    'Join the Flowbites team. We are a remote-first company building the future of the template marketplace. View open positions.',
  alternates: {
    canonical: '/careers',
  },
};

const openPositions = [
  { title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', description: 'Build the marketplace experience. React, TypeScript, Tailwind CSS. Help us create the best template shopping experience.' },
  { title: 'Backend Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', description: 'Scale our Node.js/Express APIs, optimize MongoDB queries, and build the infrastructure that powers Flowbites.' },
  { title: 'Product Designer', department: 'Design', location: 'Remote', type: 'Full-time', description: 'Design intuitive marketplace experiences for template creators and buyers. Figma, user research, and prototyping.' },
  { title: 'Template Quality Reviewer', department: 'Marketplace', location: 'Remote', type: 'Part-time', description: 'Review submitted templates for quality, performance, and design standards. Deep knowledge of Webflow, Framer, or Wix required.' },
  { title: 'Creator Community Manager', department: 'Community', location: 'Remote', type: 'Full-time', description: 'Build and nurture our creator community. Run events, create resources, and help creators succeed on Flowbites.' },
  { title: 'Growth Marketing Manager', department: 'Marketing', location: 'Remote', type: 'Full-time', description: 'Drive marketplace growth through SEO, content marketing, paid acquisition, and creator partnerships.' },
  { title: 'Customer Support Specialist', department: 'Support', location: 'Remote', type: 'Full-time', description: 'Help buyers and creators with template delivery, payments, and account issues. Be the voice of Flowbites.' },
  { title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', description: 'Manage our cloud infrastructure, CI/CD pipelines, and monitoring. Ensure Flowbites stays fast and reliable.' },
];

const perks = [
  { icon: Laptop, title: 'Remote First', description: 'Work from anywhere in the world. We\'re fully distributed.' },
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health insurance and wellness stipend.' },
  { icon: Coffee, title: 'Home Office Budget', description: '$1,500 annual budget for your home workspace setup.' },
  { icon: GraduationCap, title: 'Learning Budget', description: '$1,000/year for courses, conferences, and books.' },
  { icon: Globe, title: 'Team Retreats', description: 'Annual company retreat to connect with the team in person.' },
  { icon: Sparkles, title: 'Template Perk', description: 'Free access to all templates on Flowbites marketplace.' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Flowbites</h1>
          <p className="text-lg text-primary-100 max-w-xl mx-auto">
            Help us build the future of the template marketplace. We&apos;re a remote-first team
            passionate about empowering creators and builders.
          </p>
        </div>
      </div>

      {/* Perks */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Why work at Flowbites?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <perk.icon className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">{perk.title}</h3>
                <p className="text-sm text-neutral-500">{perk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Open Positions</h2>
          <p className="text-neutral-500 mb-8">{openPositions.length} open roles across the company</p>

          <div className="space-y-4">
            {openPositions.map((pos) => (
              <div
                key={pos.title}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 text-lg">{pos.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1">{pos.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                        <Briefcase className="w-3 h-3" />
                        {pos.department}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {pos.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {pos.type}
                      </span>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium shrink-0">
                    Apply
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-3">Don&apos;t see a role that fits?</h2>
        <p className="text-neutral-500 mb-6 max-w-lg mx-auto">
          We&apos;re always looking for talented people. Send us your resume and tell us how you&apos;d like
          to contribute to Flowbites.
        </p>
        <a
          href="mailto:careers@flowbites.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
        >
          Send General Application
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
