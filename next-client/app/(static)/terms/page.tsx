import { FileText } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Terms of Service — Flowbites',
  description:
    'Read the Flowbites Marketplace Terms of Service covering buying, selling, licenses, payments, and usage of the platform.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-neutral-900">Terms of Service</h1>
      </div>
      <p className="text-sm text-neutral-500 mb-8">Last updated: February 14, 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-neutral-600 leading-relaxed">
            By accessing or using Flowbites Marketplace (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service.
            Flowbites Marketplace is a digital marketplace for buying and selling premium website templates for
            Webflow, Framer, and Wix platforms. If you do not agree with any part of these terms, you may not use
            the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">2. Definitions</h2>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li><strong>&ldquo;Buyer&rdquo;</strong> refers to any user who purchases templates or services on Flowbites.</li>
            <li><strong>&ldquo;Creator&rdquo;</strong> refers to any user who uploads and sells templates or offers services on Flowbites.</li>
            <li><strong>&ldquo;Template&rdquo;</strong> refers to any digital website template, UI kit, or design asset listed on the Platform.</li>
            <li><strong>&ldquo;Service&rdquo;</strong> refers to custom design or development work offered by Creators.</li>
            <li><strong>&ldquo;Clone Link&rdquo;</strong> refers to a Webflow cloneable project link for template delivery.</li>
            <li><strong>&ldquo;Remix Link&rdquo;</strong> refers to a Framer remix URL for template delivery.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">3. Account Registration</h2>
          <p className="text-neutral-600 leading-relaxed">
            To purchase or sell on Flowbites, you must create an account. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities under your account. You must provide
            accurate and complete information during registration and keep your account information up to date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">4. Buying Templates</h2>
          <p className="text-neutral-600 leading-relaxed mb-3">
            When you purchase a template on Flowbites, you receive a license to use that template according to the
            license type selected at the time of purchase (Personal, Commercial, or Extended). All purchases are
            processed securely through Stripe.
          </p>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li>Templates are delivered via clone links (Webflow), remix links (Framer), or file download (Wix).</li>
            <li>You may not redistribute, resell, or share purchased templates.</li>
            <li>Refund requests are handled on a case-by-case basis within 14 days of purchase.</li>
            <li>Each license grants access for one end product unless stated otherwise.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">5. Selling Templates</h2>
          <p className="text-neutral-600 leading-relaxed mb-3">
            Creators who sell templates on Flowbites agree to the following:
          </p>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li>All templates must be original work or properly licensed for resale.</li>
            <li>Templates must be functional, well-documented, and match their preview descriptions.</li>
            <li>Creators retain ownership of their templates but grant Flowbites a license to display and distribute them.</li>
            <li>Flowbites retains a platform commission on each sale. Creator payouts are processed monthly via Stripe Connect.</li>
            <li>Creators must not include malicious code, hidden links, or deceptive functionality.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">6. Prohibited Conduct</h2>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li>Using the Platform for any illegal purpose or in violation of any laws.</li>
            <li>Uploading content that infringes intellectual property rights of third parties.</li>
            <li>Attempting to reverse engineer, decompile, or exploit the Platform&apos;s infrastructure.</li>
            <li>Creating multiple accounts to manipulate reviews, ratings, or sales metrics.</li>
            <li>Sharing or redistributing purchased templates outside the scope of your license.</li>
            <li>Engaging in fraudulent transactions or chargebacks.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">7. Intellectual Property</h2>
          <p className="text-neutral-600 leading-relaxed">
            Flowbites and its original content, features, and functionality are owned by Flowbites Inc. and are
            protected by international copyright, trademark, and other intellectual property laws. Creators retain
            ownership of their uploaded templates. Buyers receive a license, not ownership, of purchased templates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">8. Payment &amp; Pricing</h2>
          <p className="text-neutral-600 leading-relaxed">
            All prices on Flowbites are listed in USD. Payments are processed securely via Stripe. Creators set
            their own prices, and Flowbites charges a platform fee on each transaction. Tax obligations are the
            responsibility of the individual buyer or creator based on their jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">9. Disclaimer of Warranties</h2>
          <p className="text-neutral-600 leading-relaxed">
            The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or
            implied. Flowbites does not guarantee that templates will be error-free, compatible with all systems,
            or meet specific requirements. Use of the Platform is at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">10. Limitation of Liability</h2>
          <p className="text-neutral-600 leading-relaxed">
            In no event shall Flowbites, its directors, employees, or partners be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Platform or
            any templates purchased through it. Our total liability shall not exceed the amount you paid to
            Flowbites in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">11. Termination</h2>
          <p className="text-neutral-600 leading-relaxed">
            We may terminate or suspend your account at any time for violations of these Terms. Upon termination,
            your right to use the Platform ceases immediately. Provisions that by their nature should survive
            termination shall remain in effect, including ownership, warranty disclaimers, and limitations of liability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">12. Changes to Terms</h2>
          <p className="text-neutral-600 leading-relaxed">
            Flowbites reserves the right to update these Terms at any time. We will notify users of material
            changes via email or a notice on the Platform. Continued use of the Platform after changes constitutes
            acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">13. Contact</h2>
          <p className="text-neutral-600 leading-relaxed">
            If you have questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@flowbites.com" className="text-primary-500 hover:underline">legal@flowbites.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
