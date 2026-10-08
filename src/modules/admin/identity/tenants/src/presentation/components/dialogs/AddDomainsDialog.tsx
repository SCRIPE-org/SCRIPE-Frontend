/**
 * AddDomainsDialog — Vercel-Grade Domain Connection Modal
 *
 * Implements Vercel-grade UX for attaching domains to a tenant workspace.
 * Features:
 *  - Single or multi-domain parsing (comma, newline, or whitespace separated)
 *  - Automatic apex ⇄ www pairing recommendation (e.g. adding seif.com suggests www.seif.com redirect)
 *  - Environment selection ("Connect to an environment: Production")
 *  - Redirection selection ("Redirect to Another Domain") with grouped HTTP status codes:
 *     - Temporary: 307 Temporary Redirect, 302 Found
 *     - Permanent: 308 Permanent Redirect (default), 301 Moved Permanently
 *  - Target domain selector populated with existing tenant domains
 *  - Fully accessible using @core/ui/* components (Dialog, Input, Select, RadioGroup, Checkbox, Button, Badge)
 *  - Complete English & Arabic localization
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
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
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
import { Globe, Sparkles } from "lucide-react";
import { cn } from "@core/common/utils";
import type { TenantDomain } from "../../../domain/entities/TenantDomain";

/**
 * Documentation for module export
 */
export interface AddDomainsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingDomains: TenantDomain[];
  onAddDomains: (
    entries: Array<{
      domain: string;
      redirectTo?: string | null;
      redirectStatusCode?: number | null;
    }>
  ) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Parses raw input into a list of cleaned, valid domain hostnames.
 */
function parseRawDomains(input: string): string[] {
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
  return input
    .split(/[\n,\s]+/)
    .map((d) =>
      d
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "")
    )
    .filter((d) => domainRegex.test(d));
}

/**
 * Evaluates whether a domain is an apex domain (e.g. "seif.com") vs www subdomain ("www.seif.com").
 * Incomplete inputs (e.g. lacking a valid TLD or ending with a dot) will not trigger pairing.
 */
function inspectDomain(domain: string) {
  const cleaned = domain.trim().toLowerCase().replace(/\/.*$/, "");
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
  if (!domainRegex.test(cleaned)) {
    return { isApex: false, isWww: false, partnerDomain: null };
  }

  const parts = cleaned.split(".");
  const isWww = parts.length === 3 && parts[0] === "www";
  const isApex = parts.length === 2 || (parts.length === 3 && (parts[1] === "co" || parts[1] === "com" || parts[1] === "org") && parts[2].length === 2 && parts[0] !== "www");

  let partnerDomain: string | null = null;
  if (isApex) {
    partnerDomain = `www.${cleaned}`;
  } else if (isWww) {
    partnerDomain = parts.slice(1).join(".");
  }

  return { isApex, isWww, partnerDomain };
}

/**
 * Documentation for AddDomainsDialog
 */
export function AddDomainsDialog({
  open,
  onOpenChange,
  existingDomains,
  onAddDomains,
  isSubmitting = false,
}: AddDomainsDialogProps) {
  const { t, direction } = useI18n();

  const [rawInput, setRawInput] = useState("");
  const [connectMode, setConnectMode] = useState<"workspace" | "redirect">("workspace");
  const [redirectStatusCode, setRedirectStatusCode] = useState<string>("308");
  const [targetDomain, setTargetDomain] = useState<string>("");
  const [autoPairChecked, setAutoPairChecked] = useState(true);

  // Parse input
  const parsedDomains = useMemo(() => parseRawDomains(rawInput), [rawInput]);
  const primaryDomain = parsedDomains[0] || "";
  const { isApex, partnerDomain } = useMemo(
    () => (primaryDomain ? inspectDomain(primaryDomain) : { isApex: false, partnerDomain: null }),
    [primaryDomain]
  );

  // Auto-pair candidate
  const canAutoPair = Boolean(partnerDomain && parsedDomains.length === 1 && connectMode === "workspace");

  // Calculate total domains count being added
  const totalCount = parsedDomains.length + (canAutoPair && autoPairChecked ? 1 : 0);

  // Available redirect targets from existing domains
  const availableTargets = useMemo(() => {
    return existingDomains.filter((d) => !parsedDomains.includes(d.domain));
  }, [existingDomains, parsedDomains]);

  // Effective target domain: explicit user selection or first available target
  const defaultTarget = useMemo(() => {
    if (availableTargets.length === 0) return "";
    return (availableTargets.find((d) => d.isPrimary) || availableTargets[0])?.domain || "";
  }, [availableTargets]);

  const effectiveTargetDomain = targetDomain || defaultTarget;

  const handleSubmit = async () => {
    if (!parsedDomains.length) return;

    const entries: Array<{
      domain: string;
      redirectTo?: string | null;
      redirectStatusCode?: number | null;
    }> = [];

    if (connectMode === "redirect") {
      const code = parseInt(redirectStatusCode, 10) || 308;
      for (const dom of parsedDomains) {
        entries.push({
          domain: dom,
          redirectTo: effectiveTargetDomain || null,
          redirectStatusCode: code,
        });
      }
    } else {
      // Direct environment connection
      for (const dom of parsedDomains) {
        entries.push({
          domain: dom,
          redirectTo: null,
          redirectStatusCode: null,
        });
      }

      // If apex/www auto-pairing recommendation is enabled
      if (canAutoPair && autoPairChecked && partnerDomain) {
        // e.g. if primary is apex "seif.com", partner "www.seif.com" redirects to "seif.com"
        // if primary is "www.seif.com", partner "seif.com" redirects to "www.seif.com"
        entries.push({
          domain: partnerDomain,
          redirectTo: primaryDomain,
          redirectStatusCode: 308,
        });
      }
    }

    try {
      await onAddDomains(entries);
      setRawInput("");
      onOpenChange(false);
    } catch {
      // Handled in viewmodel
    }
  };

  const handleClose = () => {
    setRawInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 gap-5 bg-nx-surface border-nx-line" dir={direction}>
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-nx-ink">
            {t("tenant.domainsAddTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Domain Input */}
          <div className="space-y-2">
            <Label htmlFor="domain-input" className="text-sm font-semibold text-nx-ink">
              {t("tenant.domainsFieldDomain")}
            </Label>
            <Input
              id="domain-input"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="mywebsite.com, ..."
              className="font-mono text-sm"
              autoFocus
            />
            <p className="text-xs text-nx-ink-2 leading-relaxed">
              {t("tenant.domainsFieldDomainHint")}
            </p>
          </div>

          {/* Apex ⇄ WWW Auto-Pair Recommendation */}
          {canAutoPair && partnerDomain && (
            <div className="rounded-nx-md border border-nx-accent/30 bg-nx-accent/5 p-3.5 space-y-2 transition-all">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="auto-pair-checkbox"
                  checked={autoPairChecked}
                  onCheckedChange={(checked) => setAutoPairChecked(Boolean(checked))}
                  className="mt-0.5"
                />
                <div className="space-y-1 leading-none">
                  <label
                    htmlFor="auto-pair-checkbox"
                    className="text-xs font-semibold text-nx-ink flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
                    <span>
                      {isApex
                        ? t("tenant.domainsRecommendAddWww", { partner: partnerDomain, target: primaryDomain })
                        : t("tenant.domainsRecommendAddApex", { partner: partnerDomain, target: primaryDomain })}
                    </span>
                  </label>
                  <p className="text-[11px] text-nx-ink-2">
                    {t("tenant.domainsRecommendAutoRedirectDesc")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connect vs Redirect Radio Group */}
          <div className="space-y-3 pt-1">
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
                <RadioGroupItem value="workspace" id="mode-workspace" className="mt-0.5" />
                <div className="space-y-1">
                  <label htmlFor="mode-workspace" className="text-xs font-semibold text-nx-ink cursor-pointer">
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
                <RadioGroupItem value="redirect" id="mode-redirect" className="mt-0.5" />
                <div className="space-y-1 w-full">
                  <label htmlFor="mode-redirect" className="text-xs font-semibold text-nx-ink cursor-pointer">
                    {t("tenant.domainsModeRedirect")}
                  </label>
                  <p className="text-[11px] text-nx-ink-2">
                    {t("tenant.domainsModeRedirectDesc")}
                  </p>

                  {/* Redirection Options Sub-form */}
                  {connectMode === "redirect" && (
                    <div
                      className="mt-3 space-y-3 rounded-nx-md border border-nx-line bg-nx-surface p-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Status Code Dropdown */}
                      <div className="space-y-1.5">
                        <Label htmlFor="status-code-select" className="text-xs font-medium text-nx-ink">
                          {t("tenant.domainsHttpStatusCode")}
                        </Label>
                        <Select
                          value={redirectStatusCode}
                          onValueChange={setRedirectStatusCode}
                        >
                          <SelectTrigger id="status-code-select" className="h-9 text-xs">
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
                        <Label htmlFor="target-domain-select" className="text-xs font-medium text-nx-ink">
                          {t("tenant.domainsTargetDomain")}
                        </Label>
                        {availableTargets.length > 0 ? (
                          <Select
                            value={effectiveTargetDomain}
                            onValueChange={setTargetDomain}
                          >
                            <SelectTrigger id="target-domain-select" className="h-9 text-xs font-mono">
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
                            id="target-domain-select"
                            value={effectiveTargetDomain}
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
        </div>

        <DialogFooter className="gap-2 sm:justify-end border-t border-nx-line pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={!parsedDomains.length || isSubmitting}
            loading={isSubmitting}
            className="text-xs"
          >
            {totalCount > 1
              ? t("tenant.domainsAddMultiple", { count: totalCount })
              : t("tenant.domainsAddSingle")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
