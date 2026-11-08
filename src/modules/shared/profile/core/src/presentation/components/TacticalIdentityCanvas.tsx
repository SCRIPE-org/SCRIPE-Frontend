"use client";

/**
 * TacticalIdentityCanvas
 *
 * Interactive SVG Mini-Pitch Formation & Pressing Line Visualizer for the Executive Dossier.
 * Supports live formation switching (4-3-3, 4-2-3-1, 3-5-2), pressing line height,
 * build-up style selection, and tactical manifesto persistence.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Compass, Layers, CheckCircle2, Sparkles } from "lucide-react";

interface TacticalIdentityProps {
  preferredFormation: string;
  pressingIntensity: string;
  buildUpStyle: string;
  manifesto: string;
  assignedSquads: string[];
  onSave?: (payload: {
    preferredFormation: string;
    pressingIntensity: string;
    buildUpStyle: string;
    manifesto: string;
  }) => Promise<unknown>;
  isSaving?: boolean;
}

const FORMATION_COORDS: Record<string, Array<{ x: number; y: number; role: string }>> = {
  "4-3-3": [
    { x: 50, y: 88, role: "GK" },
    { x: 18, y: 68, role: "LB" },
    { x: 38, y: 72, role: "CB" },
    { x: 62, y: 72, role: "CB" },
    { x: 82, y: 68, role: "RB" },
    { x: 50, y: 52, role: "CDM" },
    { x: 32, y: 40, role: "CM" },
    { x: 68, y: 40, role: "CM" },
    { x: 20, y: 20, role: "LW" },
    { x: 50, y: 16, role: "ST" },
    { x: 80, y: 20, role: "RW" },
  ],
  "4-2-3-1": [
    { x: 50, y: 88, role: "GK" },
    { x: 18, y: 70, role: "LB" },
    { x: 38, y: 73, role: "CB" },
    { x: 62, y: 73, role: "CB" },
    { x: 82, y: 70, role: "RB" },
    { x: 36, y: 54, role: "CDM" },
    { x: 64, y: 54, role: "CDM" },
    { x: 22, y: 34, role: "LAM" },
    { x: 50, y: 32, role: "CAM" },
    { x: 78, y: 34, role: "RAM" },
    { x: 50, y: 15, role: "ST" },
  ],
  "3-5-2": [
    { x: 50, y: 88, role: "GK" },
    { x: 28, y: 72, role: "LCB" },
    { x: 50, y: 74, role: "CB" },
    { x: 72, y: 72, role: "RCB" },
    { x: 14, y: 46, role: "LWB" },
    { x: 34, y: 52, role: "CM" },
    { x: 50, y: 40, role: "CAM" },
    { x: 66, y: 52, role: "CM" },
    { x: 86, y: 46, role: "RWB" },
    { x: 38, y: 18, role: "ST" },
    { x: 62, y: 18, role: "ST" },
  ],
};

export function TacticalIdentityCanvas({
  preferredFormation,
  pressingIntensity,
  buildUpStyle,
  manifesto,
  assignedSquads,
  onSave,
  isSaving,
}: TacticalIdentityProps) {
  const { t } = useI18n();
  const [formation, setFormation] = useState(
    FORMATION_COORDS[preferredFormation] ? preferredFormation : "4-3-3"
  );
  const [pressing, setPressing] = useState(pressingIntensity || "High-Press Gegenpressing");
  const [savedToast, setSavedToast] = useState(false);

  const nodes = FORMATION_COORDS[formation] ?? FORMATION_COORDS["4-3-3"];
  const pressingLineY = pressing.includes("High") ? 28 : pressing.includes("Mid") ? 46 : 62;

  const handleSelectFormation = async (nextFormation: string) => {
    setFormation(nextFormation);
    if (onSave) {
      await onSave({
        preferredFormation: nextFormation,
        pressingIntensity: pressing,
        buildUpStyle,
        manifesto,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  const handleTogglePressing = async (nextPressing: string) => {
    setPressing(nextPressing);
    if (onSave) {
      await onSave({
        preferredFormation: formation,
        pressingIntensity: nextPressing,
        buildUpStyle,
        manifesto,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.philosophy.sectionTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-0.5">
            {t("profile.philosophy.sectionDesc")}
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["4-3-3", "4-2-3-1", "3-5-2"].map((fmt) => (
            <Button
              key={fmt}
              type="button"
              size="sm"
              variant={formation === fmt ? "default" : "outline"}
              disabled={isSaving}
              onClick={() => handleSelectFormation(fmt)}
              className={
                formation === fmt
                  ? "h-7 px-2.5 text-[11px] font-mono font-bold bg-nx-accent-fill text-nx-on-fill"
                  : "h-7 px-2.5 text-[11px] font-mono border-nx-line bg-nx-raised text-nx-ink-2"
              }
            >
              {fmt}
            </Button>
          ))}
          {savedToast && (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{t("profile.common.saved")}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Interactive SVG Pitch */}
          <div className="lg:col-span-5 rounded-xl border border-nx-line bg-nx-raised p-3 flex flex-col items-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full max-w-[230px] aspect-square rounded-lg border border-nx-line bg-nx-surface"
              role="img"
              aria-label={t("profile.philosophy.formation")}
            >
              {/* Pitch markings */}
              <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" className="text-nx-line" strokeWidth="0.8" />
              <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" className="text-nx-line" strokeWidth="0.6" />
              <circle cx="50" cy="50" r="11" fill="none" stroke="currentColor" className="text-nx-line" strokeWidth="0.6" />
              <rect x="26" y="4" width="48" height="14" fill="none" stroke="currentColor" className="text-nx-line" strokeWidth="0.6" />
              <rect x="26" y="82" width="48" height="14" fill="none" stroke="currentColor" className="text-nx-line" strokeWidth="0.6" />

              {/* Dynamic Pressing Line */}
              <line
                x1="6"
                y1={pressingLineY}
                x2="94"
                y2={pressingLineY}
                stroke="currentColor"
                className="text-nx-accent"
                strokeWidth="1"
                strokeDasharray="2.5 2"
              />

              {/* Formation Nodes */}
              {nodes.map((node, idx) => (
                <g key={idx} transform={`translate(${node.x}, ${node.y})`}>
                  <circle r="4.5" className="fill-nx-accent-fill stroke-nx-surface" strokeWidth="1" />
                  <text
                    y="1.2"
                    textAnchor="middle"
                    className="fill-nx-on-fill font-mono font-bold"
                    fontSize="3.2"
                  >
                    {node.role}
                  </text>
                </g>
              ))}
            </svg>

            <div className="flex items-center justify-between w-full mt-2.5 px-1 text-[10px] text-nx-ink-3 font-mono">
              <span>{t("profile.philosophy.formation")}: {formation}</span>
              <span className="text-nx-accent font-semibold">{pressing}</span>
            </div>
          </div>

          {/* Tactical Telemetry & Manifesto */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
                <span className="text-[10px] text-nx-ink-3">{t("profile.philosophy.formation")}</span>
                <p className="font-bold font-mono text-nx-ink mt-0.5">{formation}</p>
              </div>
              <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
                <span className="text-[10px] text-nx-ink-3">{t("profile.philosophy.pressing")}</span>
                <p className="font-semibold text-nx-ink mt-0.5 truncate">{pressing}</p>
              </div>
              <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
                <span className="text-[10px] text-nx-ink-3">{t("profile.philosophy.buildup")}</span>
                <p className="font-semibold text-nx-ink mt-0.5 truncate">{buildUpStyle}</p>
              </div>
            </div>

            {/* Pressing Line Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                "High-Press Gegenpressing",
                "Mid-Block Compact",
                "Low-Block Counter",
              ].map((pMode) => (
                <Button
                  key={pMode}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleTogglePressing(pMode)}
                  className={
                    pressing === pMode
                      ? "h-7 text-[10px] border-nx-accent text-nx-accent bg-nx-accent-wash font-semibold"
                      : "h-7 text-[10px] border-nx-line bg-nx-raised text-nx-ink-3"
                  }
                >
                  <Sparkles className="h-3 w-3 me-1" />
                  {pMode}
                </Button>
              ))}
            </div>

            {/* Tactical Manifesto */}
            <div className="p-3.5 rounded-lg border border-nx-line bg-nx-raised text-xs space-y-1 border-s-2 border-s-nx-accent">
              <span className="text-[10px] font-semibold text-nx-accent uppercase tracking-wider">
                {t("profile.philosophy.manifesto")}
              </span>
              <p className="text-nx-ink-2 italic leading-relaxed">
                &ldquo;{manifesto}&rdquo;
              </p>
            </div>

            {/* Assigned Squad Portfolios */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <div className="flex items-center gap-1.5 text-xs text-nx-ink font-semibold">
                <Layers className="h-3.5 w-3.5 text-nx-accent" />
                <span>{t("profile.philosophy.squads")}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {assignedSquads.map((squad, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-nx-line bg-nx-surface text-nx-ink-2">
                    {squad}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
