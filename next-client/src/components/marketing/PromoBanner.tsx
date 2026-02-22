"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Zap, Clock, Tag } from "lucide-react";

interface PromoBannerProps {
  message?: string;
  link?: string;
  linkText?: string;
  discount?: string;
  expiresAt?: Date;
  onClose?: () => void;
}

export function PromoBanner({
  message = "🎉 Launch Sale: Get 30% off all templates!",
  link = "/templates",
  linkText = "Shop Now",
  discount,
  expiresAt,
  onClose,
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setIsVisible(false);
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="max-w-8xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Zap size={18} className="flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
            {discount && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded text-xs font-bold">
                <Tag size={12} />
                {discount}
              </span>
            )}
            {timeLeft && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-white/90">
                <Clock size={12} />
                Ends in {timeLeft}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={link}
              className="text-sm font-semibold underline underline-offset-2 hover:no-underline whitespace-nowrap"
            >
              {linkText}
            </Link>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export with preset promotions
export function LaunchSaleBanner({ onClose }: { onClose?: () => void }) {
  return (
    <PromoBanner
      message="🚀 Launch Special: 30% off all premium templates!"
      link="/templates?sort=newest"
      linkText="Browse Templates"
      discount="SAVE30"
      onClose={onClose}
    />
  );
}

export function FlashSaleBanner({ onClose }: { onClose?: () => void }) {
  const [expiresAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d;
  });

  return (
    <PromoBanner
      message="⚡ Flash Sale: 50% off selected templates!"
      link="/templates?featured=true"
      linkText="Shop Sale"
      discount="FLASH50"
      expiresAt={expiresAt}
      onClose={onClose}
    />
  );
}
