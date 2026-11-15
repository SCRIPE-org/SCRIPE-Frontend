"use client";

import React, { useState } from "react";
import { Download, Layers, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
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
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            onFileChosen(e.dataTransfer.files);
          }}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-nx-lg border border-dashed p-10 text-center transition-colors",
            isDragging
              ? "border-nx-accent bg-nx-accent-wash"
              : "border-nx-line-hi bg-nx-surface hover:border-nx-accent"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            aria-label={t("dataExchange.upload.dropTitle")}
            disabled={isInspecting}
            onClick={() => fileInputRef.current?.click()}
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

          <div className="relative z-raised mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="default"
              loading={isInspecting}
              onClick={() => fileInputRef.current?.click()}
              className="bg-nx-accent-fill text-nx-on-fill hover:opacity-90 font-medium"
              data-testid="studio-choose-file-btn"
            >
              <UploadCloud className="me-2 h-4 w-4" />
              {t("dataExchange.actions.chooseFile")}
            </Button>

            {multiSheetEntityKeys && multiSheetEntityKeys.length > 1 && (
              <div className="flex items-center gap-2 rounded-nx-control border border-nx-line bg-nx-raised px-3 py-1.5">
                <Switch
                  id="dx-multisheet-toggle"
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
            <Button
              type="button"
              variant="secondary"
              className="w-full whitespace-normal h-auto min-h-10 py-2.5 text-start justify-start border border-nx-line bg-nx-raised hover:bg-nx-raised/80 text-nx-ink"
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
            {multiSheetEntityKeys && multiSheetEntityKeys.length > 1 && (
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
