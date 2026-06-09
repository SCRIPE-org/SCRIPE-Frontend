"use client";

import * as React from "react";

interface StrengthBarProps {
  strength: number;
  labels: string[];
}

export function StrengthBar({ strength, labels }: StrengthBarProps) {
  const colors = ["rgb(239,68,68)", "rgb(249,115,22)", "rgb(234,179,8)", "rgb(34,197,94)"];
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: lvl <= strength ? colors[strength - 1] : "var(--sx-chip-bg)",
            }}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-[11px]" style={{ color: colors[strength - 1] }}>
          {labels[strength - 1]}
        </p>
      )}
    </div>
  );
}
