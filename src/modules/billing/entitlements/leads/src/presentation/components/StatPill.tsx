"use client";

interface StatPillProps {
  label: string;
  value: number;
  accent: string;
}

/**
 * Presentation UI component rendering the stat pill.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div className={`flex items-center gap-2 rounded-nx-md border px-3 py-1.5 ${accent} bg-current/5`}>
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="whitespace-nowrap text-xs text-nx-ink-3">{label}</span>
    </div>
  );
}
