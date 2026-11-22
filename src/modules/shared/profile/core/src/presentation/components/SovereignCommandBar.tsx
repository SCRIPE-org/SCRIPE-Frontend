"use client";

/**
 * SovereignCommandBar (⌘K / Ctrl+K)
 *
 * Raycast / Linear-style instant command palette for the Sovereign Account World v3.0.
 * Allows instant keyboard navigation to authorized /account/* pages and quick security actions.
 */
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { useAccountContextSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import type {
  AccountPrincipalContext,
  SovereignAccountFeatureFlags,
} from "../../domain/entities/SovereignAccountEntities";
import {
  User,
  ShieldCheck,
  Radar,
  Scale,
  Activity,
  Sliders,
  Bell,
  Crown,
  Network,
  Search,
  CornerDownLeft,
} from "lucide-react";

/** Props for {@link SovereignCommandBar}. */
export interface SovereignCommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePrivacyBlur?: () => void;
  principalContext?: AccountPrincipalContext | null;
  featureFlags?: SovereignAccountFeatureFlags | null;
}

/** Keyboard-accessible command palette (`Cmd+K` / `Ctrl+K`) for rapid account console navigation. */
export function SovereignCommandBar({
  open,
  onOpenChange,
  onTogglePrivacyBlur,
  principalContext: principalContextProp,
  featureFlags: featureFlagsProp,
}: SovereignCommandBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const contextVm = useAccountContextSliceViewModel();

  const principalContext = principalContextProp !== undefined ? principalContextProp : contextVm?.principalContext;
  const featureFlags = featureFlagsProp !== undefined ? featureFlagsProp : contextVm?.featureFlags;
  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const showPlanCommand = !isPlatformAdmin && featureFlags?.planAndQuotasEnabled !== false;
  const showIntegrationsCommand = featureFlags?.integrationsEnabled !== false;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const commands = [
    { id: "dossier", href: "/account/dossier", label: t("profile.rail.dossier"), desc: t("profile.rail.dossierDesc"), category: t("profile.rail.catIdentity"), icon: User },
    { id: "security", href: "/account/security", label: t("profile.rail.security"), desc: t("profile.rail.securityDesc"), category: t("profile.rail.catSecurity"), icon: ShieldCheck },
    { id: "sessions", href: "/account/sessions", label: t("profile.rail.sessions"), desc: t("profile.rail.sessionsDesc"), category: t("profile.rail.catSecurity"), icon: Radar },
    { id: "governance", href: "/account/governance", label: t("profile.rail.governance"), desc: t("profile.rail.governanceDesc"), category: t("profile.rail.catGovernance"), icon: Scale },
    { id: "activity", href: "/account/activity", label: t("profile.rail.activity"), desc: t("profile.rail.activityDesc"), category: t("profile.rail.catGovernance"), icon: Activity },
    { id: "preferences", href: "/account/preferences", label: t("profile.rail.preferences"), desc: t("profile.rail.preferencesDesc"), category: t("profile.rail.catWorkstation"), icon: Sliders },
    { id: "notifications", href: "/account/notifications", label: t("profile.rail.notifications"), desc: t("profile.rail.notificationsDesc"), category: t("profile.rail.catWorkstation"), icon: Bell },
    ...(showPlanCommand
      ? [
          {
            id: "plan",
            href: "/account/plan",
            label: t("profile.rail.plan"),
            desc: t("profile.rail.planDesc"),
            category: t("profile.rail.catCommercial"),
            icon: Crown,
          },
        ]
      : []),
    ...(showIntegrationsCommand
      ? [
          {
            id: "integrations",
            href: "/account/integrations",
            label: t("profile.rail.integrations"),
            desc: t("profile.rail.integrationsDesc"),
            category: t("profile.rail.catEcosystem"),
            icon: Network,
          },
        ]
      : []),
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(normalizedQuery) ||
          c.desc.toLowerCase().includes(normalizedQuery) ||
          c.category.toLowerCase().includes(normalizedQuery) ||
          c.id.includes(normalizedQuery)
      )
    : commands;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("");
    }
    onOpenChange(nextOpen);
  };

  const handleSelect = (href: string) => {
    handleDialogOpenChange(false);
    if (pathname !== href) {
      startRoutingProgress();
    }
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-2xl border-nx-line bg-nx-surface text-nx-ink p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-nx-line bg-nx-raised">
          <DialogTitle className="text-sm font-semibold text-nx-ink flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-nx-accent" />
              <span>{t("profile.commandBar.title")}</span>
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
              ESC
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-3">
            {t("profile.commandBar.subtitle")}
          </DialogDescription>
          <div className="pt-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("profile.commandBar.searchPlaceholder")}
              className="bg-nx-surface border-nx-line text-nx-ink text-sm h-10"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[380px] overflow-y-auto p-3 space-y-1.5">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                data-testid={`command-bar-item-${item.id}`}
                onClick={() => handleSelect(item.href)}
                className="w-full justify-between h-auto py-2.5 px-3 rounded-lg border border-transparent hover:border-nx-line-hi hover:bg-nx-raised text-start"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-nx-line bg-nx-raised text-nx-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-nx-ink truncate">{item.label}</div>
                    <div className="text-[11px] text-nx-ink-3 truncate">{item.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] border-nx-line text-nx-ink-3 hidden sm:inline-flex">
                    {item.category}
                  </Badge>
                  <CornerDownLeft className="h-3.5 w-3.5 text-nx-ink-3" />
                </div>
              </Button>
            );
          })}
        </div>

        <div className="px-4 py-2.5 border-t border-nx-line bg-nx-raised flex items-center justify-between text-[11px] text-nx-ink-3">
          <span>{t("profile.commandBar.footerHint")}</span>
          {onTogglePrivacyBlur && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onTogglePrivacyBlur();
                handleDialogOpenChange(false);
              }}
              className="h-7 text-[11px] border-nx-line bg-nx-surface text-nx-ink"
            >
              {t("profile.commandBar.togglePrivacyBlur")} (Alt+P)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
