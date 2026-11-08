"use client";

/**
 * ProfileRailLayout
 *
 * Persistent command console layout for SCRIPE Sovereign Account World v3.0.
 * Houses the Sticky Left Rail (Executive Badge, Live Academy Switcher, and
 * 6 Categorized Role/Edition-Gated Rail Sections covering all 15 /account/* routes).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Card } from "@core/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import {
  User,
  BadgeCheck,
  ShieldCheck,
  Radar,
  TabletSmartphone,
  Scale,
  Activity,
  Lock,
  Sliders,
  Accessibility,
  Sparkles,
  Bell,
  Crown,
  Wallet,
  Network,
  Building2,
} from "lucide-react";
import type { AdminProfile } from "../../domain/entities/AdminProfile";

interface ProfileRailLayoutProps {
  profile?: AdminProfile | null;
  selectedAcademyId?: string;
  onSwitchAcademy?: (id: string) => void;
  children: React.ReactNode;
}

export function ProfileRailLayout({
  profile,
  selectedAcademyId,
  onSwitchAcademy,
  children,
}: ProfileRailLayoutProps) {
  const { t } = useI18n();
  const pathname = usePathname();

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || profile.username
    : "Capt. Seif El-Din Kamel";

  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "SK"
    : "SK";

  const categories = [
    {
      id: "identity",
      title: t("profile.rail.catIdentity"),
      items: [
        { href: "/account/dossier", label: t("profile.rail.dossier"), description: t("profile.rail.dossierDesc"), icon: User },
        { href: "/account/credentials", label: t("profile.rail.credentials"), description: t("profile.rail.credentialsDesc"), icon: BadgeCheck },
      ],
    },
    {
      id: "security",
      title: t("profile.rail.catSecurity"),
      items: [
        { href: "/account/security", label: t("profile.rail.security"), description: t("profile.rail.securityDesc"), icon: ShieldCheck },
        { href: "/account/sessions", label: t("profile.rail.sessions"), description: t("profile.rail.sessionsDesc"), icon: Radar },
        { href: "/account/devices", label: t("profile.rail.devices"), description: t("profile.rail.devicesDesc"), icon: TabletSmartphone },
      ],
    },
    {
      id: "governance",
      title: t("profile.rail.catGovernance"),
      items: [
        { href: "/account/governance", label: t("profile.rail.governance"), description: t("profile.rail.governanceDesc"), icon: Scale },
        { href: "/account/activity", label: t("profile.rail.activity"), description: t("profile.rail.activityDesc"), icon: Activity },
        { href: "/account/privacy", label: t("profile.rail.privacy"), description: t("profile.rail.privacyDesc"), icon: Lock },
      ],
    },
    {
      id: "workstation",
      title: t("profile.rail.catWorkstation"),
      items: [
        { href: "/account/preferences", label: t("profile.rail.preferences"), description: t("profile.rail.preferencesDesc"), icon: Sliders },
        { href: "/account/accessibility", label: t("profile.rail.accessibility"), description: t("profile.rail.accessibilityDesc"), icon: Accessibility },
        { href: "/account/ai-copilot", label: t("profile.rail.aiCopilot"), description: t("profile.rail.aiCopilotDesc"), icon: Sparkles },
        { href: "/account/notifications", label: t("profile.rail.notifications"), description: t("profile.rail.notificationsDesc"), icon: Bell },
      ],
    },
    {
      id: "commercial",
      title: t("profile.rail.catCommercial"),
      items: [
        { href: "/account/plan", label: t("profile.rail.plan"), description: t("profile.rail.planDesc"), icon: Crown },
        { href: "/account/billing", label: t("profile.rail.billing"), description: t("profile.rail.billingDesc"), icon: Wallet },
      ],
    },
    {
      id: "ecosystem",
      title: t("profile.rail.catEcosystem"),
      items: [
        { href: "/account/integrations", label: t("profile.rail.integrations"), description: t("profile.rail.integrationsDesc"), icon: Network },
      ],
    },
  ];

  const isItemActive = (itemHref: string) =>
    pathname === itemHref || pathname.startsWith(`${itemHref}/`);

  const academies = profile?.availableAcademies || [
    { id: "default-ahly", name: "Al-Ahly SC — Gezira HQ", isCurrent: true },
    { id: "ahly-nasr", name: "Al-Ahly SC — Nasr City Campus", isCurrent: false },
    { id: "ahly-sheikh-zayed", name: "Al-Ahly SC — Sheikh Zayed Complex", isCurrent: false },
  ];

  const activeAcademy =
    academies.find((a) => a.id === selectedAcademyId) ||
    academies.find((a) => a.isCurrent) ||
    academies[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sticky Left Rail */}
      <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-20">
        {/* Executive Identity Card */}
        <Card className="rounded-xl border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-colors">
          <div className="flex items-center gap-3.5">
            <Avatar className="h-12 w-12 border border-nx-line shrink-0">
              {profile?.profileImageUrl && (
                <AvatarImage src={profile.profileImageUrl} alt={fullName} />
              )}
              <AvatarFallback className="bg-nx-accent-wash text-nx-accent font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-nx-ink text-sm truncate">{fullName}</h3>
              <p className="text-xs text-nx-ink-3 truncate font-mono">
                @{profile?.username || "seif.kamel"}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-medium text-success">
                  {t("profile.hud.inSession")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-nx-line flex items-center justify-between text-xs">
            <span className="text-nx-ink-2">{t("profile.rail.staffId")}</span>
            <span className="font-mono text-[11px] font-semibold text-nx-ink px-1.5 py-0.5 rounded bg-nx-raised border border-nx-line">
              {profile?.staffCode || "#SCR-AHLY-001"}
            </span>
          </div>

          {/* Live Academy Campus Switcher */}
          <div className="mt-3.5 pt-3 border-t border-nx-line space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-nx-ink-2">
              <Building2 className="h-3.5 w-3.5 text-nx-accent" style={{ minWidth: 14, minHeight: 14 }} />
              <span>{t("profile.rail.activeCampus")}</span>
            </div>
            <Select value={activeAcademy.id} onValueChange={onSwitchAcademy}>
              <SelectTrigger className="w-full text-xs h-8 bg-nx-raised border-nx-line text-nx-ink">
                <SelectValue placeholder={t("profile.rail.selectCampus")} />
              </SelectTrigger>
              <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
                {academies.map((acad) => (
                  <SelectItem key={acad.id} value={acad.id} className="text-xs hover:bg-nx-raised">
                    {acad.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* 6 Categorized Sovereign Navigation Rail Sections */}
        <nav
          className="rounded-xl border border-nx-line bg-nx-surface p-2.5 space-y-3"
          aria-label="Sovereign Account Navigation"
        >
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
                {cat.title}
              </div>
              {cat.items.map((item) => {
                const active = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group",
                      active
                        ? "border border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                        : "text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-nx-accent" : "text-nx-ink-3 group-hover:text-nx-accent"
                      )}
                      style={{ width: 16, height: 16, minWidth: 16, minHeight: 16 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.label}</div>
                      <div
                        className={cn(
                          "text-[10px] truncate leading-tight",
                          active ? "text-nx-accent/80" : "text-nx-ink-3"
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 min-w-0 w-full">{children}</main>
    </div>
  );
}
