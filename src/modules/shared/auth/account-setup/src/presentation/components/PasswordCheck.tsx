"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Check } from "lucide-react";

/**
 * Documentation for module export
 */
export interface PasswordCheckProps {
  label: string;
  ok: boolean;
}

/**
 * Individual checklist item for password complexity requirements.
 */
export function PasswordCheck({ label, ok }: PasswordCheckProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {ok ? (
        <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-emerald-500" aria-hidden="true" />
      ) : (
        <div
          className="mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40"
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          "truncate text-xs transition-colors",
          ok ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
