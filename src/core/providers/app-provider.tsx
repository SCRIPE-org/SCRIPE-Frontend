"use client";

import type React from "react";
import { ThemeProvider } from "@core/providers/theme-provider";
import { I18nProvider } from "@core/providers/i18n-provider";
import { ServiceProvider } from "@core/providers/service-provider";
// import { AuthProvider } from "@core/providers/auth-provider"; // Removed
import { SettingsProvider } from "@core/providers/settings-provider";
import { NavigationProvider } from "@core/providers/navigation-provider";
import { RouteGuard } from "@core/providers/route-guard";
import { PermissionProvider } from "@core/providers/permission-provider";
import { TenantContextProvider } from "@core/providers/tenant-context-provider";
import { AuthRefreshProvider } from "@core/providers/auth-refresh-provider";
import { SignalRProvider } from "@core/providers/signalr-provider";
import { NotificationProvider } from "@core/providers/notification-provider";
import { EnhancedToaster } from "@core/ui/enhanced-toaster";
import { ErrorBoundary } from "@core/ui/error-boundary";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Combined App Provider - Optimized provider composition
 *
 * This component combines all providers into a single, optimized structure
 * to reduce nesting complexity and improve performance.
 *
 * Provider order is important:
 * 1. QueryClientProvider - Server State (Must be outer layer)
 * 2. ThemeProvider - Must be outermost for theme context
 * 3. ServiceProvider - Provides API services
 * 4. SettingsProvider - User preferences and settings
 * 5. I18nProvider - Internationalization (depends on settings)
 * 6. ErrorBoundary - Catches all errors (must be inside I18nProvider for localization)
 * 7. PermissionProvider - Permission state
 * 8. TenantContextProvider - Tenant scoping
 * 9. SignalRProvider - Real-time audit events (depends on auth)
 * 10. NotificationProvider - Real-time notification WebSocket (depends on auth)
 * 11. NavigationProvider - Navigation and permissions (depends on auth)
 * 12. AuthRefreshProvider - Periodic refresh of permissions (depends on auth)
 * 13. RouteGuard - Route protection (depends on auth and navigation)
 *
 * @param children - The app content to be wrapped
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <ServiceProvider>
          <SettingsProvider>
            <I18nProvider>
              <ErrorBoundary>
                <PermissionProvider>
                  <TenantContextProvider>
                    <SignalRProvider>
                      <NotificationProvider>
                        <NavigationProvider>
                          <AuthRefreshProvider intervalMs={1000 * 60 * 5}>
                            <RouteGuard>{children}</RouteGuard>
                          </AuthRefreshProvider>
                        </NavigationProvider>
                      </NotificationProvider>
                    </SignalRProvider>
                  </TenantContextProvider>
                </PermissionProvider>
              </ErrorBoundary>
              <EnhancedToaster />
            </I18nProvider>
          </SettingsProvider>
        </ServiceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
