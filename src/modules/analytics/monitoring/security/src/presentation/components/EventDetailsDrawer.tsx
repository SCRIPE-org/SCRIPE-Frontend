"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@core/ui/sheet";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Separator } from "@core/ui/separator";
import {
  Check,
  Copy,
  ExternalLink,
  Clock,
  User,
  Globe,
  Terminal,
  FileCode,
} from "lucide-react";
import { formatDateTimeUtc } from "@core/common/utils";
import type { SecurityChange } from "../../domain/entities/SecurityEntities";

interface EventDetailsDrawerProps {
  event: SecurityChange | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDrawer({
  event,
  open,
  onOpenChange,
}: EventDetailsDrawerProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const handleCopyId = () => {
    if (event.id) {
      navigator.clipboard.writeText(event.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const auditUrl = `/audit?search=${encodeURIComponent(
    event.username || event.ipAddress || event.eventType
  )}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 space-y-6 overflow-y-auto">
        <SheetHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={event.isSuccess ? "success" : "destructive"}
              className="text-[10px] uppercase font-bold"
            >
              {event.isSuccess ? "Success" : "Failed / Blocked"}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono" dir="ltr">
              {event.eventType}
            </span>
          </div>

          <SheetTitle className="text-lg font-bold">
            {event.eventType} Event Details
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Authoritative security audit record captured by Identity telemetry.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        {/* Core Attributes */}
        <div className="space-y-4 text-xs">
          {/* Timestamp */}
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-foreground">Timestamp (UTC)</span>
              <p className="text-muted-foreground mt-0.5 tabular-nums">
                {formatDateTimeUtc(event.timestamp)}
              </p>
            </div>
          </div>

          {/* Actor */}
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Actor</span>
                {event.isAdmin && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5">
                {event.username || "System / Unauthenticated"}
              </p>
            </div>
          </div>

          {/* IP Address */}
          <div className="flex items-start gap-3">
            <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-foreground">Source IP Address</span>
              <p className="text-muted-foreground mt-0.5 font-mono" dir="ltr">
                {event.ipAddress || "—"}
              </p>
            </div>
          </div>

          {/* Endpoint / Method */}
          {(event.endpoint || event.httpMethod) && (
            <div className="flex items-start gap-3">
              <Terminal className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-foreground">Endpoint</span>
                <p className="text-muted-foreground mt-0.5 font-mono text-[11px]" dir="ltr">
                  {event.httpMethod ? `[${event.httpMethod}] ` : ""}
                  {event.endpoint || "—"}
                </p>
              </div>
            </div>
          )}

          {/* Entity Context */}
          {event.entityType && (
            <div className="flex items-start gap-3">
              <FileCode className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-foreground">Target Resource</span>
                <p className="text-muted-foreground mt-0.5">
                  {event.entityType} {event.entityId ? `(${event.entityId})` : ""}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {event.errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 space-y-1">
              <span className="font-semibold text-destructive">Failure Detail</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {event.errorMessage}
              </p>
            </div>
          )}

          {/* Event / Correlation ID */}
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Audit Record ID
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="h-6 px-1.5 text-[11px] gap-1 text-primary hover:text-primary"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            <p className="font-mono text-[11px] text-foreground break-all select-all" dir="ltr">
              {event.id}
            </p>
          </div>
        </div>

        <Separator />

        {/* Drawer Actions */}
        <div className="space-y-2 pt-2">
          <Button variant="default" asChild className="w-full gap-2 text-xs">
            <Link href={auditUrl} onClick={() => onOpenChange(false)}>
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Investigate in Audit Log</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
