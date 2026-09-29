/**
 * EditDomainRedirectDialog — Vercel-Grade Edit Domain Redirect Configuration
 *
 * Allows tenant administrators to configure or change whether a domain
 * directly connects to the production environment or redirects to another domain.
 *
 * Features:
 *  - Radio selection: "Connect to an environment (Production)" vs "Redirect to Another Domain"
 *  - Grouped HTTP status code dropdown (307, 302, 308, 301)
 *  - Target domain selector filtering out the active domain to prevent self-redirection
 *  - Built strictly using @core/ui/* components
 *
 * @module tenants/presentation/dialogs
 */
"use client";

import React, { useState, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Input } from "@core/ui/input";
import { Globe } from "lucide-react";
import { cn } from "@core/common/utils";
import type { TenantDomain } from "../../../domain/entities/TenantDomain";

export interface EditDomainRedirectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: TenantDomain | null;
  existingDomains: TenantDomain[];
  onSave: (
    domainId: string,
    redirectTo?: string | null,
    redirectStatusCode?: number | null
  ) => Promise<void>;
  isSubmitting?: boolean;
}

function EditDomainRedirectForm({
  domain,
  existingDomains,
  onSave,
  onClose,
  isSubmitting = false,
}: {
  domain: TenantDomain;
  existingDomains: TenantDomain[];
  onSave: EditDomainRedirectDialogProps["onSave"];
  onClose: () => void;
  isSubmitting?: boolean;
}) {
  const { t } = useI18n();

  const [connectMode, setConnectMode] = useState<"workspace" | "redirect">(
    domain.isRedirect && domain.redirectTo ? "redirect" : "workspace"
  );
  const [redirectStatusCode, setRedirectStatusCode] = useState<string>(
    String(domain.redirectStatusCode || 308)
  );
  const [targetDomain, setTargetDomain] = useState<string>(
    domain.redirectTo || ""
  );

  const availableTargets = useMemo(() => {
    return existingDomains.filter((d) => d.id !== domain.id);
  }, [existingDomains, domain.id]);

  const handleSave = async () => {
    if (connectMode === "redirect") {
      const code = parseInt(redirectStatusCode, 10) || 308;
      await onSave(domain.id, targetDomain || null, code);
    } else {
      await onSave(domain.id, null, null);
    }
    onClose();
  };

  return (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-xl font-bold tracking-tight text-nx-ink font-mono">
          {domain.domain}
        </DialogTitle>
      </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={connectMode}
            onValueChange={(val) => setConnectMode(val as "workspace" | "redirect")}
            className="gap-3"
          >
            {/* Option 1: Route to Tenant Workspace & Public Site */}
            <div
              className={cn(
                "flex items-start gap-3 rounded-nx-md border p-3.5 transition-colors cursor-pointer",
                connectMode === "workspace"
                  ? "border-nx-accent bg-nx-accent/5"
                  : "border-nx-line bg-nx-surface hover:border-nx-line-hi"
              )}
              onClick={() => setConnectMode("workspace")}
            >
              <RadioGroupItem value="workspace" id="edit-mode-workspace" className="mt-0.5" />
              <div className="space-y-1">
                <label htmlFor="edit-mode-workspace" className="text-xs font-semibold text-nx-ink cursor-pointer">
                  {t("tenant.domainsModeConnectWorkspace")}
                </label>
                <div className="flex items-center gap-1.5 text-xs text-nx-ink-2">
                  <Globe className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
                  <span className="text-[11px] text-nx-ink-2">
                    {t("tenant.domainsModeConnectWorkspaceDesc")}
                  </span>
                </div>
              </div>
            </div>

            {/* Option 2: Redirect to Another Domain */}
            <div
              className={cn(
                "flex items-start gap-3 rounded-nx-md border p-3.5 transition-colors cursor-pointer",
                connectMode === "redirect"
                  ? "border-nx-accent bg-nx-accent/5"
                  : "border-nx-line bg-nx-surface hover:border-nx-line-hi"
              )}
              onClick={() => setConnectMode("redirect")}
            >
              <RadioGroupItem value="redirect" id="edit-mode-redirect" className="mt-0.5" />
              <div className="space-y-1 w-full">
                <label htmlFor="edit-mode-redirect" className="text-xs font-semibold text-nx-ink cursor-pointer">
                  {t("tenant.domainsModeRedirect")}
                </label>
                <p className="text-[11px] text-nx-ink-2">
                  {t("tenant.domainsModeRedirectDesc")}
                </p>

                {connectMode === "redirect" && (
                  <div
                    className="mt-3 space-y-3 rounded-nx-md border border-nx-line bg-nx-surface p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Status Code Dropdown */}
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-status-code-select" className="text-xs font-medium text-nx-ink">
                        {t("tenant.domainsHttpStatusCode")}
                      </Label>
                      <Select
                        value={redirectStatusCode}
                        onValueChange={setRedirectStatusCode}
                      >
                        <SelectTrigger id="edit-status-code-select" className="h-9 text-xs">
                          <SelectValue placeholder={t("tenant.domainsSelectStatusCode")} />
                        </SelectTrigger>
                        <SelectContent className="bg-nx-surface border-nx-line">
                          {/* Temporary Group */}
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-semibold text-nx-ink-3 uppercase px-2 py-1">
                              {t("tenant.domainsStatusTemporary")}
                            </SelectLabel>
                            <SelectItem value="307" className="text-xs">
                              307 Temporary Redirect
                            </SelectItem>
                            <SelectItem value="302" className="text-xs">
                              302 Found
                            </SelectItem>
                          </SelectGroup>
                          {/* Permanent Group */}
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-semibold text-nx-ink-3 uppercase px-2 py-1">
                              {t("tenant.domainsStatusPermanent")}
                            </SelectLabel>
                            <SelectItem value="308" className="text-xs font-medium">
                              308 Permanent Redirect ({t("common.default")})
                            </SelectItem>
                            <SelectItem value="301" className="text-xs">
                              301 Moved Permanently
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target Domain Dropdown */}
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-target-domain-select" className="text-xs font-medium text-nx-ink">
                        {t("tenant.domainsTargetDomain")}
                      </Label>
                      {availableTargets.length > 0 ? (
                        <Select
                          value={targetDomain}
                          onValueChange={setTargetDomain}
                        >
                          <SelectTrigger id="edit-target-domain-select" className="h-9 text-xs font-mono">
                            <SelectValue placeholder={t("tenant.domainsSelectTargetDomain")} />
                          </SelectTrigger>
                          <SelectContent className="bg-nx-surface border-nx-line">
                            {availableTargets.map((d) => (
                              <SelectItem key={d.id} value={d.domain} className="font-mono text-xs">
                                {d.domain}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="edit-target-domain-select"
                          value={targetDomain}
                          onChange={(e) => setTargetDomain(e.target.value)}
                          placeholder="example.com"
                          className="font-mono text-xs h-9"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2 sm:justify-end border-t border-nx-line pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || (connectMode === "redirect" && !targetDomain)}
            loading={isSubmitting}
            className="text-xs"
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
    </>
  );
}

export function EditDomainRedirectDialog({
  open,
  onOpenChange,
  domain,
  existingDomains,
  onSave,
  isSubmitting = false,
}: EditDomainRedirectDialogProps) {
  const { direction } = useI18n();

  if (!domain) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 gap-5 bg-nx-surface border-nx-line" dir={direction}>
        <EditDomainRedirectForm
          key={domain.id}
          domain={domain}
          existingDomains={existingDomains}
          onSave={onSave}
          onClose={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
