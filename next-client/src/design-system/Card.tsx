'use client';

import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className, hover = true, onClick }: CardProps) => {
  return (
    <div
      className={clsx(
        'border border-neutral-200 rounded-lg bg-white overflow-hidden transition-all duration-200',
        hover && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

Card.Image = ({ src, alt, aspectRatio = '16/10', badge }: {
  src: string;
  alt: string;
  aspectRatio?: string;
  badge?: ReactNode;
}) => {
  return (
    <div className="relative overflow-hidden bg-neutral-100" style={{ aspectRatio }}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {badge && (
        <div className="absolute top-3 right-3">
          {badge}
        </div>
      )}
    </div>
  );
};

Card.Content = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div className={clsx('p-4', className)}>
      {children}
    </div>
  );
};

Card.Title = ({ children }: { children: ReactNode }) => {
  return (
    <h3 className="font-semibold text-lg text-neutral-900 mb-2">
      {children}
    </h3>
  );
};

Card.Description = ({ children }: { children: ReactNode }) => {
  return (
    <p className="text-sm text-neutral-500 mb-3">
      {children}
    </p>
  );
};
