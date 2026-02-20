import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'neutral', size = 'md', children, className }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    error: 'bg-error-light text-error-dark',
    info: 'bg-info-light text-info-dark',
    neutral: 'bg-neutral-100 text-neutral-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
