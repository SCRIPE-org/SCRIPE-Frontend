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

export function CreateTenantSuccess({ vm, t, direction }: CreateTenantSuccessProps) {
  const result = vm.result!;

  return (
    <div className="mx-auto max-w-lg px-4 py-12" dir={direction}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 duration-500 animate-in zoom-in-50">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold delay-100 duration-500 animate-in fade-in-0 slide-in-from-bottom-2">
          {t("tenant.created") || "Tenant Created Successfully!"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground delay-200 duration-500 animate-in fade-in-0 slide-in-from-bottom-2">
          {t("tenant.setupEmailSent") || "An account setup email has been sent to the admin."}
        </p>
      </div>

      <div className="space-y-4 delay-300 duration-500 animate-in fade-in-0 slide-in-from-bottom-4">
        {/* Admin details card */}
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{t("tenant.adminEmail") || "Email"}:</span>
            <span className="font-medium">{result.adminEmail}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t("tenant.adminUsername") || "Username"}:
            </span>
            <span className="font-mono font-medium">{result.adminUsername}</span>
          </div>
        </div>

        {/* Setup URL card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="mb-2.5 text-xs text-muted-foreground">
            {t("tenant.setupUrlLabel") || "Account Setup Link (valid 24 hours):"}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border border-border/50 bg-muted/50 px-3 py-2 font-mono text-xs">
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
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("common.copy") || "Copy"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <a href={result.accountSetupUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Navigate to detail button */}
        <Button className="h-12 w-full gap-2 text-base" onClick={vm.navigateToDetail}>
          {t("tenant.viewTenantDetails") || "View Tenant Details"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
