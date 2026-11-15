"use client";

import React, { useState } from "react";
import { ArrowRight, Building2, RefreshCw } from "lucide-react";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { TenantContextSwitcherDialog } from "@core/components/tenant-context";

export interface DataExchangeTenantRequiredCardProps {
  title: string;
  description: string;
  switchHint: string;
  goToTenantsLabel: string;
  retryLabel: string;
  onRetry?: () => void;
  /** @deprecated Unused — context switching happens inline without routing to /tenants. */
  tenantsHref?: string;
}

/**
 * Secondary API 422 (`DataTransfer.TenantRequired`) fallback card for Data Exchange views.
 * Opens the shared inline tenant context switcher in place instead of redirecting to `/tenants`.
 */
export function DataExchangeTenantRequiredCard({
  title,
  description,
  switchHint,
  goToTenantsLabel,
  retryLabel,
  onRetry,
}: DataExchangeTenantRequiredCardProps): React.ReactElement {
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <>
      <Card
        className="border-nx-line bg-nx-surface p-5"
        data-testid="tenant-required-guidance"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-control border border-nx-warning-strong/35 bg-nx-warning/10 text-nx-warning-strong">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-nx-ink">{title}</h2>
              <p className="text-xs text-nx-ink-2 leading-relaxed">{description}</p>
              <p className="text-xs text-nx-ink-3 leading-relaxed">{switchHint}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => setSwitcherOpen(true)}
              className="bg-nx-accent-fill text-nx-on-fill hover:opacity-90 font-medium"
              data-testid="tenant-required-go-tenants"
            >
              <span>{goToTenantsLabel}</span>
              <ArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
            {onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-nx-line"
                data-testid="tenant-required-retry"
              >
                <RefreshCw className="me-1.5 h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                <span>{retryLabel}</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {switcherOpen && (
        <TenantContextSwitcherDialog open={switcherOpen} onOpenChange={setSwitcherOpen} />
      )}
    </>
  );
}
