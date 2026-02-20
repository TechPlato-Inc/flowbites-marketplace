'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, inputSize = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-4 text-base',
      lg: 'h-13 px-5 text-lg',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full rounded-lg border bg-white text-neutral-900',
              'placeholder:text-neutral-400',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none',
              'transition-colors duration-200',
              'disabled:bg-neutral-100 disabled:cursor-not-allowed',
              error ? 'border-error' : 'border-neutral-300',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              sizes[inputSize],
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-error mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-neutral-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
