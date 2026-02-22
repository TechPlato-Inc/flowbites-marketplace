"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, TrendingUp, Star } from "lucide-react";

interface Collection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  query: string;
  color: string;
  bgColor: string;
}

const COLLECTIONS: Collection[] = [
  {
    id: "new-arrivals",
    title: "New Arrivals",
    description: "Fresh templates added this week",
    icon: <Sparkles size={20} />,
    query: "sort=newest",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100",
  },
  {
    id: "bestsellers",
    title: "Bestsellers",
    description: "Most popular templates",
    icon: <TrendingUp size={20} />,
    query: "sort=popular",
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
  },
  {
    id: "sale",
    title: "On Sale",
    description: "Up to 50% off selected templates",
    icon: <Zap size={20} />,
    query: "sale=true",
    color: "text-amber-600",
    bgColor: "bg-amber-50 hover:bg-amber-100",
  },
  {
    id: "featured",
    title: "Staff Picks",
    description: "Curated by our design team",
    icon: <Star size={20} />,
    query: "featured=true",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
  },
];

const USE_CASES = [
  { name: "SaaS Startups", query: "q=SaaS", image: "💼" },
  { name: "Portfolios", query: "q=portfolio", image: "🎨" },
  { name: "E-commerce", query: "q=ecommerce", image: "🛍️" },
  { name: "Agencies", query: "q=agency", image: "🚀" },
  { name: "Blogs", query: "q=blog", image: "✍️" },
  { name: "Landing Pages", query: "q=landing", image: "🎯" },
];

export function TemplateCollections() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-8xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            Browse Collections
          </h2>
          <Link
            href="/templates"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Featured Collections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.id}
              href={`/templates?${collection.query}`}
              className={`group p-4 rounded-xl ${collection.bgColor} transition-all duration-200`}
            >
              <div className={`${collection.color} mb-3`}>
                {collection.icon}
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">
                {collection.title}
              </h3>
              <p className="text-sm text-neutral-600">
                {collection.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Use Cases */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Browse by Use Case
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {USE_CASES.map((useCase) => (
            <Link
              key={useCase.name}
              href={`/templates?${useCase.query}`}
              className="flex flex-col items-center p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-center group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {useCase.image}
              </span>
              <span className="text-sm font-medium text-neutral-700">
                {useCase.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
