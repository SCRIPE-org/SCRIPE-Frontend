"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const defaultPath = useAppStore.getState().defaultRedirectPath;
    if (defaultPath && defaultPath !== "/" && defaultPath !== "/overview") {
      router.replace(defaultPath);
      return;
    }

    const sortedRoutes = useNavigationStore.getState().allRoutesSorted;
    const firstAccessible = sortedRoutes.find((r: string) => r.startsWith("/") && r !== "/overview");
    router.replace(firstAccessible || "/hub");
  }, [router]);

  return null;
}
