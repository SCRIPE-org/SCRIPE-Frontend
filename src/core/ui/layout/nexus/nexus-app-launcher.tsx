"use client";

/**
 * NexusAppLauncher — Waffle-menu overlay (⊞ button)
 *
 * Licensing fixes applied:
 *  1. Token-safe accent alpha via color-mix(in oklch, …) — works for hex,
 *     hsl(), oklch() AND var() accents; no string concatenation anywhere
 *  2. Admin cards correctly show "active" badge when that workspace is current
 *  3. Colour reads --nx-* / status tokens — theme resolves in CSS, no isDark
 *  4. aria-modal="true" on the main launcher panel
 *  5. Focus trap inside launcher and upgrade dialog (keyboard accessibility)
 *  6. Backend-authoritative licensing: ws.isLocked from API, no hardcoded mocks
 *  7. router.push() instead of window.location.href (no full-page reload)
 *  8. Locked cards are keyboard-focusable — the upgrade dialog is the upsell
 *     and tabIndex={-1} made it unreachable without a mouse
 *  9. Enter/exit rebuilt: backdrop crossfades; the panel scales 0.95→1 with
 *     opacity from its bottom inline-start corner (the ⊞ trigger's side) —
 *     no keyframe slide from an edge. Exit runs at ~2/3 duration on the exit
 *     easing; reduced motion keeps the crossfade and drops the scale.
 * 10. Semantic z ladder (blur < overlay < modal) — the old raw 80/90/100/110
 *     stack collided with the tenant banner's z-70 neighbourhood
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/use-toast";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { Button } from "@core/ui/button";

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

// ── Issue 5 Fix: Focus trap utility ─────────────────────────────────────────
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

// ── Issue 9: enter/exit lifecycle ───────────────────────────────────────────
// "closed" → unmounted. "pre" → mounted one frame in the hidden pose so the
// transition has a starting point. "open" → resting pose. "closing" → hidden
// pose again while the exit transition plays, then unmount.
type LauncherPhase = "closed" | "pre" | "open" | "closing";
// Exit visual duration is --nx-t-micro (140ms ≈ 2/3 of standard); unmount a
// beat later so the transition is never clipped.
const EXIT_UNMOUNT_MS = 170;

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

  const isRTL = direction === "rtl";

  // Drive the phase machine from the `open` prop
  useEffect(() => {
    if (open) {
      setPhase("pre");
      // Double rAF: guarantee the hidden pose paints before the transition runs
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setPhase("open"));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setPhase((p) => (p === "closed" ? "closed" : "closing"));
    const timer = window.setTimeout(() => setPhase("closed"), EXIT_UNMOUNT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Focus search on open, clear state
  useEffect(() => {
    if (open) {
      setSearch("");
      setUpgradeTarget(null);
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

  const adminItems = useMemo(
    () =>
      sortByPinThenCatalog(
        filteredWorkspaces.filter(
          (ws) => ws.isAdminWorkspace && ws.workspaceKey !== activeWorkspace?.workspaceKey
        )
      ),
    [filteredWorkspaces, sortByPinThenCatalog, activeWorkspace?.workspaceKey]
  );
  const moduleItems = useMemo(
    () =>
      sortByPinThenCatalog(
        filteredWorkspaces.filter(
          (ws) => ws.isModuleWorkspace && ws.workspaceKey !== activeWorkspace?.workspaceKey
        )
      ),
    [filteredWorkspaces, sortByPinThenCatalog, activeWorkspace?.workspaceKey]
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

  // Issue 5: Focus trap — active when launcher is open and no upgrade dialog shown
  useFocusTrap(launcherRef, open && !upgradeTarget);

  // Stay mounted through the exit transition, then release the DOM
  if (!open && phase === "closed") return null;

  const visible = open && phase === "open";

  return (
    <>
      {/* ── Backdrop — crossfade only, 140ms ─────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-blur bg-scrim transition-opacity duration-nx-micro",
          visible ? "opacity-100 ease-nx-enter" : "opacity-0 ease-nx-exit",
          !open && "pointer-events-none"
        )}
        onClick={() => onOpenChange(false)}
        style={{
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
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
        aria-label={language === "ar" ? "مشغّل التطبيقات" : "App Launcher"}
        className={cn(
          "fixed left-1/2 top-1/2 z-overlay flex -translate-x-1/2 -translate-y-1/2 flex-col transition-[transform,opacity]",
          isRTL ? "rtl origin-bottom-right" : "ltr origin-bottom-left",
          visible
            ? "scale-100 opacity-100 duration-nx-standard ease-nx-enter"
            : "scale-95 opacity-0 duration-nx-micro ease-nx-exit motion-reduce:scale-100",
          !open && "pointer-events-none"
        )}
        style={{
          width: "min(700px, 92vw)",
          maxHeight: "min(640px, 86vh)",
          borderRadius: 20,
          background: "var(--nx-surface)",
          border: "1px solid var(--nx-line-hi)",
          boxShadow: "0 32px 80px -16px var(--scrim)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--nx-line)",
            flexShrink: 0,
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-[10px]"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--nx-accent-wash)",
                }}
              >
                <LayoutGrid size={18} className="text-nx-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-nx-ink" style={{ fontSize: 15, margin: 0 }}>
                  {language === "ar" ? "مشغّل التطبيقات" : "App Launcher"}
                </h2>
                <p className="text-nx-ink-2" style={{ fontSize: 12, margin: 0 }}>
                  {language === "ar"
                    ? "تنقل بين مساحات العمل والوحدات"
                    : "Switch between workspaces and modules"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center justify-center rounded-lg text-nx-ink-2 transition-colors duration-nx-micro hover:bg-nx-raised hover:text-nx-ink",
                NX_FOCUS_RING
              )}
              style={{
                width: 32,
                height: 32,
                border: "none",
                cursor: "pointer",
                background: "transparent",
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search input — the ring lives on the container (focus-within):
              a text input always shows focus, not just keyboard focus */}
          <div
            className="flex items-center gap-2 rounded-[10px] border border-nx-line bg-nx-raised px-3 transition-colors duration-nx-micro focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-nx-accent"
            style={{ height: 40 }}
          >
            <Search size={15} className="shrink-0 text-nx-ink-3" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "ar" ? "ابحث عن وحدة..." : "Search workspaces..."}
              className="flex-1 border-none bg-transparent text-sm text-nx-ink outline-none placeholder:text-nx-ink-3"
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={cn("cursor-pointer text-nx-ink-3 hover:text-nx-ink", NX_FOCUS_RING)}
                style={{ background: "none", border: "none", padding: 0, display: "flex" }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Content grid ─────────────────────────────────────────────── */}
        <div
          className="nexus-custom-scrollbar"
          style={{ flex: 1, overflowY: "auto", padding: "16px 24px 20px" }}
        >
          {/* Admin workspaces */}
          {adminItems.length > 0 && (
            <section className="mb-6">
              <SectionLabel label={language === "ar" ? "الإدارة" : "Administration"} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 10,
                }}
              >
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
              <SectionLabel label={language === "ar" ? "الوحدات" : "Modules"} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 10,
                }}
              >
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

          {/* Empty state */}
          {filteredWorkspaces.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-14 text-nx-ink-3"
              aria-live="polite"
            >
              <Search size={32} className="mb-3 opacity-40" />
              <p className="text-sm">
                {language === "ar" ? "لا توجد نتائج" : "No workspaces found"}
              </p>
            </div>
          )}
        </div>

        {/* ── Legend footer ─────────────────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-4"
          style={{
            padding: "10px 24px 14px",
            borderTop: "1px solid var(--nx-line)",
            flexShrink: 0,
          }}
        >
          <LegendItem
            icon={<Check size={9} />}
            colorClass="text-success"
            label={language === "ar" ? "نشط" : "Active"}
          />
          <LegendItem
            icon={<Pin size={9} />}
            colorClass="text-nx-accent"
            label={language === "ar" ? "مثبّت" : "Pinned"}
          />
          <LegendItem
            icon={<Lock size={9} />}
            colorClass="text-warning"
            label={language === "ar" ? "مقفل" : "Locked"}
          />
          <LegendItem
            icon={<Clock size={9} />}
            colorClass="text-nx-ink-3"
            label={language === "ar" ? "قريباً" : "Coming Soon"}
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
          language={language}
          // Bug 7 fix: platform admins (no tenant context) see a locked module
          // because modules require a tenant to be active — show "Select a Tenant"
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
    <p
      className="font-semibold uppercase tracking-widest text-nx-ink-3"
      style={{ fontSize: 10, letterSpacing: "0.1em", margin: "0 0 10px" }}
    >
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
    <div className="flex items-center gap-1.5 text-nx-ink-3" style={{ fontSize: 11 }}>
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
  const [hovered, setHovered] = useState(false);
  const color = accentColor || "var(--nx-accent)";
  const isLocked = status === "locked";
  const isComingSoon = status === "coming-soon";
  const isDisabled = isLocked || isComingSoon;

  return (
    <div
      role="button"
      // Issue 8: locked cards stay in the tab order — clicking OR keying one
      // opens the upgrade dialog, and that upsell must be keyboard-reachable.
      // Only coming-soon (a true no-op) leaves the tab order.
      tabIndex={isComingSoon ? -1 : 0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isComingSoon) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={isActive}
      aria-disabled={isComingSoon}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-[14px] transition-all duration-nx-micro ease-nx-enter motion-reduce:transform-none",
        NX_FOCUS_RING,
        isComingSoon ? "cursor-default" : "cursor-pointer",
        // Hover = border brightens + 1px lift, nothing louder
        hovered && !isDisabled && "-translate-y-px"
      )}
      style={{
        padding: "16px 10px 14px",
        // Issue 1: color-mix() — token-safe alpha for hex/hsl/oklch/var()
        border: isActive
          ? `1.5px solid color-mix(in oklch, ${color} 40%, transparent)`
          : hovered && !isDisabled
            ? "1.5px solid var(--nx-line-hi)"
            : "1.5px solid var(--nx-line)",
        background: isActive
          ? `color-mix(in oklch, ${color} 8%, transparent)`
          : hovered && !isDisabled
            ? "var(--nx-raised)"
            : "transparent",
        opacity: isComingSoon ? 0.55 : 1,
      }}
    >
      {/* Pin toggle — reveals on hover AND keyboard focus-within; always
          visible on coarse pointers, where there is no hover to reveal it */}
      {onTogglePin && !isLocked && !isComingSoon && (
        <button
          type="button"
          onClick={onTogglePin}
          onKeyDown={(e) => e.stopPropagation()}
          disabled={isPinLoading}
          aria-label={isPinned ? "Unpin workspace" : "Pin workspace"}
          className={cn(
            "absolute flex items-center justify-center rounded-md transition-all duration-nx-micro",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(pointer:coarse)]:opacity-100",
            isPinned ? "opacity-100" : "",
            NX_FOCUS_RING
          )}
          style={{
            top: 5,
            insetInlineStart: 5,
            width: 20,
            height: 20,
            background: isPinned ? "var(--nx-accent-wash)" : "var(--nx-raised-2)",
            border: isPinned
              ? "1px solid color-mix(in oklch, var(--nx-accent) 30%, transparent)"
              : "1px solid transparent",
            color: isPinned ? "var(--nx-accent)" : "var(--nx-ink-2)",
            cursor: isPinLoading ? "wait" : "pointer",
          }}
        >
          {isPinned ? <PinOff size={10} /> : <Pin size={10} />}
        </button>
      )}

      {/* Status badge — only for active, locked, coming-soon */}
      {(isActive || isLocked || isComingSoon) && (
        <div
          className="absolute flex items-center gap-0.5"
          style={{
            top: 5,
            insetInlineEnd: 5,
            padding: "2px 5px",
            borderRadius: 5,
            fontSize: 9,
            fontWeight: 700,
            // Measured global status tokens — read, never redefined here
            background: isLocked
              ? "hsl(var(--warning) / 0.12)"
              : isComingSoon
                ? "var(--nx-raised-2)"
                : "hsl(var(--success) / 0.12)",
            color: isLocked
              ? "hsl(var(--warning))"
              : isComingSoon
                ? "var(--nx-ink-3)"
                : "hsl(var(--success))",
          }}
        >
          {isLocked ? <Lock size={8} /> : isComingSoon ? <Clock size={8} /> : <Check size={8} />}
        </div>
      )}

      {/* Icon container */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl transition-transform duration-nx-micro motion-reduce:transform-none",
          hovered && !isDisabled ? "scale-[1.08]" : "scale-100"
        )}
        style={{
          width: 42,
          height: 42,
          // Issue 1: color-mix() safe for all colour formats including var()
          background: isDisabled
            ? "var(--nx-raised)"
            : `color-mix(in oklch, ${color} 12%, transparent)`,
          color: isDisabled ? "var(--nx-ink-3)" : color,
        }}
      >
        <DynamicIcon name={icon} size={20} />
      </div>

      {/* Name */}
      <span
        className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center leading-tight"
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: isActive ? color : isDisabled ? "var(--nx-ink-3)" : "var(--nx-ink-2)",
        }}
      >
        {name}
      </span>
    </div>
  );
}

// ── Upgrade Dialog ────────────────────────────────────────────────────────────
function UpgradeDialog({
  workspaceName,
  language,
  isNeedsTenant,
  onClose,
  onUpgrade,
}: {
  workspaceName: string;
  language: string;
  /** True when the module is locked only because no tenant context is active.
   *  Changes the dialog copy to "Select a Tenant" instead of "Upgrade Plan". */
  isNeedsTenant: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  // Issue 5: Focus trap inside upgrade dialog
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);
  return (
    <>
      {/* Scrim on top of launcher — same z-modal level, painted before the
          dialog in DOM order so the dialog wins */}
      <div
        className="fixed inset-0 z-modal bg-scrim animate-in fade-in duration-nx-micro"
        onClick={onClose}
      />
      {/* The --tw-enter-translate vars keep the animate-in `from` frame
          centered (translate(-50%,-50%)); without them the keyframe drops the
          inline centering and the dialog slides in from a corner. Reduced
          motion zeroes the scale and keeps the fade. */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={language === "ar" ? "ترقية مطلوبة" : "Upgrade Required"}
        className="fixed z-modal animate-in fade-in zoom-in-95 duration-nx-standard ease-nx-enter [--tw-enter-translate-x:-50%] [--tw-enter-translate-y:-50%] motion-reduce:[--tw-enter-scale:1]"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(400px, 90vw)",
          borderRadius: 18,
          background: "var(--nx-surface)",
          border: "1px solid var(--nx-line-hi)",
          boxShadow: "0 24px 60px -12px var(--scrim)",
          padding: "28px 28px 24px",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-2xl"
          style={{
            width: 56,
            height: 56,
            background: "hsl(var(--warning) / 0.1)",
          }}
        >
          <ArrowUpCircle size={28} className="text-warning" />
        </div>

        <h3 className="mb-2 font-bold text-nx-ink" style={{ fontSize: 17, margin: "0 0 8px" }}>
          {isNeedsTenant
            ? language === "ar"
              ? "اختر مستأجراً"
              : "Select a Tenant"
            : language === "ar"
              ? "ترقية مطلوبة"
              : "Upgrade Required"}
        </h3>

        <p
          className="text-nx-ink-2"
          style={{ fontSize: 13, lineHeight: 1.55, margin: "0 0 24px" }}
        >
          {isNeedsTenant
            ? language === "ar"
              ? `وحدة "${workspaceName}" تتطلب سياق مستأجر. انتقل إلى قائمة المستأجرين وادخل إلى مستأجر أولاً.`
              : `"${workspaceName}" requires a tenant context. Go to the Tenants list and drill into a tenant first.`
            : language === "ar"
              ? `وحدة "${workspaceName}" غير مضمّنة في خطتك الحالية. قم بالترقية لفتح هذه الوحدة.`
              : `"${workspaceName}" is not included in your current plan. Upgrade your plan to unlock this module.`}
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-[10px] text-sm font-medium text-nx-ink-2 transition-colors duration-nx-micro hover:bg-nx-raised hover:text-nx-ink"
            style={{ padding: "10px 0" }}
          >
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={onUpgrade}
            className="flex-1 rounded-[10px] text-sm font-semibold hover:opacity-90"
            style={{
              padding: "10px 0",
              border: "none",
              // Measured status fills with their own measured foregrounds —
              // info for "go pick a tenant", warning for "upgrade your plan"
              background: isNeedsTenant ? "hsl(var(--info))" : "hsl(var(--warning))",
              color: isNeedsTenant ? "hsl(var(--info-foreground))" : "hsl(var(--warning-foreground))",
              boxShadow: isNeedsTenant
                ? "0 4px 14px hsl(var(--info) / 0.35)"
                : "0 4px 14px hsl(var(--warning) / 0.35)",
            }}
          >
            {isNeedsTenant
              ? language === "ar"
                ? "انتقل إلى المستأجرين"
                : "Go to Tenants"
              : language === "ar"
                ? "ترقية الآن"
                : "Upgrade Plan"}
          </Button>
        </div>
      </div>
    </>
  );
}
