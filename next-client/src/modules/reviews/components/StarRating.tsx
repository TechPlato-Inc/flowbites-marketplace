"use client";

import { useState, useCallback } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

const sizeClasses = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [focusedRating, setFocusedRating] = useState(0);
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, starIndex: number) => {
      if (!interactive) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          if (starIndex < maxRating) {
            const nextStar = document.getElementById(`star-${starIndex + 1}`);
            nextStar?.focus();
            setFocusedRating(starIndex + 1);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (starIndex > 1) {
            const prevStar = document.getElementById(`star-${starIndex - 1}`);
            prevStar?.focus();
            setFocusedRating(starIndex - 1);
          }
          break;
        case "Home":
          e.preventDefault();
          const firstStar = document.getElementById("star-1");
          firstStar?.focus();
          setFocusedRating(1);
          break;
        case "End":
          e.preventDefault();
          const lastStar = document.getElementById(`star-${maxRating}`);
          lastStar?.focus();
          setFocusedRating(maxRating);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onChange?.(starIndex);
          break;
      }
    },
    [interactive, maxRating, onChange],
  );

  if (!interactive) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          {stars.map((star) => (
            <Star
              key={star}
              className={`${sizeClasses[size]} ${
                star <= rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-neutral-200"
              }`}
            />
          ))}
        </div>
        {showValue && (
          <span className="text-sm font-medium text-neutral-700 ml-1">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-0.5"
      role="radiogroup"
      aria-label="Rating"
    >
      {stars.map((star) => {
        const isSelected = star <= rating;
        const isHovered = star <= hoverRating;
        const isFocused = star === focusedRating;

        return (
          <button
            key={star}
            id={`star-${star}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            tabIndex={star === 1 || star === rating ? 0 : -1}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onFocus={() => setFocusedRating(star)}
            onBlur={() => setFocusedRating(0)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            className={`
              p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm
              ${isFocused ? "ring-2 ring-primary-500 ring-offset-2" : ""}
            `}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= (hoverRating || rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-neutral-200"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
