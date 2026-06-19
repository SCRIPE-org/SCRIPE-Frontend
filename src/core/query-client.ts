import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // P0.2: Prevent refetching on every navigation — data stays fresh for 2 min
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
