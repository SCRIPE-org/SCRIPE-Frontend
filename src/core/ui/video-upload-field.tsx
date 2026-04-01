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
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import {
  Upload,
  Link2,
  Video,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
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

  // Resolve display URL
  const displayUrl = value
    ? value.startsWith("http://") || value.startsWith("https://")
      ? value
      : resolveFileUrl(value)
    : "";

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);

      // Validate size
      if (file.size > maxSizeBytes) {
        setError(t("videoUpload.tooLarge", { max: maxMB }) || `File exceeds ${maxMB} MB limit`);
        return;
      }

      // Validate type
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["mp4", "webm", "ogg", "mov"].includes(ext || "")) {
        setError(t("videoUpload.invalidType") || "Invalid file type. Allowed: MP4, WebM, OGG, MOV");
        return;
      }

      setIsUploading(true);
      try {
        const apiService = getCoreContainer().apiService;
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiService.post<{ url: string }>(
          API_ENDPOINTS.UPLOADS.VIDEO,
          formData
        );
        // Resolve relative path to full backend URL + cache-buster (same as ImageUploadField)
        const resolved = resolveFileUrl(response.url);
        const cacheBusted = resolved.includes("?") ? `${resolved}&v=${Date.now()}` : `${resolved}?v=${Date.now()}`;
        onChange(cacheBusted);
        setActiveTab("url");
      } catch {
        setError(t("videoUpload.uploadFailed") || "Upload failed. Please try again.");
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
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setError(
        t("videoUpload.invalidUrl") ||
          "Please enter a valid URL starting with http:// or https://"
      );
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
    <div className="space-y-1.5">
      {label && (
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
      )}
      {description && (
        <p className="text-[9px] text-muted-foreground/70">{description}</p>
      )}

      {/* Preview */}
      {value && displayUrl && (
        <div className="relative rounded-md overflow-hidden border border-border bg-muted/20">
          <video
            src={displayUrl}
            className="w-full max-h-[120px] object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-1 end-1 h-5 w-5 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center hover:bg-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="absolute bottom-1 start-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">
            {value.split("/").pop()?.substring(0, 30) || "video"}
          </div>
        </div>
      )}

      {/* Upload / URL Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-7 w-full">
          <TabsTrigger value="upload" className="h-5 text-[10px] gap-1 flex-1">
            <Upload className="h-3 w-3" />
            {t("imageUpload.uploadTab") || "Upload"}
          </TabsTrigger>
          <TabsTrigger value="url" className="h-5 text-[10px] gap-1 flex-1">
            <Link2 className="h-3 w-3" />
            {t("imageUpload.urlTab") || "URL"}
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-1.5">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-accent/10",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-[10px] text-muted-foreground">
                  {t("imageUpload.uploading") || "Uploading..."}
                </span>
              </>
            ) : (
              <>
                <Video className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground text-center">
                  {t("videoUpload.dragDrop") || "Drop a video here or click to browse"}
                </span>
                <span className="text-[9px] text-muted-foreground/50">
                  {t("imageUpload.maxSize") || "Max"} {maxMB} MB · MP4, WebM, OGG, MOV
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
        <TabsContent value="url" className="mt-1.5 space-y-1.5">
          <div className="flex gap-1.5">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t("videoUpload.urlPlaceholder") || "https://example.com/video.mp4"}
              className="h-7 text-[10px] flex-1"
              disabled={disabled}
              onKeyDown={(e) => e.key === "Enter" && handleUrlApply()}
            />
            <Button
              size="sm"
              onClick={handleUrlApply}
              disabled={disabled || !urlInput.trim()}
              className="h-7 px-2 text-[10px]"
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground/70">
            {t("videoUpload.urlHelp") ||
              "Paste a direct .mp4/.webm/.ogg URL. YouTube and Google Drive links are not direct video URLs."}
          </p>
        </TabsContent>
      </Tabs>

      {/* Error */}
      {error && (
        <p className="text-[10px] text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
