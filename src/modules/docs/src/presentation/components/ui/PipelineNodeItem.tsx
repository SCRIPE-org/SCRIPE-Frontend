"use client";

interface PipelineNodeItemProps {
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  duration?: number;
  onClick: () => void;
}

export function PipelineNodeItem({ name, isActive, isCompleted, duration, onClick }: PipelineNodeItemProps) {
  return (
    <div
      className={`docs-pipeline-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
      onClick={onClick}
    >
      <div className="docs-pipeline-node-indicator">
        <span className="light"></span>
      </div>
      <div className="docs-pipeline-node-name">{name}</div>
      {duration !== undefined && (
        <div className="docs-pipeline-node-duration">{duration}ms</div>
      )}
    </div>
  );
}
