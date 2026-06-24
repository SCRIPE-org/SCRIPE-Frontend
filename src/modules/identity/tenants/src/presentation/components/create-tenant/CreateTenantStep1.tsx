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
import { cn } from "@core/common/utils";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Building2, GitBranch } from "lucide-react";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantStep1Props {
  vm: CreateTenantVM;
  t: (key: string) => string;
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {t("tenant.stepOrganization") || "Organization"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("tenant.stepOrganizationDesc") || "Basic information about the new tenant."}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tenant-name" className="text-sm font-medium">
            {t("tenant.name") || "Tenant Name"} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tenant-name"
            value={vm.form.name}
            onChange={(e) => vm.updateField("name", e.target.value)}
            placeholder={t("tenant.namePlaceholder") || "e.g. Acme Corporation"}
            className={cn("h-11", nameError && "border-destructive")}
            maxLength={100}
            autoFocus
          />
          <div className="mt-1 flex min-h-[20px] items-center justify-between">
            {nameError ? (
              <p className="text-xs text-destructive">
                {t("validation.invalidName") || "Tenant name is required."}
              </p>
            ) : (
              <div />
            )}
            <span className="text-xs text-muted-foreground">{vm.form.name.length}/100</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant-code" className="text-sm font-medium">
            {t("tenant.code") || "Tenant Code"} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tenant-code"
            value={vm.form.code}
            onChange={(e) => vm.updateField("code", e.target.value.toUpperCase())}
            placeholder={t("tenant.codePlaceholder") || "Auto-generated from name"}
            className={cn("h-11 font-mono uppercase", codeError && "border-destructive")}
            maxLength={100}
          />
          {codeError ? (
            <p className="text-xs text-destructive">
              {t("validation.invalidCode") || "Tenant code is required."}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("tenant.codeHint") || "Unique identifier. Auto-generated from name."}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-description" className="text-sm font-medium">
          {t("tenant.description") || "Description"}
        </Label>
        <Textarea
          id="tenant-description"
          value={vm.form.description}
          onChange={(e) => vm.updateField("description", e.target.value)}
          placeholder={
            t("tenant.descriptionPlaceholder") || "Brief description of the organization..."
          }
          className="min-h-[80px] resize-none"
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-address" className="text-sm font-medium">
          {t("tenant.address") || "Address"}
        </Label>
        <Textarea
          id="tenant-address"
          value={vm.form.address}
          onChange={(e) => vm.updateField("address", e.target.value)}
          placeholder={t("tenant.addressPlaceholder") || "Street address, city, country..."}
          className="min-h-[70px] resize-none"
          maxLength={500}
        />
      </div>

      {vm.form.parentId && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 dark:border-amber-800/40 dark:bg-amber-950/20">
          <GitBranch className="h-4 w-4 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {t("tenant.creatingAsChild") || "Creating as child tenant"}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">{vm.form.parentId}</p>
          </div>
        </div>
      )}
    </div>
  );
}
