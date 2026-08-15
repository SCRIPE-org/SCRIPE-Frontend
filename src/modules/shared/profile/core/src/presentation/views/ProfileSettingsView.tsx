// UI-EXCEPTION: compact studio layout
/**
 * @file ProfileSettingsView.tsx
 * @description Main profile settings page layout and tabs controller.
 * Contains sub-tabs for general settings (avatar and details), security (password, 2FA, passkeys),
 * active sessions list, and security activity audits.
 * Decouples direct cross-module static dependencies to 'auth' via the global component registry.
 */

"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useProfilePageViewModel } from "../viewmodels/useProfilePageViewModel";
import { useAvatarViewModel } from "../viewmodels/useAvatarViewModel";
import { useSecurityViewModel } from "../viewmodels/useSecurityViewModel";
import { useSessionsViewModel } from "../viewmodels/useSessionsViewModel";
import { useActivityLogViewModel } from "../viewmodels/useActivityLogViewModel";
import { useCorePasskeyManagement } from "@core/hooks/use-auth-bridge";

import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileNav } from "../components/ProfileNav";
import { ProfileGeneralTab } from "../components/ProfileGeneralTab";
import { ProfileSecurityTab } from "../components/ProfileSecurityTab";
import { ProfileSessionsTab } from "../components/ProfileSessionsTab";
import { ProfileActivityTab } from "../components/ProfileActivityTab";

import { Card, CardContent } from "@core/ui/card";
import { Tabs, TabsContent } from "@core/ui/tabs";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { PageHeader } from "@core/ui/page-header";
import { UserCog } from "lucide-react";

type ActiveTab = "general" | "security" | "sessions" | "activity";

/**
 * ProfileSettingsView component that renders tabs for user profile management.
 * Resolves the passkey management hook dynamically from the global registry to avoid
 * structural module violations with the authentication module.
 */
export function ProfileSettingsView() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ActiveTab>("general");

  // ViewModels
  const profileVm = useProfilePageViewModel();
  const avatarVm = useAvatarViewModel();
  const securityVm = useSecurityViewModel();
  const sessionsVm = useSessionsViewModel();
  const activityVm = useActivityLogViewModel();

  // Passkey management comes from the core auth bridge, not the runtime component registry.
  // The registry entry is only populated as a side effect of importing the auth module barrel,
  // which this route never did — so the `|| no-op` fallback below silently reported
  // `isWebAuthnSupported: false` and the whole passkey section was dead on this page.
  const passkeyVm = useCorePasskeyManagement();

  // ── Loading state ──────────────────────────────────────────────
  if (profileVm.isLoading) {
    return <LoadingSpinner fullHeight />;
  }

  // ── Error / unavailable state — never leave the user on a spinner
  // that will never resolve. ─────────────────────────────────────
  if (!profileVm.profile) {
    return (
      <ErrorMessage
        message={profileVm.error || t("profile.loadError.description")}
        onRetry={() => profileVm.refetch()}
        fullHeight
      />
    );
  }

  const profile = profileVm.profile;

  // Calculate initials for fallback
  const initials =
    `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase() ||
    "AD";

  // Filter sessions to find mobile devices (Cross-Device QR logins)
  const linkedMobileDevices =
    sessionsVm.sessions?.filter((session) => {
      const info = session.deviceInfo.toLowerCase();
      return (
        info.includes("iphone") ||
        info.includes("android") ||
        info.includes("mobile") ||
        info.includes("paired")
      );
    }) || [];

  // Calculate Security Score dynamically (simulated premium metrics)
  let securityScore = 40; // Base password
  if (profile.isTwoFactorEnabled) securityScore += 30; // 2FA is active
  if (passkeyVm.passkeys?.length > 0) securityScore += 30; // Passkey configured
  securityScore = Math.min(securityScore, 100);

  // Draws attention on the nav when there is a real, actionable security gap
  // — never a decorative badge, only a signal that something needs doing.
  const securityNeedsAttention =
    !profile.isTwoFactorEnabled ||
    profile.isPasswordExpired ||
    (profile.daysUntilPasswordExpiry !== null && profile.daysUntilPasswordExpiry <= 14);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader icon={UserCog} title={t("profile.title")} description={t("profile.subtitle")} />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Sidebar: identity + section switcher */}
          <div className="md:sticky md:top-6 md:w-64 md:shrink-0">
            <Card>
              <CardContent className="flex flex-col gap-5 p-4">
                <ProfileHeader
                  profile={profile}
                  isLoading={false}
                  meta={
                    <div className="flex w-full items-center justify-between rounded-nx-control border border-nx-line bg-nx-raised px-3 py-2 text-xs">
                      <span className="font-medium text-nx-ink-2">
                        {t("profile.general.securityStrength")}
                      </span>
                      <span className="font-bold text-nx-ink">
                        {t("profile.general.securePercent", { score: securityScore })}
                      </span>
                    </div>
                  }
                />
                <ProfileNav
                  securityNeedsAttention={securityNeedsAttention}
                  sessionsCount={sessionsVm.sessions?.length}
                />
              </CardContent>
            </Card>
          </div>

          {/* Active panel */}
          <div className="min-w-0 flex-1">
            <TabsContent
              value="general"
              className="mt-0 motion-safe:data-[state=active]:duration-nx-standard motion-safe:data-[state=active]:ease-nx-enter motion-safe:data-[state=active]:animate-in motion-safe:data-[state=active]:fade-in-0"
            >
              <ProfileGeneralTab
                profile={profile}
                initials={initials}
                avatarVm={avatarVm}
                profileVm={profileVm}
              />
            </TabsContent>

            <TabsContent
              value="security"
              className="mt-0 motion-safe:data-[state=active]:duration-nx-standard motion-safe:data-[state=active]:ease-nx-enter motion-safe:data-[state=active]:animate-in motion-safe:data-[state=active]:fade-in-0"
            >
              <ProfileSecurityTab
                profile={profile}
                linkedMobileDevices={linkedMobileDevices}
                sessionsVm={sessionsVm}
                securityVm={securityVm}
                passkeyVm={passkeyVm}
              />
            </TabsContent>

            <TabsContent
              value="sessions"
              className="mt-0 motion-safe:data-[state=active]:duration-nx-standard motion-safe:data-[state=active]:ease-nx-enter motion-safe:data-[state=active]:animate-in motion-safe:data-[state=active]:fade-in-0"
            >
              <ProfileSessionsTab sessionsVm={sessionsVm} />
            </TabsContent>

            <TabsContent
              value="activity"
              className="mt-0 motion-safe:data-[state=active]:duration-nx-standard motion-safe:data-[state=active]:ease-nx-enter motion-safe:data-[state=active]:animate-in motion-safe:data-[state=active]:fade-in-0"
            >
              <ProfileActivityTab activityVm={activityVm} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
