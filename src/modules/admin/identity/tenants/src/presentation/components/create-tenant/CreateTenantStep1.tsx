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
import {
  Building2,
  GitBranch,
  GraduationCap,
  Landmark,
  Trophy,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@core/common/utils";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";
import { CreateTenantLocationFields } from "./CreateTenantLocationFields";

interface CreateTenantStep1Props {
  vm: CreateTenantVM;
  t: (key: string) => string;
}

/**
 * Documentation for module export
 */
export function CreateTenantStep1({ vm, t }: CreateTenantStep1Props) {
  const touched = vm.stepTouched[1];
  const errors = vm.stepErrors[1];
  const nameError = touched && errors.includes("name");
  const codeError = touched && errors.includes("code");

  const orgTypes = [
    {
      id: "academy",
      label: t("tenant.types.academy"),
      desc: t("tenant.types.academyDesc"),
      icon: GraduationCap,
    },
    {
      id: "venue",
      label: t("tenant.types.venue"),
      desc: t("tenant.types.venueDesc"),
      icon: Landmark,
    },
    {
      id: "club",
      label: t("tenant.types.club"),
      desc: t("tenant.types.clubDesc"),
      icon: Trophy,
    },
    {
      id: "federation",
      label: t("tenant.types.federation"),
      desc: t("tenant.types.federationDesc"),
      icon: ShieldCheck,
    },
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

      {/* Validation Error Banner */}
      {touched && errors.length > 0 && (
        <div
          role="alert"
          className="rounded-nx-md border border-destructive/30 bg-destructive/10 p-3.5 text-destructive"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold">{t("validation.correctErrorsTitle")}</p>
              <ul className="list-disc space-y-0.5 ps-4 text-[11px] text-destructive/90">
                {errors.includes("name") && <li>{t("validation.invalidName")}</li>}
                {errors.includes("code") && <li>{t("validation.invalidCode")}</li>}
                {errors.includes("countryCode") && <li>{t("tenant.countryRequired")}</li>}
                {errors.includes("timeZone") && <li>{t("tenant.timeZoneRequired")}</li>}
                {errors.includes("state") && <li>{t("tenant.stateRequired")}</li>}
                {errors.includes("city") && <li>{t("tenant.cityRequired")}</li>}
                {errors.includes("postalCode") && <li>{t("tenant.invalidPostalCode")}</li>}
                {errors.includes("postalCodeRequired") && <li>{t("tenant.postalCodeRequired")}</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Organization Classification / Operational Archetype */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-nx-ink-1 text-xs font-semibold">
            {t("tenant.organizationType")}
          </Label>
          <span className="text-[11px] text-nx-ink-3">
            {t(`tenant.types.${vm.form.organizationType}`)}
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label={t("tenant.organizationType")}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {orgTypes.map((type) => {
            const isSelected = vm.form.organizationType === type.id;
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => vm.updateField("organizationType", type.id)}
                className={cn(
                  "duration-nx-fast ease-nx-ease group relative flex flex-col justify-between rounded-nx-lg border p-3.5 text-start transition-all",
                  isSelected
                    ? "bg-nx-accent-wash/60 ring-nx-accent/30 border-nx-accent shadow-nx-sm ring-1"
                    : "hover:border-nx-line-strong hover:bg-nx-raised/40 border-nx-line bg-nx-ground text-nx-ink"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md border transition-colors",
                      isSelected
                        ? "border-nx-accent/30 bg-nx-accent-wash text-nx-accent"
                        : "group-hover:border-nx-line-strong group-hover:text-nx-ink-1 border-nx-line bg-nx-raised text-nx-ink-2"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                      isSelected
                        ? "border-nx-accent bg-nx-accent text-nx-ground"
                        : "group-hover:border-nx-line-strong border-nx-line bg-nx-ground"
                    )}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-2.5 space-y-1">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-snug",
                      isSelected ? "text-nx-accent" : "text-nx-ink-1"
                    )}
                  >
                    {type.label}
                  </p>
                  <p className="line-clamp-2 text-[11px] leading-tight text-nx-ink-3">
                    {type.desc}
                  </p>
                </div>
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
            className={cn(nameError && "border-destructive focus-visible:ring-destructive")}
            autoFocus
          />
          <div className="mt-1 flex min-h-5 items-center justify-between">
            {nameError ? (
              <p
                id="tenant-name-error"
                className="flex items-center gap-1 text-xs text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{t("validation.invalidName")}</span>
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
            className={cn(
              "font-mono uppercase",
              codeError && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={codeError || undefined}
            aria-describedby={codeError ? "tenant-code-error" : undefined}
            maxLength={50}
          />
          {codeError ? (
            <p id="tenant-code-error" className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t("validation.invalidCode")}</span>
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
