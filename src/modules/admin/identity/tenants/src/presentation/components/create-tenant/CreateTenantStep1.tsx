/**
 * CreateTenantStep1 — Organization Details
 *
 * Collects: name, code, description.
 * Code auto-generates from name.
 *
 * @module tenants/presentation/components
 */
"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Badge } from "@core/ui/badge";
import { Building2, GitBranch } from "lucide-react";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantStep1Props {
  vm: CreateTenantVM;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Presentation UI component rendering the create tenant step1.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CreateTenantStep1({ vm, t }: CreateTenantStep1Props) {
  const touched = vm.stepTouched[1];
  const errors = vm.stepErrors[1];
  const nameError = touched && errors.includes("name");
  const codeError = touched && errors.includes("code");

  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-nx-accent-wash">
          <Building2 className="h-5 w-5 text-nx-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {t("tenant.stepOrganization")}
          </h2>
          <p className="text-sm text-nx-ink-2">
            {t("tenant.stepOrganizationDesc")}
          </p>
        </div>
      </div>

      {vm.form.parentId && (
        <div className="flex items-center justify-between gap-3 rounded-nx-md border border-nx-accent/25 bg-nx-accent-wash/30 px-3.5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nx-accent/15 text-nx-accent">
              <GitBranch className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-nx-ink-2">
                {t("tenant.creatingAsChild")}
              </p>
              <p className="truncate text-sm font-semibold text-nx-ink">
                {vm.isLoadingParentTenant ? (
                  <span className="animate-pulse text-nx-ink-3">...</span>
                ) : (
                  vm.parentTenantName || vm.form.parentId
                )}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs border-nx-accent/30 text-nx-accent bg-nx-accent/10">
            {t("tenant.childTenant")}
          </Badge>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tenant-name">
            {t("tenant.name")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tenant-name"
            value={vm.form.name}
            onChange={(e) => vm.updateField("name", e.target.value)}
            placeholder={t("tenant.namePlaceholder")}
            aria-invalid={nameError || undefined}
            aria-describedby={nameError ? "tenant-name-error" : undefined}
            maxLength={100}
            autoFocus
          />
          <div className="mt-1 flex min-h-5 items-center justify-between">
            {nameError ? (
              <p id="tenant-name-error" className="text-xs text-destructive">
                {t("validation.invalidName")}
              </p>
            ) : (
              <div />
            )}
            <span className="text-xs text-nx-ink-2">{vm.form.name.length}/100</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant-code">
            {t("tenant.code")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tenant-code"
            value={vm.form.code}
            onChange={(e) => vm.updateField("code", e.target.value.toUpperCase())}
            placeholder={t("tenant.codePlaceholder")}
            className="font-mono uppercase"
            aria-invalid={codeError || undefined}
            aria-describedby={codeError ? "tenant-code-error" : undefined}
            maxLength={100}
          />
          {codeError ? (
            <p id="tenant-code-error" className="text-xs text-destructive">
              {t("validation.invalidCode")}
            </p>
          ) : (
            <p className="text-xs text-nx-ink-2">
              {t("tenant.codeHint")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-description">
          {t("tenant.description")}
        </Label>
        <Textarea
          id="tenant-description"
          value={vm.form.description}
          onChange={(e) => vm.updateField("description", e.target.value)}
          placeholder={
            t("tenant.descriptionPlaceholder")
          }
          className="min-h-20 resize-none"
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-address">
          {t("tenant.headquartersAddress")}
        </Label>
        <Textarea
          id="tenant-address"
          value={vm.form.address}
          onChange={(e) => vm.updateField("address", e.target.value)}
          placeholder={t("tenant.headquartersAddressPlaceholder")}
          className="min-h-20 resize-none"
          maxLength={500}
        />
        <p className="text-xs text-nx-ink-2">
          {t("tenant.headquartersAddressHelp")}
        </p>
      </div>
    </div>
  );
}
