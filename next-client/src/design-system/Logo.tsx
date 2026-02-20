'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'light';
  className?: string;
}

const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };
const heights = { sm: 'h-6', md: 'h-8', lg: 'h-10' };
const iconPx = { sm: 24, md: 32, lg: 40 };

export const LogoMark = ({ size = 32 }: { size?: number }) => (
  <img
    src="/logo.png"
    alt="Flowbites"
    style={{ height: size, width: 'auto' }}
  />
);

export const Logo = ({ size = 'md', variant = 'default', className = '' }: LogoProps) => {
  return (
    <Link
      href="/"
      onClick={() => { if (typeof window !== 'undefined' && window.location.pathname === '/') window.location.reload(); }}
      className={`flex items-center gap-2 ${className}`}
    >
      {variant === 'light' ? (
        <>
          <img
            src="/logo.png"
            alt=""
            className={`${heights[size]} shrink-0 object-cover object-left`}
            style={{ width: iconPx[size] }}
          />
          <span className={`font-display font-bold text-white ${textSizes[size]} tracking-tight`}>
            FlowBites
          </span>
        </>
      ) : (
        <img
          src="/logo.png"
          alt="Flowbites"
          className={`${heights[size]} w-auto`}
        />
      )}
    </Link>
  );
};
