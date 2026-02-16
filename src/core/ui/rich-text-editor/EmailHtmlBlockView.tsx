"use client";

/**
 * EmailHtmlBlockView — React NodeView for the EmailHtmlBlock TipTap extension.
 *
 * Renders the stored email HTML inside a sandboxed visual card in the editor.
 * The user sees a labelled preview with hover controls (edit, delete).
 * The actual raw HTML is rendered in a tiny sandboxed iframe for accurate preview.
 */

import React, { useCallback, useMemo, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Trash2, MousePointerClick, Share2, Code2, GripVertical } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";

// ─── Icon Map ───────────────────────────────────────────────
const BLOCK_ICONS: Record<string, React.ReactNode> = {
      button: <MousePointerClick className="h-3.5 w-3.5" />,
      social: <Share2 className="h-3.5 w-3.5" />,
      generic: <Code2 className="h-3.5 w-3.5" />,
};

// ─── Component ──────────────────────────────────────────────
export function EmailHtmlBlockView({ node, deleteNode, selected }: NodeViewProps) {
      const { html, label, blockType } = node.attrs as {
            html: string;
            label: string;
            blockType: string;
      };
      const [hovered, setHovered] = useState(false);

      const icon = BLOCK_ICONS[blockType] || BLOCK_ICONS.generic;

      // Build a self-contained HTML document for the iframe preview
      const iframeSrcDoc = useMemo(() => {
            return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    min-height: 40px;
    padding: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: transparent;
  }
</style>
</head>
<body>${html}</body>
</html>`;
      }, [html]);

      const handleDelete = useCallback(
            (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteNode();
            },
            [deleteNode]
      );

      return (
            <NodeViewWrapper
                  className={cn(
                        "email-html-block relative my-2 rounded-lg border-2 transition-all",
                        selected
                              ? "border-primary/50 ring-2 ring-primary/20"
                              : hovered
                                    ? "border-primary/30"
                                    : "border-border/50"
                  )}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  data-drag-handle
            >
                  {/* Header bar */}
                  <div
                        className={cn(
                              "flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-t-md",
                              "bg-muted/40 text-muted-foreground border-b border-border/30"
                        )}
                  >
                        <GripVertical className="h-3 w-3 cursor-grab opacity-40" />
                        {icon}
                        <span className="truncate">{label}</span>
                        <div className="flex-1" />

                        {/* Delete button */}
                        {(hovered || selected) && (
                              <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={handleDelete}
                                    title="Remove block"
                              >
                                    <Trash2 className="h-3 w-3" />
                              </Button>
                        )}
                  </div>

                  {/* Preview iframe */}
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-b-md">
                        <iframe
                              srcDoc={iframeSrcDoc}
                              sandbox="allow-same-origin"
                              className="w-full border-0 pointer-events-none"
                              style={{ height: "auto", minHeight: "48px", maxHeight: "200px" }}
                              title={label}
                              onLoad={(e) => {
                                    // Auto-resize iframe to content height
                                    const iframe = e.currentTarget;
                                    try {
                                          const body = iframe.contentDocument?.body;
                                          if (body) {
                                                const h = body.scrollHeight;
                                                iframe.style.height = `${Math.min(h + 8, 200)}px`;
                                          }
                                    } catch {
                                          // Cross-origin or sandbox restriction — use min height
                                    }
                              }}
                        />
                  </div>
            </NodeViewWrapper>
      );
}

export default EmailHtmlBlockView;
