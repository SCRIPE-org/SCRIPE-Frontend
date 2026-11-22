// FILE-EXCEPTION: file length
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
import { formatTimeUtc } from "@core/common/utils";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import Image from "next/image";

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

/**
 * Exported type defining parameters and fields for workspace card state configurations.
 */
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
  const resolvedLogoUrl = useResolvedFileUrl(ws.logoUrl);

  const [isExpanded, setIsExpanded] = useState(false);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // ── Colours per state ─────────────────────────────────────────────────────
  const stateColors: Record<WorkspaceCardState, string> = {
    unlocked: "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-raised",
    passwordRequired: isExpanded
      ? "border-warning/60 bg-warning/10"
      : "border-nx-line bg-nx-raised hover:border-warning/50 hover:bg-warning/10",
    locked: "border-nx-line bg-nx-raised opacity-70",
    disabled: "border-nx-line bg-nx-raised opacity-50",
    setupPending: "border-nx-line bg-nx-raised opacity-60",
  };

  // ── Logo / icon section ──────────────────────────────────────────────────
  const logoSection = (
    <div
      className={[
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
        ws.isPlatformAdmin
          ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
          : state === "unlocked"
            ? "border-nx-line bg-nx-raised text-nx-ink-2"
            : "border-nx-line bg-nx-raised text-nx-ink-3 opacity-70",
      ].join(" ")}
      aria-hidden
    >
      {ws.logoUrl && resolvedLogoUrl ? (
        <Image
          src={resolvedLogoUrl}
          alt=""
          width={44}
          height={44}
          unoptimized
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
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
            <Timer className="h-2.5 w-2.5" aria-hidden />
            {t("auth.workspaceSelection.locked") || "Locked"}
            {ws.lockedUntil && ` · ${formatLockoutTime(ws.lockedUntil)}`}
          </span>
        );
      case "passwordRequired":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nx-warning-strong">
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
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nx-warning-strong">
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
    <span className="inline-flex items-center gap-1 rounded-full bg-nx-accent-wash px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nx-accent">
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
      className="flex flex-col gap-2"
    >
      {unlockError && (
        <div className="flex items-center gap-1.5 text-xs text-nx-danger" role="alert">
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
          className="h-9 pe-10 text-sm"
          aria-label={`Password for ${ws.tenantName}`}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowPwd((v) => !v)}
          className="absolute end-2.5 top-1/2 h-auto -translate-y-1/2 p-0 text-nx-ink-2 hover:bg-transparent hover:text-nx-ink"
          // Reachable by keyboard: a sighted keyboard user and a screen-reader
          // user both need to verify what they typed before submitting, and
          // this is the only control that lets them (WCAG 2.1.1, Level A).
          aria-label={showPwd ? "Hide password" : "Show password"}
        >
          {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
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
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            aria-hidden
          />
        );
      case "passwordRequired":
        return isExpanded ? (
          <LockOpen className="h-4 w-4 text-nx-warning-strong" aria-hidden />
        ) : (
          <Lock className="h-4 w-4 text-nx-warning-strong" aria-hidden />
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

  const accessibleLabel = `${ws.tenantName}${
    state === "locked"
      ? ` — Locked${ws.lockedUntil ? ` until ${formatTimeUtc(ws.lockedUntil)}` : ""}`
      : state === "passwordRequired"
        ? " — Password required"
        : state === "disabled"
          ? ` — ${ws.disabledReason || "Unavailable"}`
          : state === "setupPending"
            ? " — Setup pending"
            : ""
  }`;

  const rowContent = (
    <>
      {logoSection}

      {/* Name + badges */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold leading-tight text-nx-ink">
          {ws.tenantName}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {platformBadge}
          {stateBadge}
          {state === "unlocked" && !ws.isPlatformAdmin && (
            <span className="text-[11px] text-nx-ink-2">{ws.tenantCode}</span>
          )}
        </div>
      </div>

      {/* Action icon */}
      <div className="shrink-0 text-nx-ink-2">{actionIcon}</div>
    </>
  );

  return (
    <div
      className={[
        "w-full rounded-xl border transition-colors duration-150",
        stateColors[state],
      ].join(" ")}
    >
      {isInteractive ? (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          disabled={isGloballyDisabled}
          aria-expanded={state === "passwordRequired" ? isExpanded : undefined}
          aria-label={accessibleLabel}
          className={[
            "group flex h-auto w-full items-center justify-start gap-4 rounded-xl p-4 text-start font-normal whitespace-normal transition-transform duration-150",
            "hover:bg-transparent focus-visible:outline-none focus-visible:shadow-nx-focus",
            !isGloballyDisabled
              ? "cursor-pointer active:scale-[0.99]"
              : "cursor-not-allowed",
          ].join(" ")}
        >
          {rowContent}
        </Button>
      ) : (
        <div
          aria-disabled="true"
          aria-label={accessibleLabel}
          className="flex w-full cursor-not-allowed items-center gap-4 rounded-xl p-4 text-start"
        >
          {rowContent}
        </div>
      )}

      {/* Inline unlock form (expanded when passwordRequired — sibling to trigger button) */}
      {unlockForm && <div className="px-4 pb-4">{unlockForm}</div>}
    </div>
  );
}
