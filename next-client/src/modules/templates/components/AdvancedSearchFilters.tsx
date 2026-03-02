"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/design-system";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/constants";
import type { Category } from "@/types";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  Tag,
  LayoutGrid,
  Star,
} from "lucide-react";

interface AdvancedSearchFiltersProps {
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "sales", label: "Best Selling" },
];

export function AdvancedSearchFilters({
  categories,
}: AdvancedSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Get current filter values
  const currentPlatform = searchParams.get("platform") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentMadeBy = searchParams.get("madeBy") || "";
  const currentFeatured = searchParams.get("featured") || "";
  const currentFree = searchParams.get("free") || "";
  const currentSale = searchParams.get("sale") || "";
  const currentQuery = searchParams.get("q") || "";

  // Update active filters display
  useEffect(() => {
    const filters: string[] = [];
    if (currentPlatform)
      filters.push(
        `Platform: ${PLATFORM_LABELS[currentPlatform as keyof typeof PLATFORM_LABELS] || currentPlatform}`,
      );
    if (currentCategory) {
      const cat = categories.find((c) => c.slug === currentCategory);
      if (cat) filters.push(`Category: ${cat.name}`);
    }
    if (currentMadeBy) filters.push("Made by Flowbites");
    if (currentFeatured) filters.push("Featured");
    if (currentFree) filters.push("Free Templates");
    if (currentSale) filters.push("On Sale");
    setActiveFilters(filters);
  }, [
    currentPlatform,
    currentCategory,
    currentMadeBy,
    currentFeatured,
    currentFree,
    currentSale,
    categories,
  ]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset pagination
    router.push(`/templates?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (currentQuery) params.set("q", currentQuery);
    router.push(`/templates?${params.toString()}`);
  };

  const removeFilter = (filterLabel: string) => {
    if (filterLabel.startsWith("Platform:")) updateFilter("platform", "");
    if (filterLabel.startsWith("Category:")) updateFilter("category", "");
    if (filterLabel === "Made by Flowbites") updateFilter("madeBy", "");
    if (filterLabel === "Featured") updateFilter("featured", "");
    if (filterLabel === "Free Templates") updateFilter("free", "");
    if (filterLabel === "On Sale") updateFilter("sale", "");
  };

  const hasActiveFilters = activeFilters.length > 0 || currentSort !== "newest";

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Left: Filter Button & Active Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<SlidersHorizontal size={16} />}
            onClick={() => setIsOpen(!isOpen)}
            className={isOpen ? "bg-primary-50 border-primary-300" : ""}
          >
            Filters
            {activeFilters.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                {activeFilters.length}
              </span>
            )}
          </Button>

          {/* Active Filter Pills */}
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-sm border border-primary-200"
            >
              {filter}
              <button
                onClick={() => removeFilter(filter)}
                className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-neutral-500 hover:text-neutral-700 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Right: Sort Dropdown */}
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="appearance-none bg-white border border-neutral-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Expandable Filters Panel */}
      {isOpen && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-5">
          {/* Platform Filter */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <LayoutGrid size={16} className="text-neutral-400" />
              Platform
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("platform", "")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !currentPlatform
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                All
              </button>
              {PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  onClick={() => updateFilter("platform", platform)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    currentPlatform === platform
                      ? "bg-primary-500 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {PLATFORM_LABELS[platform]}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
                <Tag size={16} className="text-neutral-400" />
                Category
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter("category", "")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    !currentCategory
                      ? "bg-primary-500 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => updateFilter("category", category.slug)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      currentCategory === category.slug
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feature Toggles */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <Star size={16} className="text-neutral-400" />
              Features
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  updateFilter("featured", currentFeatured ? "" : "true")
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  currentFeatured
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {currentFeatured && <Check size={14} />}
                Featured Only
              </button>
              <button
                onClick={() => updateFilter("free", currentFree ? "" : "true")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  currentFree
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {currentFree && <Check size={14} />}
                Free Templates
              </button>
              <button
                onClick={() => updateFilter("sale", currentSale ? "" : "true")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  currentSale
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {currentSale && <Check size={14} />}
                On Sale
              </button>
            </div>
          </div>

          {/* Made by Flowbites Toggle */}
          <div className="pt-4 border-t border-neutral-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={currentMadeBy === "flowbites"}
                onChange={(e) =>
                  updateFilter("madeBy", e.target.checked ? "flowbites" : "")
                }
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">
                Show only Flowbites official templates
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
