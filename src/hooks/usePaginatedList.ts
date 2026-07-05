'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PaginatedResponse } from '@/types';

interface UsePaginatedListOptions<T> {
  fetcher: (params: Record<string, unknown>) => Promise<{ data: { data: PaginatedResponse<T> | T[] } }>;
  limit?: number;
  extraParams?: Record<string, unknown>;
}

/**
 * Paginated list hook. Robust against callers passing inline (non-memoized)
 * `fetcher` functions or `extraParams` object literals: the fetcher is kept in a
 * ref (never triggers a refetch on identity change) and `extraParams` is compared
 * by serialized value rather than reference, so this cannot enter an infinite
 * fetch loop regardless of how callers construct their arguments.
 */
export function usePaginatedList<T extends { id: string }>({ fetcher, limit = 20, extraParams = {} }: UsePaginatedListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

  const extraParamsKey = JSON.stringify(extraParams);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetcherRef.current({ page, limit, ...JSON.parse(extraParamsKey) });
      const data = res.data.data;
      if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
        setTotalPages(1);
      } else {
        setItems(data.items ?? []);
        setTotal(data.meta?.total ?? 0);
        setTotalPages(data.meta?.totalPages ?? 1);
      }
    } catch {
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, extraParamsKey]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [extraParamsKey]);

  return { items, page, setPage, total, totalPages, isLoading, reload: load };
}
