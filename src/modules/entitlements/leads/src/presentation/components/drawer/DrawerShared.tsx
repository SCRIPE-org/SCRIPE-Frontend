"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Copy, CheckCheck } from "lucide-react";
import type { LeadStatus } from "../../../domain/entities/PlatformLead";

// Re-export for convenience
export type { LeadStatus };

// ── Status config ─────────────────────────────────────────────────────────────

export const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Closed"];

export const STATUS_STYLES: Record<LeadStatus, { badge: string; dot: string; ring: string }> = {
  New: {
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
    ring: "ring-blue-500/30",
  },
  Contacted: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
    ring: "ring-amber-500/30",
  },
  Qualified: {
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
    ring: "ring-violet-500/30",
  },
  Converted: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    ring: "ring-emerald-500/30",
  },
  Closed: {
    badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    dot: "bg-zinc-500",
    ring: "ring-zinc-500/30",
  },
};

// ── CopyButton ────────────────────────────────────────────────────────────────

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      variant="ghost"
      size="icon"
      className="h-5 w-5 shrink-0 text-zinc-600 hover:text-zinc-300"
    >
      {copied ? <CheckCheck className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────

export function InfoRow({
  icon: Icon,
  label,
  value,
  copyable,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  copyable?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm text-zinc-200 ${mono ? "font-mono" : ""}`}>
            {value}
          </span>
          {copyable && <CopyButton value={copyable} />}
        </div>
      </div>
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────

export function SectionCard({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 ${accent ?? "border-zinc-800/50 bg-zinc-900/40"}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── SkeletonPanel ─────────────────────────────────────────────────────────────

export function SkeletonPanel() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2 rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4">
          <div className="h-2.5 w-24 rounded-full bg-zinc-800" />
          <div className="h-4 w-40 rounded-full bg-zinc-800" />
          <div className="h-4 w-32 rounded-full bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}
