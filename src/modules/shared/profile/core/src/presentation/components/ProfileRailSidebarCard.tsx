"use client";

/**
 * ProfileRailSidebarCard
 *
 * Executive identity card and categorized navigation config helpers
 * extracted from `ProfileRailLayout`.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Skeleton } from "@core/ui/skeleton";
import {
  Activity,
  Bell,
  Building2,
  Crown,
  Network,
  Radar,
  Scale,
  ShieldCheck,
  Sliders,
  User,
} from "lucide-react";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type { AccountPrincipalContext } from "../../domain/entities/SovereignAccountEntities";

/** Branch selector option displayed in the account rail. */
export interface RailBranchOption {
  id: string;
  name: string;
  isCurrent?: boolean;
}

/** Optional feature visibility gates resolved from principal context. */
export interface ProfileRailFeatureVisibility {
  integrationsEnabled?: boolean;
  planAndQuotasEnabled?: boolean;
}

/** Builds categorized Sovereign Account navigation sections gated by principal type and features. */
export function buildProfileRailCategories(
  t: (key: string) => string,
  isPlatformAdmin: boolean,
  featureFlags?: ProfileRailFeatureVisibility | null
) {
  return [
    {
      id: "identity",
      title: t("profile.rail.catIdentity"),
      items: [
        { href: "/account/dossier", label: t("profile.rail.dossier"), description: t("profile.rail.dossierDesc"), icon: User },
      ],
    },
    {
      id: "security",
      title: t("profile.rail.catSecurity"),
      items: [
        { href: "/account/security", label: t("profile.rail.security"), description: t("profile.rail.securityDesc"), icon: ShieldCheck },
        { href: "/account/sessions", label: t("profile.rail.sessions"), description: t("profile.rail.sessionsDesc"), icon: Radar },
      ],
    },
    {
      id: "governance",
      title: t("profile.rail.catGovernance"),
      items: [
        { href: "/account/governance", label: t("profile.rail.governance"), description: t("profile.rail.governanceDesc"), icon: Scale },
        { href: "/account/activity", label: t("profile.rail.activity"), description: t("profile.rail.activityDesc"), icon: Activity },
      ],
    },
    {
      id: "workstation",
      title: t("profile.rail.catWorkstation"),
      items: [
        { href: "/account/preferences", label: t("profile.rail.preferences"), description: t("profile.rail.preferencesDesc"), icon: Sliders },
        { href: "/account/notifications", label: t("profile.rail.notifications"), description: t("profile.rail.notificationsDesc"), icon: Bell },
      ],
    },
    ...(!isPlatformAdmin && featureFlags?.planAndQuotasEnabled !== false
      ? [
          {
            id: "commercial",
            title: t("profile.rail.catCommercial"),
            items: [
              { href: "/account/plan", label: t("profile.rail.plan"), description: t("profile.rail.planDesc"), icon: Crown },
            ],
          },
        ]
      : []),
    ...(featureFlags?.integrationsEnabled !== false
      ? [
          {
            id: "ecosystem",
            title: t("profile.rail.catEcosystem"),
            items: [
              { href: "/account/integrations", label: t("profile.rail.integrations"), description: t("profile.rail.integrationsDesc"), icon: Network },
            ],
          },
        ]
      : []),
  ];
}

interface ProfileRailIdentityCardProps {
  profile?: AdminProfile | null;
  principalContext?: AccountPrincipalContext | null;
  isPlatformAdmin: boolean;
  branchOptions: RailBranchOption[];
  activeAcademy?: RailBranchOption;
  onSwitchAcademy?: (id: string) => void;
}

/** Executive identity badge, control-plane tag, and branch selector card inside the sticky rail. */
export function ProfileRailIdentityCard({
  profile,
  principalContext,
  isPlatformAdmin,
  branchOptions,
  activeAcademy,
  onSwitchAcademy,
}: ProfileRailIdentityCardProps) {
  const { t } = useI18n();
  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || profile.username || ""
    : "";
  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() ||
      profile.username?.slice(0, 2).toUpperCase() ||
      ""
    : "";

  return (
    <Card className="rounded-xl border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-colors">
      <div className="flex items-center gap-3.5">
        {profile ? (
          <Avatar className="h-12 w-12 border border-nx-line shrink-0">
            {profile.profileImageUrl && <AvatarImage src={profile.profileImageUrl} alt={fullName} />}
            <AvatarFallback className="bg-nx-accent-wash text-nx-accent font-bold text-sm">
              {initials || <User className="h-5 w-5" aria-hidden="true" />}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Skeleton shape="circle" className="h-12 w-12 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          {profile ? (
            <h3 className="font-bold text-nx-ink text-sm truncate">{fullName}</h3>
          ) : (
            <Skeleton shape="text" className="h-4 w-28" />
          )}
          {profile?.username && (
            <p className="text-xs text-nx-ink-3 truncate font-mono">
              <bdi dir="ltr">@{profile.username}</bdi>
            </p>
          )}
          <div className="mt-1 flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-success animate-pulse motion-reduce:animate-none"
            />
            <span className="text-[10px] font-medium text-success">
              {t("profile.hud.inSession")}
            </span>
          </div>
        </div>
      </div>

      {profile?.staffCode && (
        <div className="mt-3.5 pt-3 border-t border-nx-line flex items-center justify-between text-xs">
          <span className="text-nx-ink-2">{t("profile.rail.staffId")}</span>
          <span
            dir="ltr"
            className="font-mono text-[11px] font-semibold text-nx-ink px-1.5 py-0.5 rounded bg-nx-raised border border-nx-line"
          >
            {profile.staffCode}
          </span>
        </div>
      )}

      {isPlatformAdmin ? (
        <div className="mt-3.5 pt-3 border-t border-nx-line flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-nx-ink-2">
            <ShieldCheck className="h-3.5 w-3.5 text-nx-accent shrink-0" aria-hidden="true" />
            <span className="truncate">
              {principalContext?.controlPlaneLabel || t("profile.hud.globalControlPlane")}
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-nx-accent/30 text-nx-accent text-[10px] py-0 px-1.5 shrink-0"
          >
            {t("profile.hud.soleRootGuard")}
          </Badge>
        </div>
      ) : (
        branchOptions.length > 0 &&
        activeAcademy && (
          <div className="mt-3.5 pt-3 border-t border-nx-line space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-nx-ink-2">
              <Building2 className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
              <span>{t("profile.rail.activeCampus")}</span>
            </div>
            <Select value={activeAcademy.id} onValueChange={onSwitchAcademy}>
              <SelectTrigger
                aria-label={t("profile.rail.activeCampus")}
                className="w-full text-xs h-8 bg-nx-raised border-nx-line text-nx-ink"
              >
                <SelectValue placeholder={t("profile.rail.selectCampus")} />
              </SelectTrigger>
              <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
                {branchOptions.map((acad) => (
                  <SelectItem key={acad.id} value={acad.id} className="text-xs hover:bg-nx-raised">
                    {acad.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      )}
    </Card>
  );
}
