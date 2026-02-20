import Link from 'next/link';
import {
  GraduationCap, BookOpen, Users, Zap, Globe, Award,
  CheckCircle2, ArrowRight, Sparkles, Code, Palette, Briefcase,
} from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Education — Flowbites',
  description:
    'Free premium templates, 50% student discount, certifications, and a community of 5,000+ students learning web design. Verified students at any accredited university qualify.',
  alternates: {
    canonical: '/education',
  },
};

const benefits = [
  {
    icon: Sparkles,
    title: 'Free Templates for Students',
    desc: 'Verified students get 3 free premium templates per semester for personal and academic projects. Build your portfolio without spending a dime.',
  },
  {
    icon: Code,
    title: '50% Off All Purchases',
    desc: 'Student-verified accounts get 50% off every template purchase on the marketplace. Stack with creator sales for even bigger savings.',
  },
  {
    icon: BookOpen,
    title: 'Learning Resources',
    desc: 'Access our full library of tutorials, courses, and guides on Webflow, Framer, and Wix Studio. Learn no-code web design from scratch.',
  },
  {
    icon: Award,
    title: 'Certifications',
    desc: 'Earn free Flowbites certifications in web design, no-code development, and template customization. Add them to your LinkedIn profile.',
  },
  {
    icon: Users,
    title: 'Student Community',
    desc: 'Join 5,000+ students in our Discord community. Share projects, get feedback, find collaborators, and connect with industry professionals.',
  },
  {
    icon: Briefcase,
    title: 'Career Opportunities',
    desc: 'Access our job board with internships and entry-level positions at design agencies, startups, and tech companies that use Flowbites.',
  },
];

const programs = [
  {
    title: 'Student Program',
    badge: 'Free',
    desc: 'For any enrolled student who wants to learn web design and build projects with premium templates.',
    features: [
      '3 free templates per semester',
      '50% off all template purchases',
      'Access to learning resources',
      'Student community access',
      'Free certifications',
    ],
    cta: 'Verify Student Status',
    ctaLink: '/register',
    highlight: false,
  },
  {
    title: 'Campus Ambassador',
    badge: 'Apply',
    desc: 'For student leaders who want to represent Flowbites, host workshops, and earn while they learn.',
    features: [
      'Everything in Student Program',
      'Free access to ALL templates',
      'Exclusive swag & welcome kit',
      '15% referral commission',
      'Career recommendations',
      'Private ambassador community',
    ],
    cta: 'Apply to be Ambassador',
    ctaLink: '/campus-ambassadors',
    highlight: true,
  },
  {
    title: 'Educator Program',
    badge: 'Free',
    desc: 'For professors and instructors who want to use Flowbites templates in their web design or marketing courses.',
    features: [
      'Free classroom license (30 seats)',
      'Curriculum templates & lesson plans',
      'Bulk student verification',
      'Dedicated education support',
      'Guest speaker opportunities',
    ],
    cta: 'Apply as Educator',
    ctaLink: '/help',
    highlight: false,
  },
];

const universities = [
  'Stanford', 'MIT', 'Harvard', 'UC Berkeley', 'Georgia Tech',
  'University of Michigan', 'NYU', 'Carnegie Mellon', 'UCLA', 'UT Austin',
  'University of Toronto', 'Imperial College', 'NUS Singapore', 'TU Munich',
  'IIT Bombay', 'University of Tokyo',
];

const useCases = [
  {
    icon: Palette,
    title: 'Portfolio Projects',
    desc: 'Use premium templates as a starting point for your portfolio website. Customize it to showcase your work and stand out to recruiters.',
  },
  {
    icon: Briefcase,
    title: 'Class Projects',
    desc: 'Build real websites for marketing, entrepreneurship, and design classes. Templates help you focus on content strategy instead of coding from scratch.',
  },
  {
    icon: Globe,
    title: 'Student Organizations',
    desc: 'Launch professional websites for clubs, student government, hackathons, and campus events. Look professional without a budget.',
  },
  {
    icon: Zap,
    title: 'Startup MVPs',
    desc: 'Building a startup for a competition or accelerator? Use a SaaS or landing page template to launch your MVP in a weekend.',
  },
];

const faqs = [
  { q: 'How do I verify my student status?', a: 'Sign up with your .edu email address (or country equivalent). We use SheerID for instant verification. If your university isn\'t recognized, contact support with your enrollment documentation.' },
  { q: 'Which universities are eligible?', a: 'Any accredited college or university worldwide. Community colleges, trade schools, and bootcamps with accredited programs also qualify.' },
  { q: 'How long does the student discount last?', a: 'Your student benefits are active as long as you can verify active enrollment. Re-verify each academic year (August or September). Benefits end 6 months after graduation.' },
  { q: 'Can I use student templates for commercial projects?', a: 'Free student templates come with a Personal license for academic and personal use only. If you need a Commercial license, use your 50% student discount to purchase one.' },
  { q: 'I\'m a professor. How does the classroom license work?', a: 'Apply through the Educator Program. Once approved, you get a classroom code that gives up to 30 students free access to selected templates for the semester. We also provide curriculum resources.' },
];

export default function EducationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold rounded-full mb-6">
            <GraduationCap className="w-4 h-4" />
            Education
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Students Get Flowbites
            <br />
            <span className="text-primary-400">for Free</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Free premium templates, 50% student discount, certifications, and a community
            of 5,000+ students learning web design. Verified students at any accredited university qualify.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Verify Student Status
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/campus-ambassadors"
              className="inline-flex items-center px-8 py-3.5 border border-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Become an Ambassador
            </Link>
          </div>
        </div>
      </div>

      {/* University Ticker */}
      <div className="bg-neutral-50 border-b border-neutral-200 py-6 overflow-hidden">
        <p className="text-[10px] text-neutral-400 text-center uppercase tracking-widest font-semibold mb-3">
          Students from 80+ universities worldwide
        </p>
        <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 max-w-4xl mx-auto px-4">
          {universities.map((u) => (
            <span key={u} className="text-xs font-medium text-neutral-400 whitespace-nowrap">
              {u}
            </span>
          ))}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">
          Student Benefits
        </h2>
        <p className="text-neutral-500 text-center mb-16 max-w-lg mx-auto">
          Everything you need to learn web design and build professional websites — at no cost.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">{b.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Programs Comparison */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">
            Choose Your Program
          </h2>
          <p className="text-neutral-500 text-center mb-12 max-w-lg mx-auto">
            Three programs for students and educators at every level.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {programs.map((p) => (
              <div
                key={p.title}
                className={`relative p-6 rounded-xl border-2 bg-white ${
                  p.highlight ? 'border-primary-500 shadow-lg' : 'border-neutral-200'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary-500 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-bold text-neutral-900">{p.title}</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                    {p.badge}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{p.desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-neutral-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.ctaLink}
                  className={`block text-center py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    p.highlight
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">
          What Students Build
        </h2>
        <p className="text-neutral-500 text-center mb-12 max-w-lg mx-auto">
          From class assignments to startup launches — here&apos;s how students use Flowbites.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((uc) => (
            <div key={uc.title} className="flex gap-4 p-6 bg-white border border-neutral-200 rounded-xl">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <uc.icon className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 mb-1">{uc.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{uc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-2xl font-bold text-neutral-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
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
          <GraduationCap className="w-10 h-10 text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-4">Start Building for Free</h2>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            Verify your student status in 30 seconds and get instant access to free templates,
            discounts, and the student community.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
