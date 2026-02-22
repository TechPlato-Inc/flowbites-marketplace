"use client";

import { useState, useCallback } from "react";

interface PaginationState {
  page: number;
  pages: number;
  total: number;
}

export function usePagination<T>(
  fetchFn: (
    page: number,
  ) => Promise<{ items: T[]; pagination: PaginationState }>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchFn(page);
        setItems(result.items);
        setPagination(result.pagination);
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { error?: string } };
          message?: string;
        };
        setError(
          axiosErr.response?.data?.error ||
            axiosErr.message ||
            "Failed to load data",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFn],
  );

  const goToPage = useCallback((page: number) => fetchPage(page), [fetchPage]);
  const nextPage = useCallback(() => {
    if (pagination.page < pagination.pages) fetchPage(pagination.page + 1);
  }, [fetchPage, pagination]);
  const prevPage = useCallback(() => {
    if (pagination.page > 1) fetchPage(pagination.page - 1);
  }, [fetchPage, pagination]);

  return { items, pagination, isLoading, error, goToPage, nextPage, prevPage };
}
