"use client";

import React from "react";
import { Building2, FileCode, Globe, Shield } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { DialogHeader, DialogTitle, DialogDescription } from "@core/ui/dialog";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../../domain/entities/CustomField";

/**
 * Documentation for module export
 */
export interface DetailHeaderProps {
  field?: CustomField;
  fieldLabel?: string;
  valueTypeMeta: { badgeVariant?: "default" | "secondary" | "outline" | "active" | "inactive" | "warning" | "destructive" | "info" | "success" } | null;
  valueTypeDisplayName: string;
  sensitivityBadgeVariant: "outline" | "secondary" | "warning" | "destructive";
  sensitivityDisplayName: string;
}

/**
 * Header component for the custom field detail inspector dialog,
 * displaying field title, key, value type, scope, and sensitivity level badges.
 */
export function DetailHeader({
  field,
  fieldLabel,
  valueTypeMeta,
  valueTypeDisplayName,
  sensitivityBadgeVariant,
  sensitivityDisplayName,
}: DetailHeaderProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <DialogHeader className="border-b px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 pe-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileCode className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span>{field?.labelEn || fieldLabel || t("customField.details.title")}</span>
            {field?.labelAr && (
              <span className="text-sm font-normal text-muted-foreground">
                ({field.labelAr})
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("customField.details.subtitle", {
              field: field?.key || field?.labelEn || fieldLabel || "",
            })}
          </DialogDescription>
        </div>
        {field && (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <Badge variant={valueTypeMeta?.badgeVariant ?? "secondary"} className="font-medium">
              {valueTypeDisplayName}
            </Badge>
            <Badge variant={field.isActive ? "active" : "inactive"}>
              {field.isActive
                ? t("customField.details.fields.active")
                : t("customField.details.fields.inactive")}
            </Badge>
          </div>
        )}
      </div>

      {field && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-1 text-xs">
          <Badge variant={field.isRequired ? "info" : "secondary"}>
            {field.isRequired ? t("customField.required") : t("customField.optional")}
          </Badge>
          <Badge variant="outline" className="gap-1">
            {field.isGlobal ? (
              <>
                <Globe className="h-3 w-3 text-sky-500" />
                <span>{t("customField.details.fields.globalScope")}</span>
              </>
            ) : (
              <>
                <Building2 className="h-3 w-3 text-indigo-500" />
                <span>{t("customField.details.fields.tenantScope")}</span>
              </>
            )}
          </Badge>
          <Badge variant={sensitivityBadgeVariant}>
            <Shield className="me-1 h-3 w-3" />
            {sensitivityDisplayName}
          </Badge>
        </div>
      )}
    </DialogHeader>
  );
}
