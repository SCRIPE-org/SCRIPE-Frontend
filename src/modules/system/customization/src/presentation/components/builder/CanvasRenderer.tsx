/**
 * CanvasRenderer — CSS Grid renderer for builder-mode preview
 *
 * Renders CanvasComponent[] as a CSS Grid layout.
 * Used ONLY inside the LoginPreviewShell (iframe) when canvasMode === 'builder'.
 *
 * This is a pure renderer — no DnD, no editing, no Zustand.
 * It inherits all design tokens set by the studio for consistent styling.
 */
"use client";

import type { CanvasComponent, CanvasBackground } from "../../../domain/entities/CanvasComponent";
import { CANVAS_GRID_COLUMNS } from "../../../domain/entities/CanvasComponent";
import { ComponentRenderer } from "./ComponentRenderer";

interface CanvasRendererProps {
  components: CanvasComponent[];
  gridRows: number;
  canvasBackground?: CanvasBackground;
}

export function CanvasRenderer({ components, gridRows, canvasBackground }: CanvasRendererProps) {
  // Resolve background
  let bg = 'var(--login-bg, hsl(var(--background)))';
  if (canvasBackground && canvasBackground.type !== 'inherit' && canvasBackground.value) {
    bg = canvasBackground.value;
  }

  return (
    <div
      className="login-page w-full min-h-screen selection:bg-primary/20"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${CANVAS_GRID_COLUMNS}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, minmax(60px, auto))`,
        minHeight: '100vh',
        gap: '0px',
        background: bg,
        fontFamily: 'var(--login-font-body, inherit)',
        lineHeight: 'var(--login-line-height, 1.5)',
        letterSpacing: 'var(--login-letter-spacing, 0px)',
      }}
    >
      {components
        .filter(c => c.visible)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((comp) => {
          // Map alignment values to CSS
          const justifyMap: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end' };
          const alignMap: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end' };

          return (
            <div
              key={comp.id}
              style={{
                gridColumn: comp.gridColumn,
                gridRow: comp.gridRow,
                display: 'flex',
                alignItems: alignMap[comp.verticalAlignment] || 'center',
                justifyContent: justifyMap[comp.alignment] || 'center',
                padding: '8px',
                zIndex: comp.zIndex,
              }}
            >
              <ComponentRenderer type={comp.type} props={comp.props} />
            </div>
          );
        })}
    </div>
  );
}
