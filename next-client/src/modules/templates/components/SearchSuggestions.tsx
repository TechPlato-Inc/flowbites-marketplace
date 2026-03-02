"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getPopularTemplates,
  PopularTemplate,
} from "../services/search.service";
import { Search, TrendingUp, Clock, Sparkles, ArrowRight } from "lucide-react";

const POPULAR_SEARCHES = [
  "SaaS landing page",
  "Portfolio website",
  "E-commerce template",
  "Dashboard UI",
  "Blog design",
  "Agency website",
  "Startup landing",
  "Personal portfolio",
];

interface SearchSuggestionsProps {
  onSuggestionClick?: (term: string) => void;
  recentSearches?: string[];
}

export function SearchSuggestions({
  onSuggestionClick,
  recentSearches: propRecentSearches,
}: SearchSuggestionsProps) {
  const [popularTemplates, setPopularTemplates] = useState<PopularTemplate[]>(
    [],
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load popular templates
    getPopularTemplates().then(setPopularTemplates);

    // Load recent searches from localStorage if not provided via props
    if (!propRecentSearches) {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, [propRecentSearches]);

  const handleRecentSearchClick = (term: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(term);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  const displayRecentSearches = propRecentSearches || recentSearches;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Recent Searches */}
      {displayRecentSearches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Clock size={16} className="text-neutral-400" />
              Recent Searches
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-neutral-500 hover:text-neutral-700"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {displayRecentSearches.slice(0, 8).map((term) => (
              <button
                key={term}
                onClick={() => handleRecentSearchClick(term)}
                className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
          <TrendingUp size={16} className="text-neutral-400" />
          Popular Searches
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => handleRecentSearchClick(term)}
              className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <div className="space-y-4 md:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <Sparkles size={16} className="text-neutral-400" />
            Trending Templates
          </h3>
          <div className="space-y-2">
            {popularTemplates.slice(0, 5).map((template) => (
              <Link
                key={template._id}
                href={`/templates/${template.slug}`}
                className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors group"
              >
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-8 bg-neutral-100 rounded flex items-center justify-center">
                    <Search size={14} className="text-neutral-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-primary-600">
                    {template.title}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {template.stats.views.toLocaleString()} views
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-neutral-400 group-hover:text-primary-600"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
