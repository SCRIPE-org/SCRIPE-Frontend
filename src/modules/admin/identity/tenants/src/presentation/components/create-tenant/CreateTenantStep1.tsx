/**
 * CreateTenantStep1 — Organization Details & Operating Geography
 *
 * Collects: name, code, category, description, and structured location.
 * Code auto-generates from name with real-time domain slug preview.
 *
 * @module tenants/presentation/components
 */
"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Building2, GitBranch } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";
import { CreateTenantLocationFields } from "./CreateTenantLocationFields";

interface CreateTenantStep1Props {
  vm: CreateTenantVM;
  t: (key: string) => string;
}

export function CreateTenantStep1({ vm, t }: CreateTenantStep1Props) {
  const touched = vm.stepTouched[1];
  const errors = vm.stepErrors[1];
  const nameError = touched && errors.includes("name");
  const codeError = touched && errors.includes("code");

  const orgTypes = [
    { id: "academy", label: t("tenant.types.academy"), icon: "⚽" },
    { id: "venue", label: t("tenant.types.venue"), icon: "🏟️" },
    { id: "club", label: t("tenant.types.club"), icon: "🏆" },
    { id: "federation", label: t("tenant.types.federation"), icon: "🏢" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-nx-accent-wash">
          <Building2 className="h-5 w-5 text-nx-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("tenant.stepOrganization")}</h2>
          <p className="text-sm text-nx-ink-2">{t("tenant.stepOrganizationDesc")}</p>
        </div>
      </div>

      {/* Organization Classification */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-nx-ink-2">
          {t("tenant.organizationType")}
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {orgTypes.map((type) => {
            const isSelected = vm.form.organizationType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => vm.updateField("organizationType", type.id)}
                className={cn(
                  "flex items-center gap-2 rounded-nx-md border p-2.5 text-start text-xs transition-all",
                  isSelected
                    ? "border-nx-accent bg-nx-accent-wash font-semibold text-nx-accent shadow-nx-sm"
                    : "border-nx-line bg-nx-ground text-nx-ink hover:bg-nx-hover"
                )}
              >
                <span>{type.icon}</span>
                <span className="truncate">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name & Code */}
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
            maxLength={50}
          />
          {codeError ? (
            <p id="tenant-code-error" className="text-xs text-destructive">
              {t("validation.invalidCode")}
            </p>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-nx-ink-2">
              <span>{t("tenant.slugPreview")}:</span>
              <code className="rounded bg-nx-raised px-1.5 py-0.5 font-mono text-[11px] text-nx-accent">
                {vm.form.code ? `${vm.form.code.toLowerCase()}.scripe.org` : "slug.scripe.org"}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="tenant-description" className="text-xs font-medium">
          {t("tenant.description")}
        </Label>
        <Input
          id="tenant-description"
          value={vm.form.description}
          onChange={(e) => vm.updateField("description", e.target.value)}
          placeholder={t("tenant.descriptionPlaceholder")}
          maxLength={250}
        />
      </div>

      {/* Structured Location & Operating Territory Card */}
      <CreateTenantLocationFields vm={vm} t={t} />

      {/* Parent Tenant Notice */}
      {vm.form.parentId && (
        <div className="flex items-center gap-2 rounded-nx-md border border-warning/30 bg-warning/10 px-3 py-2">
          <GitBranch className="h-4 w-4 shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-warning">{t("tenant.creatingAsChild")}</p>
            <p className="truncate font-mono text-xs text-nx-ink-2">{vm.form.parentId}</p>
          </div>
        </div>
      )}
    </div>
  );
}
