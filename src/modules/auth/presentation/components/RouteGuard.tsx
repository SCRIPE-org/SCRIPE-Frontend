"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useNavigation } from "@/providers/navigation-provider";
import { USE_DYNAMIC_NAVIGATION } from "@/config/navigation";
import { useI18n } from "@/providers/i18n-provider";
import { LoadingSpinner } from "../ui/loading-spinner";

interface RouteGuardProps {
  children: React.ReactNode;
}

// Define public pages that don't require authentication or authorization
const PUBLIC_PAGES = [
  "/login",
  "/not-authorized",
  "/not-found",
  "/global-error",
  "/error",
  "/404",
  "/500",
  "/settings"
];

export function RouteGuard({ children }: RouteGuardProps) {
  // For SSR/prerendering, render children without checks
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPageAccess, isLoading: navLoading } = useNavigation();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const { t } = useI18n()

  useEffect(() => {
    const checkAccess = async () => {
      // Skip check if still loading
      if (authLoading) {
        return;
      }

      // Always allow access to public pages
      if (PUBLIC_PAGES.includes(pathname)) {
        setIsChecking(false);
        return;
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // If using static navigation, allow all pages for authenticated users
      if (!USE_DYNAMIC_NAVIGATION) {
        setIsChecking(false);
        return;
      }

      // Skip navigation loading check if still loading
      if (navLoading) {
        return;
      }

      // Check if user has access to current page
      const hasAccess = hasPageAccess(pathname);

      if (!hasAccess) {
        router.push("/not-authorized");
        return;
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, authLoading, navLoading, pathname, hasPageAccess, router]);

  // Show loading only when actually checking auth (not navigation loading for public pages)
  if (authLoading || (isChecking && !PUBLIC_PAGES.includes(pathname))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner /> 
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Always render children for public pages
  if (PUBLIC_PAGES.includes(pathname)) {
    return <>{children}</>;
  }

  // For protected pages, only render if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Default fallback (shouldn't reach here due to redirects)
  return null;
}
