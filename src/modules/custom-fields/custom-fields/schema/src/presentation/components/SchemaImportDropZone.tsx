/**
 * Drop zone and file selection component for SchemaImportDialog.
 * Keyboard operable and drag-and-drop enabled using @core/ui/input.
 */
"use client";

import React from "react";
import { FileJson, Upload, X } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Documentation for module export
 */
export interface SchemaImportDropZoneProps {
  selectedFile: { name: string; size: number } | null;
  disabled: boolean;
  onFilesSelected: (files: FileList | null) => void;
  onClearFile: () => void;
}

function formatFileSize(bytes: number): string {
  const kib = bytes / 1024;
  if (kib < 1) return `${bytes} B`;
  if (kib < 1024) return `${kib.toFixed(1)} KB`;
  return `${(kib / 1024).toFixed(1)} MB`;
}

/**
 * Documentation for SchemaImportDropZone
 */
export function SchemaImportDropZone({
  selectedFile,
  disabled,
  onFilesSelected,
  onClearFile,
}: SchemaImportDropZoneProps) {
  const { t } = useI18n();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFiles = (files: FileList | null) => {
    onFilesSelected(files);
  };

  if (!selectedFile) {
    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={t("schemaImport.dropZoneLabel")}
        data-testid="schema-import-drop-zone"
        className={cn(
          "cursor-pointer rounded-nx-lg border-2 border-dashed p-6 text-center transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "focus-visible:border-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none",
          dragOver && "border-nx-accent bg-nx-accent-wash",
          !dragOver && "border-nx-line hover:border-nx-accent",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="mx-auto mb-2 h-6 w-6 text-nx-ink-3" aria-hidden="true" />
        <p className="text-sm text-nx-ink-2">{t("schemaImport.dropZoneLabel")}</p>
        <p className="mt-1 text-xs text-nx-ink-3">{t("schemaImport.dropZoneHint")}</p>
        <Input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label={t("schemaImport.chooseFile")}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-2"
      data-testid="schema-import-selected-file"
    >
      <FileJson className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-nx-ink">{selectedFile.name}</p>
        <span className="text-xs text-nx-ink-3">{formatFileSize(selectedFile.size)}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        {t("schemaImport.changeFile")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={onClearFile}
        disabled={disabled}
        aria-label={t("schemaImport.removeFile")}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <Input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label={t("schemaImport.chooseFile")}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        disabled={disabled}
      />
    </div>
  );
}
