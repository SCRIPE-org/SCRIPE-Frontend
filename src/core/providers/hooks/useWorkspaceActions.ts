import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "@core/providers/navigation-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { firstPageOf } from "../utils/navigation-helpers";
import { appLogger } from "@core/common/logger";

export function useWorkspaceActions() {
  const router = useRouter();
  const { fetchWorkspaceMenu } = useNavigation();

  const setActiveWorkspace = useCallback(
    async (workspaceKey: string, navigateTo = false) => {
      appLogger.debug(`[WorkspaceProvider] Switching to workspace: ${workspaceKey}`);

      useNavigationStore.getState().setActiveWorkspace(workspaceKey);
      useNavigationStore.getState().setActiveRootItem(null);

      if (!useNavigationStore.getState().hasWorkspaceData(workspaceKey)) {
        await fetchWorkspaceMenu(workspaceKey);
      }

      if (navigateTo) {
        const freshState = useNavigationStore.getState();
        const wsData = freshState.workspaces.get(workspaceKey) ?? null;
        const firstHref = wsData ? firstPageOf(wsData) : null;

        if (firstHref) {
          router.replace(firstHref);
          return;
        }

        const wsGroup =
          freshState.workspaceGroups.find((g) => g.workspaceKey === workspaceKey) ?? null;
        const groupFirstHref = wsGroup ? firstPageOf(wsGroup) : null;

        if (groupFirstHref) {
          router.replace(groupFirstHref);
        }
      }
    },
    [fetchWorkspaceMenu, router]
  );

  return { setActiveWorkspace };
}
