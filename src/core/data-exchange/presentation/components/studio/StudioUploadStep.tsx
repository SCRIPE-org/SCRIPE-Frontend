"use client";

import React, { useState } from "react";
import { ArrowRight, Download, Layers, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { getEntityDisplayName } from "../../utils/entity-display-names";
import { SchemaWarningsBanner } from "./SchemaWarningsBanner";
import type { DataExchangeSchemaWarning } from "../../../domain/types";

export interface StudioUploadStepProps {
  isMultiSheet: boolean;
  onToggleMultiSheet: (val: boolean) => void;
  isInspecting: boolean;
  isDownloading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChosen: (files: FileList | null) => void;
  onDownloadTemplate: (format: "xlsx" | "csv", isMultiSheet?: boolean) => void;
  multiSheetEntityKeys?: string[];
  schemaWarnings?: DataExchangeSchemaWarning[] | null;
}

/**
 * Step 1: Upload & Smart Templates panel supporting drag-and-drop spreadsheet upload,
 * multi-sheet migration switch, and localized downloadable Excel/CSV schema templates.
 */
export function StudioUploadStep({
  isMultiSheet,
  onToggleMultiSheet,
  isInspecting,
  isDownloading,
  fileInputRef,
  onFileChosen,
  onDownloadTemplate,
  multiSheetEntityKeys,
  schemaWarnings,
}: StudioUploadStepProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const [isDragging, setIsDragging] = useState(false);
  const hasMultiSheet = Boolean(multiSheetEntityKeys && multiSheetEntityKeys.length > 1);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (isInspecting) return;
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (isInspecting) return;
            onFileChosen(e.dataTransfer.files);
          }}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-nx-lg border border-dashed p-6 sm:p-10 text-center transition-colors",
            isDragging
              ? "border-nx-accent bg-nx-accent-wash"
              : "border-nx-line-hi bg-nx-surface hover:border-nx-accent"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            tabIndex={-1}
            aria-hidden="true"
            aria-label={t("dataExchange.upload.dropTitle")}
            disabled={isInspecting}
            onClick={() => {
              if (!isInspecting) fileInputRef.current?.click();
            }}
            data-testid="studio-dropzone-trigger"
            className="absolute inset-0 z-0 h-full w-full rounded-nx-lg bg-transparent hover:bg-transparent"
          />

          <div className="pointer-events-none relative z-raised flex flex-col items-center">
            <UploadCloud className="mb-3 h-10 w-10 text-nx-accent" />
            <h3 className="text-base font-semibold text-nx-ink">
              {t("dataExchange.upload.dropTitle")}
            </h3>
            <p className="mt-1 max-w-md text-xs text-nx-ink-2">
              {t("dataExchange.upload.dropHint")}
            </p>

            {isInspecting && (
              <div className="mt-3 flex items-center gap-2 text-xs text-nx-accent">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("dataExchange.upload.inspecting")}</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "relative z-raised mt-5 flex flex-wrap items-center justify-center gap-3",
              isDragging && "pointer-events-none"
            )}
          >
            <Button
              type="button"
              variant="default"
              loading={isInspecting}
              onClick={() => fileInputRef.current?.click()}
              className="font-medium"
              data-testid="studio-choose-file-btn"
            >
              <UploadCloud className="me-2 h-4 w-4" />
              {t("dataExchange.actions.chooseFile")}
            </Button>

            {hasMultiSheet && (
              <div className="flex items-center gap-2 rounded-nx-control border border-nx-line bg-nx-raised px-3 py-1.5">
                <Switch
                  id="dx-multisheet-toggle"
                  disabled={isInspecting}
                  checked={isMultiSheet}
                  onCheckedChange={onToggleMultiSheet}
                />
                <Label
                  htmlFor="dx-multisheet-toggle"
                  className="cursor-pointer text-xs text-nx-ink font-medium"
                >
                  {t("dataExchange.actions.multiSheetMigration")}
                </Label>
              </div>
            )}
          </div>

          {hasMultiSheet && isMultiSheet && multiSheetEntityKeys && (
            <div className="pointer-events-none relative z-raised mt-4 flex flex-wrap items-center justify-center gap-1.5 rounded-nx-control border border-nx-line bg-nx-raised px-3 py-2 text-xs">
              <span className="text-nx-ink-2 font-medium">
                {t("dataExchange.upload.multiSheetOrderLabel")}
              </span>
              {multiSheetEntityKeys.map((key, idx) => (
                <React.Fragment key={key}>
                  <Badge variant="outline" className="text-[11px] font-medium">
                    <span className="me-1 font-mono text-nx-ink-3">{idx + 1}.</span>
                    <span>{getEntityDisplayName(key, t, isAr)}</span>
                  </Badge>
                  {idx < multiSheetEntityKeys.length - 1 && (
                    <ArrowRight
                      className="h-3 w-3 text-nx-ink-3 rtl:rotate-180"
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <SchemaWarningsBanner warnings={schemaWarnings} />

        <Alert variant="info" className="border-nx-line bg-nx-raised text-nx-ink">
          <ShieldCheck className="h-4 w-4 text-nx-accent shrink-0" />
          <AlertDescription className="text-xs text-nx-ink-2">
            {t("dataExchange.upload.securityNote")}
          </AlertDescription>
        </Alert>
      </div>

      {/* Right Panel: Smart Templates */}
      <div className="space-y-4">
        <Card className="border-nx-line bg-nx-surface p-5 text-nx-ink">
          <h4 className="text-sm font-semibold text-nx-ink">
            {t("dataExchange.upload.needTemplateTitle")}
          </h4>
          <p className="mt-1 text-xs text-nx-ink-2">
            {t("dataExchange.upload.needTemplateDesc")}
          </p>
          <div className="mt-4 space-y-2">
            {hasMultiSheet && isMultiSheet && (
              <Button
                type="button"
                variant="secondary"
                className="w-full whitespace-normal h-auto min-h-10 py-2.5 text-start justify-start border border-nx-line bg-nx-raised hover:bg-nx-raised-2 text-nx-ink"
                loading={isDownloading}
                onClick={() => onDownloadTemplate("xlsx", true)}
              >
                <Layers className="me-2 h-4 w-4 shrink-0 text-nx-accent" />
                <span>{t("dataExchange.actions.downloadMultiSheetTemplate")}</span>
              </Button>
            )}
            <Button
              type="button"
              variant={hasMultiSheet && isMultiSheet ? "outline" : "secondary"}
              className={cn(
                "w-full whitespace-normal h-auto min-h-10 py-2.5 text-start justify-start border border-nx-line text-nx-ink",
                !(hasMultiSheet && isMultiSheet) && "bg-nx-raised hover:bg-nx-raised-2"
              )}
              loading={isDownloading}
              onClick={() => onDownloadTemplate("xlsx", false)}
            >
              <Download className="me-2 h-4 w-4 shrink-0 text-nx-accent" />
              <span>{t("dataExchange.actions.downloadTemplateXlsx")}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full whitespace-normal h-auto min-h-10 py-2.5 text-start justify-start border border-nx-line text-nx-ink"
              loading={isDownloading}
              onClick={() => onDownloadTemplate("csv", false)}
            >
              <Download className="me-2 h-4 w-4 shrink-0 text-nx-ink-2" />
              <span>{t("dataExchange.actions.downloadTemplateCsv")}</span>
            </Button>
            {hasMultiSheet && !isMultiSheet && (
              <Button
                type="button"
                variant="outline"
                className="w-full whitespace-normal h-auto min-h-10 py-2.5 text-start justify-start border border-nx-line text-nx-ink"
                loading={isDownloading}
                onClick={() => onDownloadTemplate("xlsx", true)}
              >
                <Layers className="me-2 h-4 w-4 shrink-0 text-nx-accent" />
                <span>{t("dataExchange.actions.downloadMultiSheetTemplate")}</span>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
