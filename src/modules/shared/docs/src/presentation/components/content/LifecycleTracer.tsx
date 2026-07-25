"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { LifecycleStep } from "../../../domain/entities/DocSection";
import { LifecycleStepItem } from "../ui/LifecycleStepItem";
import { chartColor } from "@core/ui/chart";
import { cn } from "@core/common/utils";

interface LifecycleTracerProps {
  steps: LifecycleStep[];
  titleKey: string;
}

const ACTOR_ORDER: LifecycleStep["actor"][] = [
  "view",
  "viewmodel",
  "repository",
  "controller",
  "handler",
  "database",
];

const ACTOR_SLOT: Record<LifecycleStep["actor"], number> = {
  view: 1,
  viewmodel: 2,
  repository: 3,
  controller: 4,
  handler: 5,
  database: 6,
};

const ACTOR_LABEL_KEY: Record<LifecycleStep["actor"], string> = {
  view: "widgets.lifecycleTracer.actor.view",
  viewmodel: "widgets.lifecycleTracer.actor.viewmodel",
  repository: "widgets.lifecycleTracer.actor.repository",
  controller: "widgets.lifecycleTracer.actor.controller",
  handler: "widgets.lifecycleTracer.actor.handler",
  database: "widgets.lifecycleTracer.actor.database",
};

export function LifecycleTracer({ steps, titleKey }: LifecycleTracerProps) {
  const { t } = useDocsI18n();
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  if (!steps || steps.length === 0) return null;

  const activeStep = steps[activeStepIdx];
  const isInbound = activeStep.direction === "inbound";

  return (
    <div className="mb-10">
      <div className="mb-4 text-lg font-semibold leading-none tracking-tight text-nx-ink">
        {t(titleKey)}
      </div>

      <div className="docs-explorer-layout" style={{ height: "380px" }}>
        <div className="docs-explorer-sidebar flex flex-col gap-2">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("widgets.lifecycleTracer.sequenceStepsLabel")}
          </div>
          {steps.map((step, idx) => (
            <LifecycleStepItem
              key={step.id}
              step={step}
              isActive={idx === activeStepIdx}
              onClick={() => setActiveStepIdx(idx)}
            />
          ))}
        </div>
        <div className="docs-explorer-panel flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span
                className="docs-matrix-badge uppercase"
                style={{ color: chartColor(ACTOR_SLOT[activeStep.actor]) }}
              >
                {t(ACTOR_LABEL_KEY[activeStep.actor])}
              </span>
              <span className="text-xs text-nx-ink-2">
                {t("widgets.lifecycleTracer.directionLabel")}:{" "}
                {isInbound
                  ? t("widgets.lifecycleTracer.directionInbound")
                  : t("widgets.lifecycleTracer.directionOutbound")}
              </span>
            </div>
            <h4 className="mb-2 text-base font-semibold text-nx-ink">{t(activeStep.labelKey)}</h4>
            <p className="text-sm leading-relaxed text-pretty text-nx-ink-2">
              {t(activeStep.descriptionKey)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 border-t border-nx-line pt-4">
            {ACTOR_ORDER.map((actor, i) => {
              const isActiveActor = activeStep.actor === actor;
              return (
                <div key={actor} className="contents">
                  <span
                    className={cn(
                      "rounded-nx-sm border px-2 py-1 text-[11px]",
                      isActiveActor
                        ? "border-nx-accent bg-nx-accent-wash font-bold text-nx-accent"
                        : "border-transparent text-nx-ink-3"
                    )}
                  >
                    {t(ACTOR_LABEL_KEY[actor])}
                  </span>
                  {i < ACTOR_ORDER.length - 1 && (
                    <span className="text-xs text-nx-ink-3" aria-hidden="true">
                      ➔
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
