"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Check } from "lucide-react";

export interface PasswordCheckProps {
  label: string;
  ok: boolean;
}

/**
 * Individual checklist item for password complexity requirements.
 */
export function PasswordCheck({ label, ok }: PasswordCheckProps) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {ok ? (
        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 stroke-[2.5]" aria-hidden="true" />
      ) : (
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0 mx-1" aria-hidden="true" />
      )}
      <span
        className={cn(
          "truncate text-xs transition-colors",
          ok ? "text-foreground font-medium" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
