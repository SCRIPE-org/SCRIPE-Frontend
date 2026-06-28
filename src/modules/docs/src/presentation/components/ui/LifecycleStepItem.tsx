"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { LifecycleStep } from "../../../domain/entities/DocSection";

interface LifecycleStepItemProps {
  step: LifecycleStep;
  isActive: boolean;
  onClick: () => void;
}

const actorColors = {
  view: "var(--docs-purple-primary)",
  viewmodel: "#38bdf8",
  repository: "#f59e0b",
  controller: "#10b981",
  handler: "#ec4899",
  database: "#8b5cf6"
};

export function LifecycleStepItem({ step, isActive, onClick }: LifecycleStepItemProps) {
  const { t } = useDocsI18n();
  const color = actorColors[step.actor] || "var(--border)";

  return (
    <div
      className={`docs-lifecycle-step-card ${isActive ? "active" : ""}`}
      onClick={onClick}
      style={{
        borderLeft: `3px solid ${color}`,
        background: "var(--bg-secondary)",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: "bold", textTransform: "uppercase", color }}>
          {step.actor}
        </span>
        <span style={{ fontSize: "0.65rem", color: "hsl(var(--muted-foreground))" }}>
          {step.direction === "inbound" ? "📥 Inbound" : "📤 Outbound"}
        </span>
      </div>
      <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>{t(step.labelKey)}</div>
    </div>
  );
}
