"use client";

import { useState, useEffect, useRef } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { PipelineNodeItem } from "../ui/PipelineNodeItem";

interface PipelineSimulatorProps {
  titleKey: string;
  samplePayloadKey: string;
}

const pipelineBehaviors = [
  { name: "UnhandledException", log: "Init global error boundaries. Request monitoring active." },
  { name: "Validation", log: "Validating incoming payload... FluentValidation checks ok (0 errors)." },
  { name: "Authorization", log: "Authorizing user principal... RBAC permission requirements validated." },
  { name: "FeatureCheck", log: "Gating entitlements... Subscription active, tenant quota check ok." },
  { name: "Caching", log: "Reading Redis cache key... Cache miss. Forwarding request to handler." },
  { name: "Audit", log: "Logging mutation transaction details. Audit log prepared." },
  { name: "Handler", log: "Executing request handler logic. Database transactions complete." }
];

export function PipelineSimulator({ titleKey, samplePayloadKey }: PipelineSimulatorProps) {
  const { t } = useDocsI18n();
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSimulator = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([`[System] Starting AstraFlow request pipeline simulation...`]);
    setActiveStep(0);
  };

  const resetSimulator = () => {
    setIsRunning(false);
    setActiveStep(-1);
    setLogs([]);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isRunning && activeStep >= 0 && activeStep < pipelineBehaviors.length) {
      const current = pipelineBehaviors[activeStep];
      setLogs((prev) => [...prev, `[AstraFlow] Entering ${current.name}Behavior...`, ` -> ${current.log}`]);
      
      intervalRef.current = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 1500);
    } else if (activeStep >= pipelineBehaviors.length) {
      setLogs((prev) => [...prev, `[System] Simulation completed successfully in 10500ms.`]);
      setIsRunning(false);
      setActiveStep(-1);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isRunning, activeStep]);

  return (
    <div className="docs-pipeline-container" style={{ marginBottom: "2.5rem" }}>
      <div className="docs-pipeline-title" style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>
        {t(titleKey)}
      </div>
      
      <div className="docs-pipeline-controls" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          className="docs-terminal-tab active"
          onClick={startSimulator}
          disabled={isRunning}
          style={{ cursor: isRunning ? "not-allowed" : "pointer" }}
        >
          {t("docs.pipeline.run") || "Run Simulator"}
        </button>
        <button
          className="docs-terminal-tab"
          onClick={resetSimulator}
          style={{ cursor: "pointer" }}
        >
          {t("docs.pipeline.reset") || "Reset"}
        </button>
      </div>

      <div className="docs-pipeline-track" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", padding: "1rem", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "1rem" }}>
        {pipelineBehaviors.map((item, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = activeStep === -1 ? false : idx < activeStep;
          return (
            <div key={idx} style={{ display: "contents" }}>
              <PipelineNodeItem
                name={item.name}
                isActive={isActive}
                isCompleted={isCompleted}
                duration={idx * 15 + 10}
                onClick={() => {}}
              />
              {idx < pipelineBehaviors.length - 1 && (
                <span style={{ color: isCompleted ? "var(--docs-purple-primary)" : "var(--border)", fontWeight: "bold" }}>➔</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="docs-terminal-window">
        <div className="docs-terminal-header">
          <div className="docs-terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span style={{ marginLeft: "1rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
            Console output logs
          </span>
        </div>
        <div className="docs-terminal-body" style={{ minHeight: "120px", height: "160px", overflowY: "auto" }}>
          {logs.map((log, i) => (
            <div key={i} className="docs-terminal-output" style={{ fontSize: "0.8rem", color: log.startsWith(" [AstraFlow]") ? "var(--docs-purple-primary)" : log.startsWith(" -> ") ? "#e4e4e7" : "#10b981" }}>
              {log}
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.8rem" }}>
              Click "Run Simulator" above to trace flow...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
