"use client";

/**
 * SessionRadarTelemetryCards
 *
 * Displays unlocated session fallback telemetry cards and the selected map pin
 * workstation inspector bar inside `SovereignSessionRadar`.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Monitor, Trash2 } from "lucide-react";
import type {
  PositionedRadarNode,
  UnlocatedRadarNode,
} from "../utils/session-radar.utils";

interface SessionRadarTelemetryCardsProps {
  unlocatedNodes: UnlocatedRadarNode[];
  activeNode?: PositionedRadarNode;
  onKillNode?: (nodeId: string) => void;
}

/** Renders non-geocoded session cards and the selected workstation pin inspector strip. */
export function SessionRadarTelemetryCards({
  unlocatedNodes,
  activeNode,
  onKillNode,
}: SessionRadarTelemetryCardsProps) {
  const { t } = useI18n();

  return (
    <>
      {unlocatedNodes.length > 0 && (
        <div
          data-testid="session-network-telemetry-grid"
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {unlocatedNodes.map((node) => (
            <div
              key={node.id}
              className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-nx-line bg-nx-surface text-nx-accent">
                  <Monitor className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-nx-ink truncate">
                      {node.deviceTitle}
                    </span>
                    {node.isCurrent && (
                      <Badge className="bg-nx-accent-wash text-nx-accent border border-nx-accent/30 text-[10px] py-0 px-1.5">
                        {t("profile.sessions.currentBadge")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-nx-ink-3 truncate">
                    {node.ipAddress || "—"} · {node.cityLabel}
                  </p>
                </div>
              </div>
              {!node.isCurrent && onKillNode && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onKillNode(node.id)}
                  className="h-7 px-2 text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeNode && (
        <div
          data-testid="map-selected-workstation-inspector"
          className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-nx-accent/30 bg-nx-accent-wash text-nx-accent">
              <Monitor className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-nx-ink">{activeNode.deviceTitle}</span>
                <Badge className="bg-success/15 text-success border border-success/30 text-[10px] font-mono">
                  {activeNode.tls}
                </Badge>
              </div>
              <p className="text-[11px] font-mono text-nx-ink-3 mt-0.5">
                {activeNode.cityLabel} ({activeNode.lat.toFixed(2)}°N, {activeNode.lon.toFixed(2)}°E) • IP {activeNode.ipAddress}
              </p>
            </div>
          </div>

          {!activeNode.isCurrent && onKillNode && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="map-inspector-kill-btn"
              onClick={() => onKillNode(activeNode.id)}
              className="h-8 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
              <span>{t("profile.sessions.terminateNodeBtn")}</span>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
