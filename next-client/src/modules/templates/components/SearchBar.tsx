"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/design-system";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getUploadUrl } from "@/lib/api/client";
import Link from "next/link";
import {
  getAutocomplete,
  getPopularTemplates,
  SearchSuggestion,
  PopularTemplate,
} from "../services/search.service";

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

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<PopularTemplate[]>(
    [],
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    // Load popular templates when component mounts
    getPopularTemplates().then(setPopularTemplates);
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

  // Debounced autocomplete search
  const fetchAutocomplete = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const data = await getAutocomplete(searchQuery);
    setSuggestions(data.slice(0, 8)); // Limit to 8 suggestions
  }, []);

  // Debounced full search
  const searchTemplates = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { api } = await import("@/lib/api/client");
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
      fetchAutocomplete(query);
      searchTemplates(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, fetchAutocomplete, searchTemplates]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const hasQuery = query.trim().length >= 2;
      const totalItems = hasQuery
        ? suggestions.length
        : recentSearches.length + popularTemplates.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            return prev < totalItems - 1 ? prev + 1 : 0;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            return prev > 0 ? prev - 1 : totalItems - 1;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0) {
            if (hasQuery && suggestions[highlightedIndex]) {
              // Navigate to suggested template
              const suggestion = suggestions[highlightedIndex];
              saveRecentSearch(suggestion.title);
              router.push(`/templates/${suggestion.slug}`);
              setIsOpen(false);
              setHighlightedIndex(-1);
            } else if (!hasQuery) {
              // Handle recent searches or popular templates
              if (highlightedIndex < recentSearches.length) {
                const term = recentSearches[highlightedIndex];
                setQuery(term);
                router.push(`/search?q=${encodeURIComponent(term)}`);
                setIsOpen(false);
                setHighlightedIndex(-1);
              } else {
                const templateIndex = highlightedIndex - recentSearches.length;
                if (popularTemplates[templateIndex]) {
                  const template = popularTemplates[templateIndex];
                  saveRecentSearch(template.title);
                  router.push(`/templates/${template.slug}`);
                  setIsOpen(false);
                  setHighlightedIndex(-1);
                }
              }
            }
          } else {
            handleSubmit();
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    highlightedIndex,
    query,
    suggestions,
    recentSearches,
    popularTemplates,
    router,
  ]);

  const handleSubmit = () => {
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setHighlightedIndex(-1);
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

  const clearQuery = () => {
    setQuery("");
    setSuggestions([]);
    setResults([]);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    saveRecentSearch(suggestion.title);
    router.push(`/templates/${suggestion.slug}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
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
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            className="!pl-12 !h-12 !text-base !bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded transition-colors"
            >
              <X size={16} className="text-neutral-400" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50">
          {/* Autocomplete Suggestions (when query has 2+ chars) */}
          {query.trim().length >= 2 && (
            <div className="max-h-[320px] overflow-y-auto">
              {/* Autocomplete suggestions from API */}
              {suggestions.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50 flex items-center gap-1">
                    <Sparkles size={12} />
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion._id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                        index === highlightedIndex
                          ? "bg-primary-50"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      {suggestion.thumbnail ? (
                        <img
                          src={getUploadUrl(`images/${suggestion.thumbnail}`)}
                          alt={suggestion.title}
                          className="w-10 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-8 bg-neutral-100 rounded" />
                      )}
                      <span className="font-medium text-neutral-900 truncate text-sm">
                        {suggestion.title}
                      </span>
                      <ArrowRight
                        size={14}
                        className="ml-auto text-neutral-400"
                      />
                    </button>
                  ))}
                </>
              )}

              {/* Full search results */}
              {results.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50 border-t border-neutral-100">
                    Templates
                  </div>
                  {results.slice(0, 3).map((template) => (
                    <Link
                      key={template._id}
                      href={`/templates/${template.slug}`}
                      onClick={() => {
                        saveRecentSearch(template.title);
                        setIsOpen(false);
                        setHighlightedIndex(-1);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      <img
                        src={getUploadUrl(`images/${template.thumbnail}`)}
                        alt={template.title}
                        className="w-10 h-8 object-cover rounded"
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
                </>
              )}

              {/* No results */}
              {!loading && suggestions.length === 0 && results.length === 0 && (
                <div className="p-4 text-center text-neutral-500">
                  No templates found for &quot;{query}&quot;
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="p-4 text-center text-neutral-500">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              )}

              {/* View all results link */}
              {!loading && (suggestions.length > 0 || results.length > 0) && (
                <button
                  onClick={handleSubmit}
                  className="w-full px-3 py-2.5 text-center text-primary-600 font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 border-t border-neutral-100"
                >
                  View all results for &quot;{query}&quot;
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}

          {/* Recent & Popular Templates (when no query or less than 2 chars) */}
          {query.trim().length < 2 && (
            <div className="p-3">
              {/* Recent Searches */}
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
                    {recentSearches.map((term, index) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          router.push(`/search?q=${encodeURIComponent(term)}`);
                          setIsOpen(false);
                          setHighlightedIndex(-1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          index === highlightedIndex
                            ? "bg-primary-100 text-primary-700"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Popular Templates from API */}
              {popularTemplates.length > 0 && (
                <>
                  <div className="flex items-center gap-1 mb-2">
                    <TrendingUp size={12} className="text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Popular Templates
                    </span>
                  </div>
                  <div className="space-y-1">
                    {popularTemplates.slice(0, 5).map((template, index) => {
                      const actualIndex = recentSearches.length + index;
                      return (
                        <button
                          key={template._id}
                          onClick={() => {
                            saveRecentSearch(template.title);
                            router.push(`/templates/${template.slug}`);
                            setIsOpen(false);
                            setHighlightedIndex(-1);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                            actualIndex === highlightedIndex
                              ? "bg-primary-50"
                              : "hover:bg-neutral-50"
                          }`}
                        >
                          {template.thumbnail ? (
                            <img
                              src={getUploadUrl(`images/${template.thumbnail}`)}
                              alt={template.title}
                              className="w-10 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-8 bg-neutral-100 rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 truncate text-sm">
                              {template.title}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {template.stats.views.toLocaleString()} views •{" "}
                              {template.stats.purchases} sales
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-neutral-400" />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Popular Searches (fallback) */}
              {popularTemplates.length === 0 && (
                <>
                  <div className="flex items-center gap-1 mb-2">
                    <TrendingUp size={12} className="text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Popular Searches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term, index) => {
                      const actualIndex = recentSearches.length + index;
                      return (
                        <button
                          key={term}
                          onClick={() => {
                            setQuery(term);
                            router.push(
                              `/templates?q=${encodeURIComponent(term)}`,
                            );
                            setIsOpen(false);
                            setHighlightedIndex(-1);
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            actualIndex === highlightedIndex
                              ? "bg-primary-100 text-primary-700"
                              : "bg-primary-50 hover:bg-primary-100 text-primary-700"
                          }`}
                        >
                          {term}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
