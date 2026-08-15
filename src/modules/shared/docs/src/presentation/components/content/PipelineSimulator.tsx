"use client";

import { useState, useEffect, useRef } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { PipelineNodeItem } from "../ui/PipelineNodeItem";
import { Button } from "@core/ui/button";

interface PipelineSimulatorProps {
  titleKey: string;
  samplePayloadKey: string;
}

// Fictional demonstration pipeline (no real "AstraFlow" tool exists) used to
// teach the request-middleware shape — unlike CliSimulator's transcript of a
// real tool's stdout, this narration is the widget's own documentation prose,
// so every stage is a translation key rather than invariant literal text.
const pipelineStageKeys = [
  "unhandledException",
  "validation",
  "authorization",
  "featureCheck",
  "caching",
  "audit",
  "handler",
] as const;

export function PipelineSimulator({ titleKey }: PipelineSimulatorProps) {
  const { t } = useDocsI18n();
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepName = (key: (typeof pipelineStageKeys)[number]) =>
    t(`widgets.pipelineSimulator.steps.${key}.name`);
  const stepDescription = (key: (typeof pipelineStageKeys)[number]) =>
    t(`widgets.pipelineSimulator.steps.${key}.description`);

  const startSimulator = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([`[System] ${t("widgets.pipelineSimulator.startMessage")}`]);
    setActiveStep(0);
  };

  const resetSimulator = () => {
    setIsRunning(false);
    setActiveStep(-1);
    setLogs([]);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    let logsTimeout: ReturnType<typeof setTimeout> | null = null;
    let completeTimeout: ReturnType<typeof setTimeout> | null = null;

    if (isRunning && activeStep >= 0 && activeStep < pipelineStageKeys.length) {
      const key = pipelineStageKeys[activeStep];
      logsTimeout = setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `[Pipeline] ${t("widgets.pipelineSimulator.enteringStep", { step: stepName(key) })}`,
          ` -> ${stepDescription(key)}`,
        ]);
      }, 0);

      intervalRef.current = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 1500);
    } else if (activeStep >= pipelineStageKeys.length) {
      completeTimeout = setTimeout(() => {
        setLogs((prev) => [...prev, `[System] ${t("widgets.pipelineSimulator.completeMessage")}`]);
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
    // `t` intentionally excluded: this mirrors the original [isRunning, activeStep]
    // dependency set exactly. Including `t` would re-fire the in-flight timer (and
    // duplicate a log line) if the docs language is switched mid-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, activeStep]);

  return (
    <div className="mb-10">
      <div className="mb-4 text-lg font-semibold leading-none tracking-tight text-nx-ink">
        {t(titleKey)}
      </div>

      <div className="flex flex-col gap-2">
        {pipelineStageKeys.map((key, idx) => (
          <PipelineNodeItem
            key={key}
            name={stepName(key)}
            description={stepDescription(key)}
            isActive={idx === activeStep}
            isCompleted={idx < activeStep}
            duration={idx < activeStep ? idx * 12 + 8 : undefined}
          />
        ))}
      </div>

      <div className="mb-6 mt-6 flex gap-4">
        <Button type="button" onClick={startSimulator} disabled={isRunning} aria-busy={isRunning}>
          {isRunning ? t("widgets.pipelineSimulator.running") : t("common.run")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={resetSimulator}
          disabled={!isRunning && logs.length === 0}
        >
          {t("common.reset")}
        </Button>
      </div>

      <div className="docs-terminal-window">
        <div className="docs-terminal-header">
          <div className="docs-terminal-dots" aria-hidden="true">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className="ms-4 text-[11px] text-nx-ink-3">
            {t("widgets.pipelineSimulator.consoleLabel")}
          </span>
        </div>
        <div className="docs-terminal-body h-40 min-h-[120px] overflow-y-auto" aria-live="polite">
          {logs.map((log, i) => (
            <div
              key={i}
              className={
                log.startsWith("->")
                  ? "docs-terminal-output"
                  : "docs-terminal-output text-nx-accent"
              }
            >
              {log}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-nx-ink-3">{t("widgets.pipelineSimulator.emptyHint")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
