"use client";

/**
 * ProfileRailLayout
 *
 * Persistent command console layout for SCRIPE Profile & Security Suite.
 * Houses the Sticky Left Rail (Executive Badge, Live Academy Switcher, Navigation Console)
 * and the primary active sub-view viewport.
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
  ShieldCheck,
  Monitor,
  Activity,
  Sliders,
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

/**
 * ProfileRailLayout Component
 *
 * Renders the sticky left operational rail with executive badge, staff code,
 * live academy switcher, and sub-navigation links.
 */
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
    : "Administrator";

  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "SC"
    : "SC";

  const navItems = [
    {
      href: "/profile",
      label: t("profile.rail.dossier"),
      description: t("profile.rail.dossierDesc"),
      icon: User,
      exact: true,
    },
    {
      href: "/profile/security",
      label: t("profile.rail.security"),
      description: t("profile.rail.securityDesc"),
      icon: ShieldCheck,
      exact: false,
    },
    {
      href: "/profile/sessions",
      label: t("profile.rail.sessions"),
      description: t("profile.rail.sessionsDesc"),
      icon: Monitor,
      exact: false,
    },
    {
      href: "/profile/activity",
      label: t("profile.rail.activity"),
      description: t("profile.rail.activityDesc"),
      icon: Activity,
      exact: false,
    },
    {
      href: "/profile/preferences",
      label: t("profile.rail.preferences"),
      description: t("profile.rail.preferencesDesc"),
      icon: Sliders,
      exact: false,
    },
    {
      href: "/profile/integrations",
      label: t("profile.rail.integrations"),
      description: t("profile.rail.integrationsDesc"),
      icon: Network,
      exact: false,
    },
  ];

  const isItemActive = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref || pathname === `${itemHref}/`;
    }
    return pathname.startsWith(itemHref);
  };

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
        <Card className="rounded-xl border border-nx-line bg-nx-surface p-5 hover:border-nx-line-hi transition-colors">
          <div className="flex items-center gap-3.5">
            <Avatar className="h-14 w-14 border border-nx-line shrink-0">
              {profile?.profileImageUrl && (
                <AvatarImage src={profile.profileImageUrl} alt={fullName} />
              )}
              <AvatarFallback className="bg-nx-accent-wash text-nx-accent font-bold text-base">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-nx-ink text-sm truncate">{fullName}</h3>
              <p className="text-xs text-nx-ink-3 truncate">
                @{profile?.username || "admin"}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-medium text-success">
                  {t("profile.hud.inSession")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-nx-line flex items-center justify-between text-xs">
            <span className="text-nx-ink-2">{t("profile.rail.staffId")}</span>
            <span className="font-mono text-[11px] font-semibold text-nx-ink px-1.5 py-0.5 rounded bg-nx-raised border border-nx-line">
              {profile?.staffCode || "#SCR-ADM-001"}
            </span>
          </div>

          {/* Live Academy Campus Switcher */}
          <div className="mt-4 pt-3.5 border-t border-nx-line space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-nx-ink-2">
              <Building2 className="h-3.5 w-3.5 text-nx-accent" style={{ minWidth: 14, minHeight: 14 }} />
              <span>{t("profile.rail.activeCampus")}</span>
            </div>
            <Select
              value={activeAcademy.id}
              onValueChange={onSwitchAcademy}
            >
              <SelectTrigger className="w-full text-xs h-9 bg-nx-raised border-nx-line text-nx-ink">
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

        {/* Navigation Console */}
        <nav className="rounded-xl border border-nx-line bg-nx-surface p-2 space-y-1" aria-label="Profile navigation">
          {navItems.map((item) => {
            const active = isItemActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
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
                      "text-[10px] truncate leading-tight mt-0.5",
                      active ? "text-nx-accent/80" : "text-nx-ink-3"
                    )}
                  >
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 min-w-0 w-full">
        {children}
      </main>
    </div>
  );
}
