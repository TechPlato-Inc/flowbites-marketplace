'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ==========================================================================
   useScrollReveal — Intersection Observer hook for scroll-triggered animations
   Returns a ref to attach to the element and a boolean for visibility
   ========================================================================== */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; rootMargin?: string; once?: boolean }
) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = options || {};
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

/* ==========================================================================
   useCountUp — Animates a number from 0 to target when triggered
   ========================================================================== */
export function useCountUp(target: number, trigger: boolean, duration = 1500) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, target, duration]);

  return value;
}

/* ==========================================================================
   useParallax — Returns a Y offset based on scroll position
   ========================================================================== */
export function useParallax(speed = 0.1) {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            setOffset((center - viewCenter) * speed);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
}

/* ==========================================================================
   useStaggeredReveal — Returns visibility + delay index for staggered children
   ========================================================================== */
export function useStaggeredReveal<T extends HTMLElement = HTMLDivElement>(
  itemCount: number,
  options?: { threshold?: number; staggerDelay?: number }
) {
  const { threshold = 0.1, staggerDelay = 80 } = options || {};
  const { ref, isVisible } = useScrollReveal<T>({ threshold });

  const getDelay = useCallback(
    (index: number) => (isVisible ? index * staggerDelay : 0),
    [isVisible, staggerDelay]
  );

  return { ref, isVisible, getDelay, itemCount };
}
