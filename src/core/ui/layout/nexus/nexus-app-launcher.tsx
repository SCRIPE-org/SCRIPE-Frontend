"use client";

/**
 * NexusAppLauncher — Waffle-menu overlay (⊞ button)
 *
 * Licensing fixes applied:
 *  1. Safe accentColor opacity via withOpacity() — no string.replace() fragility
 *  2. Admin cards correctly show "active" badge when that workspace is current
 *  3. useTheme() for dark-mode consistency with the rest of the nav system
 *  4. aria-modal="true" on the main launcher panel
 *  5. Focus trap inside launcher and upgrade dialog (keyboard accessibility)
 *  6. Backend-authoritative licensing: ws.isLocked from API, no hardcoded mocks
 *  7. router.push() instead of window.location.href (no full-page reload)
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";

import { Search, X, Lock, Check, LayoutGrid, Clock, ArrowUpCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { DynamicIcon } from "./_parts/primary-rail-parts";
import { useWorkspaceTransitionContext } from "./nexus-layout";

// ── Types ───────────────────────────────────────────────────────────────────
type WorkspaceStatus = "active" | "available" | "locked" | "coming-soon";

interface NexusAppLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Issue 1 Fix: Safe opacity helper ────────────────────────────────────────
// Avoids string.replace(")",...) which breaks for hsl(var(--primary)) etc.
function withOpacity(color: string, alpha: number): string {
  const pct = Math.round(alpha * 100);
  // oklch(L C H) → oklch(L C H / XX%)
  if (color.startsWith("oklch(")) return color.slice(0, -1) + ` / ${pct}%)`;
  // hsl(X Y Z) → hsl(X Y Z / XX%)
  if (color.startsWith("hsl(")) return color.slice(0, -1) + ` / ${pct}%)`;
  // hex fallback: append two-digit alpha
  return `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
}

// ── Status derivation ─ backend-authoritative ───────────────────────────────
// The backend populates WorkspaceGroup.isLocked based on the tenant's license.
// No client-side guessing. The hook is kept for call-site compat only.
function deriveWorkspaceStatus(
  ws: { workspaceKey: string; isLocked: boolean },
  activeWsKey: string | undefined
): WorkspaceStatus {
  if (ws.isLocked) return "locked";
  if (activeWsKey === ws.workspaceKey) return "active";
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
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
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

// ── Main Component ───────────────────────────────────────────────────────────
export function NexusAppLauncher({ open, onOpenChange }: NexusAppLauncherProps) {
  const { workspaceGroups, activeWorkspace } = useWorkspace();
  const { language, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const { switchWorkspace } = useWorkspaceTransitionContext();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLDivElement>(null);

  const isRTL = direction === "rtl";
  const isDark = resolvedTheme === "dark";

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

  const adminItems = useMemo(
    () => filteredWorkspaces.filter((ws) => ws.isAdminWorkspace),
    [filteredWorkspaces]
  );
  const moduleItems = useMemo(
    () => filteredWorkspaces.filter((ws) => ws.isModuleWorkspace),
    [filteredWorkspaces]
  );

  // Handle card click — locked → show upgrade dialog, else switch
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

  // Issue 5: Focus trap — active when launcher is open and no upgrade dialog shown
  useFocusTrap(launcherRef, open && !upgradeTarget);

  if (!open) return null;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[80]"
        onClick={() => onOpenChange(false)}
        style={{
          background: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* ── Launcher Panel ───────────────────────────────────────────────── */}
      <div
        ref={launcherRef}
        role="dialog"
        aria-modal="true"
        aria-label={language === "ar" ? "مشغّل التطبيقات" : "App Launcher"}
        className={cn(
          "fixed z-[90] flex flex-col animate-in fade-in zoom-in-95 duration-200",
          isRTL ? "rtl" : "ltr"
        )}
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(700px, 92vw)",
          maxHeight: "min(640px, 86vh)",
          borderRadius: 20,
          background: "hsl(var(--background))",
          border: "1px solid hsl(var(--border))",
          boxShadow: isDark
            ? "0 30px 70px rgba(0,0,0,0.5), 0 0 0 1px hsl(var(--border))"
            : "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px hsl(var(--border))",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid hsl(var(--border))",
            flexShrink: 0,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-[10px]"
                style={{
                  width: 36,
                  height: 36,
                  background: "hsl(var(--primary) / 0.1)",
                }}
              >
                <LayoutGrid size={18} className="text-primary" />
              </div>
              <div>
                <h2
                  className="text-foreground font-semibold"
                  style={{ fontSize: 15, margin: 0 }}
                >
                  {language === "ar" ? "مشغّل التطبيقات" : "App Launcher"}
                </h2>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: 12, margin: 0 }}
                >
                  {language === "ar"
                    ? "تنقل بين مساحات العمل والوحدات"
                    : "Switch between workspaces and modules"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
              style={{ width: 32, height: 32, border: "none", cursor: "pointer", background: "transparent" }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search input */}
          <div
            className="flex items-center gap-2 rounded-[10px] border border-border bg-muted/50 px-3"
            style={{ height: 40 }}
          >
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "ar" ? "ابحث عن وحدة..." : "Search workspaces..."}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
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
                  // Issue 2: Admin cards also show active badge when current workspace
                  const adminStatus: WorkspaceStatus =
                    activeWorkspace?.workspaceKey === ws.workspaceKey ? "active" : "available";
                  return (
                    <WorkspaceCard
                      key={ws.workspaceKey}
                      name={ws.getLocalizedName(language)}
                      icon={ws.workspaceIcon}
                      accentColor={ws.accentColor}
                      isActive={adminStatus === "active"}
                      status={adminStatus}
                      onClick={() => handleSelect(ws.workspaceKey, adminStatus)}
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
                  const status = deriveWorkspaceStatus(ws, activeWorkspace?.workspaceKey);
                  return (
                    <WorkspaceCard
                      key={ws.workspaceKey}
                      name={ws.getLocalizedName(language)}
                      icon={ws.workspaceIcon}
                      accentColor={ws.accentColor}
                      isActive={status === "active"}
                      status={status}
                      onClick={() => handleSelect(ws.workspaceKey, status)}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state */}
          {filteredWorkspaces.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-14 text-muted-foreground"
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
          className="flex gap-4 flex-wrap items-center"
          style={{
            padding: "10px 24px 14px",
            borderTop: "1px solid hsl(var(--border))",
            flexShrink: 0,
          }}
        >
          <LegendItem
            icon={<Check size={9} />}
            colorClass="text-emerald-500"
            label={language === "ar" ? "نشط" : "Active"}
          />
          <LegendItem
            icon={<Lock size={9} />}
            colorClass="text-amber-500"
            label={language === "ar" ? "مقفل" : "Locked"}
          />
          <LegendItem
            icon={<Clock size={9} />}
            colorClass="text-muted-foreground"
            label={language === "ar" ? "قريباً" : "Coming Soon"}
          />
        </div>
      </div>

      {/* ── Upgrade Dialog ──────────────────────────────────────────────── */}
      {upgradeTarget && (
        <UpgradeDialog
          workspaceName={
            workspaceGroups.find((ws) => ws.workspaceKey === upgradeTarget)?.getLocalizedName(language) ??
            upgradeTarget
          }
          language={language}
          isDark={isDark}
          onClose={() => setUpgradeTarget(null)}
          onUpgrade={() => {
            setUpgradeTarget(null);
            onOpenChange(false);
            router.push("/my-subscription"); // Issue 7: SPA navigation, no full reload
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
      className="text-muted-foreground font-semibold uppercase tracking-widest"
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
    <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 11 }}>
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
  status,
  onClick,
}: {
  name: string;
  icon: string;
  accentColor: string | null;
  isActive: boolean;
  status: WorkspaceStatus;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = accentColor || "hsl(var(--primary))";
  const isLocked = status === "locked";
  const isComingSoon = status === "coming-soon";
  const isDisabled = isLocked || isComingSoon;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={isActive}
      aria-disabled={isDisabled}
      className={cn(
        "group relative flex flex-col items-center gap-2 transition-all duration-200 rounded-[14px]",
        isComingSoon ? "cursor-default" : "cursor-pointer"
      )}
      style={{
        padding: "16px 10px 14px",
        // Issue 1: use withOpacity() — safe for oklch(), hsl(), hsl(var()), hex
        border: isActive
          ? `1.5px solid ${withOpacity(color, 0.4)}`
          : "1.5px solid hsl(var(--border))",
        background: isActive
          ? withOpacity(color, 0.08)
          : hovered && !isDisabled
          ? "hsl(var(--accent))"
          : "transparent",
        opacity: isComingSoon ? 0.55 : 1,
        transform: hovered && !isDisabled ? "translateY(-2px)" : "none",
        boxShadow:
          hovered && !isDisabled
            ? "0 8px 24px rgba(0,0,0,0.1)"
            : "none",
      }}
    >
      {/* Status badge — only for active, locked, coming-soon (not available) */}
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
            background: isLocked
              ? "hsl(38 92% 50% / 0.12)"
              : isComingSoon
              ? "hsl(var(--muted))"
              : "hsl(142 76% 36% / 0.12)",
            color: isLocked
              ? "hsl(38 92% 40%)"
              : isComingSoon
              ? "hsl(var(--muted-foreground))"
              : "hsl(142 76% 36%)",
          }}
        >
          {isLocked ? <Lock size={8} /> : isComingSoon ? <Clock size={8} /> : <Check size={8} />}
        </div>
      )}

      {/* Icon container */}
      <div
        className="flex items-center justify-center rounded-xl transition-transform duration-200"
        style={{
          width: 42,
          height: 42,
          // Issue 1: withOpacity() safe for all color formats
          background: isDisabled ? "hsl(var(--muted))" : withOpacity(color, 0.12),
          color: isDisabled ? "hsl(var(--muted-foreground))" : color,
          transform: hovered && !isDisabled ? "scale(1.08)" : "scale(1)",
        }}
      >
        <DynamicIcon name={icon} size={20} />
      </div>

      {/* Name */}
      <span
        className="text-center leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: isActive
            ? color
            : isDisabled
            ? "hsl(var(--muted-foreground))"
            : "hsl(var(--foreground) / 0.8)",
        }}
      >
        {name}
      </span>
    </button>
  );
}

// ── Upgrade Dialog ────────────────────────────────────────────────────────────
function UpgradeDialog({
  workspaceName,
  language,
  isDark,
  onClose,
  onUpgrade,
}: {
  workspaceName: string;
  language: string;
  isDark: boolean; // Issue 3: consistent theme
  onClose: () => void;
  onUpgrade: () => void;
}) {
  // Issue 5: Focus trap inside upgrade dialog
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);
  return (
    <>
      {/* Scrim on top of launcher */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={language === "ar" ? "ترقية مطلوبة" : "Upgrade Required"}
        className="fixed z-[110] animate-in fade-in zoom-in-95 duration-150"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(400px, 90vw)",
          borderRadius: 18,
          background: "hsl(var(--background))",
          border: "1px solid hsl(var(--border))",
          boxShadow: isDark ? "0 30px 60px rgba(0,0,0,0.5)" : "0 20px 50px rgba(0,0,0,0.2)",
          padding: "28px 28px 24px",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-2xl mx-auto mb-4"
          style={{
            width: 56,
            height: 56,
            background: "hsl(38 92% 50% / 0.1)",
          }}
        >
          <ArrowUpCircle size={28} className="text-amber-500" />
        </div>

        <h3 className="text-foreground font-bold mb-2" style={{ fontSize: 17, margin: "0 0 8px" }}>
          {language === "ar" ? "ترقية مطلوبة" : "Upgrade Required"}
        </h3>

        <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.55, margin: "0 0 24px" }}>
          {language === "ar"
            ? `وحدة "${workspaceName}" غير مضمّنة في خطتك الحالية. قم بالترقية لفتح هذه الوحدة.`
            : `"${workspaceName}" is not included in your current plan. Upgrade your plan to unlock this module.`}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] text-sm font-medium text-muted-foreground border border-border bg-transparent hover:bg-accent transition-colors duration-150"
            style={{ padding: "10px 0", cursor: "pointer" }}
          >
            {language === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={onUpgrade}
            className="flex-1 rounded-[10px] text-sm font-semibold text-white border-none"
            style={{
              padding: "10px 0",
              cursor: "pointer",
              background: "linear-gradient(135deg, hsl(38 92% 50%), hsl(28 90% 48%))",
              boxShadow: "0 4px 14px hsl(38 92% 50% / 0.35)",
            }}
          >
            {language === "ar" ? "ترقية الآن" : "Upgrade Plan"}
          </button>
        </div>
      </div>
    </>
  );
}
