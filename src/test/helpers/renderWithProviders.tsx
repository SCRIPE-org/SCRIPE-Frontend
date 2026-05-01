import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Creates a fresh QueryClient configured for testing.
 * - No retries (tests should fail fast)
 * - Short stale time
 * - No garbage collection during tests
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component that provides all necessary providers for testing.
 * Usage with @testing-library/react:
 *
 * ```ts
 * const { result } = renderHook(() => useSomeViewModel(), {
 *   wrapper: renderWithProviders,
 * });
 * ```
 */
export function renderWithProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * Creates a wrapper with a specific QueryClient instance
 * for scenarios where you need to pre-populate the cache.
 */
export function createWrapper(queryClient?: QueryClient) {
  const client = queryClient ?? createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
