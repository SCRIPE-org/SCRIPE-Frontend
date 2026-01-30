"use client";

import { useNavigation } from "@core/providers/navigation-provider";
import type { MenuItemActions } from "@core/domain/entities/Navigation";

/**
 * usePageActions Hook
 * 
 * Returns the granular permissions (canView, canCreate, canUpdate, canDelete)
 * for a specific page based on the navigation data from the backend.
 * 
 * @example
 * const { canCreate, canDelete } = usePageActions("/demo/products");
 * 
 * // In your component:
 * {canCreate && <Button>Add Product</Button>}
 * {canDelete && <Button variant="destructive">Delete</Button>}
 */
export function usePageActions(pathname?: string): MenuItemActions {
      const { getPageActions } = useNavigation();

      // Use provided pathname or get from window
      const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');

      const actions = getPageActions(path);

      // Default: no permissions if not found
      return actions ?? {
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
      };
}

/**
 * Default export for convenience
 */
export default usePageActions;
