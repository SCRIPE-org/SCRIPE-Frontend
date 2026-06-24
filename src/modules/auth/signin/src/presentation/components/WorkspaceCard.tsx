// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import { useState, useRef } from "react";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Clock,
  Ban,
  Lock,
  LockOpen,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  Timer,
} from "lucide-react";
import { resolveFileUrl } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatLockoutTime(lockedUntil: string | null | undefined): string {
  if (!lockedUntil) return "";
  const remaining = Math.max(
    0,
    Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000 / 60)
  );
  return remaining > 0 ? `${remaining}m` : "";
}

// ── Types ────────────────────────────────────────────────────────────────────

export type WorkspaceCardState =
  /** Unlocked — password verified or SSO/magic-link auth */
  | "unlocked"
  /** Locked out — too many failed attempts */
  | "locked"
  /** Wrong password — show inline password form */
  | "passwordRequired"
  /** Disabled — tenant suspended / account deactivated */
  | "disabled"
  /** Setup pending — admin hasn't completed first-time setup */
  | "setupPending";

function getCardState(ws: WorkspaceChoice): WorkspaceCardState {
  if (!ws.isActivated) return "setupPending";
  if (ws.isDisabled) return "disabled";
  if (ws.isLocked) return "locked";
  // isPasswordVerified undefined = no password context (SSO/magic-link) → unlocked
  if (ws.isPasswordVerified === false) return "passwordRequired";
  return "unlocked";
}

// ── Props ────────────────────────────────────────────────────────────────────

interface WorkspaceCardProps {
  workspace: WorkspaceChoice;
  isThisLoading: boolean;
  isAnyLoading: boolean;
  onSelect: (ws: WorkspaceChoice) => void;
  /** Called when user submits inline password to unlock this workspace */
  onUnlock?: (ws: WorkspaceChoice, password: string) => Promise<void>;
}

/**
 * WorkspaceCard — A single workspace entry in the hybrid picker.
 *
 * States:
 *   unlocked         — Clickable card → select to log in
 *   passwordRequired — Expandable card with inline password form
 *   locked           — Shows lockout badge + timer; non-clickable
 *   disabled         — Suspended/deactivated; non-clickable
 *   setupPending     — Account not yet activated; non-clickable
 */
export function WorkspaceCard({
  workspace: ws,
  isThisLoading,
  isAnyLoading,
  onSelect,
  onUnlock,
}: WorkspaceCardProps) {
  const { t } = useI18n();
  const state = getCardState(ws);

  const [isExpanded, setIsExpanded] = useState(false);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // ── Colours per state ─────────────────────────────────────────────────────
  const stateColors: Record<WorkspaceCardState, string> = {
    unlocked: "border-border bg-card hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm",
    passwordRequired: isExpanded
      ? "border-amber-400/60 bg-amber-50/40 dark:border-amber-500/40 dark:bg-amber-900/10"
      : "border-border/60 bg-muted/10 hover:border-amber-400/40 hover:bg-amber-50/20",
    locked: "border-border/40 bg-muted/20 opacity-70",
    disabled: "border-border/30 bg-muted/10 opacity-50",
    setupPending: "border-border/40 bg-muted/20 opacity-60",
  };

  // ── Logo / icon section ──────────────────────────────────────────────────
  const logoSection = (
    <div
      className={[
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
        ws.isPlatformAdmin
          ? "border-primary/20 bg-primary/10 text-primary"
          : state === "unlocked"
            ? "border-border bg-muted text-muted-foreground"
            : "border-border/50 bg-muted/50 text-muted-foreground/60",
      ].join(" ")}
      aria-hidden
    >
      {ws.logoUrl ? (
        <img
          src={resolveFileUrl(ws.logoUrl)}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : ws.isPlatformAdmin ? (
        <ShieldCheck className="h-5 w-5" />
      ) : (
        <Building2 className="h-5 w-5" />
      )}
    </div>
  );

  // ── State badge ───────────────────────────────────────────────────────────
  const stateBadge = (() => {
    switch (state) {
      case "locked":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
            <Timer className="h-2.5 w-2.5" aria-hidden />
            {t("auth.workspaceSelection.locked") || "Locked"}
            {ws.lockedUntil && ` · ${formatLockoutTime(ws.lockedUntil)}`}
          </span>
        );
      case "passwordRequired":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            <Lock className="h-2.5 w-2.5" aria-hidden />
            {t("auth.workspaceSelection.passwordRequired") || "Password required"}
          </span>
        );
      case "disabled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
            <Ban className="h-2.5 w-2.5" aria-hidden />
            {ws.disabledReason || t("auth.workspaceSelection.unavailable") || "Unavailable"}
          </span>
        );
      case "setupPending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            <Clock className="h-2.5 w-2.5" aria-hidden />
            {t("auth.workspaceSelection.setupPending") || "Setup pending"}
          </span>
        );
      default:
        return null;
    }
  })();

  // ── Platform badge ────────────────────────────────────────────────────────
  const platformBadge = ws.isPlatformAdmin && (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
      <ShieldCheck className="h-2.5 w-2.5" aria-hidden />
      {t("auth.workspaceSelection.platform") || "Platform"}
    </span>
  );

  // ── Inline unlock form ────────────────────────────────────────────────────
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !onUnlock) return;
    setUnlockError(null);
    setIsUnlocking(true);
    try {
      await onUnlock(ws, password);
      setPassword("");
      setIsExpanded(false);
    } catch (err: unknown) {
      setUnlockError(
        err instanceof Error ? err.message : t("auth.invalidCredentials") || "Incorrect password"
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const unlockForm = isExpanded && state === "passwordRequired" && (
    <form
      onSubmit={handleUnlockSubmit}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="mt-3 flex flex-col gap-2"
    >
      {unlockError && (
        <div className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {unlockError}
        </div>
      )}
      <div className="relative">
        <Input
          ref={passwordRef}
          id={`unlock-pwd-${ws.tenantId || "platform"}`}
          type={showPwd ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.passwordPlaceholder") || "Enter password"}
          autoFocus
          autoComplete="current-password"
          disabled={isUnlocking}
          className="h-9 pr-10 text-sm"
          aria-label={`Password for ${ws.tenantName}`}
        />
        <button
          type="button"
          onClick={() => setShowPwd((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
          aria-label={showPwd ? "Hide password" : "Show password"}
        >
          {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={!password.trim() || isUnlocking}
          className="h-8 flex-1 gap-1.5 text-xs"
        >
          {isUnlocking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="h-3.5 w-3.5" aria-hidden />
          )}
          {t("auth.workspaceSelection.unlock") || "Unlock"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsExpanded(false);
            setPassword("");
            setUnlockError(null);
          }}
          disabled={isUnlocking}
          className="h-8 text-xs"
        >
          {t("common.cancel") || "Cancel"}
        </Button>
      </div>
    </form>
  );

  // ── Card action area (right side) ─────────────────────────────────────────
  const actionIcon = (() => {
    if (isThisLoading) return <Loader2 className="h-4 w-4 animate-spin" aria-hidden />;
    switch (state) {
      case "unlocked":
        return (
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        );
      case "passwordRequired":
        return isExpanded ? (
          <LockOpen className="h-4 w-4 text-amber-500" aria-hidden />
        ) : (
          <Lock className="h-4 w-4 text-amber-400/80" aria-hidden />
        );
      default:
        return null;
    }
  })();

  // ── Clickability ──────────────────────────────────────────────────────────
  const isInteractive = state === "unlocked" || state === "passwordRequired";
  const isGloballyDisabled = isAnyLoading && !isThisLoading;

  const handleClick = () => {
    if (!isInteractive || isGloballyDisabled) return;
    if (state === "unlocked") {
      onSelect(ws);
    } else if (state === "passwordRequired") {
      setIsExpanded((v) => !v);
      // Auto-focus password input after expand
      if (!isExpanded) {
        setTimeout(() => passwordRef.current?.focus(), 50);
      }
    }
  };

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive && !isGloballyDisabled ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isInteractive && !isGloballyDisabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-disabled={!isInteractive || isGloballyDisabled}
      aria-expanded={state === "passwordRequired" ? isExpanded : undefined}
      aria-label={`${ws.tenantName}${
        state === "locked"
          ? ` — Locked${ws.lockedUntil ? ` until ${new Date(ws.lockedUntil).toLocaleTimeString()}` : ""}`
          : state === "passwordRequired"
            ? " — Password required"
            : state === "disabled"
              ? ` — ${ws.disabledReason || "Unavailable"}`
              : state === "setupPending"
                ? " — Setup pending"
                : ""
      }`}
      className={[
        "group w-full rounded-xl border p-4 text-start transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        stateColors[state],
        isInteractive && !isGloballyDisabled
          ? "cursor-pointer active:scale-[0.99]"
          : "cursor-not-allowed",
      ].join(" ")}
    >
      {/* Main row */}
      <div className="flex items-center gap-4">
        {logoSection}

        {/* Name + badges */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm font-semibold leading-tight text-foreground">
            {ws.tenantName}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {platformBadge}
            {stateBadge}
            {state === "unlocked" && !ws.isPlatformAdmin && (
              <span className="text-[11px] text-muted-foreground">{ws.tenantCode}</span>
            )}
          </div>
        </div>

        {/* Action icon */}
        <div className="shrink-0 text-muted-foreground">{actionIcon}</div>
      </div>

      {/* Inline unlock form (expanded when passwordRequired) */}
      {unlockForm}
    </div>
  );
}
