"use client";

import type React from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@core/providers/theme-provider";
import { I18nProvider } from "@core/providers/i18n-provider";
import { ServiceProvider } from "@core/providers/service-provider";
import { SettingsProvider } from "@core/providers/settings-provider";
import { NavigationProvider } from "@core/providers/navigation-provider";
import { WorkspaceProvider } from "@core/providers/workspace-provider";
import { RouteGuard } from "@core/providers/route-guard";
import { PermissionProvider } from "@core/providers/permission-provider";
import { TenantContextProvider } from "@core/providers/tenant-context-provider";
import { AuthRefreshProvider } from "@core/providers/auth-refresh-provider";
import { EnhancedToaster } from "@core/ui/enhanced-toaster";
import { QueryAwareErrorBoundary } from "@core/ui/error-boundary";
import { TooltipProvider } from "@core/ui/tooltip";

// Lazy-load React Query DevTools — dev only, zero production bundle cost
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then((m) => ({
            default: m.ReactQueryDevtools,
          })),
        { ssr: false }
      )
    : null;

// Lazy-load SignalR providers (~100KB @microsoft/signalr) — not needed for initial render
const SignalRProvider = dynamic(
  () => import("@core/providers/signalr-provider").then((m) => ({ default: m.SignalRProvider })),
  { ssr: false }
);
const NotificationSignalRProvider = dynamic(
  () =>
    import("@core/providers/notification-provider").then((m) => ({
      default: m.NotificationSignalRProvider,
    })),
  { ssr: false }
);

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@core/query-client";

/**
 * Combined App Provider - Optimized provider composition
 *
 * This component combines all providers into a single, optimized structure
 * to reduce nesting complexity and improve performance.
 *
 * Provider order is important:
 * 1. QueryClientProvider - Server State (Must be outer layer)
 * 2. ThemeProvider - Must be outermost for theme context
 * 2a. TooltipProvider - Global tooltip context (inside ThemeProvider for correct styling)
 * 3. ServiceProvider - Provides API services
 * 4. SettingsProvider - User preferences and settings
 * 5. I18nProvider - Internationalization (depends on settings)
 * 6. ErrorBoundary - Catches all errors (must be inside I18nProvider for localization)
 * 7. PermissionProvider - Permission state
 * 8. TenantContextProvider - Tenant scoping
 * 9. SignalRProvider - Real-time audit events (depends on auth)
 * 10. NotificationSignalRProvider - Real-time notification WebSocket (depends on auth)
 * 11. NavigationProvider - Navigation and permissions (depends on auth)
 * 12. AuthRefreshProvider - Periodic refresh of permissions (depends on auth)
 * 13. RouteGuard - Route protection (depends on auth and navigation)
 *
 * @param children - The app content to be wrapped
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" disableTransitionOnChange={false}>
          <TooltipProvider>
            <ServiceProvider>
              <SettingsProvider>
                <I18nProvider>
                  <QueryAwareErrorBoundary>
                    <PermissionProvider>
                      <TenantContextProvider>
                        <SignalRProvider>
                          <NotificationSignalRProvider>
                            <NavigationProvider>
                              <WorkspaceProvider>
                                <AuthRefreshProvider intervalMs={1000 * 60 * 5}>
                                  <RouteGuard>{children}</RouteGuard>
                                </AuthRefreshProvider>
                              </WorkspaceProvider>
                            </NavigationProvider>
                          </NotificationSignalRProvider>
                        </SignalRProvider>
                      </TenantContextProvider>
                    </PermissionProvider>
                  </QueryAwareErrorBoundary>
                  <EnhancedToaster />
                </I18nProvider>
              </SettingsProvider>
            </ServiceProvider>
          </TooltipProvider>
        </ThemeProvider>
        {/* React Query DevTools — only rendered in development */}
        {process.env.NODE_ENV === "development" && ReactQueryDevtools && (
          <ReactQueryDevtools
            {...({ initialIsOpen: false, buttonPosition: "bottom-right" } as any)}
          />
        )}
      </QueryClientProvider>
    </>
  );
}
