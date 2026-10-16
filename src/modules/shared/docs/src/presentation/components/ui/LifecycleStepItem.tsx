"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { Button } from "@core/ui/button";
import { chartColor } from "@core/ui/chart";
import { cn } from "@core/common/utils";
import type { LifecycleStep } from "../../../domain/entities/DocSection";

interface LifecycleStepItemProps {
  step: LifecycleStep;
  isActive: boolean;
  onClick: () => void;
}

// Colour follows the actor entity, never its position in the list — a fixed
// categorical chart slot per actor keeps the mapping stable across renders.
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

/**
 * Documentation for module export
 */
export function LifecycleStepItem({ step, isActive, onClick }: LifecycleStepItemProps) {
  const { t } = useDocsI18n();
  const color = chartColor(ACTOR_SLOT[step.actor]);
  const isInbound = step.direction === "inbound";

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-current={isActive ? "step" : undefined}
      className={cn(
        "docs-lifecycle-step-card block h-auto w-full justify-start text-start font-normal",
        isActive && "active"
      )}
      style={{ borderInlineStartWidth: "3px", borderInlineStartColor: color }}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>
          {t(ACTOR_LABEL_KEY[step.actor])}
        </span>
        <span className="text-[11px] text-nx-ink-2">
          <span aria-hidden="true">{isInbound ? "📥" : "📤"}</span>{" "}
          {isInbound
            ? t("widgets.lifecycleTracer.directionInbound")
            : t("widgets.lifecycleTracer.directionOutbound")}
        </span>
      </div>
      <div className="text-sm font-semibold text-nx-ink">{t(step.labelKey)}</div>
    </Button>
  );
}
