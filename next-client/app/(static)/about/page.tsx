import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Shield,
  Star,
  Zap,
  Heart,
  Users,
  Globe,
  Palette,
  Sparkles,
} from "lucide-react";
import { Button } from "@/design-system";

export const dynamic = "force-static";

export const metadata = {
  title: "About Flowbites — Premium Template Publisher",
  description:
    "Flowbites offers a premium collection of Webflow templates, UI kits, and Figma designs to help creators build stunning projects faster.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="-mb-20">
      {/* ============================================================
          HERO — Clean, bold statement with subtle gradient accent
          ============================================================ */}
      <section className="relative overflow-hidden bg-neutral-950 py-32 md:py-44">
        {/* Subtle gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-primary-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-secondary-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-primary-400 text-sm font-semibold tracking-widest uppercase mb-6 reveal">
            About Flowbites
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-8 reveal">
            Premium templates,
            <br />
            crafted with care
          </h1>
          <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed reveal">
            Flowbites is a premium template publisher offering a curated
            collection of Webflow templates, UI kits, and Figma designs. We help
            creators build stunning projects faster — with quality at the heart
            of everything we do.
          </p>
        </div>
      </section>

      {/* ============================================================
          MISSION — Two-column narrative
          ============================================================ */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 leading-tight mb-6">
                Crafting quality templates
                <span className="text-primary-500"> since day one</span>
              </h2>
              <p className="text-neutral-500 text-[15px] leading-relaxed">
                Flowbites was founded with a clear mission: to provide creators
                with premium, professionally designed templates that save time
                without sacrificing quality. Every template in our collection is
                carefully crafted and thoroughly tested to ensure it meets the
                highest standards of design and functionality.
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-[15px] leading-relaxed mb-6">
                Today, Flowbites offers a diverse range of templates across
                multiple platforms including Webflow, Framer, and Figma. Our
                templates power thousands of projects worldwide, from startups
                and agencies to personal portfolios and e-commerce stores.
              </p>
              <p className="text-neutral-500 text-[15px] leading-relaxed">
                We believe that great design should be accessible to everyone.
                That&apos;s why we&apos;re committed to creating templates that
                are not only beautiful but also easy to customize — empowering
                creators of all skill levels to bring their vision to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          VALUES — Icon grid with clear descriptions
          ============================================================ */}
      <section className="bg-neutral-50 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              What drives us
            </h2>
            <p className="text-neutral-500 text-[15px] max-w-xl mx-auto leading-relaxed">
              These aren&apos;t just words on a wall. They shape every product
              decision, every support reply, and every partnership we pursue.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Palette,
                title: "Craft over quantity",
                desc: "We'd rather have 500 exceptional templates than 50,000 mediocre ones. Every listing is hand-reviewed before it goes live.",
                color: "bg-primary-50 text-primary-500",
              },
              {
                icon: Users,
                title: "Creators first",
                desc: "Designers keep 85% of every sale. We succeed when our creators succeed — it's that simple.",
                color: "bg-secondary-50 text-secondary-500",
              },
              {
                icon: Globe,
                title: "Open to everyone",
                desc: "Templates that work globally, licenses that make sense, and pricing that respects creators at every level.",
                color: "bg-emerald-50 text-emerald-500",
              },
              {
                icon: Sparkles,
                title: "Ship, don't polish",
                desc: "We move fast and iterate in the open. Our users get new features weekly, not quarterly.",
                color: "bg-amber-50 text-amber-500",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${value.color} flex items-center justify-center mb-4`}
                >
                  <value.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-neutral-900 text-base mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BY THE NUMBERS — Stats strip
          ============================================================ */}
      <section className="bg-white py-16 md:py-20 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { stat: "$2.8M+", label: "Paid to creators" },
              { stat: "3", label: "Platforms supported" },
              { stat: "85%", label: "Creator revenue share" },
              { stat: "2022", label: "Founded" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="font-display text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-1">
                  {item.stat}
                </p>
                <p className="text-sm text-neutral-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHAT WE OFFER — Alternating feature rows
          ============================================================ */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-20 md:space-y-28">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 leading-tight mb-6">
                Platform-native templates,{" "}
                <span className="text-primary-500">zero friction</span>
              </h2>
              <p className="text-neutral-500 text-[15px] leading-relaxed mb-8 max-w-lg">
                Clone or remix directly into your Webflow, Framer, or Wix Studio
                workspace with one click. No zip files, no broken imports, no
                compatibility headaches. Just open and start building.
              </p>
              <Link href="/templates">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Browse templates
                </Button>
              </Link>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="w-full bg-white rounded-lg shadow-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="flex-1 h-4 bg-neutral-100 rounded-full mx-4" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-8 bg-gradient-to-r from-primary-100 to-primary-50 rounded" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-video bg-neutral-100 rounded" />
                      <div className="aspect-video bg-neutral-50 rounded" />
                      <div className="aspect-video bg-neutral-100 rounded" />
                    </div>
                    <div className="w-2/3 h-2 bg-neutral-100 rounded" />
                    <div className="w-1/2 h-2 bg-neutral-50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 md:order-1 relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="bg-white rounded-lg shadow-2xl p-5 text-center">
                  <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="font-bold text-neutral-900 text-sm mb-1">
                    Commercial License
                  </p>
                  <p className="text-xs text-neutral-500 mb-3">
                    Lifetime &middot; Unlimited projects
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Active forever
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 leading-tight mb-6">
                Buy once, <span className="text-primary-500">use forever</span>
              </h2>
              <p className="text-neutral-500 text-[15px] leading-relaxed mb-8 max-w-lg">
                Every template comes with a perpetual commercial license. Build
                client projects, launch your startup, sell products — no
                recurring fees, no usage limits, no surprises. Your license
                never expires.
              </p>
              <Link href="/licenses">
                <Button
                  variant="outline"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View license details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS — Clean quote cards
          ============================================================ */}
      <section className="bg-neutral-50 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-14">
            Trusted by creative teams
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-8">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-neutral-700 text-base leading-relaxed mb-6">
                &ldquo;Flowbites cut our project timeline in half. We cloned a
                Webflow template on Monday and shipped the client site by
                Wednesday. The quality is production-ready out of the
                box.&rdquo;
              </p>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">
                  Adriana Torres
                </p>
                <p className="text-xs text-neutral-500">
                  Creative Director, Lighthouse Digital
                </p>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-8">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-neutral-700 text-base leading-relaxed mb-6">
                &ldquo;As a solo freelancer, Flowbites is my secret weapon.
                I&apos;ve sold 40+ templates and built a real passive income
                stream. The creator tools are best-in-class.&rdquo;
              </p>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">
                  Marcus Chen
                </p>
                <p className="text-xs text-neutral-500">
                  Independent Designer, Studio Noire
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          OUR COMMITMENT — Compact trust signals
          ============================================================ */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
            Our commitment to you
          </h2>
          <p className="text-neutral-500 text-[15px] max-w-2xl mx-auto mb-14 leading-relaxed">
            Standards we hold ourselves to — for creators, customers, and the
            community.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                label: "Quality Guarantee",
                desc: "Every template hand-reviewed before listing",
              },
              {
                icon: Heart,
                label: "Fair Revenue Share",
                desc: "85% earnings go directly to creators",
              },
              {
                icon: Zap,
                label: "Instant Delivery",
                desc: "Clone or remix links — no file downloads",
              },
              {
                icon: Star,
                label: "Lifetime License",
                desc: "Commercial use, perpetual, unlimited projects",
              },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-primary-500" />
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">
                  {item.label}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-10 border-t border-neutral-100">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { label: "License Terms", href: "/licenses" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookies" },
              ].map((policy) => (
                <Link
                  key={policy.label}
                  href={policy.href}
                  className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors group"
                >
                  {policy.label}
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA — Join us
          ============================================================ */}
      <section className="relative overflow-hidden bg-neutral-950 text-white py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[40%] h-[80%] bg-primary-500/10 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-6">
            Come build with us
          </h2>
          <p className="text-neutral-400 text-[15px] leading-relaxed mb-10 max-w-xl mx-auto">
            Flowbites is a remote-first team driven by craft and community. If
            you care about great design and want to make an impact, we&apos;d
            love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/careers">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View open roles
              </Button>
            </Link>
            <Link href="/community">
              <Button
                variant="ghost"
                size="lg"
                className="!text-neutral-300 hover:!text-white"
              >
                Join the community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
