"use client";

import React from "react";
import { History } from "lucide-react";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { DynamicIcon } from "@core/ui/layout/shared";

/** Props for {@link HubRecentStrip}. */
export interface HubRecentStripProps {
  /** Recently visited unlocked workspaces scoped to the active navigation context. */
  workspaces: WorkspaceGroup[];
  /** Active UI language (`"en"` or `"ar"`). */
  language: string;
  /** Callback fired when launching a recent workspace shortcut. */
  onOpenWorkspace: (workspace: WorkspaceGroup) => void;
}

/**
 * Compact centered shortcut strip of recently visited workspaces rendered on `/hub`
 * strictly when search is inactive and at least two recent unlocked workspaces exist.
 */
export function HubRecentStrip({ workspaces, language, onOpenWorkspace }: HubRecentStripProps) {
  const { t } = useI18n();

  if (workspaces.length < 2) return null;

  return (
    <section
      aria-label={t("workspaceHub.sections.recent")}
      data-testid="hub-recent-workspaces-strip"
      className="mx-auto mt-10 flex w-full max-w-[760px] flex-wrap items-center justify-center gap-2"
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-nx-ink-3">
        <History className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t("workspaceHub.sections.recent")}</span>
      </span>

      {workspaces.map((ws) => (
        <Button
          key={ws.workspaceKey}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenWorkspace(ws)}
          className="h-8 gap-1.5 rounded-full border-nx-line bg-nx-surface px-3 text-xs font-medium text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink"
        >
          <DynamicIcon name={ws.workspaceIcon || "Layers"} size={13} />
          <span className="truncate">
            <bdi>{ws.getLocalizedName(language)}</bdi>
          </span>
        </Button>
      ))}
    </section>
  );
}
