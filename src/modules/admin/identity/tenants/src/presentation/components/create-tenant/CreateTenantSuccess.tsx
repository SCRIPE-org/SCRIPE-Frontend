/**
 * CreateTenantSuccess — Post-Creation Confirmation Screen
 *
 * Shows admin credentials, the one-time setup URL, and a link
 * to navigate to the new tenant's detail page.
 *
 * @module tenants/presentation/components
 */
"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { CheckCircle2, Mail, Building2, Copy, ExternalLink, ArrowRight } from "lucide-react";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantSuccessProps {
  vm: CreateTenantVM;
  t: (key: string) => string;
  direction: string;
}

/**
 * Presentation UI component rendering the create tenant success.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function CreateTenantSuccess({ vm, t, direction }: CreateTenantSuccessProps) {
  const result = vm.result!;

  return (
    <div className="mx-auto max-w-lg px-4 py-12" dir={direction}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-nx-lg bg-success/10 duration-nx-standard ease-nx-enter motion-safe:animate-in motion-safe:zoom-in-95">
          <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2">
          {t("tenant.created")}
        </h1>
        <p className="mt-2 text-sm text-nx-ink-2 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2">
          {t("tenant.setupEmailSent")}
        </p>
      </div>

      <div className="space-y-4 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2">
        {/* Admin details card */}
        <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-surface p-5">
          <div className="flex items-center gap-2.5 text-sm">
            <Mail className="h-4 w-4 shrink-0 text-nx-ink-2" aria-hidden="true" />
            <span className="text-nx-ink-2">{t("tenant.adminEmail")}:</span>
            <span className="font-medium">{result.adminEmail}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Building2 className="h-4 w-4 shrink-0 text-nx-ink-2" aria-hidden="true" />
            <span className="text-nx-ink-2">
              {t("tenant.adminUsername")}:
            </span>
            <span className="font-mono font-medium">{result.adminUsername}</span>
          </div>
        </div>

        {/* Setup URL card */}
        <div className="rounded-nx-md border border-nx-accent bg-nx-accent-wash p-5">
          <p className="mb-2.5 text-xs text-nx-ink-2">
            {t("tenant.setupUrlLabel")}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-nx-md border border-nx-line bg-nx-raised px-3 py-2 font-mono text-xs">
              {result.accountSetupUrl}
            </code>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => navigator.clipboard.writeText(result.accountSetupUrl)}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("common.copy")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <a href={result.accountSetupUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        {/* Navigate to detail button */}
        <Button size="lg" className="w-full gap-2" onClick={vm.navigateToDetail}>
          {t("tenant.viewTenantDetails")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
