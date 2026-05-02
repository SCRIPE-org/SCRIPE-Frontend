"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, ArrowRight, Loader2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useWorkspaceDiscovery, type WorkspaceInfo } from "../viewmodels/useWorkspaceDiscovery";
import { useI18n } from "@core/providers/i18n-provider";

interface WorkspacePickerProps {
  /** Pre-filled email (e.g. typed into the credentials form above) */
  initialEmail?: string;
  /** Called when user picks a workspace — default behaviour is router.push to loginUrl */
  onWorkspaceSelected?: (workspace: WorkspaceInfo) => void;
  className?: string;
}

/**
 * WorkspacePicker — Multi-tenant workspace selector
 *
 * Flow:
 * 1. User enters their email
 * 2. POST /auth/admin/discover-workspaces → list of tenants for that email
 * 3. Single result → auto-navigate
 * 4. Multiple results → card list to choose from
 * 5. Empty → neutral "not found" (no email enumeration)
 *
 * Uses @core/ui/* components throughout — no raw HTML form elements.
 */
export function WorkspacePicker({
  initialEmail = "",
  onWorkspaceSelected,
  className = "",
}: WorkspacePickerProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const { discover, workspaces, isLoading, hasSearched, hasWorkspaces, reset } =
    useWorkspaceDiscovery();

  const handleSelect = useCallback(
    (workspace: WorkspaceInfo) => {
      if (onWorkspaceSelected) {
        onWorkspaceSelected(workspace);
      } else {
        router.push(workspace.loginUrl);
      }
    },
    [router, onWorkspaceSelected]
  );

  const handleDiscover = useCallback(async () => {
    if (!email.trim()) return;
    const found = await discover(email);
    if (found.length === 1) handleSelect(found[0]);
  }, [email, discover, handleSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleDiscover();
    },
    [handleDiscover]
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Email input row */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="workspace-email" className="text-xs text-muted-foreground">
          {t("auth.workspacePicker.emailLabel") || "Your email address"}
        </Label>
        <div className="flex gap-2">
          <Input
            id="workspace-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              reset();
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              t("auth.workspacePicker.emailPlaceholder") || "admin@company.com"
            }
            autoComplete="email"
            disabled={isLoading}
            className="h-9 flex-1 text-sm"
            aria-label="Email for workspace discovery"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleDiscover}
            disabled={isLoading || !email.trim()}
            aria-busy={isLoading}
            className="h-9 shrink-0 gap-1.5"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" aria-label="Searching…" />
            ) : (
              <ArrowRight size={14} aria-hidden />
            )}
            <span className="hidden sm:inline">
              {isLoading
                ? t("auth.workspacePicker.searching") || "Searching…"
                : t("auth.workspacePicker.find") || "Find"}
            </span>
          </Button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div role="region" aria-label="Workspace results" aria-live="polite">
          {hasWorkspaces ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">
                {t("auth.workspacePicker.selectWorkspace") ||
                  "Select a workspace to continue:"}
              </p>
              <ul className="flex flex-col gap-1.5" role="list">
                {workspaces.map((ws) => (
                  <li key={ws.tenantCode}>
                    <Button
                      type="button"
                      variant={ws.isActivated ? "outline" : "ghost"}
                      className="h-auto w-full justify-start gap-3 px-3 py-2.5 text-left"
                      onClick={() => ws.isActivated && handleSelect(ws)}
                      disabled={!ws.isActivated}
                      aria-disabled={!ws.isActivated}
                      aria-label={`${ws.tenantName}${!ws.isActivated ? " — setup pending" : ""}`}
                    >
                      {/* Workspace icon */}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                          ws.isPlatformAdmin
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                        aria-hidden
                      >
                        {ws.isPlatformAdmin ? (
                          <ShieldCheck size={16} />
                        ) : (
                          <Building2 size={16} />
                        )}
                      </span>

                      {/* Workspace info */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium leading-tight">
                          {ws.tenantName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ws.isPlatformAdmin && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              {t("auth.workspacePicker.platformAdmin") ||
                                "Platform"}
                            </span>
                          )}
                          {!ws.isActivated && (
                            <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              <Clock size={10} aria-hidden />
                              {t("auth.workspacePicker.setupPending") ||
                                "Setup pending"}
                            </span>
                          )}
                        </div>
                      </div>

                      {ws.isActivated && (
                        <ArrowRight
                          size={14}
                          className="shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div
              className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground"
              role="status"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
              <p className="text-xs leading-snug">
                {t("auth.workspacePicker.notFound") ||
                  "No workspaces found. Check your email or contact your administrator."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
