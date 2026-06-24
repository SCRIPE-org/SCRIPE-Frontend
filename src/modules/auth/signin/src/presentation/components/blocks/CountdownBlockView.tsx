"use client";

import { useEffect, useMemo, useState } from "react";
import type { CountdownBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

function getParts(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    expired: diff <= 0,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * React presentation component representing the countdown block view UI element.
 */
export function CountdownBlockView({ block }: { block: CountdownBlock }) {
  const props = block.props;
  const [parts, setParts] = useState(() => getParts(props.targetDate));
  const entries = useMemo(
    () => [
      ["days", parts.days],
      ["hrs", parts.hours],
      ["min", parts.minutes],
      ["sec", parts.seconds],
    ],
    [parts]
  );

  useEffect(() => {
    const id = window.setInterval(() => setParts(getParts(props.targetDate)), 1000);
    return () => window.clearInterval(id);
  }, [props.targetDate]);

  if (parts.expired)
    return <p className="text-center text-sm text-muted-foreground">{props.expiredText || ""}</p>;

  return (
    <div className="text-center">
      {props.label && <p className="mb-2 text-sm font-medium">{props.label}</p>}
      <div className="flex justify-center gap-2">
        {entries.map(([label, value]) => (
          <div
            key={label}
            className={
              props.style === "minimal" ? "px-1" : "rounded-lg border bg-background px-3 py-2"
            }
          >
            <div className="text-lg font-bold tabular-nums">{String(value).padStart(2, "0")}</div>
            {props.showLabels !== false && (
              <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
