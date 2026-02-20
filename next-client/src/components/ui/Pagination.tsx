'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push('...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('...');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  }

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {generatePageNumbers(currentPage, totalPages).map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-neutral-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
