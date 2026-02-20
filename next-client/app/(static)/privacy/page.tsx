import { Shield } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Privacy Policy — Flowbites',
  description:
    'Learn how Flowbites Marketplace collects, uses, and protects your personal information when buying or selling Webflow, Framer, and Wix templates.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
      </div>
      <p className="text-sm text-neutral-500 mb-8">Last updated: February 14, 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">1. Introduction</h2>
          <p className="text-neutral-600 leading-relaxed">
            Flowbites Marketplace (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you visit our website and use
            our services to buy or sell Webflow, Framer, and Wix templates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">2. Information We Collect</h2>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2 mb-4">
            <li>Name, email address, and profile information when you create an account.</li>
            <li>Payment information processed through Stripe (we do not store full card details).</li>
            <li>Creator profile data including portfolio links, bio, and payout details.</li>
            <li>Communications you send to us or other users through the Platform.</li>
          </ul>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li>IP address, browser type, operating system, and device information.</li>
            <li>Pages visited, time spent on pages, and navigation patterns.</li>
            <li>Template views, search queries, and purchase history.</li>
            <li>Cookies and similar tracking technologies (see our Cookies Policy).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li>To provide, maintain, and improve the Flowbites Marketplace.</li>
            <li>To process transactions and send purchase confirmations.</li>
            <li>To manage creator payouts through Stripe Connect.</li>
            <li>To send marketing emails about new templates, features, and promotions (with opt-out).</li>
            <li>To personalize your browsing experience and recommend relevant templates.</li>
            <li>To detect, prevent, and address fraud, abuse, and security issues.</li>
            <li>To comply with legal obligations and enforce our Terms of Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">4. Information Sharing</h2>
          <p className="text-neutral-600 leading-relaxed mb-3">
            We do not sell your personal information. We may share information with:
          </p>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li><strong>Service Providers:</strong> Stripe for payments, cloud hosting providers, and analytics services.</li>
            <li><strong>Creators:</strong> Limited buyer information necessary for template delivery and support.</li>
            <li><strong>Legal Requirements:</strong> When required by law, regulation, or valid legal process.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">5. Data Security</h2>
          <p className="text-neutral-600 leading-relaxed">
            We implement industry-standard security measures to protect your personal information, including encrypted
            data transmission (TLS/SSL), secure authentication, and regular security audits. Payment data is processed
            by Stripe, a PCI DSS Level 1 certified payment processor. However, no method of transmission over the
            Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">6. Data Retention</h2>
          <p className="text-neutral-600 leading-relaxed">
            We retain your personal information for as long as your account is active or as needed to provide services.
            Purchase records are retained for tax and legal compliance purposes. You can request deletion of your account
            and associated data at any time, subject to our legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">7. Your Rights</h2>
          <p className="text-neutral-600 leading-relaxed mb-3">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate personal data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
            <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time.</li>
            <li><strong>Restriction:</strong> Request restriction of processing of your personal data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">8. International Data Transfers</h2>
          <p className="text-neutral-600 leading-relaxed">
            Your information may be transferred to and processed in countries other than your country of residence.
            We ensure appropriate safeguards are in place for international transfers in compliance with applicable
            data protection laws, including GDPR Standard Contractual Clauses where required.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">9. Children&apos;s Privacy</h2>
          <p className="text-neutral-600 leading-relaxed">
            Flowbites Marketplace is not intended for users under the age of 16. We do not knowingly collect personal
            information from children. If we become aware that a child has provided us with personal data, we will
            take steps to delete that information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">10. Changes to This Policy</h2>
          <p className="text-neutral-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
            the new policy on this page and updating the &ldquo;Last updated&rdquo; date. We encourage you to review this policy
            periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">11. Contact Us</h2>
          <p className="text-neutral-600 leading-relaxed">
            For privacy-related inquiries, please contact our Data Protection Officer at{' '}
            <a href="mailto:privacy@flowbites.com" className="text-primary-500 hover:underline">privacy@flowbites.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
