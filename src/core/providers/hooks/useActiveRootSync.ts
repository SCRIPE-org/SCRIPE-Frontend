import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import { containsPath, findBestRootMatch } from "@core/navigation/utils/path-matcher";

export function useActiveRootSync(rootMenuItems: MenuItem[]) {
  const pathname = usePathname();

  useEffect(() => {
    if (!rootMenuItems.length) return;

    const activeRootItemId = useNavigationStore.getState().activeRootItemId;

    if (activeRootItemId) {
      const current = rootMenuItems.find((m) => m.id === activeRootItemId);
      if (current) {
        if (containsPath(current, pathname)) {
          return;
        }
      }
    }

    const bestRoot = findBestRootMatch(rootMenuItems, pathname);

    if (bestRoot && bestRoot.id !== activeRootItemId) {
      useNavigationStore.getState().setActiveRootItem(bestRoot.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, rootMenuItems]);
}
