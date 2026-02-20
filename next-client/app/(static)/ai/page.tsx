import Link from 'next/link';
import { Sparkles, Search, ShieldCheck, Palette, BarChart3, Zap, Brain, Eye, MessageSquare, Layers } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata = {
  title: 'AI Overview — Flowbites',
  description:
    'Flowbites uses AI across the marketplace — from intelligent search to smart pricing insights and automated quality review.',
  alternates: {
    canonical: '/ai',
  },
};

const aiFeatures = [
  { icon: Search, title: 'Intelligent Search', desc: 'Our AI-powered search understands intent, not just keywords. Search for "dark SaaS landing page with pricing table" and get exactly what you need — no endless scrolling.', tag: 'Discovery' },
  { icon: ShieldCheck, title: 'Automated Quality Review', desc: 'Every template submission is pre-screened by AI for code quality, responsive breakpoints, accessibility compliance, and performance benchmarks before human review begins.', tag: 'Quality' },
  { icon: Palette, title: 'Style Matching', desc: 'Upload a screenshot, mood board, or reference URL and our AI finds templates with similar design language — color palette, typography style, layout patterns, and visual tone.', tag: 'Discovery' },
  { icon: BarChart3, title: 'Smart Pricing Insights', desc: 'AI analyzes market demand, template complexity, category trends, and competitor pricing to suggest optimal price points that maximize both sales volume and revenue.', tag: 'Creators' },
  { icon: Eye, title: 'Visual Similarity Detection', desc: 'Our computer vision system detects overly similar or derivative templates during submission, protecting original creators and maintaining marketplace diversity.', tag: 'Trust' },
  { icon: MessageSquare, title: 'AI Support Assistant', desc: 'Get instant answers about licensing, template setup, customization tips, and account questions from our AI assistant — available 24/7 with context-aware responses.', tag: 'Support' },
  { icon: Layers, title: 'Auto-Categorization', desc: 'AI automatically suggests categories, tags, and platform classifications for new templates based on design analysis, reducing setup time for creators by 80%.', tag: 'Creators' },
  { icon: Zap, title: 'Personalized Recommendations', desc: "Browse history, purchase patterns, and project context power a recommendation engine that surfaces templates you're most likely to buy — and love.", tag: 'Discovery' },
];

const roadmap = [
  { phase: 'Live Now', items: ['AI-powered semantic search across all templates', 'Automated quality pre-screening for submissions', 'Smart categorization and tagging suggestions', 'AI support assistant for common questions'] },
  { phase: 'Coming Q2 2026', items: ['Visual similarity search — upload a screenshot, find matching templates', 'AI-generated template descriptions and SEO metadata for creators', 'Smart pricing recommendations based on market analysis', 'Personalized homepage feed powered by browsing behavior'] },
  { phase: 'On the Roadmap', items: ['AI template customization previews — see your brand colors applied before purchase', 'Natural language template builder — describe your site, get a starting point', 'Automated A/B testing insights for template listings', 'AI-powered content generation for template demo sites'] },
];

export default function AIOverviewPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-neutral-950 text-white py-20 md:py-28 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            AI That Makes Templates
            <br />
            <span className="text-primary-400">Smarter to Find, Buy &amp; Sell</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Flowbites uses artificial intelligence across the entire marketplace —
            from how you discover templates to how creators price and optimize their listings.
            Better results, less friction, more sales.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/templates" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              Try AI Search
            </Link>
            <Link href="/become-creator" className="inline-flex items-center px-8 py-3 border border-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors">
              Creator AI Tools
            </Link>
          </div>
        </div>
      </div>

      {/* How AI Powers Flowbites */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">How AI Powers Flowbites</h2>
          <p className="text-neutral-500 max-w-lg mx-auto">Eight AI systems working behind the scenes to create the best template marketplace experience.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {aiFeatures.map((f) => (
            <div key={f.title} className="group p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                  <f.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-neutral-900">{f.title}</h3>
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-semibold rounded-full uppercase tracking-wider">{f.tag}</span>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* For Buyers */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-primary-500 mb-2 block">For Buyers</span>
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">Find the Perfect Template in Seconds</h2>
              <div className="space-y-4">
                {[
                  { title: 'Natural language search', desc: 'Describe what you need in plain English. "Minimal portfolio for architects with dark mode" returns precise results.' },
                  { title: 'Smart filters that learn', desc: 'The more you browse, the better your results. AI adjusts filtering weights based on your preferences and past purchases.' },
                  { title: 'Instant compatibility check', desc: 'AI verifies that templates work with your platform version, preferred integrations, and hosting setup before you buy.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <Brain className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm mb-0.5">{item.title}</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-400">AI Search</span>
              </div>
              <div className="space-y-3">
                {[
                  { query: '"SaaS landing page with pricing"', results: '47 templates', time: '0.12s' },
                  { query: '"dark agency portfolio Webflow"', results: '23 templates', time: '0.09s' },
                  { query: '"restaurant with online ordering CMS"', results: '12 templates', time: '0.11s' },
                ].map((ex) => (
                  <div key={ex.query} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700 font-mono">{ex.query}</span>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-xs font-semibold text-primary-600">{ex.results}</div>
                      <div className="text-[10px] text-neutral-400">{ex.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Creators */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-white border border-neutral-200 rounded-xl p-6">
            <div className="text-sm font-semibold text-neutral-900 mb-4">AI Creator Dashboard</div>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <div className="text-xs font-semibold text-emerald-600 mb-1">Pricing Suggestion</div>
                <div className="text-sm text-neutral-700">Based on 142 similar templates, we recommend <strong>$59</strong> for optimal revenue. Templates in this range convert 2.3x better.</div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-xs font-semibold text-blue-600 mb-1">SEO Optimization</div>
                <div className="text-sm text-neutral-700">Add &ldquo;startup&rdquo; and &ldquo;SaaS&rdquo; to your title. These keywords drive 68% more search traffic in your category.</div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="text-xs font-semibold text-amber-600 mb-1">Quality Score: 87/100</div>
                <div className="text-sm text-neutral-700">Lighthouse mobile score is 72. Optimize hero image (2.4MB → compress to WebP) to improve by ~15 points.</div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold text-primary-500 mb-2 block">For Creators</span>
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">Sell Smarter with AI Insights</h2>
            <div className="space-y-4">
              {[
                { title: 'Pricing intelligence', desc: "AI analyzes your template's complexity, market demand, and competitor pricing to suggest the price point that maximizes your revenue." },
                { title: 'Listing optimization', desc: 'Get AI-generated title suggestions, SEO keywords, and description improvements that increase click-through rates by up to 40%.' },
                { title: 'Quality pre-check', desc: 'Before you submit, AI scans your template for common rejection reasons — broken responsive layouts, missing alt tags, slow load times — so you can fix them first.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm mb-0.5">{item.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-neutral-950 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '0.1s', label: 'Avg. Search Time' },
              { value: '93%', label: 'Search Relevance' },
              { value: '2.3x', label: 'Better Conversions' },
              { value: '80%', label: 'Faster Submissions' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary-400">{s.value}</div>
                <div className="text-sm text-neutral-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-neutral-900 text-center mb-4">AI Roadmap</h2>
        <p className="text-neutral-500 text-center mb-12 max-w-lg mx-auto">
          We&apos;re continuously building new AI capabilities. Here&apos;s what&apos;s live, what&apos;s next, and what&apos;s on the horizon.
        </p>
        <div className="space-y-8">
          {roadmap.map((phase) => (
            <div key={phase.phase} className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className={`px-6 py-3 font-semibold text-sm ${
                phase.phase === 'Live Now'
                  ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-100'
                  : phase.phase.includes('Q2')
                  ? 'bg-blue-50 text-blue-700 border-b border-blue-100'
                  : 'bg-neutral-50 text-neutral-700 border-b border-neutral-200'
              }`}>
                {phase.phase}
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                        phase.phase === 'Live Now' ? 'bg-emerald-500' : phase.phase.includes('Q2') ? 'bg-blue-500' : 'bg-neutral-300'
                      }`} />
                      <span className="text-sm text-neutral-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsible AI */}
      <div className="bg-neutral-50 border-y border-neutral-200 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ShieldCheck className="w-10 h-10 text-primary-500 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">Responsible AI</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto mb-10">
            We believe AI should enhance the marketplace, not replace human creativity or judgment. Here are our commitments.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Human Review Always', desc: 'AI assists our review team — it never makes final approval or rejection decisions. Every template is reviewed by a human before going live.' },
              { title: 'Transparent Algorithms', desc: "Creators can see why AI made specific suggestions. No black boxes. Pricing, categorization, and quality scores come with clear explanations." },
              { title: 'Privacy First', desc: "Buyer browsing data used for recommendations is anonymized and never shared. Creators' unpublished work is never used to train our models." },
            ].map((item) => (
              <div key={item.title} className="p-5 bg-white border border-neutral-200 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-4" />
        <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">Experience AI-Powered Templates</h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          See the difference intelligent search and smart recommendations make. Find your perfect template faster.
        </p>
        <Link href="/templates" className="inline-flex items-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
          Browse Templates
        </Link>
      </div>
    </div>
  );
}
