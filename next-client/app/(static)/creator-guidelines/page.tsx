import Link from 'next/link';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Creator Guidelines — Flowbites',
  description:
    'Quality standards and best practices for creating templates that sell well on Flowbites. Follow these guidelines to get approved quickly.',
  alternates: {
    canonical: '/creator-guidelines',
  },
};

export default function CreatorGuidelinesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-7 h-7 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">Creator Resources</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Creator Guidelines
          </h1>
          <p className="text-neutral-400 text-base md:text-lg max-w-2xl leading-relaxed">
            Quality standards and best practices for creating templates that sell well on Flowbites.
            Follow these guidelines to get your templates approved quickly and maximize sales.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Design Quality */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">Design Quality Standards</h2>
          <div className="space-y-3">
            {[
              'Professional, modern design with consistent visual language',
              'Responsive across all breakpoints — desktop, tablet, and mobile',
              'Proper typography hierarchy with readable font sizes and line heights',
              'Consistent spacing system using a 4px or 8px grid',
              'High-quality placeholder images (not blurry, not watermarked)',
              'Thoughtful color palette with accessible contrast ratios (WCAG AA)',
              'Clean interactions and hover states for all interactive elements',
              'Working navigation with mobile hamburger menu',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-600">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Requirements */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">Technical Requirements</h2>
          <div className="space-y-4 text-[15px] text-neutral-600 leading-relaxed">
            <p><strong>Performance.</strong> Templates must score 80+ on Google Lighthouse for both mobile and desktop. Optimize images (WebP preferred), minimize custom code, and avoid render-blocking resources.</p>
            <p><strong>Clean Structure.</strong> Use organized class naming (Client-First or similar convention). Avoid deeply nested elements, redundant classes, and inline styles. The cleaner your structure, the easier it is for buyers to customize.</p>
            <p><strong>CMS Architecture.</strong> If your template uses CMS, collections must be well-organized with descriptive field names and helpful field descriptions. Test with realistic data volumes (at least 10+ items per collection).</p>
            <p><strong>Browser Compatibility.</strong> Templates must work in the latest versions of Chrome, Firefox, Safari, and Edge. Test on both Mac and Windows if possible.</p>
            <p><strong>Custom Code.</strong> Minimize custom JavaScript. If your template requires custom code, it must be well-commented and documented in your setup guide.</p>
          </div>
        </section>

        {/* What Not To Do */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">What Will Get Your Template Rejected</h2>
          <div className="space-y-3">
            {[
              'Copied or heavily derivative designs from existing templates or websites',
              'Broken layouts on mobile devices or common screen sizes',
              "Placeholder text that hasn't been replaced with realistic content",
              'Missing pages listed in the navigation (404 links)',
              "No demo URL or a demo URL that doesn't work",
              'Stock images with visible watermarks',
              'Excessive custom code that could be done natively in the platform',
              'Templates that contain malicious code, tracking scripts, or affiliate links',
              "Misleading descriptions that don't match the actual template",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-red-50/50 border border-red-100 rounded-lg">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-600">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Listing Requirements */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">Listing Requirements</h2>
          <div className="space-y-4 text-[15px] text-neutral-600 leading-relaxed">
            <p><strong>Title.</strong> Clear, descriptive title that includes the template name and primary use case. Example: &ldquo;Nova — AI Startup Landing Page&rdquo; or &ldquo;Horizon — Architecture Portfolio&rdquo;.</p>
            <p><strong>Description.</strong> Detailed description covering: what the template is for, key features and pages included, CMS structure, customization options, and any technical requirements.</p>
            <p><strong>Thumbnail.</strong> High-quality thumbnail (1200x900px minimum) showing the template&apos;s homepage. Use a clean mockup or browser frame — no excessive text overlays or badges.</p>
            <p><strong>Gallery.</strong> At least 3 gallery images showing different pages and responsive views. Include mobile screenshots, key sections, and CMS views.</p>
            <p><strong>Demo URL.</strong> A live, working demo URL that showcases the template with realistic content. The demo should load quickly and be accessible without login.</p>
            <p><strong>Pricing.</strong> Set fair pricing based on template complexity. Simple landing pages: $19-39. Multi-page marketing sites: $39-79. Complex CMS-driven sites: $79-149. Enterprise templates: $149+.</p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
          <h2 className="font-display text-xl font-bold text-neutral-900 mb-2">Ready to Submit?</h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Follow these guidelines and your template will sail through the review process.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard/creator/upload-template" className="inline-flex items-center px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              Upload a Template
            </Link>
            <Link href="/help" className="inline-flex items-center px-6 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-lg hover:bg-neutral-100 transition-colors">
              Get Help
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
