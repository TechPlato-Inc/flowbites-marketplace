"use client";

import Link from "next/link";
import { Badge } from "@/design-system";
import { getUploadUrl } from "@/lib/api/client";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/constants";
import { useCartStore } from "@/stores/cartStore";
import type { Template } from "@/types";
import { WishlistButton } from "@/modules/wishlists/components/WishlistButton";
import { useAuthStore } from "@/stores/authStore";
import {
  Eye,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Check,
  ZoomIn,
} from "lucide-react";
import { useState } from "react";
import { QuickViewModal } from "@/components/templates/QuickViewModal";

const IMG_FALLBACK =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMTc1IDEyNUgyMjVWMTc1SDE3NVYxMjVaIiBzdHJva2U9IiNEMUQxRDEiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==";

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const { isAuthenticated } = useAuthStore();
  const platform = template.platform as keyof typeof PLATFORM_COLORS;
  const platformColor = PLATFORM_COLORS[platform] || "bg-neutral-700";
  const platformLabel =
    PLATFORM_LABELS[platform] || template.platform.toUpperCase();
  const creatorName = template.creatorProfileId?.displayName || "Creator";
  const creatorLink = template.creatorProfileId?.username
    ? `/creators/${template.creatorProfileId.username}`
    : template.creatorProfileId?._id
      ? `/creators/${template.creatorProfileId._id}`
      : "#";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addItem, isInCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const inCart = isInCart(template._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem(template);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };
  const images = [template.thumbnail, ...(template.gallery || [])].slice(0, 4);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentImageIndex];

  // Calculate discount percentage
  const hasSale =
    template.salePrice !== null &&
    template.salePrice !== undefined &&
    template.salePrice < template.price;
  const discountPercent = hasSale
    ? Math.round(
        ((template.price - template.salePrice!) / template.price) * 100,
      )
    : 0;

  return (
    <div className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image container */}
      <Link
        href={`/templates/${template.slug}`}
        className="block relative overflow-hidden bg-neutral-100"
      >
        <div className="aspect-[4/3]">
          <img
            src={getUploadUrl(`images/${currentImage}`)}
            alt={template.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = IMG_FALLBACK;
            }}
          />
        </div>

        {/* Platform badge - top right */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider text-white shadow-lg ${platformColor}`}
          >
            {platformLabel}
          </span>
        </div>

        {/* Wishlist Button */}
        {isAuthenticated && (
          <div className="absolute top-3 right-16 z-10">
            <WishlistButton templateId={template._id} size="sm" />
          </div>
        )}

        {/* Sale badge - top left */}
        {hasSale && (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider text-white shadow-lg bg-red-500">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Featured badge */}
        {template.isFeatured && !hasSale && (
          <div className="absolute top-3 left-3">
            <Badge variant="info" size="sm">
              Featured
            </Badge>
          </div>
        )}

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} className="text-neutral-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Next image"
            >
              <ChevronRight size={18} className="text-neutral-700" />
            </button>
          </>
        )}

        {/* Image dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Hover overlay with Live Preview & Quick View */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <button
            onClick={handleQuickView}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 text-neutral-900 rounded-lg text-sm font-semibold hover:bg-white transition-colors shadow-lg"
          >
            <ZoomIn size={16} />
            Quick View
          </button>
          {template.demoUrl && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(template.demoUrl, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg"
            >
              <Eye size={16} />
              Preview
            </button>
          )}
        </div>
      </Link>

      {/* Info below - Elementor style */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/templates/${template.slug}`}>
          <h3 className="font-semibold text-sm text-neutral-900 line-clamp-1 hover:text-primary-600 transition-colors mb-1">
            {template.title}
          </h3>
        </Link>

        {/* Creator */}
        <p className="text-xs text-neutral-500 mb-3">
          by{" "}
          <Link
            href={creatorLink}
            className="text-neutral-600 hover:text-primary-600 transition-colors hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {creatorName}
          </Link>
        </p>

        {/* Price and Actions Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Price with sale */}
          <div className="flex items-center gap-2">
            {hasSale ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  ${template.salePrice}
                </span>
                <span className="text-sm text-neutral-400 line-through">
                  ${template.price}
                </span>
              </>
            ) : (
              <span
                className={`text-lg font-bold ${
                  template.price === 0 ? "text-green-600" : "text-neutral-900"
                }`}
              >
                {template.price === 0 ? "Free" : `$${template.price}`}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${
                inCart || added
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
              aria-label={inCart ? "In cart" : "Add to cart"}
              disabled={inCart}
            >
              {inCart || added ? (
                <Check size={16} />
              ) : (
                <ShoppingCart size={16} className="text-neutral-600" />
              )}
            </button>

            {/* Live Preview Button */}
            {template.demoUrl && (
              <a
                href={template.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
              >
                Live Preview
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        template={template}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </div>
  );
}
