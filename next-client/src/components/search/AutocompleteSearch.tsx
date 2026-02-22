"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Input } from "@/design-system";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { getUploadUrl } from "@/lib/api/client";
import Link from "next/link";

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  salePrice?: number;
  platform: string;
  category?: { name: string };
}

const POPULAR_SEARCHES = [
  "SaaS landing page",
  "Portfolio",
  "E-commerce",
  "Dashboard",
  "Blog",
  "Agency",
];

export function AutocompleteSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  const searchTemplates = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get("/templates", {
        params: { q: searchQuery, limit: 5 },
      });
      setResults(data.data.templates);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchTemplates(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, searchTemplates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/templates?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      5,
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            size={20}
          />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search templates (e.g., 'SaaS landing page')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="!pl-12 !h-12 !text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"
            >
              <X size={16} className="text-neutral-400" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50">
          {/* Search Results */}
          {query.trim() && (
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-neutral-500">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50">
                    Templates
                  </div>
                  {results.map((template) => (
                    <Link
                      key={template._id}
                      href={`/templates/${template.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      <img
                        src={getUploadUrl(`images/${template.thumbnail}`)}
                        alt={template.title}
                        className="w-12 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate text-sm">
                          {template.title}
                        </p>
                        <p className="text-xs text-neutral-500 capitalize">
                          {template.platform} •{" "}
                          {template.category?.name || "Template"}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">
                        ${template.salePrice ?? template.price}
                      </span>
                    </Link>
                  ))}
                  <button
                    onClick={handleSubmit}
                    className="w-full px-3 py-2.5 text-center text-primary-600 font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                  >
                    View all results for "{query}"
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <div className="p-4 text-center text-neutral-500">
                  No templates found for "{query}"
                </div>
              )}
            </div>
          )}

          {/* Recent & Popular Searches (when no query) */}
          {!query.trim() && (
            <div className="p-3">
              {recentSearches.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={12} />
                      Recent
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-neutral-400 hover:text-neutral-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          router.push(
                            `/templates?q=${encodeURIComponent(term)}`,
                          );
                          setIsOpen(false);
                        }}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-sm text-neutral-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="flex items-center gap-1 mb-2">
                <TrendingUp size={12} className="text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Popular Searches
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      router.push(`/templates?q=${encodeURIComponent(term)}`);
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-full text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
