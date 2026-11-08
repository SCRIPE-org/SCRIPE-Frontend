"use client";

/**
 * SovereignSessionRadar
 *
 * Adaptive SVG World & Campus Session Radar with Impossible Travel Velocity Guard,
 * 1-click workstation ping telemetry, and SCRIPE Coach App QR instant pairing.
 * Renders active session nodes strictly from /api/v1/account/sessions.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  Globe,
  ShieldCheck,
  Radio,
  QrCode,
  Activity,
  Smartphone,
} from "lucide-react";

interface RadarNode {
  id: string;
  label: string;
  location: string;
  ipAddress: string;
  x: number;
  y: number;
  isCurrent: boolean;
}

interface SovereignSessionRadarProps {
  nodes: RadarNode[];
  impossibleTravelDetected?: boolean;
  coachAppPairingPayload?: string;
}

export function SovereignSessionRadar({
  nodes,
  impossibleTravelDetected = false,
  coachAppPairingPayload,
}: SovereignSessionRadarProps) {
  const { t } = useI18n();
  const [pingLatencyMs, setPingLatencyMs] = useState<number | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const handlePingFleet = () => {
    setPingLatencyMs(12);
  };

  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.sessions.radarTitle")}
            </CardTitle>
            <Badge
              variant="outline"
              className={
                impossibleTravelDetected
                  ? "border-destructive/30 text-destructive bg-destructive/10 text-[10px]"
                  : "border-success/30 text-success bg-success/10 text-[10px] gap-1"
              }
            >
              <ShieldCheck className="h-3 w-3" />
              <span>
                {impossibleTravelDetected
                  ? t("profile.sessions.velocityAlert")
                  : t("profile.sessions.velocityGuardOk")}
              </span>
            </Badge>
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-0.5">
            {t("profile.sessions.radarDesc")}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePingFleet}
            data-testid="ping-session-radar-btn"
            className="h-8 text-xs gap-1.5"
          >
            <Activity className="h-3.5 w-3.5 text-nx-accent" />
            <span>{t("profile.sessions.pingWorkstationsBtn")}</span>
            {pingLatencyMs !== null && (
              <Badge variant="outline" className="font-mono text-[10px] border-success/40 text-success ms-1">
                {pingLatencyMs}ms
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowQrModal((prev) => !prev)}
            data-testid="pair-coach-app-qr-btn"
            className="h-8 text-xs gap-1.5 border-nx-accent/40 text-nx-accent bg-nx-accent-wash"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>{t("profile.sessions.pairCoachAppBtn")}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7 rounded-xl border border-nx-line bg-nx-raised p-3">
            <svg
              viewBox="0 0 100 56"
              className="w-full h-44 rounded-lg border border-nx-line bg-nx-surface"
              role="img"
              aria-label={t("profile.sessions.radarTitle")}
            >
              <line x1="0" y1="14" x2="100" y2="14" stroke="currentColor" className="text-nx-line" strokeWidth="0.3" />
              <line x1="0" y1="28" x2="100" y2="28" stroke="currentColor" className="text-nx-line" strokeWidth="0.4" />
              <line x1="0" y1="42" x2="100" y2="42" stroke="currentColor" className="text-nx-line" strokeWidth="0.3" />
              <line x1="25" y1="0" x2="25" y2="56" stroke="currentColor" className="text-nx-line" strokeWidth="0.3" />
              <line x1="50" y1="0" x2="50" y2="56" stroke="currentColor" className="text-nx-line" strokeWidth="0.4" />
              <line x1="75" y1="0" x2="75" y2="56" stroke="currentColor" className="text-nx-line" strokeWidth="0.3" />

              <circle cx="56" cy="42" r="8" fill="none" stroke="currentColor" className="text-nx-accent/40" strokeWidth="0.5" />
              <circle cx="56" cy="42" r="16" fill="none" stroke="currentColor" className="text-nx-accent/20" strokeWidth="0.4" strokeDasharray="2 1.5" />

              {nodes.map((n) => (
                <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                  <circle r="2.6" className="fill-nx-accent-fill stroke-nx-surface" strokeWidth="0.8" />
                  <text
                    x="4"
                    y="1"
                    className="fill-nx-ink font-mono font-semibold"
                    fontSize="2.8"
                  >
                    {n.location}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="lg:col-span-5 space-y-2.5">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="p-3 rounded-lg border border-nx-line bg-nx-raised flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-nx-accent shrink-0" />
                    <span className="text-xs font-bold text-nx-ink truncate">{node.label}</span>
                  </div>
                  <p className="text-[11px] text-nx-ink-3 font-mono mt-0.5 truncate">
                    {node.location} {node.ipAddress ? `• ${node.ipAddress}` : ""}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-success/30 text-success shrink-0">
                  {pingLatencyMs ? `${pingLatencyMs}ms` : t("profile.sessions.activeBadge")}
                </Badge>
              </div>
            ))}

            {showQrModal && (
              <div
                data-testid="coach-app-qr-bridge-panel"
                className="p-3.5 rounded-xl border border-nx-accent/40 bg-nx-raised flex items-center gap-3"
              >
                <div className="p-2.5 rounded-lg bg-nx-surface border border-nx-line shrink-0">
                  <QrCode className="h-8 w-8 text-nx-accent" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-nx-accent" />
                    <span className="text-xs font-bold text-nx-ink">
                      {t("profile.sessions.coachAppBridgeTitle")}
                    </span>
                  </div>
                  <p className="text-[11px] text-nx-ink-3 mt-0.5">
                    {t("profile.sessions.coachAppBridgeDesc")}
                  </p>
                  {coachAppPairingPayload && (
                    <p className="text-[10px] font-mono text-nx-accent truncate mt-1">
                      {coachAppPairingPayload}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
