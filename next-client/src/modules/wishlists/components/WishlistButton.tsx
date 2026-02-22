"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import {
  checkWishlistStatus,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlists.service";
import { showToast } from "@/design-system/Toast";

interface WishlistButtonProps {
  templateId: string;
  initialWishlisted?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-11 h-11",
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 22,
};

export function WishlistButton({
  templateId,
  initialWishlisted = false,
  size = "md",
  className = "",
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  // Check actual status on mount if not provided
  useEffect(() => {
    if (initialWishlisted === undefined) {
      checkWishlistStatus(templateId).then(setIsWishlisted);
    }
  }, [templateId, initialWishlisted]);

  const handleToggle = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    // Optimistic update - toggle immediately
    const previousState = isWishlisted;
    const newState = !previousState;
    setIsWishlisted(newState);
    setLoading(true);

    try {
      if (previousState) {
        await removeFromWishlist(templateId);
        showToast("Removed from wishlist", "success");
      } else {
        await addToWishlist(templateId);
        showToast("Added to wishlist", "success");
      }
    } catch (error) {
      // Revert on failure
      console.error("Failed to toggle wishlist:", error);
      setIsWishlisted(previousState);
      showToast("Failed to update wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleToggle(e);
    }
  };

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      disabled={loading}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${
          isWishlisted
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-white/90 backdrop-blur-sm text-neutral-400 hover:text-red-500 hover:bg-white"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
        shadow-sm border border-neutral-200/50
        ${className}
      `}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={iconSizes[size]}
        className={`${isWishlisted ? "fill-red-500" : ""} transition-transform ${loading ? "scale-90" : ""}`}
      />
    </button>
  );
}
