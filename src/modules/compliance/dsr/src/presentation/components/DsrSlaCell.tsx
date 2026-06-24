"use client";

// ── SLA Progress Bar ──────────────────────────────────────────────────────────

const SLA_BG: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

interface DsrSlaCellProps {
  percent: number;
  color: string;
}

/**
 * React presentation component representing the dsr sla cell UI element.
 */
export function DsrSlaCell({ percent, color }: DsrSlaCellProps) {
  return (
    <div
      className="flex min-w-[100px] items-center gap-2"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${SLA_BG[color] ?? "bg-muted-foreground"}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{percent}%</span>
    </div>
  );
}
