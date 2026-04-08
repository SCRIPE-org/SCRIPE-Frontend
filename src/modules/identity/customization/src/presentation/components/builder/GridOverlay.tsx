/**
 * GridOverlay — Visual 12-column grid lines for the builder canvas
 *
 * Renders as a transparent overlay on top of the canvas to show
 * column guides and row dividers, helping admins position components.
 */
"use client";

import { CANVAS_GRID_COLUMNS } from "../../../domain/entities/CanvasComponent";

interface GridOverlayProps {
  gridRows: number;
  show: boolean;
}

export function GridOverlay({ gridRows, show }: GridOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${CANVAS_GRID_COLUMNS}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, minmax(60px, 1fr))`,
      }}
    >
      {/* Column guides */}
      {Array.from({ length: CANVAS_GRID_COLUMNS }).map((_, i) => (
        <div
          key={`col-${i}`}
          className="border-x border-primary/[0.06]"
          style={{
            gridColumn: `${i + 1} / ${i + 2}`,
            gridRow: `1 / -1`,
          }}
        >
          {/* Column number label */}
          <span className="block text-center text-[8px] text-primary/20 font-mono pt-0.5">
            {i + 1}
          </span>
        </div>
      ))}
      {/* Row guides */}
      {Array.from({ length: gridRows }).map((_, i) => (
        <div
          key={`row-${i}`}
          className="border-y border-primary/[0.04]"
          style={{
            gridColumn: `1 / -1`,
            gridRow: `${i + 1} / ${i + 2}`,
          }}
        />
      ))}
    </div>
  );
}
