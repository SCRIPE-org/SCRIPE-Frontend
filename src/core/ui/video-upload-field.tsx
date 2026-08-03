/**
 * VideoUploadField — Reusable video upload component
 *
 * Supports two modes via tabs:
 * 1. Upload: Drag-and-drop or file picker, uploads to server
 * 2. URL: Paste a direct video URL (.mp4, .webm, .ogg)
 *
 * Note: YouTube/Google Drive links are NOT direct video URLs.
 * Only direct file URLs or server-uploaded videos work for <video> playback.
 */
"use client";

import { useRef, useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, resolveFileUrl } from "@core/common/utils";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Upload, Link2, Video, Check, X } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { SYSTEM_ENDPOINTS } from "@core/config/api-endpoints";
import { getCoreContainer } from "@core/di";

// ─── Props ──────────────────────────────────────────────────────
interface VideoUploadFieldProps {
  /** Current stored value — either a relative server path or a full URL */
  value: string;
  /** Called with the new value (relative path after upload, or full URL) */
  onChange: (value: string) => void;
  /** Label displayed above the component */
  label?: string;
  /** Description / help text */
  description?: string;
  /** Max file size in bytes (default: 50MB) */
  maxSizeBytes?: number;
  /** Whether the field is disabled */
  disabled?: boolean;
}

const ACCEPT_VIDEO = "video/mp4,video/webm,video/ogg,video/quicktime";
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export function VideoUploadField({
  value,
  onChange,
  label,
  description,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
}: VideoUploadFieldProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>(value ? "url" : "upload");

  const maxMB = Math.round(maxSizeBytes / (1024 * 1024));

  // Resolve display URL. The hook runs unconditionally so hook order stays
  // stable regardless of `value`; it already passes absolute URLs through.
  const resolvedValueUrl = useResolvedFileUrl(value);
  const displayUrl = value ? resolvedValueUrl : "";

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);

      // Validate size
      if (file.size > maxSizeBytes) {
        setError(t("videoUpload.tooLarge", { max: maxMB }));
        return;
      }

      // Validate type
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["mp4", "webm", "ogg", "mov"].includes(ext || "")) {
        setError(t("videoUpload.invalidType"));
        return;
      }

      setIsUploading(true);
      try {
        const apiService = getCoreContainer().apiService;
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiService.post<{ url: string }>(
          SYSTEM_ENDPOINTS.UPLOADS.VIDEO,
          formData
        );
        // Resolve relative path to full backend URL + cache-buster (same as ImageUploadField)
        const resolved = resolveFileUrl(response.url);
        const cacheBusted = resolved.includes("?")
          ? `${resolved}&v=${Date.now()}`
          : `${resolved}?v=${Date.now()}`;
        onChange(cacheBusted);
        setActiveTab("url");
      } catch {
        setError(t("videoUpload.uploadFailed"));
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeBytes, maxMB, onChange, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleUpload]
  );

  const handleUrlApply = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    // Basic URL validation
    if (
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://") &&
      !trimmed.startsWith("/")
    ) {
      setError(t("videoUpload.invalidUrl"));
      return;
    }
    setError(null);
    onChange(trimmed);
    setUrlInput("");
  }, [urlInput, onChange, t]);

  const handleRemove = useCallback(() => {
    onChange("");
    setUrlInput("");
    setError(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      {/* The old ladder here was 8/9/10px — three sizes of unreadable. One
          type scale now: label, then a hint one step down. */}
      {label && <Label fontSize="xs">{label}</Label>}
      {description && <p className="text-xs leading-relaxed text-nx-ink-3">{description}</p>}

      {/* Filled state — the frame is a hairline card, the filename rides a
          hairline strip UNDER the frame rather than a black chip floating over
          the footage, and the remove control is a real 28px target. */}
      {value && displayUrl && (
        <div className="overflow-hidden rounded-nx-control border border-nx-line bg-nx-surface">
          <div className="relative">
            <video
              src={displayUrl}
              className="max-h-[120px] w-full bg-nx-ground object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label={t("common.remove")}
              className="absolute end-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-nx-line bg-nx-surface text-nx-ink-3 shadow-nx-sm transition-colors duration-nx-micro ease-nx-enter hover:text-nx-danger focus-visible:shadow-nx-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:text-nx-ink-3 motion-reduce:transition-none"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="truncate border-t border-nx-line px-2 py-1 font-mono text-xs text-nx-ink-2">
            {value.split("/").pop()?.substring(0, 40) || "video"}
          </p>
        </div>
      )}

      {/* Upload / URL Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9 w-full">
          <TabsTrigger value="upload" className="h-full flex-1 gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            {t("imageUpload.uploadTab")}
          </TabsTrigger>
          <TabsTrigger value="url" className="h-full flex-1 gap-1.5 text-xs">
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            {t("imageUpload.urlTab")}
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab — same drop-zone law as the image field: keyboard
            reachable, dashed hairline at rest, accent edge + wash while
            dragging, raised slab while inert. */}
        <TabsContent value="upload" className="mt-2">
          <div
            role="button"
            tabIndex={disabled || isUploading ? -1 : 0}
            aria-disabled={disabled || isUploading || undefined}
            aria-label={t("videoUpload.dragDrop")}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (disabled || isUploading) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-nx-control border border-dashed p-4 text-center",
              "transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "focus-visible:border-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none",
              isDragOver
                ? "border-nx-accent bg-nx-accent-wash"
                : "border-nx-line bg-nx-ground hover:border-nx-line-hi hover:bg-nx-hover",
              (disabled || isUploading) &&
                "cursor-not-allowed border-nx-line bg-nx-raised hover:border-nx-line hover:bg-nx-raised"
            )}
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" showText={false} className="py-0" />
                <span className="text-xs text-nx-ink-2">{t("imageUpload.uploading")}</span>
              </>
            ) : (
              <>
                <Video
                  className={cn("h-5 w-5", isDragOver ? "text-nx-accent" : "text-nx-ink-3")}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-nx-ink">
                  {t("videoUpload.dragDrop")}
                </span>
                <span className="text-xs text-nx-ink-3">
                  <span className="tabular-nums">
                    {t("imageUpload.maxSize")} {maxMB} MB
                  </span>{" "}
                  · MP4, WebM, OGG, MOV
                </span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_VIDEO}
            onChange={handleFileSelect}
            className="hidden"
          />
        </TabsContent>

        {/* URL Tab */}
        <TabsContent value="url" className="mt-2 space-y-1.5">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t("videoUpload.urlPlaceholder")}
              className="h-9 flex-1 font-mono text-xs"
              disabled={disabled}
              aria-invalid={Boolean(error) || undefined}
              onKeyDown={(e) => e.key === "Enter" && handleUrlApply()}
            />
            <Button
              size="sm"
              onClick={handleUrlApply}
              disabled={disabled || !urlInput.trim()}
              className="h-9 shrink-0 px-3"
              aria-label={t("common.save")}
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-nx-ink-3">{t("videoUpload.urlHelp")}</p>
        </TabsContent>
      </Tabs>

      {/* Error */}
      {error && (
        <p role="status" className="flex items-start gap-1.5 text-xs font-medium text-nx-danger">
          <X className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
