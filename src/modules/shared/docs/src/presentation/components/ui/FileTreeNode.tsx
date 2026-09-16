"use client";

import { Folder, File as FileIcon } from "lucide-react";
import { Button } from "@core/ui/button";
import type { ExplorerFile } from "../../../domain/entities/DocSection";

interface FileTreeNodeProps {
  file: ExplorerFile;
  isActive: boolean;
  onClick: () => void;
}

/**
 * FileTreeNode — one row in the file explorer's tree. A real button, indented
 * with a logical (start-edge) inline padding so depth reads correctly in a
 * mirrored RTL tree instead of always indenting from the physical left.
 */
export function FileTreeNode({ file, isActive, onClick }: FileTreeNodeProps) {
  const indent = file.depth * 16;
  const Icon = file.type === "dir" ? Folder : FileIcon;

  return (
    <Button
      type="button"
      variant="ghost"
      aria-current={isActive ? "true" : undefined}
      className={`docs-tree-node w-full h-auto justify-start ${isActive ? "active" : ""}`}
      style={{ paddingInlineStart: `${indent + 8}px` }}
      onClick={onClick}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{file.name}</span>
    </Button>
  );
}
