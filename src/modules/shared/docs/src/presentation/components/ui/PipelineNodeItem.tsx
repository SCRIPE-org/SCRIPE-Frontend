"use client";

import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";

interface PipelineNodeItemProps {
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  duration?: number;
  description?: string;
  onClick?: () => void;
}

/**
 * PipelineNodeItem — one stage in the request-pipeline simulator.
 * `onClick` is optional: the simulator currently drives this list itself
 * (no stage is user-selectable), so a stage without a handler renders as a
 * plain row rather than an element that looks clickable but does nothing.
 */
export function PipelineNodeItem({
  name,
  isActive,
  isCompleted,
  duration,
  description,
  onClick,
}: PipelineNodeItemProps) {
  const stateClass = isActive ? "active" : isCompleted ? "completed" : "";

  const body = (
    <>
      <div className="docs-pipeline-node-indicator" aria-hidden="true">
        <span className="light"></span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="docs-pipeline-node-name">{name}</div>
        {description && <div className="docs-pipeline-node-desc">{description}</div>}
      </div>
      {duration !== undefined && <div className="docs-pipeline-node-duration">{duration}ms</div>}
    </>
  );

  if (onClick) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={onClick}
        className={cn("docs-pipeline-node h-auto p-0 hover:bg-transparent justify-start text-start", stateClass)}
      >
        {body}
      </Button>
    );
  }

  return <div className={cn("docs-pipeline-node cursor-default", stateClass)}>{body}</div>;
}
