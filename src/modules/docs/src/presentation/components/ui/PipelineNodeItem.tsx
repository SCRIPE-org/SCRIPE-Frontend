"use client";

interface PipelineNodeItemProps {
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  duration?: number;
  description?: string;
  onClick?: () => void;
}

export function PipelineNodeItem({ name, isActive, isCompleted, duration, description, onClick }: PipelineNodeItemProps) {
  return (
    <div
      className={`docs-pipeline-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
      onClick={onClick}
    >
      <div className="docs-pipeline-node-indicator">
        <span className="light"></span>
      </div>
      <div className="docs-pipeline-node-content" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="docs-pipeline-node-name" style={{ fontWeight: "600" }}>{name}</div>
        {description && (
          <div className="docs-pipeline-node-desc" style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "0.15rem" }}>
            {description}
          </div>
        )}
      </div>
      {duration !== undefined && (
        <div className="docs-pipeline-node-duration">{duration}ms</div>
      )}
    </div>
  );
}
