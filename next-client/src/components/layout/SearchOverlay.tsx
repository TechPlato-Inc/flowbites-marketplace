'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { api } from '@/lib/api/client';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/templates?q=${encodeURIComponent(value)}&limit=5`);
      setResults(data.data.templates || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-[10vh]" ref={searchRef}>
        <div className="w-full max-w-xl mx-4 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
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

          {query.length >= 2 && (
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-neutral-500">Searching...</div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((t: any) => (
                    <Link
                      key={t._id}
                      href={`/templates/${t.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 truncate">{t.title}</div>
                        <div className="text-xs text-neutral-500 capitalize">
                          {t.platform} &middot; ${t.price}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/templates?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="block px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors text-center border-t border-neutral-100"
                  >
                    View all results
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-neutral-500">
                  No templates found for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          )}

          {query.length < 2 && (
            <div className="px-4 py-6 text-center text-sm text-neutral-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </>
  );
}
