'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary-500 hover:bg-primary-50 text-primary-600 hover:text-primary-700',
    ghost: 'text-primary-600 hover:bg-primary-50',
    danger: 'bg-error hover:bg-error-dark text-white shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-base gap-2',
    lg: 'h-12 px-6 text-lg gap-2',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
