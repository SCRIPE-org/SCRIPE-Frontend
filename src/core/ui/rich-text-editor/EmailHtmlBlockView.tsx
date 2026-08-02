"use client";

// COLOUR EXCEPTION — email HTML output, not product chrome.
//
// The document fragment this view builds for the preview iframe is the same
// markup that will be sent to a mail client, and mail clients do not evaluate
// CSS custom properties: a var(--nx-*) reference is dropped or, worse, silently
// resolved against the client's own stylesheet. So anything INSIDE the
// generated markup below stays inline and literal on purpose. Everything
// outside it — the card, the header strip, the hairlines, the delete control —
// is product chrome and reads the --nx- tokens like every other surface.

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
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

// ─── Icon Map ───────────────────────────────────────────────
const BLOCK_ICONS: Record<string, React.ReactNode> = {
  button: <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />,
  social: <Share2 className="h-3.5 w-3.5" aria-hidden="true" />,
  generic: <Code2 className="h-3.5 w-3.5" aria-hidden="true" />,
};

// ─── Component ──────────────────────────────────────────────
export function EmailHtmlBlockView({ node, deleteNode, selected }: NodeViewProps) {
  const { t } = useI18n();
  const { html, label, blockType } = node.attrs as {
    html: string;
    label: string;
    blockType: string;
  };
  const [hovered, setHovered] = useState(false);

  const icon = BLOCK_ICONS[blockType] || BLOCK_ICONS.generic;

  // Build a self-contained HTML document for the iframe preview. Everything in
  // here is mail-client markup — see the COLOUR EXCEPTION note at the top.
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
        // Selection lights the EDGE rather than growing the border: a 2px→1px
        // swap moved every following line in the document by a pixel.
        "email-html-block relative my-2 rounded-nx-md border transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        selected
          ? "border-nx-accent shadow-[inset_0_0_0_1px_var(--nx-accent)]"
          : hovered
            ? "border-nx-line-hi"
            : "border-nx-line"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-drag-handle
    >
      {/* Header bar */}
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-t-nx-md px-2 py-1 text-xs font-medium",
          "border-b border-nx-line bg-nx-raised text-nx-ink-2"
        )}
      >
        <GripVertical className="h-3 w-3 cursor-grab text-nx-ink-3" aria-hidden="true" />
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
            aria-label={t("editorBlocks.block.remove")}
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Preview iframe */}
      <div className="rounded-b-nx-md bg-nx-surface p-2">
        <iframe
          srcDoc={iframeSrcDoc}
          sandbox="allow-same-origin"
          className="pointer-events-none w-full border-0"
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
