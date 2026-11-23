"use client";

/**
 * ProfileTelemetryHud
 *
 * Persistent Sovereign Telemetry HUD across all /account/* routes.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { Building2, ShieldCheck } from "lucide-react";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type {
  SovereignAccountContext,
  SovereignSecuritySlice,
} from "../../domain/entities/SovereignAccountEntities";
import { ProfileTelemetryHudSkeleton } from "./AccountSkeletons";
import {
  ProfilePostureChecklistDialog,
  buildPostureChecklistItems,
} from "./ProfilePostureChecklistDialog";
import { TelemetryHudBadges } from "./TelemetryHudBadges";

/** Props for {@link ProfileTelemetryHud}. */
export interface ProfileTelemetryHudProps {
  /** Legacy admin profile fallback used when sovereign context is not yet loaded. */
  profile?: AdminProfile | null;
  /** Sovereign account context containing tenant, staff code, posture score, and session counts. */
  accountContext?: SovereignAccountContext | null;
  /** Sovereign security slice fallback (accessible during mandatory MFA enrollment). */
  security?: Partial<
    Pick<SovereignSecuritySlice, "securityPostureScore" | "postureChecklist" | "isTwoFactorEnabled">
  > | null;
  /** Live active session count override from workstation fleet slice. */
  activeSessionCount?: number;
  /** Toggles operational availability status on the backend profile. */
  onToggleAvailability?: (available: boolean) => void;
  /** Opens the Sudo step-up elevation dialog. */
  onOpenSudoGate?: () => void;
  /** Immediately locks the elevated sudo session. */
  onLockSudo?: () => void | Promise<void>;
  /** Explicit sudo active flag overriding store value when supplied. */
  sudoActive?: boolean;
  /** Shows loading skeleton when neither profile nor context has resolved. */
  isLoading?: boolean;
}

/** Persistent telemetry header displaying account security posture, Sudo countdown, and session status. */
export function ProfileTelemetryHud({
  profile,
  accountContext,
  security,
  activeSessionCount,
  onToggleAvailability,
  onOpenSudoGate,
  onLockSudo,
  sudoActive,
  isLoading = false,
}: ProfileTelemetryHudProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const authUser = useAppStore((s) => s.user);
  const { isPlatform, isTenant, activeTenantName } = useAdminContext();

  const storeSudoActive = useSudoStore((s) => s.isActive);
  const sudoExpiresAtUtc = useSudoStore((s) => s.expiresAtUtc);
  const openSudoModal = useSudoStore((s) => s.openModal);
  const effectiveSudoActive =
    typeof sudoActive === "boolean" ? sudoActive && storeSudoActive : storeSudoActive;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!sudoExpiresAtUtc) return 0;
    return Math.max(0, Math.floor((Date.parse(sudoExpiresAtUtc) - Date.now()) / 1000));
  });

  const displayedRemainingSeconds =
    effectiveSudoActive && sudoExpiresAtUtc ? remainingSeconds : 0;

  useEffect(() => {
    if (!effectiveSudoActive || !sudoExpiresAtUtc) {
      return;
    }
    const compute = () => {
      const diff = Math.floor((Date.parse(sudoExpiresAtUtc) - Date.now()) / 1000);
      setRemainingSeconds(Math.max(0, diff));
    };
    const immediate = setTimeout(compute, 0);
    const timer = setInterval(compute, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(timer);
    };
  }, [effectiveSudoActive, sudoExpiresAtUtc]);

  if (isLoading && !profile && !accountContext && !security && !authUser) {
    return <ProfileTelemetryHudSkeleton />;
  }

  const checklistItems = buildPostureChecklistItems(accountContext, profile, t, security);
  const principalContext = accountContext?.principalContext;
  const isPlatformAdmin = principalContext
    ? principalContext.principalKind === "PlatformAdmin"
    : isPlatform && Boolean(authUser);

  const isAvailable =
    accountContext?.isAvailableForOperations ?? profile?.isAvailableForOperations ?? true;
  const securityScore =
    accountContext?.securityPostureScore ??
    security?.securityPostureScore ??
    profile?.securityScore ??
    0;
  const resolvedSessionCount =
    activeSessionCount ?? accountContext?.activeSessionsCount ?? 0;

  const primaryOrgTitle = isPlatformAdmin
    ? principalContext?.controlPlaneLabel || t("profile.hud.globalControlPlane")
    : principalContext?.activeTenantName ||
      accountContext?.clubAffiliation ||
      profile?.clubAffiliation ||
      activeTenantName ||
      (isTenant
        ? t("chrome.section.organization", { defaultValue: "Organization" })
        : t("profile.hud.noOrganizationScoped"));

  const secondaryBadgeText = isPlatformAdmin
    ? t("profile.hud.soleRootGuard")
    : accountContext?.editionName || profile?.editionName || "";

  const branchLabel = isPlatformAdmin
    ? t("profile.hud.globalControlPlane")
    : accountContext?.activeBranchName ||
      principalContext?.activeBranchName ||
      profile?.activeBranchName ||
      "";
  const staffCode = accountContext?.staffCode || profile?.staffCode || "";

  return (
    <>
      <Card className="w-full rounded-xl border border-nx-line bg-nx-surface p-4 sm:p-5 mb-6 hover:border-nx-line-hi transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-nx-line bg-nx-accent-wash text-nx-accent">
              <Building2 className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                <h2 className="text-sm font-semibold tracking-tight text-nx-ink truncate min-w-0">
                  {primaryOrgTitle}
                </h2>
                {secondaryBadgeText && (
                  <Badge
                    variant="outline"
                    className="border-nx-accent/30 text-nx-accent text-[10px] font-medium py-0 px-1.5 flex items-center gap-1 shrink-0 whitespace-nowrap"
                  >
                    <ShieldCheck className="h-3 w-3 shrink-0" style={{ minWidth: 12, minHeight: 12 }} />
                    <span>{secondaryBadgeText}</span>
                  </Badge>
                )}
              </div>
              {(branchLabel || staffCode) && (
                <p className="text-xs text-nx-ink-3 mt-0.5 font-mono truncate">
                  {branchLabel}
                  {branchLabel && staffCode ? " • " : ""}
                  {staffCode ? <bdi dir="ltr">{staffCode}</bdi> : null}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap xl:flex-nowrap shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-nx-line bg-nx-raised shrink-0 whitespace-nowrap">
              <Switch
                checked={isAvailable}
                onCheckedChange={onToggleAvailability}
                aria-label={t("profile.hud.toggleAvailability")}
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-nx-ink leading-tight">
                  {isAvailable ? t("profile.hud.activeStatus") : t("profile.hud.standbyStatus")}
                </span>
                <span className="text-[10px] text-nx-ink-3">
                  {isAvailable ? t("profile.hud.inSession") : t("profile.hud.offDuty")}
                </span>
              </div>
            </div>

            <TelemetryHudBadges
              securityScore={securityScore}
              effectiveSudoActive={effectiveSudoActive}
              remainingSeconds={displayedRemainingSeconds}
              resolvedSessionCount={resolvedSessionCount}
              onOpenChecklist={() => setChecklistOpen(true)}
              onTriggerSudo={() => (onOpenSudoGate ? onOpenSudoGate() : openSudoModal())}
              onLockSudo={onLockSudo}
            />
          </div>
        </div>
      </Card>

      <ProfilePostureChecklistDialog
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
        securityScore={securityScore}
        items={checklistItems}
        onNavigate={(href) => {
          setChecklistOpen(false);
          router.push(href);
        }}
      />
    </>
  );
}
