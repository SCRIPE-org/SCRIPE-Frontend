/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@core/ui/sheet";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Separator } from "@core/ui/separator";
import { Check, Copy, ExternalLink, Clock, User, Globe, Terminal, FileCode } from "lucide-react";
import { formatDateTimeUtc } from "@core/common/utils";
import type { SecurityChange } from "../../domain/entities/SecurityEntities";

interface EventDetailsDrawerProps {
  event: SecurityChange | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * EventDetailsDrawer
 */
export function EventDetailsDrawer({ event, open, onOpenChange }: EventDetailsDrawerProps) {
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
      <SheetContent side="right" className="w-full space-y-6 overflow-y-auto p-6 sm:max-w-md">
        <SheetHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={event.isSuccess ? "success" : "destructive"}
              className="text-[10px] font-bold uppercase"
            >
              {event.isSuccess ? "Success" : "Failed / Blocked"}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground" dir="ltr">
              {event.eventType}
            </span>
          </div>

          <SheetTitle className="text-lg font-bold">{event.eventType} Event Details</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Authoritative security audit record captured by Identity telemetry.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        {/* Core Attributes */}
        <div className="space-y-4 text-xs">
          {/* Timestamp */}
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <span className="font-semibold text-foreground">Timestamp (UTC)</span>
              <p className="mt-0.5 tabular-nums text-muted-foreground">
                {formatDateTimeUtc(event.timestamp)}
              </p>
            </div>
          </div>

          {/* Actor */}
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Actor</span>
                {event.isAdmin && (
                  <Badge variant="outline" className="px-1 py-0 text-[9px]">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-muted-foreground">
                {event.username || "System / Unauthenticated"}
              </p>
            </div>
          </div>

          {/* IP Address */}
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <span className="font-semibold text-foreground">Source IP Address</span>
              <p className="mt-0.5 font-mono text-muted-foreground" dir="ltr">
                {event.ipAddress || "—"}
              </p>
            </div>
          </div>

          {/* Endpoint / Method */}
          {(event.endpoint || event.httpMethod) && (
            <div className="flex items-start gap-3">
              <Terminal className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="font-semibold text-foreground">Endpoint</span>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground" dir="ltr">
                  {event.httpMethod ? `[${event.httpMethod}] ` : ""}
                  {event.endpoint || "—"}
                </p>
              </div>
            </div>
          )}

          {/* Entity Context */}
          {event.entityType && (
            <div className="flex items-start gap-3">
              <FileCode className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="font-semibold text-foreground">Target Resource</span>
                <p className="mt-0.5 text-muted-foreground">
                  {event.entityType} {event.entityId ? `(${event.entityId})` : ""}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {event.errorMessage && (
            <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <span className="font-semibold text-destructive">Failure Detail</span>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {event.errorMessage}
              </p>
            </div>
          )}

          {/* Event / Correlation ID */}
          <div className="space-y-2 rounded-lg border border-border/80 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Audit Record ID
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="h-6 gap-1 px-1.5 text-[11px] text-primary hover:text-primary"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            <p className="select-all break-all font-mono text-[11px] text-foreground" dir="ltr">
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

          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full text-xs">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
