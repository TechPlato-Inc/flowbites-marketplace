"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal, Button } from "@/design-system";
import { getUploadUrl } from "@/lib/api/client";
import { useCartStore } from "@/stores/cartStore";
import type { Template } from "@/types";
import {
  X,
  ShoppingCart,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

interface QuickViewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  template,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const { addItem, isInCart } = useCartStore();
  const [currentImage, setCurrentImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!template) return null;

  const images = [template.thumbnail, ...(template.gallery || [])].slice(0, 4);
  const inCart = isInCart(template._id);

  const handleAddToCart = () => {
    if (!inCart) {
      addItem(template);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const hasSale =
    template.salePrice !== null &&
    template.salePrice !== undefined &&
    template.salePrice < template.price;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100">
            <img
              src={getUploadUrl(`images/${images[currentImage]}`)}
              alt={template.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentImage ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Sale Badge */}
          {hasSale && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              {Math.round(
                ((template.price - template.salePrice!) / template.price) * 100,
              )}
              % OFF
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-2xl font-bold text-neutral-900">
                {template.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-neutral-500 text-sm capitalize mb-4">
              {template.platform} Template •{" "}
              {template.category?.name || "Design"}
            </p>

            <p className="text-neutral-600 mb-6 line-clamp-3">
              {template.description}
            </p>

            {/* Features Preview */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Check size={16} className="text-green-500" />
                <span>Responsive design</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Check size={16} className="text-green-500" />
                <span>Commercial license included</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Check size={16} className="text-green-500" />
                <span>Lifetime updates</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Price */}
            <div className="flex items-center gap-3">
              {hasSale ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    ${template.salePrice}
                  </span>
                  <span className="text-xl text-neutral-400 line-through">
                    ${template.price}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-neutral-900">
                  ${template.price}
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={inCart}
                className="flex-1"
                size="lg"
                rightIcon={
                  inCart || added ? (
                    <Check size={18} />
                  ) : (
                    <ShoppingCart size={18} />
                  )
                }
                variant={inCart ? "outline" : "primary"}
              >
                {inCart ? "In Cart" : added ? "Added!" : "Add to Cart"}
              </Button>
              <Link href={`/templates/${template.slug}`} onClick={onClose}>
                <Button size="lg" variant="outline">
                  <ExternalLink size={18} />
                </Button>
              </Link>
            </div>

            {/* Full Details Link */}
            <Link
              href={`/templates/${template.slug}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Eye size={16} />
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
