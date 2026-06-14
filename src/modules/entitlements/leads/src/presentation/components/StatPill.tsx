"use client";

interface StatPillProps {
  label: string;
  value: number;
  accent: string;
}

export function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${accent} bg-current/5`}>
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="whitespace-nowrap text-xs text-zinc-400">{label}</span>
    </div>
  );
}
