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
        <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-nx-success" aria-hidden="true" />
      ) : (
        <div
          className="mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-nx-line-hi"
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          "truncate text-xs transition-colors",
          ok ? "font-medium text-nx-ink" : "text-nx-ink-2"
        )}
      >
        {label}
      </span>
    </div>
  );
}
