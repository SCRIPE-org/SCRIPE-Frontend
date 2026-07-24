"use client";

// ── SLA Progress Bar ──────────────────────────────────────────────────────────
// Radix's shared Progress primitive pins a single accent fill (@core/ui/progress),
// but this reading needs its colour to track SLA health (green → red), so the
// track/fill are built by hand here — using the same scaleX-transform technique
// Progress uses, rather than a width transition, so the motion stays consistent
// with the rest of the system.

const SLA_FILL: Record<string, string> = {
  green: "bg-success",
  yellow: "bg-warning",
  orange: "bg-warning-strong",
  red: "bg-destructive",
};

interface DsrSlaCellProps {
  percent: number;
  color: string;
}

/**
 * Presentation UI component rendering the dsr sla cell.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DsrSlaCell({ percent, color }: DsrSlaCellProps) {
  const ratio = Math.min(1, Math.max(0, percent / 100));

  return (
    <div
      className="flex min-w-[100px] items-center gap-2"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-nx-raised">
        <div
          className={`h-full w-full origin-left rounded-full transition-transform duration-nx-standard ease-nx-enter motion-reduce:transition-none rtl:origin-right ${SLA_FILL[color] ?? "bg-nx-raised-2"}`}
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
      <span className="w-8 text-end text-xs tabular-nums text-nx-ink-3">{percent}%</span>
    </div>
  );
}
