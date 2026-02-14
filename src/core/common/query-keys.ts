/**
 * Query Keys Factory
 *
 * Centralized factory for creating consistent React Query cache keys.
 * This ensures predictable cache invalidation and avoids key collisions.
 *
 * @example
 * // In a module:
 * import { queryKeys } from '@core/common/query-keys';
 *
 * const { data } = useQuery({
 *   queryKey: queryKeys.products.list({ page: 1, search: 'test' }),
 *   queryFn: () => productService.getProducts({ page: 1, search: 'test' })
 * });
 *
 * // Invalidation:
 * queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
 */

/**
 * Base key segments for each domain
 */
const KEYS = {
  // Core domains
  auth: ["auth"] as const,
  users: ["users"] as const,
  products: ["products"] as const,
  navigation: ["navigation"] as const,
  settings: ["settings"] as const,

  // Add more domains as needed
  // Example: orders: ['orders'] as const,
} as const;

/**
 * Query Keys Factory
 *
 * Usage patterns:
 * - `.all` - Invalidates everything in the domain
 * - `.lists()` - All list queries
 * - `.list(params)` - Specific list with params
 * - `.details()` - All detail queries
 * - `.detail(id)` - Specific detail by ID
 */
export const queryKeys = {
  // ============================================
  // AUTH KEYS
  // ============================================
  auth: {
    all: KEYS.auth,
    session: () => [...KEYS.auth, "session"] as const,
    user: () => [...KEYS.auth, "user"] as const,
  },

  // ============================================
  // USERS KEYS
  // ============================================
  users: {
    all: KEYS.users,
    lists: () => [...KEYS.users, "list"] as const,
    list: (params: Record<string, unknown>) => [...KEYS.users, "list", params] as const,
    details: () => [...KEYS.users, "detail"] as const,
    detail: (id: string) => [...KEYS.users, "detail", id] as const,
    profile: () => [...KEYS.users, "profile"] as const,
  },

  // ============================================
  // PRODUCTS KEYS
  // ============================================
  products: {
    all: KEYS.products,
    lists: () => [...KEYS.products, "list"] as const,
    list: (params: Record<string, unknown>) => [...KEYS.products, "list", params] as const,
    details: () => [...KEYS.products, "detail"] as const,
    detail: (id: string) => [...KEYS.products, "detail", id] as const,
    categories: () => [...KEYS.products, "categories"] as const,
  },

  // ============================================
  // NAVIGATION KEYS
  // ============================================
  navigation: {
    all: KEYS.navigation,
    menu: () => [...KEYS.navigation, "menu"] as const,
    permissions: () => [...KEYS.navigation, "permissions"] as const,
  },

  // ============================================
  // SETTINGS KEYS
  // ============================================
  settings: {
    all: KEYS.settings,
    preferences: () => [...KEYS.settings, "preferences"] as const,
  },
} as const;

/**
 * Helper to create a new domain key set
 *
 * @example
 * const ordersKeys = createDomainKeys('orders');
 * // ordersKeys.all, ordersKeys.list(params), ordersKeys.detail(id)
 */
export function createDomainKeys<T extends string>(domain: T) {
  const baseKey = [domain] as const;

  return {
    all: baseKey,
    lists: () => [...baseKey, "list"] as const,
    list: (params: Record<string, unknown>) => [...baseKey, "list", params] as const,
    details: () => [...baseKey, "detail"] as const,
    detail: (id: string) => [...baseKey, "detail", id] as const,
  };
}

/**
 * Type for query key arrays
 */
export type QueryKey = readonly unknown[];
