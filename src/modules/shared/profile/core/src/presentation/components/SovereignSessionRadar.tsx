"use client";

/**
 * SovereignSessionRadar
 *
 * Interactive OpenStreetMap geolocation radar displaying active authenticated
 * workstation nodes, anti-collision city pin callouts, and node termination actions.
 */
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Globe, ShieldAlert, Wifi } from "lucide-react";
import {
  normalizeRadarNodes,
  type PositionedRadarNode,
  type RadarSessionNode,
} from "../utils/session-radar.utils";
import { SessionRadarSvgOverlay } from "./SessionRadarSvgOverlay";
import { SessionRadarTelemetryCards } from "./SessionRadarTelemetryCards";

/** Re-exported session node descriptor for {@link SovereignSessionRadar}. */
export type { RadarSessionNode };

interface SovereignSessionRadarProps {
  nodes: RadarSessionNode[];
  impossibleTravelDetected?: boolean;
  onRevokeAllOther?: () => void;
  onSelectNode?: (nodeId: string) => void;
  onKillNode?: (nodeId: string) => void;
}

/** Interactive geolocation radar card plotting active account session nodes. */
export function SovereignSessionRadar({
  nodes,
  onRevokeAllOther,
  onSelectNode,
  onKillNode,
}: SovereignSessionRadarProps) {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [domIsLight, setDomIsLight] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const checkLight = () => {
      const html = document.documentElement;
      setDomIsLight(
        html.classList.contains("light") || html.getAttribute("data-theme") === "light"
      );
    };
    checkLight();
    const observer = new MutationObserver(checkLight);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const isLight = domIsLight || resolvedTheme === "light";
  const [zoom, setZoom] = useState<number>(1.35);
  const [selectedId, setSelectedId] = useState<string>(nodes[0]?.id ?? "ws-current");

  const normalizedNodes = normalizeRadarNodes(
    nodes,
    t("profile.sessions.geoTelemetryUnavailable"),
    t("profile.sessions.workstationFallback")
  );
  const positionedNodes = normalizedNodes.filter(
    (n): n is PositionedRadarNode => n.hasCoords
  );
  const unlocatedNodes = normalizedNodes.filter((n) => !n.hasCoords);
  const activeNode = positionedNodes.find((n) => n.id === selectedId) ?? positionedNodes[0];

  return (
    <Card
      data-testid="sovereign-session-radar"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.sessions.radarTitle")}
            </CardTitle>
            <Badge variant="outline" className="border-nx-line text-nx-ink-2 text-[10px] font-mono">
              OpenStreetMap • CARTO
            </Badge>
          </div>
          <CardDescription className="text-xs text-nx-ink-2 mt-1">
            {t("profile.sessions.radarSubtitle")}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-nx-accent/30 text-nx-accent font-mono text-xs gap-1.5">
            <Wifi className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
            <span>
              {nodes.length} {t("profile.sessions.activeNodesBadge")}
            </span>
          </Badge>
          {onRevokeAllOther && (
            <Button
              size="sm"
              variant="destructive"
              data-testid="kill-all-other-sessions-btn"
              onClick={onRevokeAllOther}
              className="text-xs h-8 font-semibold gap-1.5"
            >
              <ShieldAlert className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
              <span>{t("profile.sessions.killOtherBtn")}</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {positionedNodes.length > 0 && (
          <SessionRadarSvgOverlay
            positionedNodes={positionedNodes}
            activeNodeId={activeNode?.id}
            zoom={zoom}
            isLight={isLight}
            onZoomChange={setZoom}
            onSelectNode={(nodeId) => {
              setSelectedId(nodeId);
              onSelectNode?.(nodeId);
            }}
          />
        )}

        <SessionRadarTelemetryCards
          unlocatedNodes={unlocatedNodes}
          activeNode={activeNode}
          onKillNode={onKillNode}
        />
      </CardContent>
    </Card>
  );
}
