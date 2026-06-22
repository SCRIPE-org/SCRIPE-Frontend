"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useProfilePageViewModel } from "../viewmodels/useProfilePageViewModel";
import { useAvatarViewModel } from "../viewmodels/useAvatarViewModel";
import { useSecurityViewModel } from "../viewmodels/useSecurityViewModel";
import { useSessionsViewModel } from "../viewmodels/useSessionsViewModel";
import { useActivityLogViewModel } from "../viewmodels/useActivityLogViewModel";
import { usePasskeyManagementViewModel } from "@modules/auth";

import { ProfileGeneralTab } from "../components/ProfileGeneralTab";
import { ProfileSecurityTab } from "../components/ProfileSecurityTab";
import { ProfileSessionsTab } from "../components/ProfileSessionsTab";
import { ProfileActivityTab } from "../components/ProfileActivityTab";

import { cn, resolveFileUrl } from "@core/common/utils";
import { User, Shield, Monitor, ListTodo } from "lucide-react";

type ActiveTab = "general" | "security" | "sessions" | "activity";

export function ProfileSettingsView() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ActiveTab>("general");
  const [imageError, setImageError] = useState(false);

  // ViewModels
  const profileVm = useProfilePageViewModel();

  const imageUrl = profileVm.profile?.profileImageUrl;
  const [prevImageUrl, setPrevImageUrl] = useState(imageUrl);
  if (imageUrl !== prevImageUrl) {
    setPrevImageUrl(imageUrl);
    setImageError(false);
  }
  const avatarVm = useAvatarViewModel();
  const securityVm = useSecurityViewModel();
  const sessionsVm = useSessionsViewModel();
  const activityVm = useActivityLogViewModel();
  const passkeyVm = usePasskeyManagementViewModel();

  if (profileVm.isLoading || !profileVm.profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </span>
      </div>
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

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("profile.title")}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {/* Main Glassmorphic Container Card */}
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card/45 shadow-sm backdrop-blur-md">
        {/* User Quick Info Banner */}
        <div className="flex flex-col gap-6 border-b border-border/60 bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {/* Animated Gradient Border Avatar */}
            <div className="group relative flex h-20 w-20 items-center justify-center">
              <div className="animate-spin-slow absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-pink-500 to-emerald-500 p-[3px]">
                <div className="h-full w-full rounded-full bg-slate-950" />
              </div>
              <div className="relative z-10 flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full border border-white/5 bg-gradient-to-br from-violet-500/20 to-pink-500/20 text-2xl font-bold text-white">
                {profile.profileImageUrl && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveFileUrl(profile.profileImageUrl)}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                {profile.firstName} {profile.lastName}
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  {profile.adminTypeName || t("profile.fields.role")}
                </span>
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{profile.username}</p>
            </div>
          </div>

          {/* Security Score Widget */}
          <div className="flex items-center gap-3 self-start rounded-xl border border-border/60 bg-muted/40 p-3 transition-colors hover:bg-muted/60 sm:self-center">
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {t("profile.general.securityStrength")}
              </p>
              <p className="mt-0.5 text-base font-extrabold text-foreground">
                {t("profile.general.securePercent", { score: securityScore })}
              </p>
            </div>
            {/* Circular Progress */}
            <div className="relative h-10 w-10">
              <svg className="h-full w-full -rotate-90">
                <circle cx="20" cy="20" r="16" className="fill-none stroke-border/40 stroke-[3]" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="fill-none stroke-primary stroke-[3] transition-all duration-500"
                  strokeDasharray="100.5"
                  strokeDashoffset={100.5 - securityScore}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex flex-wrap gap-2 border-b border-border/60 bg-muted/40 p-4">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold outline-none transition-all duration-200",
              activeTab === "general"
                ? "border border-primary/25 bg-primary/10 text-primary shadow-sm"
                : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <User className="h-4 w-4" />
            {t("profile.nav.general")}
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold outline-none transition-all duration-200",
              activeTab === "security"
                ? "border border-primary/25 bg-primary/10 text-primary shadow-sm"
                : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Shield className="h-4 w-4" />
            {t("profile.nav.security")}
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold outline-none transition-all duration-200",
              activeTab === "sessions"
                ? "border border-primary/25 bg-primary/10 text-primary shadow-sm"
                : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Monitor className="h-4 w-4" />
            {t("profile.nav.sessions")}
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold outline-none transition-all duration-200",
              activeTab === "activity"
                ? "border border-primary/25 bg-primary/10 text-primary shadow-sm"
                : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <ListTodo className="h-4 w-4" />
            {t("profile.nav.activity")}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {activeTab === "general" && (
            <ProfileGeneralTab
              profile={profile}
              initials={initials}
              avatarVm={avatarVm}
              profileVm={profileVm}
            />
          )}

          {activeTab === "security" && (
            <ProfileSecurityTab
              profile={profile}
              linkedMobileDevices={linkedMobileDevices}
              sessionsVm={sessionsVm}
              securityVm={securityVm}
              passkeyVm={passkeyVm}
            />
          )}

          {activeTab === "sessions" && <ProfileSessionsTab sessionsVm={sessionsVm} />}

          {activeTab === "activity" && <ProfileActivityTab activityVm={activityVm} />}
        </div>
      </div>
    </div>
  );
}
