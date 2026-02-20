'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getUploadUrl } from '@/lib/api/client';
import type { Template } from '@/types';

export function HeroShowcase({ templates }: { templates: Template[] }) {
  const count = templates.length;
  const [mainIdx, setMainIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const wrap = useCallback((i: number) => ((i % count) + count) % count, [count]);

  const smallLeftIdx = wrap(mainIdx + 1);
  const smallRightIdx = wrap(mainIdx + 2);

  const advance = useCallback(() => {
    setDirection('next');
    setMainIdx((prev) => wrap(prev + 1));
  }, [wrap]);

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const timer = setInterval(advance, 3500);
    return () => clearInterval(timer);
  }, [isPaused, advance, count]);

  const goTo = (i: number) => {
    setDirection(i > mainIdx ? 'next' : 'prev');
    setMainIdx(i);
  };

  if (count === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Large featured card with slide animation */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-4 bg-neutral-100">
        <div className="relative aspect-[16/9]">
          {templates.map((t, i) => {
            const isActive = i === mainIdx;
            const slideDir = direction === 'next' ? 1 : -1;
            return (
              <Link
                key={t._id}
                href={`/templates/${t.slug}`}
                className="absolute inset-0 transition-all duration-700 ease-in-out"
                style={{
                  transform: isActive ? 'translateX(0)' : `translateX(${slideDir * 100}%)`,
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 10 : 1,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <img
                  src={getUploadUrl(`images/${t.thumbnail}`)}
                  alt={t.title}
                  className="w-full h-full object-cover"
                />
              </Link>
            );
          })}

          {/* Gradient overlay + info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 z-20 pointer-events-none">
            <p
              key={mainIdx}
              className="font-display font-bold text-white text-lg truncate animate-[fadeUp_0.5s_ease-out]"
            >
              {templates[mainIdx]?.title}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-white/70">
                by {templates[mainIdx]?.creatorProfileId?.displayName}
              </p>
              <span className="text-lg font-bold text-white">
                ${templates[mainIdx]?.price}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {!isPaused && count > 1 && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-20">
              <div className="h-full bg-white/80 animate-[progressBar_3.5s_linear_infinite]" />
            </div>
          )}
        </div>
      </div>

      {/* Two smaller cards */}
      <div className="grid grid-cols-2 gap-3">
        {[smallLeftIdx, smallRightIdx].map((idx, pos) => {
          const t = templates[idx];
          return (
            <Link
              key={`${t._id}-${pos}`}
              href={`/templates/${t.slug}`}
              className="group rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5"
              style={{ animation: `fadeSlideUp 0.6s ease-out ${pos * 0.15}s both` }}
            >
              <div className="aspect-[16/10] bg-neutral-100 overflow-hidden">
                <img
                  src={getUploadUrl(`images/${t.thumbnail}`)}
                  alt={t.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-neutral-900 truncate">{t.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-neutral-500 truncate">
                    by {t.creatorProfileId?.displayName}
                  </p>
                  <span className="text-sm font-bold text-primary-600 shrink-0 ml-2">
                    ${t.price}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Navigation dots */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {templates.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === mainIdx
                  ? 'w-6 h-2 bg-primary-500'
                  : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
