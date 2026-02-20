'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, getUploadUrl } from '@/lib/api/client';
import { Button, Badge, Input } from '@/design-system';
import { TemplateCard } from '@/modules/templates/components/TemplateCard';
import { HeroShowcase } from './HeroShowcase';
import { useScrollReveal } from '@/hooks/useAnimations';
import { PLATFORM_BADGE_COLORS } from '@/lib/constants';
import type { Template, Category, ServicePackage } from '@/types';

import {
  ArrowRight,
  Star,
  Search,
  Award,
  Headphones,
  ShieldCheck,
  Palette,
  Layout,
  Code,
  ChevronRight,
  Sparkles,
  Users,
  TrendingUp,
  ShoppingCart,
  Globe,
  Layers,
  Briefcase,
  Monitor,
} from 'lucide-react';

/* ===== Reveal wrapper ===== */
const Reveal = ({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
}) => {
  const { ref, isVisible } = useScrollReveal();
  const dirClass =
    direction === 'left'
      ? 'reveal-left'
      : direction === 'right'
        ? 'reveal-right'
        : direction === 'scale'
          ? 'reveal-scale'
          : 'reveal';
  return (
    <div
      ref={ref}
      className={`${dirClass} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ===== Constants ===== */
const CATEGORY_ICONS: Record<string, typeof Palette> = {
  default: Palette,
  design: Palette,
  landing: Layout,
  'landing-page': Layout,
  development: Code,
  business: Briefcase,
  portfolio: Monitor,
  ecommerce: ShoppingCart,
  'e-commerce': ShoppingCart,
  blog: Layers,
  agency: Globe,
  saas: Globe,
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/* ===== Skeleton ===== */
const TemplateGridSkeleton = ({ count }: { count: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
        <div className="aspect-[16/10] bg-neutral-200 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-neutral-200 rounded w-1/2 animate-pulse" />
          <div className="pt-3 border-t border-neutral-100 flex justify-between">
            <div className="h-5 bg-neutral-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-12 animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ===== HomeContent Props ===== */
interface HomeContentProps {
  initialFeatured: Template[];
  initialCategories: Category[];
}

export function HomeContent({ initialFeatured, initialCategories }: HomeContentProps) {
  const router = useRouter();
  const [featuredTemplates] = useState<Template[]>(initialFeatured);
  const [newestTemplates, setNewestTemplates] = useState<Template[]>([]);
  const [bestSellers, setBestSellers] = useState<Template[]>([]);
  const [categories] = useState<Category[]>(initialCategories);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [newestLoading, setNewestLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBestSellers();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchNewest();
  }, [activePlatform, activeCategory]);

  const fetchNewest = async () => {
    setNewestLoading(true);
    try {
      const params: Record<string, string> = { limit: '8', sort: 'newest' };
      if (activePlatform) params.platform = activePlatform;
      if (activeCategory) params.category = activeCategory;
      const { data } = await api.get('/templates', { params });
      setNewestTemplates(data.data.templates);
    } catch (error) {
      console.error('Failed to fetch newest templates:', error);
    } finally {
      setNewestLoading(false);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const { data } = await api.get('/templates?limit=8&sort=popular&featured=true');
      setBestSellers(data.data.templates);
    } catch (error) {
      console.error('Failed to fetch best sellers:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services/packages/browse', { params: { limit: 3 } });
      setServices(data.data.packages);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/templates?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const spotlightCreator = bestSellers[0]?.creatorProfileId;

  return (
    <div>
      {/* ====== SECTION 1: HERO ====== */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-20 left-[10%] w-16 h-16 rounded-2xl bg-primary-200/30 blur-sm float hidden lg:block" />
        <div className="absolute top-40 right-[8%] w-12 h-12 rounded-full bg-secondary-200/30 blur-sm float-delayed hidden lg:block" />
        <div className="absolute bottom-20 left-[20%] w-10 h-10 rounded-lg bg-primary-300/20 blur-sm float-slow hidden lg:block" />

        <div className="relative max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Text & Search */}
            <div className="flex-1 max-w-2xl">
              <div className="hero-line hero-line-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Sparkles size={14} />
                The #1 marketplace for premium templates
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-neutral-900 leading-[1.1] mb-4 sm:mb-6">
                <span className="hero-line hero-line-2 block">Premium Website Templates</span>
                <span className="hero-line hero-line-3 block">for any project</span>
              </h1>

              <p className="hero-line hero-line-3 text-base sm:text-lg lg:text-xl text-neutral-600 mb-6 sm:mb-8 leading-relaxed">
                Discover thousands of easy-to-customize Webflow, Framer & Wix
                templates, made by world-class creators.
              </p>

              {/* Search Bar */}
              <div className="hero-line hero-line-4">
                <form onSubmit={handleSearch} className="relative mb-6">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    leftIcon={<Search size={20} />}
                    className="!h-12 sm:!h-14 !pl-10 sm:!pl-12 !pr-24 sm:!pr-32 !rounded-xl shadow-sm text-sm sm:text-base"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 !h-9 sm:!h-10 !px-4 sm:!px-6 shadow-sm"
                  >
                    Search
                  </Button>
                </form>

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-neutral-500 mr-1">Popular:</span>
                  {['Webflow', 'Framer', 'Wix', 'Landing Page', 'Portfolio', 'eCommerce'].map(
                    (tag, i) => (
                      <Link
                        key={tag}
                        href={`/templates?q=${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-sm text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                        style={{ animationDelay: `${0.6 + i * 0.05}s` }}
                      >
                        {tag}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right: Animated Template Showcase */}
            <div className="flex-1 relative hidden lg:block max-w-[540px] hero-line hero-line-2">
              {featuredTemplates.length > 0 && (
                <HeroShowcase templates={featuredTemplates} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====== SECTION 2: CATEGORY TILES ====== */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                  Browse by Category
                </h2>
                <p className="text-neutral-600">Find the perfect template for your next project</p>
              </div>
              <Link href="/templates">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
                  All Categories
                </Button>
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.length > 0
              ? categories.slice(0, 6).map((category, catIdx) => {
                  const IconComponent = CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default;
                  return (
                    <Reveal key={category._id} delay={catIdx * 80}>
                      <Link
                        href={`/templates?category=${category.slug}`}
                        className="group relative border border-neutral-200 rounded-xl bg-white hover:shadow-lg hover:border-primary-200 transition-all duration-200 overflow-hidden block hover:-translate-y-1"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-200 shrink-0">
                              <IconComponent size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display font-bold text-lg text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-sm text-neutral-500 mb-3 line-clamp-2">
                                  {category.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-sm">
                                {category.templateCount != null && (
                                  <span className="text-neutral-400">
                                    {category.templateCount} templates
                                  </span>
                                )}
                                <span className="text-neutral-300">&middot;</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.push(`/templates?category=${category.slug}&sort=newest`);
                                  }}
                                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                                >
                                  Newest
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.push(`/templates?category=${category.slug}&sort=popular`);
                                  }}
                                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                                >
                                  Bestsellers
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })
              : [...Array(6)].map((_, i) => (
                  <div key={i} className="border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-neutral-200 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-neutral-200 rounded w-1/2 animate-pulse" />
                        <div className="h-3 bg-neutral-200 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-neutral-200 rounded w-1/3 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ====== SECTION 3: FEATURED / STAFF PICKS ====== */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-3">
                Unique templates for every budget
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Every week, our staff personally hand-picks standout items with
                exceptional design and functionality standards.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTemplates.map((template) => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="text-center mt-10">
              <Link href="/templates">
                <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
                  View All Templates
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ====== SECTION 4: VALUE PROPOSITION BAR ====== */}
      <section className="py-14 bg-white border-y border-neutral-100">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Award,
                title: 'Home of premium quality',
                desc: 'Every template is reviewed by our team before going live on the marketplace.',
              },
              {
                icon: Headphones,
                title: 'Dedicated creator support',
                desc: 'Get help directly from template creators with clear documentation included.',
              },
              {
                icon: ShieldCheck,
                title: 'Quality reviewed & secure',
                desc: 'All items go through quality review ensuring clean code and great design.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 150}>
                <div className="flex items-start gap-4 text-center md:text-left md:flex-row flex-col md:items-start items-center">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 mb-1">{item.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SECTION 5: NEWEST TEMPLATES (TABBED) ====== */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
          <Reveal>
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                Check out our newest templates
              </h2>
              <p className="text-neutral-600">
                We carefully review new entries from our community one by one to
                make sure they meet high-quality design and functionality standards.
              </p>
            </div>
          </Reveal>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-neutral-200">
            {[
              { key: '', label: 'All categories' },
              { key: 'webflow', label: 'Webflow' },
              { key: 'framer', label: 'Framer' },
              { key: 'wix', label: 'Wix' },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActivePlatform(tab.key);
                  setActiveCategory('');
                }}
                className={`!rounded-full whitespace-nowrap ${
                  activePlatform === tab.key && !activeCategory
                    ? '!bg-primary-500 !text-white shadow-sm'
                    : '!bg-neutral-100 !text-neutral-600 hover:!bg-neutral-200 hover:!text-neutral-800'
                }`}
              >
                {tab.label}
              </Button>
            ))}

            {categories.slice(0, 6).map((cat) => (
              <Button
                key={cat._id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveCategory(cat.slug);
                  setActivePlatform('');
                }}
                className={`!rounded-full whitespace-nowrap ${
                  activeCategory === cat.slug
                    ? '!bg-primary-500 !text-white shadow-sm'
                    : '!bg-neutral-100 !text-neutral-600 hover:!bg-neutral-200 hover:!text-neutral-800'
                }`}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {newestLoading ? (
            <TemplateGridSkeleton count={8} />
          ) : newestTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newestTemplates.map((template) => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-500">No templates found for this filter.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/templates?sort=newest">
              <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
                View All New Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ====== SECTION 6: SERVICES CROSS-SELL BANNER ====== */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-secondary-600 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 float-slow" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 float-delayed" />

        <div className="relative max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <Reveal direction="left" className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-4">
                Need a custom build? Hire our creators.
              </h2>
              <p className="text-base sm:text-lg text-white/80 mb-6 max-w-xl">
                Get professional Webflow, Framer, and Wix development services
                from verified creators. From custom designs to full builds.
              </p>

              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                {['Custom Design', 'Full Development', 'Migration Support'].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-sm border border-white/20"
                  >
                    <ShieldCheck size={14} />
                    {f}
                  </span>
                ))}
              </div>

              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  rightIcon={<ArrowRight size={18} />}
                  className="!bg-white !text-primary-600 !border-white hover:!bg-neutral-50 shadow-lg"
                >
                  Browse Services
                </Button>
              </Link>
            </Reveal>

            {services.length > 0 && (
              <Reveal direction="right" className="flex-1 max-w-md w-full">
                <div className="space-y-3">
                  {services.slice(0, 3).map((service) => (
                    <Link
                      key={service._id}
                      href={`/services/${service.slug}`}
                      className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 hover:bg-white/20 transition-all duration-200 group hover:-translate-y-0.5"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <Briefcase size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{service.name}</p>
                        <p className="text-white/60 text-xs">
                          {service.deliveryDays} day delivery &middot; {service.revisions} revisions
                        </p>
                      </div>
                      <span className="text-white font-bold text-sm shrink-0">
                        ${service.price}
                      </span>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ====== SECTION 7: FEATURED CREATOR SPOTLIGHT ====== */}
      {spotlightCreator && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                  Featured Creator
                </h2>
                <p className="text-neutral-600">
                  Our templates are produced by world-class creators. Explore the best of the week.
                </p>
              </div>
            </Reveal>

            <div className="max-w-5xl mx-auto">
              <Reveal direction="scale">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
                    {spotlightCreator.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-xl font-display font-bold text-neutral-900">
                      {spotlightCreator.displayName}
                    </h3>
                    {spotlightCreator.bio && (
                      <p className="text-neutral-500 text-sm mt-1 mb-3 max-w-lg">
                        {spotlightCreator.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                      <Badge variant="info" size="sm">
                        {spotlightCreator.stats?.templateCount || 0} templates
                      </Badge>
                      <Badge variant="success" size="sm">
                        {spotlightCreator.stats?.totalSales || 0} sales
                      </Badge>
                      {spotlightCreator.stats?.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star size={14} className="fill-warning text-warning" />
                          <span className="text-neutral-600 font-medium">
                            {spotlightCreator.stats.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href={`/creators/${spotlightCreator.username}`} className="shrink-0">
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight size={14} />}>
                      View Portfolio
                    </Button>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {bestSellers.slice(0, 4).map((template) => (
                    <TemplateCard key={template._id} template={template} />
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ====== SECTION 8: BEST SELLERS ====== */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                  Best Selling Templates
                </h2>
                <p className="text-neutral-600">The most popular items loved by our customers</p>
              </div>
              <Link href="/templates?sort=popular">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
                  View More Bestsellers
                </Button>
              </Link>
            </div>
          </Reveal>

          {bestSellers.length > 0 ? (
            <Reveal delay={150}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.slice(0, 8).map((template) => (
                  <TemplateCard key={template._id} template={template} />
                ))}
              </div>
            </Reveal>
          ) : (
            <TemplateGridSkeleton count={4} />
          )}
        </div>
      </section>

      {/* ====== SECTION 9: CREATOR CTA ====== */}
      <section className="relative py-16 sm:py-20 lg:py-28 bg-neutral-900 overflow-hidden -mb-20">
        <div className="absolute top-1/2 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 float-slow" />
        <div className="absolute top-1/2 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-secondary-500/10 rounded-full blur-3xl -translate-y-1/2 float-delayed" />

        <Reveal className="relative max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold text-white mb-4">
            Start Selling on Flowbites
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Join our community of creators and earn from your design work.
            Thousands of customers are waiting for your templates.
          </p>

          <div className="flex flex-wrap justify-center gap-6 lg:gap-10 mb-10">
            {[
              { icon: TrendingUp, value: '85%', label: 'Creator earnings' },
              { icon: Users, value: '10K+', label: 'Happy customers' },
              { icon: Sparkles, value: '500+', label: 'Premium templates' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex items-center gap-3"
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <stat.icon size={20} className="text-primary-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">{stat.value}</div>
                  <div className="text-neutral-500 text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/register">
            <Button size="lg" rightIcon={<ChevronRight size={20} />}>
              Become a Creator
            </Button>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
