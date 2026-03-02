"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, TrendingUp } from "lucide-react";
import { api } from "@/lib/api/client";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Suggestion {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  platform: string;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [popular, setPopular] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open; load popular items
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      if (popular.length === 0) fetchPopular();
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const fetchPopular = async () => {
    try {
      const { data } = await api.get("/search/popular");
      setPopular(data.data.templates || []);
    } catch {
      // silently fail — popular is supplemental
    }
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(
        `/search/autocomplete?q=${encodeURIComponent(value)}`,
      );
      setResults(data.data.suggestions || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const showingResults = query.length >= 2;
  const showingPopular = !showingResults && popular.length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div
        className="fixed top-0 inset-x-0 z-50 flex justify-center pt-[10vh]"
        ref={searchRef}
      >
        <div className="w-full max-w-xl mx-4 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
            <Search size={20} className="text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search templates, services..."
              className="flex-1 text-sm outline-none text-neutral-900 placeholder:text-neutral-400"
            />
            <button
              onClick={onClose}
              className="text-xs text-neutral-400 border border-neutral-200 px-1.5 py-0.5 rounded"
            >
              ESC
            </button>
          </div>

          {/* Search results */}
          {showingResults && (
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-neutral-500">
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((t) => (
                    <Link
                      key={t._id}
                      href={`/templates/${t.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg shrink-0 overflow-hidden">
                        {t.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.thumbnail}
                            alt={t.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 truncate">
                          {t.title}
                        </div>
                        <div className="text-xs text-neutral-500 capitalize">
                          {t.platform} &middot; ${t.price}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="block px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors text-center border-t border-neutral-100"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-neutral-500">
                  No templates found for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* Popular items */}
          {showingPopular && (
            <div className="max-h-80 overflow-y-auto">
              <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-neutral-400" />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Popular Templates
                </span>
              </div>
              <div className="py-1">
                {popular.slice(0, 6).map((t) => (
                  <Link
                    key={t._id}
                    href={`/templates/${t.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg shrink-0 overflow-hidden">
                      {t.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.thumbnail}
                          alt={t.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {t.title}
                      </div>
                      <div className="text-xs text-neutral-500 capitalize">
                        {t.platform} &middot; ${t.price}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty state hint */}
          {!showingResults && !showingPopular && (
            <div className="px-4 py-6 text-center text-sm text-neutral-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </>
  );
}
