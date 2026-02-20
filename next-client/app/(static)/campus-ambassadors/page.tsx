import Link from 'next/link';
import {
  GraduationCap, Megaphone, Gift, Users, Rocket, Globe,
  Star, Heart, Award, MessageSquare, Calendar,
  CheckCircle2, ArrowRight, Sparkles,
} from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Campus Ambassadors — Flowbites',
  description:
    'Represent Flowbites at your university. Host workshops, build community, earn commissions, and get free access to every template on the marketplace.',
  alternates: {
    canonical: '/campus-ambassadors',
  },
};

const perks = [
  {
    icon: Sparkles,
    title: 'Free Flowbites Pro',
    desc: 'Get free access to every template on the marketplace — worth $1,000+/year. Use them for personal projects, portfolios, and campus organizations.',
  },
  {
    icon: Gift,
    title: 'Exclusive Swag',
    desc: 'Ambassador welcome kit with branded hoodie, stickers, notebook, and tote bag. Plus seasonal drops throughout the year.',
  },
  {
    icon: Users,
    title: 'Private Community',
    desc: 'Join a private Slack with fellow ambassadors, the Flowbites team, and industry mentors. Get early access to features and direct feedback channels.',
  },
  {
    icon: Rocket,
    title: 'Career Boost',
    desc: 'LinkedIn recommendation from Flowbites leadership. Add "Campus Ambassador" to your resume. Get referrals to top design and tech companies.',
  },
  {
    icon: Award,
    title: 'Certifications',
    desc: 'Earn official Flowbites certifications in web design, no-code development, and template creation. Stand out in job applications.',
  },
  {
    icon: Globe,
    title: 'Revenue Share',
    desc: 'Earn 15% commission on every template sold through your referral link. Top ambassadors earn $500+/month while in school.',
  },
];

const responsibilities = [
  {
    icon: Megaphone,
    title: 'Host Workshops',
    desc: 'Organize 1-2 workshops per semester teaching web design with Flowbites templates. We provide presentation decks, demo accounts, and speaker guides.',
  },
  {
    icon: MessageSquare,
    title: 'Build Community',
    desc: 'Start a web design club or integrate Flowbites into existing design/tech communities on campus. Connect students with no-code tools.',
  },
  {
    icon: Heart,
    title: 'Create Content',
    desc: 'Share your Flowbites experience on social media, write blog posts, or create tutorial videos. Minimum 2 posts per month.',
  },
  {
    icon: Star,
    title: 'Give Feedback',
    desc: 'Be the voice of students. Share feedback on new features, report bugs, and help shape the product roadmap for education use cases.',
  },
];

const requirements = [
  'Currently enrolled as a full-time undergraduate or graduate student',
  'Passionate about web design, no-code tools, or UI/UX',
  'Active on at least one social platform (Twitter/X, Instagram, LinkedIn, TikTok)',
  'Comfortable speaking in front of groups and hosting workshops',
  'Available to commit 5-8 hours per month to ambassador activities',
  'Minimum GPA of 3.0 (or equivalent) — we want you to succeed academically first',
];

const timeline = [
  { step: '01', title: 'Apply Online', desc: 'Fill out the application form with your university, major, portfolio (if any), and why you want to be an ambassador.', duration: '5 minutes' },
  { step: '02', title: 'Video Interview', desc: 'Selected applicants have a casual 15-minute video call with our community team. Tell us about your campus and your ideas.', duration: '1 week' },
  { step: '03', title: 'Onboarding', desc: 'Accepted ambassadors join a 2-hour virtual onboarding session. Meet the team, get your swag kit, and set up your ambassador dashboard.', duration: '1 week' },
  { step: '04', title: 'Launch', desc: 'Host your first workshop, share your referral link, and start building the Flowbites community on your campus.', duration: 'Ongoing' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    university: 'Stanford University',
    quote: 'Being a Flowbites ambassador helped me land my internship at a top design agency. The workshops I hosted became the most popular events in our design club.',
    stat: '12 workshops hosted',
  },
  {
    name: 'Carlos Mendez',
    university: 'MIT',
    quote: 'I earned over $2,000 in referral commissions while helping 200+ students build their first professional websites. The community is incredibly supportive.',
    stat: '$2,400 earned',
  },
  {
    name: 'Aiko Tanaka',
    university: 'University of Tokyo',
    quote: 'Flowbites gave me the tools and confidence to teach web design to non-technical students. Now our entire business school uses templates for class projects.',
    stat: '200+ students reached',
  },
];

const faqs = [
  { q: 'How many ambassadors do you accept per campus?', a: 'We accept 1-3 ambassadors per university, depending on campus size. Large universities (10,000+ students) may have up to 3 ambassadors working together as a team.' },
  { q: 'Can I apply if I\'m not a design or CS student?', a: 'Absolutely! We welcome students from all majors. Business, marketing, communications, and liberal arts students bring valuable perspectives. You don\'t need to code.' },
  { q: 'What\'s the time commitment?', a: '5-8 hours per month. This includes hosting 1-2 workshops per semester, creating 2+ social media posts per month, and attending monthly ambassador calls.' },
  { q: 'Is the program paid?', a: 'The program itself isn\'t salaried, but you earn 15% commission on every template sold through your referral link, plus free access to all templates ($1,000+/year value), swag, certifications, and career opportunities.' },
  { q: 'Can international students apply?', a: 'Yes! The program is global. We have ambassadors at universities across 30+ countries. All onboarding and resources are available in English.' },
  { q: 'How long does the ambassadorship last?', a: 'Each cohort runs for one academic year (August\u2013May or September\u2013June depending on your country). High-performing ambassadors are automatically renewed and can become Senior Ambassadors.' },
];

const stats = [
  { value: '150+', label: 'Ambassadors' },
  { value: '80+', label: 'Universities' },
  { value: '30+', label: 'Countries' },
  { value: '10K+', label: 'Students Reached' },
];

export default function CampusAmbassadorsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold rounded-full mb-6">
            <GraduationCap className="w-4 h-4" />
            Flowbites for Education
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Become a Flowbites
            <br />
            <span className="text-primary-400">Campus Ambassador</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Represent Flowbites at your university. Host workshops, build community,
            earn commissions, and get free access to every template on the marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/education"
              className="inline-flex items-center px-8 py-3.5 border border-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Student Program
            </Link>
          </div>
          <p className="text-xs text-neutral-600 mt-4">
            Spring 2026 applications open — limited spots per campus
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-neutral-900">{s.value}</div>
                <div className="text-sm text-neutral-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Perks */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
            Ambassador Perks
          </h2>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Everything you get for being part of the program — no strings attached.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((p) => (
            <div key={p.title} className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">{p.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What You'll Do */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              What You&apos;ll Do
            </h2>
            <p className="text-neutral-500 max-w-lg mx-auto">
              Your mission: bring web design education to your campus and help students build beautiful websites.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {responsibilities.map((r) => (
              <div key={r.title} className="flex gap-4 p-6 bg-white border border-neutral-200 rounded-xl">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <r.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">{r.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-12">
          Who Can Apply
        </h2>
        <div className="space-y-3">
          {requirements.map((req, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-neutral-700">{req}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How to Apply Timeline */}
      <div className="bg-neutral-950 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold text-center mb-16">
            How to Apply
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {timeline.map((t) => (
              <div key={t.step} className="text-center">
                <span className="text-5xl font-bold text-primary-500/30 block mb-3">{t.step}</span>
                <h3 className="font-bold text-white text-lg mb-2">{t.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-3">{t.desc}</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 text-neutral-400 text-xs font-medium rounded-full">
                  <Calendar className="w-3 h-3" />
                  {t.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">
          Hear from Ambassadors
        </h2>
        <p className="text-neutral-500 text-center mb-12 max-w-lg mx-auto">
          Real students sharing their ambassador experience.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 bg-white border border-neutral-200 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">{t.name}</h3>
                  <p className="text-xs text-neutral-500">{t.university}</p>
                </div>
              </div>
              <blockquote className="text-sm text-neutral-600 leading-relaxed italic mb-4">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="pt-3 border-t border-neutral-100">
                <span className="text-xs font-semibold text-primary-600">{t.stat}</span>
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
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <GraduationCap className="w-10 h-10 text-primary-500 mx-auto mb-4" />
        <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
          Ready to Represent Flowbites on Campus?
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          Applications for the Spring 2026 cohort are now open. Limited spots per university — apply early.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/education"
            className="inline-flex items-center px-8 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Learn About Student Program
          </Link>
        </div>
      </div>
    </div>
  );
}
