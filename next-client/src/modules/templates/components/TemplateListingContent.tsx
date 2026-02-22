"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/design-system";
import { TemplateCard } from "./TemplateCard";
import { SearchBar } from "./SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import type { Template, Category } from "@/types";
import {
  Plus,
  SlidersHorizontal,
  X,
  ChevronDown,
  AlertTriangle,
  Search,
} from "lucide-react";

const MAX_VISIBLE_CATEGORIES = 8;

interface TemplateListingContentProps {
  initialTemplates: Template[];
  initialTotal: number;
  initialPages: number;
  categories: Category[];
}

export function TemplateListingContent({
  initialTemplates,
  initialTotal,
  initialPages,
  categories,
}: TemplateListingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeTab = searchParams.get("madeBy") || "";
  const activePlatform = searchParams.get("platform") || "";
  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const activeQuery = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const templates = initialTemplates;
  const totalCount = initialTotal;
  const totalPages = initialPages;

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== "page") {
      newParams.delete("page");
    }
    router.push(`/templates?${newParams.toString()}`);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFilter("page", page === 1 ? "" : String(page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("q", searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilter("q", "");
  };

  const toggleMadeBy = (value: string) => {
    setFilter("madeBy", activeTab === value ? "" : value);
  };

  const hasActiveFilters =
    activePlatform || activeQuery || activeCategory || activeTab;

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCount = categories.length - MAX_VISIBLE_CATEGORIES;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-2">
                Template Marketplace
              </h1>
              <p className="text-neutral-500 text-sm sm:text-base max-w-xl">
                Kickstart your next project with a premium Webflow, Framer, or
                Wix template built by world-class creators.
              </p>
            </div>
            <Link
              href="/dashboard/creator/upload-template"
              className="shrink-0"
            >
              <Button leftIcon={<Plus size={18} />}>Sell a Template</Button>
            </Link>
          </div>

          {/* Made by toggle */}
          <div className="flex items-center gap-2 mt-6">
            <span className="text-sm text-neutral-500 mr-1">Made by:</span>
            <div className="inline-flex border border-neutral-300 rounded-full overflow-hidden">
              <button
                onClick={() => toggleMadeBy("flowbites")}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "flowbites"
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                Flowbites
              </button>
              <button
                onClick={() => toggleMadeBy("community")}
                className={`px-4 py-1.5 text-sm font-medium transition-colors border-l border-neutral-300 ${
                  activeTab === "community"
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                Community
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setFilter("category", "")}
              className={`shrink-0 px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all border rounded-full ${
                !activeCategory
                  ? "bg-primary-50 border-primary-500 text-primary-700"
                  : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400"
              }`}
            >
              All
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() =>
                  setFilter(
                    "category",
                    cat._id === activeCategory ? "" : cat._id,
                  )
                }
                className={`shrink-0 px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all border rounded-full ${
                  activeCategory === cat._id
                    ? "bg-primary-50 border-primary-500 text-primary-700"
                    : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {cat.name}
              </button>
            ))}
            {hiddenCount > 0 && !showAllCategories && (
              <button
                onClick={() => setShowAllCategories(true)}
                className="shrink-0 px-4 py-1.5 text-sm font-medium whitespace-nowrap border border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-all rounded-full"
              >
                +{hiddenCount} more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-neutral-100 bg-neutral-50/50">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-neutral-500">
              <strong className="text-neutral-900">
                {totalCount.toLocaleString()}
              </strong>{" "}
              templates found
            </span>

            {activePlatform && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">
                {activePlatform.charAt(0).toUpperCase() +
                  activePlatform.slice(1)}
                <button
                  onClick={() => setFilter("platform", "")}
                  className="ml-0.5 hover:text-neutral-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {activeQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">
                &ldquo;{activeQuery}&rdquo;
                <button
                  onClick={clearSearch}
                  className="ml-0.5 hover:text-neutral-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none sm:w-80">
              <SearchBar />
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              {(["webflow", "framer", "wix"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setFilter("platform", activePlatform === p ? "" : p)
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activePlatform === p
                      ? "bg-neutral-900 border-neutral-900 text-white"
                      : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative">
              <select
                value={activeSort}
                onChange={(e) => setFilter("sort", e.target.value)}
                className="h-9 pl-3 pr-8 border border-neutral-300 rounded-lg bg-white text-sm text-neutral-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="price_low">Price: Low</option>
                <option value="price_high">Price: High</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden h-9 px-3 border border-neutral-300 rounded-lg bg-white text-neutral-600"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {showMobileFilters && (
          <div className="sm:hidden max-w-8xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-500">Platform:</span>
              {(["webflow", "framer", "wix"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setFilter("platform", activePlatform === p ? "" : p)
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activePlatform === p
                      ? "bg-neutral-900 border-neutral-900 text-white"
                      : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Template Grid */}
      <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {templates.length === 0 ? (
          <div className="text-center py-20 sm:py-28">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No templates found
            </h3>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search to find what you're looking for."
                : "Templates will appear here once they are published."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => router.push("/templates")}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {templates.map((template) => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
