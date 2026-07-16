"use client";

import type { ExplorerFile } from "../../../domain/entities/DocSection";

interface FileTreeNodeProps {
  file: ExplorerFile;
  isActive: boolean;
  onClick: () => void;
}

export function FileTreeNode({ file, isActive, onClick }: FileTreeNodeProps) {
  const indent = file.depth * 16;
  return (
    <div
      className={`docs-tree-node ${isActive ? "active" : ""}`}
      style={{ paddingLeft: `${indent + 8}px` }}
      onClick={onClick}
    >
      <span>{file.type === "dir" ? "📁" : "📄"}</span>
      <span>{file.name}</span>
    </div>
  );
}
