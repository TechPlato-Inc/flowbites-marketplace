import Link from 'next/link';
import { CheckCircle2, XCircle, Scale, Info } from 'lucide-react';
import { FaqItem } from './FaqItem';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Licenses — Flowbites',
  description:
    'Understand the Flowbites license terms for purchased templates. Personal, Commercial, and Extended license types explained with FAQ.',
  alternates: {
    canonical: '/licenses',
  },
};

function Clause({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-4">
      <span className="text-sm font-bold text-neutral-400 mt-0.5 shrink-0 w-6 text-right">
        {number}.
      </span>
      <div className="text-[15px] text-neutral-600 leading-relaxed">{children}</div>
    </div>
  );
}

function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="font-display text-2xl font-bold text-neutral-900 mb-6 scroll-mt-8">
      {title}
    </h2>
  );
}

export default function LicensesPage() {
  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <div className="bg-neutral-950 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-7 h-7 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">License Terms</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Flowbites License
          </h1>
          <p className="text-neutral-400 text-base md:text-lg max-w-2xl leading-relaxed">
            This license is a legal agreement between you (the purchaser) and the creator of the
            template (the author). It covers your rights to use the template you&apos;ve purchased from
            Flowbites.
          </p>
          <p className="text-neutral-500 text-sm mt-4">
            Last updated: February 14, 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* ===== TABLE OF CONTENTS ===== */}
        <nav className="mb-14 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">
            Contents
          </h2>
          <ol className="space-y-2 text-sm">
            {[
              'The Basics',
              'What You Can Do',
              'What You Cannot Do',
              'Other License Terms',
              'License Types & Comparison',
              'Definitions',
              'Frequently Asked Questions',
            ].map((item, i) => (
              <li key={i}>
                <a href={`#section-${i + 1}`} className="text-primary-500 hover:text-primary-600 hover:underline transition-colors">
                  {i + 1}. {item}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ===== INFO BANNER ===== */}
        <div className="flex items-start gap-3 p-5 mb-14 bg-blue-50 border border-blue-200 rounded-xl">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800 leading-relaxed">
            <strong>Simple version:</strong> Each template you buy comes with a license to use it in
            one project. You can use it commercially, modify it however you like, and your license
            lasts forever once you&apos;ve built your project. You just can&apos;t resell or give away the
            original template files.
          </div>
        </div>

        {/* ===== SECTION 1: The Basics ===== */}
        <section className="mb-14">
          <SectionHeading id="section-1" title="1. The Basics" />
          <Clause number={1}>
            The Flowbites License grants you an <strong>ongoing, non-exclusive, worldwide</strong> license
            to make use of a digital work (<strong>Item</strong>) you have selected and purchased through
            Flowbites.
          </Clause>
          <Clause number={2}>
            You are licensed to use the Item to create <strong>one single End Product</strong> for yourself
            or for one client (a &ldquo;single application&rdquo;), and the End Product can be distributed for Free
            or as a Commercial product (depending on your license type).
          </Clause>
          <Clause number={3}>
            An <strong>End Product</strong> is a customised implementation of the Item. For templates, the
            End Product is your finished website — built using the template as a foundation, with your
            own content, images, and customisations applied. The End Product must be
            a <strong>larger work</strong> that is meaningfully different from the original Item, not just
            a minor reskin or superficial change.
          </Clause>
          <Clause number={4}>
            You are granted the license on condition of payment of the listed price for the Item on
            Flowbites. If the price is $0 (a free Item), the same license terms apply.
          </Clause>
          <Clause number={5}>
            This license is between you (the purchaser) and the author of the Item. Flowbites acts as
            the marketplace facilitating the transaction. The author retains ownership of the Item at
            all times — you are <strong>licensed to use</strong> the Item, not purchasing ownership of it.
          </Clause>
        </section>

        {/* ===== SECTION 2: What You Can Do ===== */}
        <section className="mb-14">
          <SectionHeading id="section-2" title="2. What You Can Do" />
          <Clause number={6}>
            <strong>Create one End Product.</strong> You can use the Item to create one End Product for
            yourself or for one client. You can create the End Product for any platform — Webflow,
            Framer, Wix Studio, or any other platform if you adapt the design.
          </Clause>
          <Clause number={7}>
            <strong>Modify and customise.</strong> You can modify, manipulate, and combine the Item with other
            works to create your End Product. Change colors, fonts, layouts, content, images,
            structure — make it yours.
          </Clause>
          <Clause number={8}>
            <strong>Transfer to a client.</strong> You can create the End Product for a client and transfer
            the finished product to them. The client receives the completed website, not the original
            template. Your client cannot use the Item to create additional End Products without
            purchasing their own license.
          </Clause>
          <Clause number={9}>
            <strong>Make copies.</strong> You can make unlimited copies and deploy your End Product to
            multiple servers, staging environments, and production environments — as long as they all
            serve the same single End Product.
          </Clause>
          <Clause number={10}>
            <strong>Perpetual use.</strong> Once the Item has been incorporated into a completed End Product,
            your license to use the Item as part of that End Product is perpetual — it continues for the
            life of the End Product.
          </Clause>
          <div className="mt-6 space-y-3">
            {[
              'Use commercially — client websites, business sites, SaaS landing pages, e-commerce stores',
              'Modify and customise the template fully — add/remove pages, components, sections',
              'Create the End Product for yourself or for a single client',
              'Make unlimited copies of your completed End Product',
              'Use even if the Item is later removed from Flowbites by the author',
              'Keep it forever once your End Product is completed',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-600">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 3: What You Cannot Do ===== */}
        <section className="mb-14">
          <SectionHeading id="section-3" title="3. What You Cannot Do" />
          <Clause number={11}>
            <strong>No redistribution.</strong> You cannot redistribute the Item as stock, in a template
            marketplace, in a tool or template pack, or with its source files. You cannot do this with
            an Item either on its own or bundled with other items, even if you modify the Item. You
            cannot redistribute or make available the Item as-is or with superficial modifications.
          </Clause>
          <Clause number={12}>
            <strong>No &ldquo;build-it-yourself&rdquo; or on-demand use.</strong> You cannot use the Item in any
            application allowing an end user to customise the Item to their specific needs, such as an
            &ldquo;on demand&rdquo;, &ldquo;made to order&rdquo; or &ldquo;build it yourself&rdquo; service. You can use the Item in this
            way only if you purchase a separate license for each final product incorporating the Item
            that is created using the application.
          </Clause>
          <Clause number={13}>
            <strong>No standalone extraction.</strong> You cannot extract a single component of the Item
            (such as an illustration, icon, photo, video, or audio clip embedded in the template) and
            use it separately from the End Product. The Item must be used as part of a larger work.
          </Clause>
          <Clause number={14}>
            <strong>One End Product per license.</strong> If you want to use the same Item for a second
            End Product (e.g., building two different client websites from the same template), you need
            to purchase a separate license for each End Product. The <strong>Extended License</strong> allows
            unlimited End Products.
          </Clause>
          <Clause number={15}>
            <strong>No claiming ownership.</strong> You cannot claim ownership or authorship of the original
            Item, even if you have modified it significantly. The author retains all intellectual
            property rights in the Item.
          </Clause>
          <Clause number={16}>
            <strong>No sharing credentials.</strong> You cannot share your Flowbites account credentials or
            transfer your license to another person, company, or account. The license is personal to
            you (the purchaser).
          </Clause>
          <div className="mt-6 space-y-3">
            {[
              'Redistribute the template as stock, in a template pack, or with source files',
              'Use in "on-demand" or "build-it-yourself" services without separate licenses',
              'Extract a single component for standalone use',
              'Use one license for multiple End Products (buy a new license per project)',
              'Claim ownership of the original template design',
              'Share your account or transfer the license to another person',
              'Use in connection with unlawful, defamatory, or offensive content',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-red-50/50 border border-red-100 rounded-lg">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-600">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 4: Other License Terms ===== */}
        <section className="mb-14">
          <SectionHeading id="section-4" title="4. Other License Terms" />
          <Clause number={17}>
            <strong>Third-party components.</strong> Some Items may contain components sourced from third
            parties with different license terms (e.g., open-source fonts, icon libraries under MIT or
            Creative Commons licenses). Where this applies, the Item description will note these components
            and their applicable licenses. The third-party license applies to those specific components.
          </Clause>
          <Clause number={18}>
            <strong>Lawful use.</strong> The Item must not be used for any unlawful purpose. You cannot
            use the Item in connection with material that is defamatory, obscene, promotes
            discrimination, infringes intellectual property rights, or is otherwise illegal or creates
            fake identities.
          </Clause>
          <Clause number={19}>
            <strong>Delivery.</strong> After purchase, you receive immediate access to your template via
            the platform-appropriate delivery method: Webflow templates are delivered via
            a <strong>clone link</strong> that copies the project into your workspace; Framer templates use
            a <strong>remix link</strong> that opens in your account; Wix Studio templates are delivered
            as <strong>downloadable files</strong> you import into Wix Studio.
          </Clause>
          <Clause number={20}>
            <strong>Updates.</strong> Authors may release updates to their Items (bug fixes, new features,
            design improvements). All license types include free lifetime updates. You will be notified
            in your Flowbites dashboard when an update is available for a template you&apos;ve purchased.
          </Clause>
          <Clause number={21}>
            <strong>Support.</strong> Template-specific support (setup help, customisation guidance, bug
            reports) is provided by the author. Commercial and Extended license holders receive priority
            support. For platform issues (payments, account, delivery problems),
            contact <Link href="/help" className="text-primary-500 hover:underline">Flowbites support</Link> directly.
          </Clause>
          <Clause number={22}>
            <strong>Refunds.</strong> Flowbites handles refund requests on a case-by-case basis within
            14 days of purchase. Valid reasons include: the Item is significantly different from its
            listing, critical functionality is broken, or the delivery link doesn&apos;t work. Contact
            our <Link href="/help" className="text-primary-500 hover:underline">support team</Link> for
            assistance.
          </Clause>
          <Clause number={23}>
            <strong>Termination.</strong> This license can be terminated if you breach any of its terms.
            If the license is terminated, you must stop using the Item and remove it from any End
            Products you have created, unless the End Product has already been completed and deployed
            prior to termination.
          </Clause>
        </section>

        {/* ===== SECTION 5: License Types ===== */}
        <section className="mb-14">
          <SectionHeading id="section-5" title="5. License Types & Comparison" />
          <p className="text-neutral-600 text-[15px] leading-relaxed mb-8">
            Every Item on Flowbites is available under one or more of the following license types.
            The license type is selected by the author and determines the scope and price of the
            license granted to you.
          </p>

          <div className="space-y-6">
            {/* Personal */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900">Personal License</h3>
                <p className="text-sm text-neutral-500">For personal, non-commercial projects</p>
              </div>
              <div className="px-6 py-5 space-y-4 text-[15px] text-neutral-600 leading-relaxed">
                <p>
                  The Personal License grants you the right to use the Item in <strong>one personal,
                  non-commercial End Product</strong>. This is suitable for portfolios, hobby projects,
                  personal blogs, and experimental sites that are not monetised.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {[
                    'One personal, non-commercial End Product',
                    'Full modification and customisation rights',
                    'Lifetime access to the template',
                    'Free updates from the author',
                    'Clone/remix link or file download',
                    'Staging + production = one End Product',
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-neutral-600">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  {[
                    'Cannot be used for commercial or client projects',
                    'Cannot be resold, redistributed, or sublicensed',
                    'One End Product per license',
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-neutral-500">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Commercial */}
            <div className="border-2 border-primary-500 rounded-xl overflow-hidden ring-2 ring-primary-200">
              <div className="bg-primary-50 px-6 py-4 border-b border-primary-200">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-neutral-900">Commercial License</h3>
                  <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                </div>
                <p className="text-sm text-neutral-500">For client work and business projects</p>
              </div>
              <div className="px-6 py-5 space-y-4 text-[15px] text-neutral-600 leading-relaxed">
                <p>
                  The Commercial License grants you the right to use the Item in <strong>one commercial
                  End Product</strong>. You may create the End Product for yourself or for a client, and
                  the End Product can be sold or distributed commercially.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {[
                    'One commercial End Product',
                    'Client projects and business websites',
                    'SaaS landing pages and marketing sites',
                    'Lifetime access and free updates',
                    'Priority email support from author',
                    'Transfer completed End Product to client',
                    'Clone/remix link or file download',
                    'Unlimited copies of the End Product',
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-neutral-600">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  {[
                    'Cannot be resold or redistributed as a template',
                    'One End Product per license (buy again for additional projects)',
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-neutral-500">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Extended */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900">Extended License</h3>
                <p className="text-sm text-neutral-500">For SaaS products, white-label, and resale</p>
              </div>
              <div className="px-6 py-5 space-y-4 text-[15px] text-neutral-600 leading-relaxed">
                <p>
                  The Extended License grants you the right to use the Item in <strong>unlimited End
                  Products</strong>, including products that are sold to end users. This is suitable
                  for SaaS applications, white-label solutions, on-demand services, and products
                  where the template forms a component of a paid offering.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {[
                    'Unlimited End Products',
                    'SaaS applications and paid products',
                    'White-label and resale rights for End Products',
                    'Lifetime access with all future updates',
                    'Dedicated author support channel',
                    'Full source files and assets included',
                    'On-demand and merchandise use',
                    'Multi-team deployment',
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-neutral-600">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  {[
                    'Cannot claim original authorship of the template design',
                    'Cannot resell the template itself (only End Products built with it)',
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-neutral-500">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-10">
            <h3 className="font-display text-lg font-bold text-neutral-900 mb-4">
              Quick Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-neutral-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 border-b border-neutral-200">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-900 border-b border-neutral-200">Personal</th>
                    <th className="text-center py-3 px-4 font-semibold text-primary-600 border-b border-neutral-200 bg-primary-50/50">Commercial</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-900 border-b border-neutral-200">Extended</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Number of End Products', personal: '1', commercial: '1', extended: 'Unlimited' },
                    { feature: 'Commercial use', personal: '\u2014', commercial: '\u2713', extended: '\u2713' },
                    { feature: 'Client projects', personal: '\u2014', commercial: '\u2713', extended: '\u2713' },
                    { feature: 'SaaS / paid products', personal: '\u2014', commercial: 'Landing page only', extended: '\u2713' },
                    { feature: 'White-label / resale of End Product', personal: '\u2014', commercial: '\u2014', extended: '\u2713' },
                    { feature: 'On-demand / build-it-yourself', personal: '\u2014', commercial: '\u2014', extended: '\u2713' },
                    { feature: 'Lifetime access', personal: '\u2713', commercial: '\u2713', extended: '\u2713' },
                    { feature: 'Free updates', personal: '\u2713', commercial: '\u2713', extended: '\u2713' },
                    { feature: 'Priority support', personal: '\u2014', commercial: '\u2713', extended: '\u2713' },
                    { feature: 'Perpetual after build', personal: '\u2713', commercial: '\u2713', extended: '\u2713' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                      <td className="py-3 px-4 text-neutral-700 border-b border-neutral-100">{row.feature}</td>
                      <td className="py-3 px-4 text-center text-neutral-500 border-b border-neutral-100">{row.personal}</td>
                      <td className="py-3 px-4 text-center text-neutral-700 font-medium border-b border-neutral-100 bg-primary-50/30">{row.commercial}</td>
                      <td className="py-3 px-4 text-center text-neutral-500 border-b border-neutral-100">{row.extended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ===== SECTION 6: Definitions ===== */}
        <section className="mb-14">
          <SectionHeading id="section-6" title="6. Definitions" />
          <div className="space-y-5">
            {[
              { term: 'Item', definition: 'A digital work (template) available for purchase on Flowbites. Each Item is created by an author and listed on the marketplace.' },
              { term: 'End Product', definition: 'A customised implementation of the Item — your finished website or application, built using the Item as a foundation with your own content, images, and customisations applied. The End Product must be a larger work that is meaningfully different from and not merely a superficial modification of the original Item.' },
              { term: 'Author', definition: 'The creator who designed and published the Item on Flowbites. The author retains ownership and intellectual property rights over the Item at all times.' },
              { term: 'Purchaser (You)', definition: 'The person or entity who purchases a license to use an Item through Flowbites. The license is personal to the purchaser and cannot be transferred.' },
              { term: 'Free', definition: 'An End Product that is distributed at no charge — not sold, not offered via subscription, and not behind a paywall of any kind.' },
              { term: 'Sell / Sold', definition: 'To license, sublicense, or distribute an End Product for any type of fee or charge, including one-time payments, subscriptions, or advertising-supported access.' },
              { term: 'Single Application / Single Use', definition: 'The use of an Item in one End Product. Each license covers one Single Application. A staging environment and its corresponding production deployment count as one Single Application.' },
            ].map((item) => (
              <div key={item.term} className="pl-5 border-l-2 border-neutral-200">
                <dt className="font-semibold text-neutral-900 text-sm mb-1">{item.term}</dt>
                <dd className="text-sm text-neutral-600 leading-relaxed">{item.definition}</dd>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SECTION 7: FAQ ===== */}
        <section className="mb-14">
          <SectionHeading id="section-7" title="7. Frequently Asked Questions" />
          <div className="border-t border-neutral-200">
            <FaqItem
              question="What counts as one 'End Product'?"
              answer="An End Product is a single, distinct website or application that is live and accessible. A portfolio site is one End Product. A client's e-commerce store is another. If you build two different websites using the same template, you need two licenses — one per site. A staging/development environment and its corresponding production deployment count as one End Product."
            />
            <FaqItem
              question="Can I use a template for a client project?"
              answer="Yes — with a Commercial or Extended license. You can build a website for a client using a Flowbites template and transfer the completed website to them. The client receives the finished site, not the original template source. You (the purchaser) remain the license holder."
            />
            <FaqItem
              question="Do I need a new license for each project?"
              answer="Yes, for Personal and Commercial licenses. Each license covers one End Product. If you want to use the same template for multiple projects, you need a separate license for each. The Extended License allows unlimited End Products from a single purchase."
            />
            <FaqItem
              question="Can I use the template in a SaaS product?"
              answer="With a Commercial license, you can use a template as the marketing site or landing page for a SaaS product. If the template is a core component of the SaaS product itself (e.g., the product IS the template offered to end users), you need an Extended License."
            />
            <FaqItem
              question="What if the author removes the template from Flowbites?"
              answer="Your license remains valid. If a template you purchased is later delisted by the author, you keep full rights to use it under your existing license. Your clone/remix link and any downloaded files continue to work."
            />
            <FaqItem
              question="Can I modify the template?"
              answer="Absolutely. All license types allow full customisation — change colors, fonts, layouts, content, images, add or remove pages and sections. The only restriction is redistributing the original template source files."
            />
            <FaqItem
              question="Can I use the same template on staging and production?"
              answer="Yes. A staging/development environment and its corresponding production deployment count as one End Product, not two. You don't need a separate license for staging."
            />
            <FaqItem
              question="What happens if I breach the license terms?"
              answer="If you breach the license terms, the license is terminated. You must stop using the Item and remove it from any End Products, unless the End Product was completed and deployed prior to the breach. We recommend reviewing these terms carefully before use."
            />
            <FaqItem
              question="Can I get a refund?"
              answer="We accept refund requests within 14 days of purchase on a case-by-case basis. Valid reasons include: the template is significantly different from its listing, critical functionality is broken, or the delivery link doesn't work. Contact our support team to request a refund."
            />
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
          <h2 className="font-display text-xl font-bold text-neutral-900 mb-2">
            Still have questions?
          </h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Our support team is happy to help clarify any licensing questions.
            Reach out anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
