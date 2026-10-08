"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Eye, EyeOff } from "lucide-react";

/**
 * Props for password input with reveal toggle.
 */
export interface PasswordFieldProps {
  id: string;
  value: string;
  show: boolean;
  placeholder: string;
  onChange: (v: string) => void;
  onToggle: () => void;
  autoFocus?: boolean;
}

/**
 * Documentation for PasswordField
 */
export function PasswordField({
  id,
  value,
  show,
  placeholder,
  onChange,
  onToggle,
  autoFocus,
}: PasswordFieldProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pe-10 font-mono tracking-tight text-sm focus-visible:ring-2 focus-visible:ring-primary"
        autoFocus={autoFocus}
      />
      <Button
        variant="ghost"
        type="button"
        size="sm"
        onClick={onToggle}
        className="absolute end-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={0}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
