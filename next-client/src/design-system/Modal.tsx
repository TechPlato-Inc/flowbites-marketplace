'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div
          className={clsx(
            'bg-white shadow-2xl w-full animate-scale-in',
            'rounded-t-2xl sm:rounded-xl',
            'max-h-[90vh] sm:max-h-[85vh] flex flex-col',
            sizes[size]
          )}
        >
          {title && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 shrink-0">
              <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 pr-4">{title}</h2>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors shrink-0 p-1"
              >
                <X size={24} />
              </button>
            </div>
          )}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
