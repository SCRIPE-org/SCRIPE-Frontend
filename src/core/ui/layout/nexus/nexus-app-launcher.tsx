"use client";

/**
 * NexusAppLauncher — Waffle-menu overlay (⊞ button)
 *
 * Behaviour that must not regress:
 *  1. Token-safe accent alpha via color-mix(in oklch, …) — works for hex,
 *     hsl(), oklch() AND var() accents; no string concatenation anywhere. The
 *     per-card colour is the workspace's OWN backend-supplied accent: in the
 *     launcher you are looking at workspaces you are not in, so their identity
 *     colour is information, not decoration. It falls back to --nx-accent.
 *  2. Backend-authoritative licensing: ws.isLocked from API, no hardcoded mocks
 *  3. router.push() instead of window.location.href (no full-page reload)
 *  4. Locked cards are keyboard-focusable — the upgrade dialog is the upsell
 *     and tabIndex={-1} made it unreachable without a mouse
 *  5. Focus trap inside the launcher panel (the upgrade dialog now gets Radix's)
 *  6. Enter/exit: backdrop crossfades; the panel scales 0.95→1 with opacity
 *     from its bottom inline-start corner (the ⊞ trigger's side) — no keyframe
 *     slide from an edge. Exit runs at ~2/3 duration on the exit easing;
 *     reduced motion keeps the crossfade and drops the scale.
 *  7. Semantic z ladder (blur < overlay < modal) — the old raw 80/90/100/110
 *     stack collided with the tenant banner's z-70 neighbourhood
 *
 * Design corrections in this pass:
 *  - Every string moved to the shell locale pack. The file used to carry its
 *    copy as inline `language === "ar" ? … : …` ternaries, which is two
 *    languages inside a JSX expression: `aria-label="Close"` and the pin
 *    toggle's name had already fallen out of that pattern in English only.
 *  - The upgrade prompt was a hand-built role="alertdialog" with its own
 *    scrim, its own focus trap and two hsl() fills of its own. It is now an
 *    AlertDialog, so it inherits the family's scrim, motion, footer order and
 *    focus behaviour, and the CTA is simply the primary button.
 *  - The search field is the Input primitive; it was a raw <input> wearing a
 *    hand-rolled focus-within ring.
 *  - Cards no longer lift on hover and their icon no longer scales: hover is
 *    colour and hairline, nothing floats. The 6px backdrop blur is gone — the
 *    scrim pushes the page back by taking light away.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";

import {
  Search,
  X,
  Lock,
  Check,
  LayoutGrid,
  Clock,
  ArrowUpCircle,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { DynamicIcon, NX_FOCUS_RING } from "./_parts/primary-rail-parts";
import { useWorkspaceTransitionContext } from "./nexus-layout";

// Active workspace is filtered out of the grid entirely — you are already there.
// Cards only ever appear as: available (switch to it), locked, or coming-soon.
type WorkspaceStatus = "available" | "locked" | "coming-soon";

interface NexusAppLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Status derivation ─ backend-authoritative ───────────────────────────────
// Active workspace is filtered before reaching this function, so we only
// need to distinguish locked vs available (coming-soon is future extension).
function deriveWorkspaceStatus(ws: { workspaceKey: string; isLocked: boolean }): WorkspaceStatus {
  if (ws.isLocked) return "locked";
  return "available";
}

// ── Focus trap utility ──────────────────────────────────────────────────────
function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const el = containerRef.current;
    const focusableSelectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () => Array.from(el.querySelectorAll<HTMLElement>(focusableSelectors));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    // Move focus into the container if it's outside
    if (!el.contains(document.activeElement)) {
      (getFocusable()[0] ?? el).focus();
    }
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}

// ── Enter/exit lifecycle ────────────────────────────────────────────────────
// "closed" → unmounted. "pre" → mounted one frame in the hidden pose so the
// transition has a starting point. "open" → resting pose. "closing" → hidden
// pose again while the exit transition plays, then unmount.
type LauncherPhase = "closed" | "pre" | "open" | "closing";
// Exit visual duration is --nx-t-micro (140ms ≈ 2/3 of standard); unmount a
// beat later so the transition is never clipped.
const EXIT_UNMOUNT_MS = 170;

// Card geometry is shared by every workspace tile so a locked card and an
// available one are the same object in two states, never two components.
const CARD_GRID = "grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(120px,1fr))]";

// ── Main Component ───────────────────────────────────────────────────────────
export function NexusAppLauncher({ open, onOpenChange }: NexusAppLauncherProps) {
  const { workspaceGroups, activeWorkspace, togglePin } = useWorkspace();
  const { language, direction, t } = useI18n();
  const { switchWorkspace } = useWorkspaceTransitionContext();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);
  const [pinningKey, setPinningKey] = useState<string | null>(null); // loading state for pin toggle
  const [phase, setPhase] = useState<LauncherPhase>("closed");
  const searchRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  const isRTL = direction === "rtl";

  // Drive the phase machine from the `open` prop
  useEffect(() => {
    let cancel = false;
    let raf1 = 0;
    let raf2 = 0;
    let timer = 0;

    queueMicrotask(() => {
      if (cancel) return;
      if (open) {
        setPhase("pre");
        // Double rAF: guarantee the hidden pose paints before the transition runs
        raf1 = requestAnimationFrame(() => {
          raf2 = requestAnimationFrame(() => setPhase("open"));
        });
      } else {
        setPhase((p) => (p === "closed" ? "closed" : "closing"));
        timer = window.setTimeout(() => setPhase("closed"), EXIT_UNMOUNT_MS);
      }
    });

    return () => {
      cancel = true;
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (timer) window.clearTimeout(timer);
    };
  }, [open]);

  // Focus search on open, clear state
  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setSearch("");
        setUpgradeTarget(null);
      });
      setTimeout(() => searchRef.current?.focus(), 120);
    }
  }, [open]);

  // Keyboard: Escape closes dialog or upgrade modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (upgradeTarget) setUpgradeTarget(null);
        else onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [open, onOpenChange, upgradeTarget]);

  // Filter by search query
  const filteredWorkspaces = useMemo(() => {
    if (!search.trim()) return workspaceGroups;
    const q = search.toLowerCase();
    return workspaceGroups.filter(
      (ws) =>
        ws.workspaceNameEn.toLowerCase().includes(q) ||
        ws.workspaceNameAr.includes(q) ||
        ws.workspaceKey.toLowerCase().includes(q)
    );
  }, [workspaceGroups, search]);

  // Sort helper: pinned items first (by pinSortOrder asc), then unpinned (by workspaceSortOrder asc)
  const sortByPinThenCatalog = useCallback(
    (items: typeof workspaceGroups) =>
      [...items].sort((a, b) => {
        const aPinned = a.isPinned;
        const bPinned = b.isPinned;
        if (aPinned && bPinned) {
          // Both pinned → use PinSortOrder
          const aOrder = a.pinSortOrder ?? Infinity;
          const bOrder = b.pinSortOrder ?? Infinity;
          return aOrder !== bOrder ? aOrder - bOrder : a.workspaceSortOrder - b.workspaceSortOrder;
        }
        if (aPinned) return -1; // pinned first
        if (bPinned) return 1;
        // Both unpinned → catalog order
        return a.workspaceSortOrder - b.workspaceSortOrder;
      }),
    []
  );

  const activeWorkspaceKey = activeWorkspace?.workspaceKey;

  const adminItems = useMemo(
    () =>
      sortByPinThenCatalog(
        filteredWorkspaces.filter(
          (ws) => ws.isAdminWorkspace && ws.workspaceKey !== activeWorkspaceKey
        )
      ),
    [filteredWorkspaces, sortByPinThenCatalog, activeWorkspaceKey]
  );
  const moduleItems = useMemo(
    () =>
      sortByPinThenCatalog(
        filteredWorkspaces.filter(
          (ws) => ws.isModuleWorkspace && ws.workspaceKey !== activeWorkspaceKey
        )
      ),
    [filteredWorkspaces, sortByPinThenCatalog, activeWorkspaceKey]
  );

  const { currentTenant } = useTenantContext();
  const hasTenantContext = !!currentTenant;

  // Handle card click — locked → show upgrade/context dialog, else switch
  const handleSelect = useCallback(
    (wsKey: string, status: WorkspaceStatus) => {
      if (status === "locked") {
        setUpgradeTarget(wsKey);
        return;
      }
      if (status === "coming-soon") return;
      switchWorkspace(wsKey);
      onOpenChange(false);
    },
    [switchWorkspace, onOpenChange]
  );

  // Handle pin toggle — calls backend, updates store optimistically
  const handleTogglePin = useCallback(
    async (wsKey: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (pinningKey) return; // debounce concurrent requests
      setPinningKey(wsKey);
      try {
        await togglePin(wsKey);
      } catch {
        // Show user-facing error feedback — store was NOT updated (no optimistic mutation here)
        toast({
          title: t("common.error"),
          description: t("nav.pinToggleFailed"),
          variant: "destructive",
        });
      } finally {
        setPinningKey(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [togglePin, pinningKey]
  );

  // Focus trap — active when launcher is open and no upgrade dialog shown
  // (the AlertDialog brings Radix's own trap when it is).
  useFocusTrap(launcherRef, open && !upgradeTarget);

  // Stay mounted through the exit transition, then release the DOM
  if (!open && phase === "closed") return null;

  const visible = open && phase === "open";

  return (
    <>
      {/* ── Backdrop — crossfade only, 140ms. No backdrop-filter: the scrim
          pushes the page back by taking light away, not by blurring it. ── */}
      <div
        className={cn(
          "fixed inset-0 z-blur bg-scrim transition-opacity duration-nx-micro motion-reduce:transition-none",
          visible ? "opacity-100 ease-nx-enter" : "opacity-0 ease-nx-exit",
          !open && "pointer-events-none"
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* ── Launcher Panel ───────────────────────────────────────────────── */}
      {/* Scales 0.95→1 from its bottom inline-start corner — the ⊞ trigger
          lives at the bottom of the primary rail, so growth reads as coming
          from it. Centering is class-composed (-translate-*) so it shares one
          transform with the scale instead of fighting an inline style. */}
      <div
        ref={launcherRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed left-1/2 top-1/2 z-overlay flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden",
          "rounded-nx-lg border border-nx-line-hi bg-nx-popover shadow-nx-modal",
          "transition-[transform,opacity] motion-reduce:transition-none",
          isRTL ? "rtl origin-bottom-right" : "ltr origin-bottom-left",
          visible
            ? "scale-100 opacity-100 duration-nx-standard ease-nx-enter"
            : "scale-95 opacity-0 duration-nx-micro ease-nx-exit motion-reduce:scale-100",
          !open && "pointer-events-none"
        )}
        style={{
          width: "min(700px, 92vw)",
          maxHeight: "min(640px, 86vh)",
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-nx-line px-6 pb-4 pt-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-wash">
              <LayoutGrid className="h-5 w-5 text-nx-accent" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-lg font-semibold leading-tight tracking-tight text-nx-ink"
              >
                {t("shell.launcher.title")}
              </h2>
              <p className="text-sm leading-relaxed text-nx-ink-2">
                {t("shell.launcher.description")}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="ms-auto h-8 w-8 shrink-0"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Search — the Input primitive owns rest/hover/focus/invalid; the
              glyph and the clear control ride in its inline padding. */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
              aria-hidden="true"
            />
            <Input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("shell.launcher.searchPlaceholder")}
              aria-label={t("shell.launcher.searchPlaceholder")}
              className="pe-11 ps-9"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearch("")}
                className="absolute end-1 top-1 h-8 w-8"
                aria-label={t("shell.launcher.clearSearch")}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        {/* ── Content grid ─────────────────────────────────────────────── */}
        <div className="nexus-custom-scrollbar flex-1 overflow-y-auto px-6 pb-5 pt-4">
          {/* Admin workspaces */}
          {adminItems.length > 0 && (
            <section className="mb-6">
              <SectionLabel label={t("shell.launcher.sections.administration")} />
              <div className={CARD_GRID}>
                {adminItems.map((ws) => {
                  const status = deriveWorkspaceStatus(ws);
                  return (
                    <WorkspaceCard
                      key={ws.workspaceKey}
                      name={ws.getLocalizedName(language)}
                      icon={ws.workspaceIcon}
                      accentColor={ws.accentColor}
                      isActive={false}
                      isPinned={ws.isPinned}
                      isPinLoading={pinningKey === ws.workspaceKey}
                      status={status}
                      onClick={() => handleSelect(ws.workspaceKey, status)}
                      onTogglePin={
                        !ws.isLocked ? (e) => handleTogglePin(ws.workspaceKey, e) : undefined
                      }
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Module workspaces — always rendered; backend controls isLocked per workspace */}
          {moduleItems.length > 0 && (
            <section>
              <SectionLabel label={t("shell.launcher.sections.modules")} />
              <div className={CARD_GRID}>
                {moduleItems.map((ws) => {
                  const status = deriveWorkspaceStatus(ws);
                  return (
                    <WorkspaceCard
                      key={ws.workspaceKey}
                      name={ws.getLocalizedName(language)}
                      icon={ws.workspaceIcon}
                      accentColor={ws.accentColor}
                      isActive={false}
                      isPinned={ws.isPinned}
                      isPinLoading={pinningKey === ws.workspaceKey}
                      status={status}
                      onClick={() => handleSelect(ws.workspaceKey, status)}
                      onTogglePin={
                        !ws.isLocked ? (e) => handleTogglePin(ws.workspaceKey, e) : undefined
                      }
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state — no action slot: the only move left is editing the
              search, and its clear control is already one tab away. */}
          {filteredWorkspaces.length === 0 && (
            <div aria-live="polite">
              <EmptyState
                bare
                icon={Search}
                size="md"
                title={t("shell.launcher.empty.title")}
                description={t("shell.launcher.empty.description")}
              />
            </div>
          )}
        </div>

        {/* ── Legend footer ─────────────────────────────────────────────── */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-4 border-t border-nx-line px-6 pb-3.5 pt-2.5">
          <LegendItem
            icon={<Check className="h-2.5 w-2.5" aria-hidden="true" />}
            colorClass="text-success"
            label={t("shell.launcher.legend.active")}
          />
          <LegendItem
            icon={<Pin className="h-2.5 w-2.5" aria-hidden="true" />}
            colorClass="text-nx-accent"
            label={t("shell.launcher.legend.pinned")}
          />
          <LegendItem
            icon={<Lock className="h-2.5 w-2.5" aria-hidden="true" />}
            colorClass="text-warning"
            label={t("shell.launcher.legend.locked")}
          />
          <LegendItem
            icon={<Clock className="h-2.5 w-2.5" aria-hidden="true" />}
            colorClass="text-nx-ink-3"
            label={t("shell.launcher.legend.comingSoon")}
          />
        </div>
      </div>

      {/* ── Upgrade Dialog ──────────────────────────────────────────────── */}
      {upgradeTarget && (
        <UpgradeDialog
          workspaceName={
            workspaceGroups
              .find((ws) => ws.workspaceKey === upgradeTarget)
              ?.getLocalizedName(language) ?? upgradeTarget
          }
          // Platform admins (no tenant context) see a locked module because
          // modules require a tenant to be active — show "Select a Tenant"
          // rather than the misleading "Upgrade your plan" copy.
          isNeedsTenant={!hasTenantContext}
          onClose={() => setUpgradeTarget(null)}
          onUpgrade={() => {
            setUpgradeTarget(null);
            onOpenChange(false);
            // If the user has no tenant context, navigate to the tenants list
            // so they can drill into one. Otherwise go to billing/subscription.
            startRoutingProgress();
            router.push(hasTenantContext ? "/my-subscription" : "/tenants");
          }}
        />
      )}
    </>
  );
}

// ── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
      {label}
    </p>
  );
}

// ── Legend Item ───────────────────────────────────────────────────────────────
function LegendItem({
  icon,
  colorClass,
  label,
}: {
  icon: React.ReactNode;
  colorClass: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-nx-ink-3">
      <span className={cn("flex", colorClass)}>{icon}</span>
      {label}
    </div>
  );
}

// ── Workspace Card ────────────────────────────────────────────────────────────
function WorkspaceCard({
  name,
  icon,
  accentColor,
  isActive,
  isPinned = false,
  isPinLoading = false,
  status,
  onClick,
  onTogglePin,
}: {
  name: string;
  icon: string;
  accentColor: string | null;
  isActive: boolean;
  isPinned?: boolean;
  isPinLoading?: boolean;
  status: WorkspaceStatus;
  onClick: () => void;
  onTogglePin?: (e: React.MouseEvent) => void;
}) {
  const { t } = useI18n();
  const color = accentColor || "var(--nx-accent)";
  const isLocked = status === "locked";
  const isComingSoon = status === "coming-soon";
  const isDisabled = isLocked || isComingSoon;

  return (
    <div
      role="button"
      // Locked cards stay in the tab order — clicking OR keying one opens the
      // upgrade dialog, and that upsell must be keyboard-reachable. Only
      // coming-soon (a true no-op) leaves the tab order.
      tabIndex={isComingSoon ? -1 : 0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isComingSoon) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={isActive}
      aria-disabled={isComingSoon}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-nx-md border px-2.5 pb-3.5 pt-4",
        "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        NX_FOCUS_RING,
        isComingSoon ? "cursor-default" : "cursor-pointer",
        // Hover brightens the hairline and steps the fill. Nothing lifts.
        isActive
          ? "border-nx-accent bg-nx-accent-wash"
          : isDisabled
            ? "border-nx-line bg-nx-raised"
            : "border-nx-line bg-transparent hover:border-nx-line-hi hover:bg-nx-raised"
      )}
    >
      {/* Pin toggle — reveals on hover AND keyboard focus-within; always
          visible on coarse pointers, where there is no hover to reveal it */}
      {onTogglePin && !isLocked && !isComingSoon && (
        <button
          type="button"
          onClick={onTogglePin}
          onKeyDown={(e) => e.stopPropagation()}
          disabled={isPinLoading}
          aria-label={isPinned ? t("shell.launcher.unpin") : t("shell.launcher.pin")}
          className={cn(
            "absolute top-1 flex h-5 w-5 items-center justify-center rounded-nx-sm border",
            "transition-opacity duration-nx-micro motion-reduce:transition-none",
            "start-1 disabled:cursor-wait",
            "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100",
            isPinned
              ? "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent opacity-100"
              : "border-transparent bg-nx-raised-2 text-nx-ink-2",
            NX_FOCUS_RING
          )}
        >
          {isPinned ? (
            <PinOff className="h-2.5 w-2.5" aria-hidden="true" />
          ) : (
            <Pin className="h-2.5 w-2.5" aria-hidden="true" />
          )}
        </button>
      )}

      {/* Status badge — only for active, locked, coming-soon. The glyph is
          decorative: the accessible name is the legend plus the card label. */}
      {(isActive || isLocked || isComingSoon) && (
        <div
          className={cn(
            "absolute end-1 top-1 flex items-center rounded-nx-sm px-1 py-0.5",
            // Measured global status tokens — read, never redefined here
            isLocked
              ? "bg-warning/10 text-warning"
              : isComingSoon
                ? "bg-nx-raised-2 text-nx-ink-3"
                : "bg-success/10 text-success"
          )}
        >
          {isLocked ? (
            <Lock className="h-2 w-2" aria-hidden="true" />
          ) : isComingSoon ? (
            <Clock className="h-2 w-2" aria-hidden="true" />
          ) : (
            <Check className="h-2 w-2" aria-hidden="true" />
          )}
        </div>
      )}

      {/* Icon container — the workspace's own accent, mixed token-safely so a
          hex, an hsl(), an oklch() or a var() all tint identically. */}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-nx-md",
          isDisabled && "bg-nx-raised text-nx-ink-3"
        )}
        style={
          isDisabled
            ? undefined
            : {
                background: `color-mix(in oklch, ${color} 12%, transparent)`,
                color,
              }
        }
      >
        <DynamicIcon name={icon} size={20} />
      </div>

      {/* Name */}
      <span
        className={cn(
          "max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs font-medium leading-tight",
          isActive ? "text-nx-accent" : isDisabled ? "text-nx-ink-3" : "text-nx-ink-2"
        )}
      >
        {name}
      </span>
    </div>
  );
}

// ── Upgrade Dialog ────────────────────────────────────────────────────────────
export function UpgradeDialog({
  workspaceName,
  isNeedsTenant,
  onClose,
  onUpgrade,
}: {
  workspaceName: string;
  /** True when the module is locked only because no tenant context is active.
   *  Changes the dialog copy to "Select a Tenant" instead of "Upgrade Plan". */
  isNeedsTenant: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const { t } = useI18n();

  // Keys are spelled out rather than composed from a namespace variable so a
  // locale audit can grep them.
  const copy = isNeedsTenant
    ? {
        title: t("shell.launcher.selectTenant.title"),
        description: t("shell.launcher.selectTenant.description", { name: workspaceName }),
        cta: t("shell.launcher.selectTenant.cta"),
      }
    : {
        title: t("shell.launcher.upgrade.title"),
        description: t("shell.launcher.upgrade.description", { name: workspaceName }),
        cta: t("shell.launcher.upgrade.cta"),
      };

  return (
    <AlertDialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Severity speaks through glyph + hairline + wash; the copy below
              keeps neutral ink. */}
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-nx-md border",
              isNeedsTenant
                ? "border-info/30 bg-info/10 text-info"
                : "border-warning/30 bg-warning/10 text-warning"
            )}
          >
            <ArrowUpCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onUpgrade}>{copy.cta}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
