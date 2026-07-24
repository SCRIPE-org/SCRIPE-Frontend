/**
 * ImageUploadField — Reusable image upload component
 *
 * Supports two modes via tabs:
 * 1. Upload: Drag-and-drop or file picker, uploads to server
 * 2. URL: Paste an external URL directly
 *
 * Resolves stored values intelligently:
 * - Full URLs (http/https) → displayed as-is
 * - Relative paths → prefixed with NEXT_PUBLIC_File_URL (server-hosted files)
 */
"use client";

import { useRef, useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, resolveFileUrl } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Upload, Link2, Trash2, ImageIcon, Loader2, Check, X } from "lucide-react";
import { SYSTEM_ENDPOINTS } from "@core/config/api-endpoints";
import { getCoreContainer } from "@core/di";

// ─── Props ──────────────────────────────────────────────────────
interface ImageUploadFieldProps {
  /** Current stored value — either a relative server path or a full URL */
  value: string;
  /** Called with the new value (relative path after upload, or full URL) */
  onChange: (value: string) => void;
  /** Label displayed above the component */
  label?: string;
  /** Description / help text */
  description?: string;
  /** Max file size in bytes (default: 2MB) */
  maxSizeBytes?: number;
  /** Accepted file types (default: image/*) */
  accept?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────
function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

// ─── Component ──────────────────────────────────────────────────
export function ImageUploadField({
  value,
  onChange,
  label,
  description,
  maxSizeBytes = 2 * 1024 * 1024,
  accept = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon",
  disabled = false,
}: ImageUploadFieldProps) {
  const { t, direction } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("upload");

  const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));

  // Resolved display URL
  // If we just uploaded a file, show the local blob URL (previewUrl),
  // otherwise ensure the value is resolved so newly uploaded relative paths preview correctly.
  const displayUrl = previewUrl || resolveFileUrl(value) || "";

  // ─── File validation ──────────────────
  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);
      const allowedExts = accept.split(",").map((t) => t.trim());
      if (
        !allowedExts.some((ext) => file.type === ext || file.type.startsWith(ext.replace("*", "")))
      ) {
        setError(t("imageUpload.invalidType") || "Invalid file type");
        return false;
      }
      if (file.size > maxSizeBytes) {
        setError(
          (t("imageUpload.tooLarge") || "File exceeds {{max}} MB limit").replace(
            "{{max}}",
            String(maxSizeMB)
          )
        );
        return false;
      }
      return true;
    },
    [accept, maxSizeBytes, maxSizeMB, t]
  );

  // ─── File handling ────────────────────
  const handleFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;
      // Show local preview immediately
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Upload to server
      uploadFile(file);
    },
    [validateFile]
  );

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const api = getCoreContainer().apiService;
      const result = await api.post<{ url: string }>(SYSTEM_ENDPOINTS.UPLOADS.IMAGE, formData);
      // Append cache-buster so browser fetches the new image (not a stale cached one)
      const resolved = resolveFileUrl(result.url);
      const cacheBusted = resolved.includes("?")
        ? `${resolved}&v=${Date.now()}`
        : `${resolved}?v=${Date.now()}`;
      onChange(cacheBusted);
      setPreviewUrl(null); // Clear preview, use the resolved value
    } catch (err: any) {
      setError(err?.message || t("imageUpload.uploadFailed") || "Upload failed");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Drag & drop ──────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ─── URL paste ────────────────────────
  const handleUrlConfirm = () => {
    if (!urlInput.trim()) return;
    if (!isExternalUrl(urlInput.trim())) {
      setError(
        t("imageUpload.invalidUrl") || "Please enter a valid URL starting with http:// or https://"
      );
      return;
    }
    setError(null);
    onChange(urlInput.trim());
    setUrlInput("");
  };

  // ─── Remove ───────────────────────────
  const handleRemove = () => {
    onChange("");
    setPreviewUrl(null);
    setUrlInput("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Field anatomy: label → hint → control → error */}
      {label && <Label>{label}</Label>}
      {description && <p className="-mt-1.5 text-xs leading-relaxed text-nx-ink-3">{description}</p>}

      {/* Filled state — the value itself is the proof, so it gets a real row:
          thumbnail on the neutral raised step (never white, which blows out in
          dark), the stored path in mono, and the destructive action at a 32px
          target. Uploading reports on the same row instead of replacing it. */}
      {displayUrl && (
        <div className="flex items-center gap-3 rounded-nx-control border border-nx-line bg-nx-surface p-3">
          <img
            src={displayUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-nx-sm border border-nx-line bg-nx-raised object-contain p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs text-nx-ink-2">{value}</p>
            {isUploading && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-nx-ink-3">
                <Loader2
                  className="h-3 w-3 motion-safe:animate-spin"
                  aria-hidden="true"
                />
                <span>{t("imageUpload.uploading") || "Uploading..."}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-nx-ink-3 hover:text-nx-danger"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            aria-label={t("common.remove")}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Tabs: Upload | URL */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir={direction}>
        <TabsList className="grid h-9 w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" />
            {t("imageUpload.uploadTab") || "Upload"}
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-1.5 text-xs">
            <Link2 className="h-3.5 w-3.5" />
            {t("imageUpload.urlTab") || "URL"}
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab — a drop zone is a control: it is keyboard-reachable,
            announces itself, and has four designed states (empty, hover,
            dragging, uploading/inert). Dragging is the ONE moment light
            collects: accent edge plus the accent wash, no scale, no bounce. */}
        <TabsContent value="upload" className="mt-3">
          <div
            role="button"
            tabIndex={disabled || isUploading ? -1 : 0}
            aria-disabled={disabled || isUploading || undefined}
            aria-label={t("imageUpload.dragDrop") || "Drop an image here or click to browse"}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && !isUploading && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (disabled || isUploading) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-nx-control border border-dashed p-6 text-center",
              "transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
              isDragging
                ? "border-nx-accent bg-nx-accent-wash"
                : "border-nx-line bg-nx-ground hover:border-nx-line-hi hover:bg-nx-hover",
              (disabled || isUploading) &&
                "cursor-not-allowed border-nx-line bg-nx-raised hover:border-nx-line hover:bg-nx-raised"
            )}
          >
            {isUploading ? (
              <Loader2
                className="h-8 w-8 text-nx-accent motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ImageIcon
                className={cn("h-8 w-8", isDragging ? "text-nx-accent" : "text-nx-ink-3")}
                aria-hidden="true"
              />
            )}
            <div>
              <p className="text-sm font-medium text-nx-ink">
                {isUploading
                  ? t("imageUpload.uploading") || "Uploading..."
                  : t("imageUpload.dragDrop") || "Drop an image here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-nx-ink-3">
                PNG, JPG, SVG, WebP ·{" "}
                <span className="tabular-nums">
                  {t("imageUpload.maxSize") || "Max"} {maxSizeMB}MB
                </span>
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              // Reset so the same file can be re-selected
              e.target.value = "";
            }}
          />
        </TabsContent>

        {/* URL Tab */}
        <TabsContent value="url" className="mt-3">
          <div className="flex items-center gap-2">
            <Input
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError(null);
              }}
              placeholder={t("imageUpload.urlPlaceholder") || "https://example.com/logo.png"}
              className="flex-1 font-mono text-sm"
              aria-invalid={Boolean(error) || undefined}
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUrlConfirm();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleUrlConfirm}
              disabled={disabled || !urlInput.trim()}
              className="shrink-0 gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              {t("imageUpload.apply") || "Apply"}
            </Button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-nx-ink-3">
            {t("imageUpload.urlHelp") ||
              "Paste a direct link to an image. Best for well-known provider logos."}
          </p>
        </TabsContent>
      </Tabs>

      {/* Error — one line, danger ink, announced politely. No banner, no fill:
          the message is six words and the control above it is already wrong. */}
      {error && (
        <p role="status" className="flex items-start gap-1.5 text-xs font-medium text-nx-danger">
          <X className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
