"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUploadUrl } from "@/lib/api/client";
import { Button, Badge } from "@/design-system";
import {
  Search,
  Users,
  Award,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Creator {
  _id: string;
  displayName: string;
  username: string;
  bio?: string;
  stats: {
    templateCount: number;
    totalSales: number;
  };
  isFeatured: boolean;
  isOfficial: boolean;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface CreatorsListingContentProps {
  initialCreators: Creator[];
  initialTotal: number;
  initialPages: number;
}

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "templates", label: "Most Templates" },
  { value: "newest", label: "Newest" },
];

export function CreatorsListingContent({
  initialCreators,
  initialTotal,
  initialPages,
}: CreatorsListingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSort = searchParams.get("sort") || "popular";
  const currentQuery = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(currentQuery);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset page when filters change
    if (!updates.page) params.delete("page");
    router.push(`/creators?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput || null });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
          Creators
        </h1>
        <p className="text-neutral-500">
          {initialTotal} talented creators building premium templates
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search creators..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </form>
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="px-4 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Creators Grid */}
      {initialCreators.length === 0 ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <Users size={48} className="text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              No creators found
            </h2>
            <p className="text-neutral-500">
              {currentQuery
                ? `No creators matching "${currentQuery}"`
                : "No verified creators yet"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialCreators.map((creator) => (
            <Link key={creator._id} href={`/creators/${creator.username}`}>
              <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md hover:border-neutral-300 transition-all h-full">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl shrink-0 overflow-hidden">
                    {creator.userId?.avatar ? (
                      <img
                        src={getUploadUrl(creator.userId.avatar)}
                        alt={creator.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      creator.displayName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate flex items-center gap-1.5">
                      {creator.displayName}
                      {creator.isOfficial && (
                        <Award
                          size={14}
                          className="text-primary-500 shrink-0"
                        />
                      )}
                    </h3>
                    <p className="text-sm text-neutral-500 truncate">
                      @{creator.username}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {creator.bio && (
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                    {creator.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span className="flex items-center gap-1">
                    <ShoppingBag size={14} />
                    {creator.stats?.templateCount || 0} templates
                  </span>
                  {creator.isFeatured && (
                    <Badge variant="warning" size="sm">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {initialPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateParams({ page: String(currentPage - 1) })}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-neutral-600 px-3">
            Page {currentPage} of {initialPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= initialPages}
            onClick={() => updateParams({ page: String(currentPage + 1) })}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
