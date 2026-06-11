"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** True while revalidating in the background (cache already showing). */
  validating: boolean;
  refetch: () => void;
}

// ── Tiny SWR-style cache ──────────────────────────────────────
// Pages are client components that fetch on mount. Without a cache, every
// navigation refetches everything → blank flashes and redundant API calls.
// This module-level cache lets a revisited page render instantly from cache
// and revalidate in the background. In-flight promises are de-duped so two
// components asking for the same path share one request.

interface CacheEntry<T = unknown> {
  data: T;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();
// Notify mounted hooks when a path's cache updates (e.g. after mutate()).
const subscribers = new Map<string, Set<() => void>>();

// How long a cached value is considered "fresh" — within this window we skip
// the background revalidation entirely (prevents rapid back-and-forth refetch).
const FRESH_MS = 15_000;

function subscribe(path: string, cb: () => void) {
  let set = subscribers.get(path);
  if (!set) subscribers.set(path, (set = new Set()));
  set.add(cb);
  return () => {
    set!.delete(cb);
  };
}

function notify(path: string) {
  subscribers.get(path)?.forEach((cb) => cb());
}

function fetchPath<T>(path: string): Promise<T> {
  const existing = inflight.get(path);
  if (existing) return existing as Promise<T>;
  const p = api<T>(path)
    .then((res) => {
      cache.set(path, { data: res, ts: Date.now() });
      notify(path);
      return res;
    })
    .finally(() => {
      inflight.delete(path);
    });
  inflight.set(path, p);
  return p;
}

/** Imperatively drop a path (or prefix) from the cache so the next read refetches. */
export function invalidate(pathOrPrefix: string, prefix = false) {
  if (prefix) {
    for (const key of cache.keys()) if (key.startsWith(pathOrPrefix)) cache.delete(key);
  } else {
    cache.delete(pathOrPrefix);
  }
}

/** Write fresh data into the cache and notify subscribers (optimistic updates). */
export function mutateCache<T>(path: string, data: T) {
  cache.set(path, { data, ts: Date.now() });
  notify(path);
}

/** Wipe the entire cache — call on sign-out so the next user can't see stale data. */
export function clearApiCache() {
  cache.clear();
  inflight.clear();
}

/**
 * Fetch data from the API on mount (and whenever `deps` change), backed by a
 * small SWR cache: cached data shows instantly while a background revalidation
 * keeps it fresh. Returns the parsed data plus loading/validating/error/refetch.
 */
export function useApiData<T = unknown>(
  path: string | null,
  deps: unknown[] = [],
): UseApiState<T> {
  const cached = path ? (cache.get(path) as CacheEntry<T> | undefined) : undefined;

  const [data, setData] = useState<T | null>(cached?.data ?? null);
  const [loading, setLoading] = useState<boolean>(!!path && !cached);
  const [validating, setValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => {
    if (path) invalidate(path);
    setTick((t) => t + 1);
  }, [path]);

  // Re-render this hook whenever the cache for `path` is updated elsewhere.
  const dataRef = useRef(data);
  dataRef.current = data;
  useEffect(() => {
    if (!path) return;
    return subscribe(path, () => {
      const entry = cache.get(path) as CacheEntry<T> | undefined;
      if (entry && entry.data !== dataRef.current) setData(entry.data);
    });
  }, [path]);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    let alive = true;
    const entry = cache.get(path) as CacheEntry<T> | undefined;

    if (entry) {
      // Show cache immediately; skip refetch if still fresh.
      setData(entry.data);
      setLoading(false);
      if (Date.now() - entry.ts < FRESH_MS && tick === 0) return;
      setValidating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    fetchPath<T>(path)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((err) => {
        if (alive) setError(err instanceof ApiError ? err.message : "Lỗi tải dữ liệu");
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
          setValidating(false);
        }
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);

  return { data, loading, error, validating, refetch };
}

/** Wrap an async action with loading/error state (for forms & buttons). */
export function useAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { run, loading, error, setError };
}
