"use client";

/**
 * HubRecentWorkspacesStrip — Quick launcher strip for recently visited workspaces
 * isolated to the active tenant/platform navigation context.
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@core/ui/button";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";

export interface HubRecentWorkspacesStripProps {
  workspaces: WorkspaceGroup[];
  language: string;
  onOpenWorkspace: (ws: WorkspaceGroup) => void;
}

export function HubRecentWorkspacesStrip({
  workspaces,
  language,
  onOpenWorkspace,
}: HubRecentWorkspacesStripProps) {
  if (workspaces.length === 0) return null;

  return (
    <div
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
      data-testid="hub-recent-workspaces-strip"
    >
      {workspaces.map((ws) => {
        const displayName = ws.getLocalizedName(language);
        return (
          <Button
            key={ws.workspaceKey}
            type="button"
            variant="ghost"
            onClick={() => onOpenWorkspace(ws)}
            className="group flex h-auto w-full items-center justify-between gap-2.5 rounded-nx-md border border-nx-line bg-nx-surface px-3.5 py-2.5 text-start font-normal text-nx-ink transition-[border-color] duration-nx-micro ease-nx-enter hover:border-nx-line-hi hover:bg-nx-surface focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-nx-sm border border-nx-line bg-nx-raised text-nx-ink-2">
                <DynamicIcon name={ws.workspaceIcon || "Layers"} size={15} />
              </span>
              <span className="truncate text-xs font-medium text-nx-ink">
                <bdi>{displayName}</bdi>
              </span>
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-nx-ink-3 transition-colors group-hover:text-nx-ink-2 rtl:rotate-180"
              aria-hidden="true"
            />
          </Button>
        );
      })}
    </div>
  );
}
