"use client";

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";

interface HoldCountdownBadgeProps {
  expiresAtUtc: string | null;
  onExpired?: () => void;
  className?: string;
  label?: string;
}

export function HoldCountdownBadge({
  expiresAtUtc,
  onExpired,
  className,
  label,
}: HoldCountdownBadgeProps) {
  const [remainingText, setRemainingText] = useState<string | null>(null);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (!expiresAtUtc) {
      setRemainingText(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(expiresAtUtc).getTime();
      const diffMs = expiry - now;

      if (diffMs <= 0) {
        setRemainingText("00:00");
        setIsCritical(true);
        onExpired?.();
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setRemainingText(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
      setIsCritical(totalSeconds < 120);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAtUtc, onExpired]);

  if (!remainingText) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-mono text-xs px-2.5 py-1 border transition-colors",
        isCritical
          ? "border-red-500/50 bg-red-500/10 text-red-400 animate-pulse"
          : "border-amber-500/40 bg-amber-500/10 text-amber-300",
        className
      )}
    >
      <Timer className="size-3.5" />
      <span>{label ? `${label}: ${remainingText}` : remainingText}</span>
    </Badge>
  );
}
