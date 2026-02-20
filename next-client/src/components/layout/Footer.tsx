import Link from 'next/link';
import { Logo } from '@/design-system';

const FOOTER_COLUMNS = [
  {
    title: 'For Buyers',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/templates', label: 'Browse Templates' },
      { href: '/services', label: 'Hire a Creator' },
      { href: '/templates?platform=webflow', label: 'Webflow Templates' },
      { href: '/templates?platform=framer', label: 'Framer Templates' },
      { href: '/templates?platform=wix', label: 'Wix Templates' },
      { href: '/licenses', label: 'Licenses' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/enterprise', label: 'Enterprise' },
    ],
  },
  {
    title: 'For Creators',
    links: [
      { href: '/become-creator', label: 'Become a Creator' },
      { href: '/dashboard/creator/upload-template', label: 'Sell a Template' },
      { href: '/dashboard/creator/create-service', label: 'Offer Services' },
      { href: '/affiliate', label: 'Affiliate Program' },
      { href: '/creator-guidelines', label: 'Creator Guidelines' },
      { href: '/community', label: 'Creator Community' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/help', label: 'Help & Support' },
      { href: '/blog', label: 'Blog' },
      { href: '/ui-shorts', label: 'UI Shorts' },
      { href: '/success-stories', label: 'Success Stories' },
      { href: '/updates', label: "What's New" },
      { href: '/ai', label: 'AI Overview' },
      { href: '/education', label: 'Students' },
      { href: '/campus-ambassadors', label: 'Campus Ambassadors' },
      { href: '/sitemap', label: 'Sitemap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/careers', label: 'Careers' },
      { href: '/trust-safety', label: 'Trust & Safety' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/cookies', label: 'Cookie Policy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      {/* Main footer links */}
      <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Brand column */}
          <div className="col-span-2">
            <div className="mb-4">
              <Logo size="md" variant="light" />
            </div>
            <p className="text-xs text-neutral-500 mb-4 max-w-xs">
              The premium marketplace for Webflow, Framer &amp; Wix templates. Built by world-class
              creators, curated for quality.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance badges */}
      <div className="border-t border-neutral-800">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6 md:gap-8">
              {/* ISO */}
              <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-80 transition-opacity">
                <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400" />
                  <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1" className="text-neutral-500" />
                  <path d="M12 16h16M12 24h16M14 12a18 18 0 000 16M26 12a18 18 0 010 16" stroke="currentColor" strokeWidth="1" className="text-neutral-500" />
                </svg>
                <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">ISO</span>
              </div>
              {/* GDPR */}
              <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-80 transition-opacity">
                <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400" />
                  <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1" className="text-neutral-500" />
                  <path d="M15 20l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400" />
                </svg>
                <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">GDPR</span>
              </div>
              {/* SOC 2 */}
              <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-80 transition-opacity">
                <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
                  <rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400" />
                  <text x="20" y="18" textAnchor="middle" className="text-neutral-400" fill="currentColor" fontSize="7" fontWeight="bold">AICPA</text>
                  <text x="20" y="28" textAnchor="middle" className="text-neutral-400" fill="currentColor" fontSize="8" fontWeight="bold">SOC2</text>
                </svg>
              </div>
              {/* CCPA */}
              <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-80 transition-opacity">
                <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400" />
                  <path d="M20 10v4M20 26v4M10 20h4M26 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-500" />
                  <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400" />
                </svg>
                <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">CCPA</span>
              </div>
            </div>

            <div className="w-full max-w-xs border-t border-neutral-800" />

            {/* AI Summary link */}
            <Link
              href="/ai"
              className="group flex items-center gap-3 px-5 py-2.5 rounded-full border border-neutral-800 hover:border-neutral-600 transition-colors"
            >
              <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                Get an AI summary of Flowbites
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-5">
            <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity">
              <img src="/logo.png" alt="Flowbites" className="h-8 w-8 object-cover object-left" />
            </Link>

            {/* Social icons */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-neutral-500 hover:text-white transition-colors" aria-label="X">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-neutral-500 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a href="#" className="text-neutral-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="text-neutral-500 hover:text-white transition-colors" aria-label="YouTube">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            {/* System status */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-sm text-neutral-400">All systems operational</span>
            </div>

            <p className="text-xs text-neutral-600">
              &copy; {new Date().getFullYear()} Flowbites, a TechPlato, Inc. Brand. Trademarks and
              brands are the property of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
