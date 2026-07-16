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
  {
    name: "Validation",
    log: "Validating incoming payload... FluentValidation checks ok (0 errors).",
  },
  {
    name: "Authorization",
    log: "Authorizing user principal... RBAC permission requirements validated.",
  },
  {
    name: "FeatureCheck",
    log: "Gating entitlements... Subscription active, tenant quota check ok.",
  },
  { name: "Caching", log: "Reading Redis cache key... Cache miss. Forwarding request to handler." },
  { name: "Audit", log: "Logging mutation transaction details. Audit log prepared." },
  { name: "Handler", log: "Executing request handler logic. Database transactions complete." },
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
    let logsTimeout: NodeJS.Timeout | null = null;
    let completeTimeout: NodeJS.Timeout | null = null;

    if (isRunning && activeStep >= 0 && activeStep < pipelineBehaviors.length) {
      const current = pipelineBehaviors[activeStep];
      logsTimeout = setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `[AstraFlow] Entering ${current.name}Behavior...`,
          ` -> ${current.log}`,
        ]);
      }, 0);

      intervalRef.current = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 1500);
    } else if (activeStep >= pipelineBehaviors.length) {
      completeTimeout = setTimeout(() => {
        setLogs((prev) => [...prev, `[System] Simulation completed successfully in 10500ms.`]);
        setIsRunning(false);
        setActiveStep(-1);
      }, 0);
    }

    return () => {
      if (logsTimeout) clearTimeout(logsTimeout);
      if (completeTimeout) clearTimeout(completeTimeout);
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isRunning, activeStep]);

  return (
    <div className="docs-pipeline-container" style={{ marginBottom: "2.5rem" }}>
      <div
        className="docs-pipeline-title"
        style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}
      >
        {t(titleKey)}
      </div>

      <div
        className="docs-pipeline-steps"
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        {pipelineBehaviors.map((step, idx) => (
          <PipelineNodeItem
            key={idx}
            name={`${step.name}Behavior`}
            description={step.log}
            isActive={idx === activeStep}
            isCompleted={idx < activeStep}
            duration={idx < activeStep ? idx * 12 + 8 : undefined}
          />
        ))}
      </div>

      <div
        className="docs-pipeline-controls"
        style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", marginBottom: "1.5rem" }}
      >
        <button
          className="docs-pipeline-btn docs-pipeline-btn-primary"
          onClick={startSimulator}
          disabled={isRunning}
        >
          {t("common.run")}
        </button>
        <button
          className="docs-pipeline-btn docs-pipeline-btn-secondary"
          onClick={resetSimulator}
          disabled={!isRunning && logs.length === 0}
        >
          {t("common.reset")}
        </button>
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
        <div
          className="docs-terminal-body"
          style={{ minHeight: "120px", height: "160px", overflowY: "auto" }}
        >
          {logs.map((log, i) => (
            <div
              key={i}
              className="docs-terminal-output"
              style={{
                fontSize: "0.8rem",
                color: log.startsWith(" [AstraFlow]")
                  ? "var(--docs-purple-primary)"
                  : log.startsWith(" -> ")
                    ? "#e4e4e7"
                    : "#10b981",
              }}
            >
              {log}
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.8rem" }}>
              Click &quot;Run Simulator&quot; above to trace flow...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
