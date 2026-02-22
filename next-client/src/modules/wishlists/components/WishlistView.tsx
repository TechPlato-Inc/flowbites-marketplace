"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWishlist, removeFromWishlist } from "../services/wishlists.service";
import type { WishlistItem } from "@/types";
import { TemplateCard } from "@/modules/templates/components/TemplateCard";
import { Button } from "@/design-system";
import { Heart, ShoppingBag, AlertCircle } from "lucide-react";

export function WishlistView() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist(1, 50);
      setItems(data.items);
    } catch (err: any) {
      console.error("Failed to fetch wishlist:", err);
      setError(err?.response?.data?.error || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (e: React.MouseEvent, templateId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setRemovingId(templateId);
    try {
      await removeFromWishlist(templateId);
      setItems((prev) =>
        prev.filter((item) => item.templateId._id !== templateId),
      );
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    } finally {
      setRemovingId(null);
    }
  };

  // Skeleton Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="h-8 w-40 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="border border-neutral-200 rounded-lg overflow-hidden bg-white"
            >
              <div className="aspect-[4/3] bg-neutral-200 animate-pulse" />
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
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="bg-error-light border border-error/20 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-error" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Failed to load wishlist
          </h3>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-6">
            {error}
          </p>
          <Button onClick={fetchWishlist}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">
            My Wishlist
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {items.length} template{items.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        {items.length > 0 && (
          <Link href="/templates">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ShoppingBag size={16} />}
            >
              Browse More Templates
            </Button>
          </Link>
        )}
      </div>

      {/* Wishlist Grid */}
      {items.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Heart size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
            Save templates you love to your wishlist and come back to them
            anytime.
          </p>
          <Link href="/templates">
            <Button>Browse Templates</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id} className="relative group">
              <TemplateCard template={item.templateId} />
              {/* Remove button overlay */}
              <button
                onClick={(e) => handleRemove(e, item.templateId._id)}
                disabled={removingId === item.templateId._id}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-white shadow-sm border border-neutral-200/50 transition-all opacity-0 group-hover:opacity-100"
                title="Remove from wishlist"
              >
                <Heart size={14} className="fill-red-500 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
