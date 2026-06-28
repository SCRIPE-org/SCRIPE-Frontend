"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { LifecycleStep } from "../../../domain/entities/DocSection";
import { LifecycleStepItem } from "../ui/LifecycleStepItem";

interface LifecycleTracerProps {
  steps: LifecycleStep[];
  titleKey: string;
}

export function LifecycleTracer({ steps, titleKey }: LifecycleTracerProps) {
  const { t } = useDocsI18n();
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="docs-lifecycle-container" style={{ marginBottom: "2.5rem" }}>
      <div className="docs-lifecycle-title" style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>
        {t(titleKey)}
      </div>

      <div className="docs-explorer-layout" style={{ height: "380px" }}>
        <div className="docs-explorer-sidebar" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div className="docs-explorer-header">Sequence Steps</div>
          {steps.map((step, idx) => (
            <LifecycleStepItem
              key={step.id}
              step={step}
              isActive={idx === activeStepIdx}
              onClick={() => setActiveStepIdx(idx)}
            />
          ))}
        </div>
        <div className="docs-explorer-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
              <span className="docs-matrix-badge" style={{ textTransform: "uppercase" }}>
                {steps[activeStepIdx].actor}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Direction: {steps[activeStepIdx].direction}
              </span>
            </div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              {t(steps[activeStepIdx].labelKey)}
            </h4>
            <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", lineHeight: "1.6" }}>
              {t(steps[activeStepIdx].descriptionKey)}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", justifyContent: "center", borderTop: "1px solid var(--border)", paddingTop: "1rem", flexWrap: "wrap" }}>
            {["view", "viewmodel", "repository", "controller", "handler", "database"].map((actor, i) => {
              const isActiveActor = steps[activeStepIdx].actor === actor;
              return (
                <div key={actor} style={{ display: "contents" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      background: isActiveActor ? "var(--docs-purple-muted)" : "transparent",
                      border: isActiveActor ? "1px solid var(--docs-purple-primary)" : "1px solid transparent",
                      color: isActiveActor ? "var(--docs-purple-primary)" : "var(--text-tertiary)",
                      fontWeight: isActiveActor ? "bold" : "normal"
                    }}
                  >
                    {actor}
                  </span>
                  {i < 5 && <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>➔</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
