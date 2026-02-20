import { Cookie } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Cookie Policy — Flowbites',
  description:
    'Learn about how Flowbites Marketplace uses cookies, the types of cookies we use, and how to manage your cookie preferences.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Cookie className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-neutral-900">Cookies Policy</h1>
      </div>
      <p className="text-sm text-neutral-500 mb-8">Last updated: February 14, 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">1. What Are Cookies?</h2>
          <p className="text-neutral-600 leading-relaxed">
            Cookies are small text files stored on your device when you visit a website. They help websites
            remember your preferences, keep you signed in, and understand how you use the site. Flowbites
            Marketplace uses cookies to provide you with the best possible experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">2. Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-lg p-5">
              <h3 className="font-medium text-neutral-900 mb-2">Essential Cookies</h3>
              <p className="text-sm text-neutral-600 mb-2">Required for the website to function. These cannot be disabled.</p>
              <ul className="list-disc pl-5 text-sm text-neutral-500 space-y-1">
                <li><strong>Session cookie:</strong> Keeps you signed in while browsing Flowbites.</li>
                <li><strong>CSRF token:</strong> Protects against cross-site request forgery attacks.</li>
                <li><strong>Cart/checkout data:</strong> Remembers your template selections during checkout.</li>
              </ul>
            </div>
            <div className="bg-neutral-50 rounded-lg p-5">
              <h3 className="font-medium text-neutral-900 mb-2">Analytics Cookies</h3>
              <p className="text-sm text-neutral-600 mb-2">Help us understand how visitors use Flowbites so we can improve the experience.</p>
              <ul className="list-disc pl-5 text-sm text-neutral-500 space-y-1">
                <li><strong>Google Analytics:</strong> Tracks page views, session duration, and traffic sources.</li>
                <li><strong>Flowbites Analytics:</strong> Internal analytics for template views and search patterns.</li>
              </ul>
            </div>
            <div className="bg-neutral-50 rounded-lg p-5">
              <h3 className="font-medium text-neutral-900 mb-2">Functional Cookies</h3>
              <p className="text-sm text-neutral-600 mb-2">Enable enhanced functionality and personalization.</p>
              <ul className="list-disc pl-5 text-sm text-neutral-500 space-y-1">
                <li><strong>Language preference:</strong> Remembers your language and region settings.</li>
                <li><strong>Theme preference:</strong> Stores light/dark mode preference.</li>
                <li><strong>Recent searches:</strong> Remembers your recent template search queries.</li>
              </ul>
            </div>
            <div className="bg-neutral-50 rounded-lg p-5">
              <h3 className="font-medium text-neutral-900 mb-2">Marketing Cookies</h3>
              <p className="text-sm text-neutral-600 mb-2">Used to deliver relevant advertisements and track campaign effectiveness.</p>
              <ul className="list-disc pl-5 text-sm text-neutral-500 space-y-1">
                <li><strong>Affiliate tracking:</strong> Tracks referrals from our affiliate partners (90-day cookie).</li>
                <li><strong>Social media pixels:</strong> Helps us understand which social channels drive traffic.</li>
                <li><strong>Retargeting:</strong> Shows relevant Flowbites ads on other platforms you visit.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">3. Third-Party Cookies</h2>
          <p className="text-neutral-600 leading-relaxed mb-3">Some cookies are placed by third-party services that appear on our pages:</p>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li><strong>Stripe:</strong> Payment processing cookies for secure checkout.</li>
            <li><strong>Google Analytics:</strong> Website usage analytics and reporting.</li>
            <li><strong>Intercom/Support widgets:</strong> Live chat and support functionality.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">4. Managing Cookies</h2>
          <p className="text-neutral-600 leading-relaxed mb-3">You can control and manage cookies in several ways:</p>
          <ul className="list-disc pl-6 text-neutral-600 space-y-2">
            <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies through settings.</li>
            <li><strong>Cookie banner:</strong> When you first visit Flowbites, you can choose which cookie categories to accept.</li>
            <li><strong>Opt-out links:</strong> For Google Analytics, visit <span className="text-primary-500">tools.google.com/dlpage/gaoptout</span>.</li>
          </ul>
          <p className="text-neutral-600 leading-relaxed mt-3">
            Note that disabling certain cookies may affect the functionality of Flowbites. Essential cookies
            cannot be disabled as they are required for the website to operate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">5. Cookie Retention</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 pr-4 font-medium text-neutral-900">Cookie Type</th>
                  <th className="text-left py-3 pr-4 font-medium text-neutral-900">Duration</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100"><td className="py-2.5 pr-4">Session cookie</td><td className="py-2.5">Until browser is closed</td></tr>
                <tr className="border-b border-neutral-100"><td className="py-2.5 pr-4">Authentication token</td><td className="py-2.5">7 days</td></tr>
                <tr className="border-b border-neutral-100"><td className="py-2.5 pr-4">Analytics cookies</td><td className="py-2.5">2 years</td></tr>
                <tr className="border-b border-neutral-100"><td className="py-2.5 pr-4">Affiliate tracking</td><td className="py-2.5">90 days</td></tr>
                <tr className="border-b border-neutral-100"><td className="py-2.5 pr-4">Preferences</td><td className="py-2.5">1 year</td></tr>
                <tr><td className="py-2.5 pr-4">Marketing cookies</td><td className="py-2.5">30 days</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">6. Updates to This Policy</h2>
          <p className="text-neutral-600 leading-relaxed">
            We may update this Cookies Policy from time to time. Any changes will be posted on this page
            with an updated &ldquo;Last updated&rdquo; date. We encourage you to check back periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">7. Contact Us</h2>
          <p className="text-neutral-600 leading-relaxed">
            If you have questions about our use of cookies, please contact us at{' '}
            <a href="mailto:privacy@flowbites.com" className="text-primary-500 hover:underline">privacy@flowbites.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
