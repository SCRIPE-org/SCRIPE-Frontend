// UI-EXCEPTION: compact studio layout
"use client";

import React, { useCallback, useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import {
  Paperclip,
  Upload,
  X,
  FileText,
  ImageIcon,
  Video,
  FileArchive,
  FileSpreadsheet,
  File,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for attachment file.
 */
export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  /** Raw file reference for deferred upload */
  file?: File;
  /** URL after upload — null means pending */
  url?: string;
  progress?: number;
  error?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for attachment uploader props.
 */
export interface AttachmentUploaderProps {
  attachments: AttachmentFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: string;
  disabled?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────
function getFileIcon(type: string) {
  if (type.startsWith("image/"))
    return <ImageIcon className="h-4 w-4 text-info" aria-hidden="true" />;
  if (type.startsWith("video/"))
    return <Video className="h-4 w-4 text-nx-accent" aria-hidden="true" />;
  if (type.includes("pdf"))
    return <FileText className="h-4 w-4 text-destructive" aria-hidden="true" />;
  if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
    return <FileArchive className="h-4 w-4 text-warning" aria-hidden="true" />;
  if (type.includes("sheet") || type.includes("csv") || type.includes("excel"))
    return <FileSpreadsheet className="h-4 w-4 text-success" aria-hidden="true" />;
  return <File className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main ───────────────────────────────────────────────────
/**
 * Presentation UI component rendering the attachment uploader.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AttachmentUploader({
  attachments,
  onAdd,
  onRemove,
  maxFiles = 10,
  maxSizeMb = 25,
  accept = "*/*",
  disabled,
}: AttachmentUploaderProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList);
      const remaining = maxFiles - attachments.length;

      const withinSize = files.filter((f) => f.size <= maxSizeMb * 1024 * 1024);
      const hasOversized = withinSize.length < files.length;

      const valid = withinSize.slice(0, Math.max(0, remaining));
      const hasExcess = withinSize.length > valid.length;

      const messages: string[] = [];
      if (hasOversized) {
        messages.push(t("messaging.email.fileTooLarge", { size: maxSizeMb }));
      }
      if (hasExcess) {
        messages.push(t("messaging.email.tooManyFiles", { count: maxFiles }));
      }
      setError(messages.length > 0 ? messages.join(" ") : null);

      if (valid.length > 0) onAdd(valid);
    },
    [attachments.length, maxFiles, maxSizeMb, onAdd, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={t("messaging.email.dropFiles")}
        className={cn(
          "cursor-pointer rounded-nx-lg border-2 border-dashed p-4 text-center transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
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
        onDrop={handleDrop}
      >
        <Upload className="mx-auto mb-2 h-6 w-6 text-nx-ink-3" aria-hidden="true" />
        <p className="text-sm text-nx-ink-2">{t("messaging.email.dropFiles")}</p>
        <p className="mt-1 text-xs text-nx-ink-3">
          {t("messaging.email.maxFileSize", { size: maxSizeMb })}
          {" · "}
          {t("messaging.email.maxFiles", { count: maxFiles })}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
          disabled={disabled}
        />
      </div>

      {/* Rejection feedback — oversized files and excess-count slices are
          silent otherwise, so surface them the same way ImageUploadField/
          VideoUploadField do. */}
      {error && (
        <p role="status" className="flex items-start gap-1.5 text-xs font-medium text-nx-danger">
          <X className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((file) => (
            <div
              key={file.id}
              className={cn(
                "group flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-2",
                file.error && "border-destructive/30 bg-destructive/10"
              )}
            >
              {getFileIcon(file.type)}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-nx-ink">{file.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-nx-ink-3">{formatFileSize(file.size)}</span>
                  {file.progress !== undefined && file.progress < 100 && (
                    <div className="h-1 max-w-24 flex-1 overflow-hidden rounded-full bg-nx-raised-2">
                      <div
                        className="h-full rounded-full bg-nx-accent-fill transition-[width] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                  {file.url && (
                    <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                      {t("messaging.email.fileUploaded")}
                    </Badge>
                  )}
                  {file.error && <span className="text-[10px] text-destructive">{file.error}</span>}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 transition-opacity duration-nx-micro ease-nx-enter focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
                onClick={() => onRemove(file.id)}
                disabled={disabled}
                aria-label={t("messaging.email.removeAttachmentNamed", { name: file.name })}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          ))}

          {/* Summary */}
          <div className="flex items-center justify-between px-1 text-xs text-nx-ink-3">
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" aria-hidden="true" />
              {t("messaging.email.attachmentCountLabel", { count: attachments.length })}
            </span>
            <span>
              {t("messaging.email.attachmentsTotalSize", { size: formatFileSize(totalSize) })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttachmentUploader;
