// UI-EXCEPTION: compact studio layout
"use client";

/**
 * AvatarUpload — Profile picture upload component
 *
 * Features: drag & drop, file validation, preview, upload/remove buttons.
 * The multipart (File) upload contract here is intentionally kept distinct
 * from `@core/ui/image-uploader`'s base64-conversion flow — this component's
 * `onFileSelect` / `onUpload` / `onRemove` map straight onto the real avatar
 * mutations, so it is not swapped onto that primitive.
 */
import { useRef, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, resolveFileUrl } from "@core/common/utils";
import { Upload, Trash2, Camera } from "lucide-react";

interface AvatarUploadProps {
  currentImageUrl: string | null;
  initials: string;
  previewUrl: string | null;
  onFileSelect: (file: File) => File;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
  isUploading: boolean;
  isRemoving: boolean;
  error: string | null;
}

/**
 * Presentation UI component rendering the avatar upload.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AvatarUpload({
  currentImageUrl,
  initials,
  previewUrl,
  onFileSelect,
  onUpload,
  onRemove,
  isUploading,
  isRemoving,
  error,
}: AvatarUploadProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resolvedImageUrl = resolveFileUrl(currentImageUrl) || null;
  const displayUrl = previewUrl || resolvedImageUrl;

  const [prevDisplayUrl, setPrevDisplayUrl] = useState(displayUrl);
  const [imageError, setImageError] = useState(false);
  if (displayUrl !== prevDisplayUrl) {
    setPrevDisplayUrl(displayUrl);
    setImageError(false);
  }

  const handleFile = useCallback(
    (file: File) => {
      try {
        setLocalError(null);
        const validated = onFileSelect(file);
        setSelectedFile(validated);
      } catch (err: unknown) {
        setLocalError(err instanceof Error ? err.message : t("profile.avatar.unknownError"));
      }
    },
    [onFileSelect, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const displayError = localError || error;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center gap-6 rounded-nx-lg border-2 border-dashed p-6 sm:flex-row",
          "transition-[border-color,background-color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
          isDragging ? "border-nx-accent bg-nx-accent-wash" : "border-nx-line hover:border-nx-line-hi"
        )}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
          aria-label={t("profile.avatar.changePhoto")}
          className="group relative cursor-pointer rounded-full focus-visible:outline-none focus-visible:shadow-nx-focus"
        >
          <Avatar className="h-24 w-24 border border-nx-line shadow-nx-sm">
            {displayUrl && !imageError && (
              <AvatarImage
                src={displayUrl}
                alt={t("profile.avatar.alt")}
                onError={() => setImageError(true)}
              />
            )}
            <AvatarFallback className="bg-nx-accent-wash text-2xl font-semibold text-nx-accent">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full bg-scrim opacity-0",
              "transition-opacity duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "group-hover:opacity-100 group-focus-visible:opacity-100"
            )}
          >
            <Camera className="h-6 w-6 text-nx-on-fill" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-1.5 text-center sm:text-start">
          <p className="text-sm font-medium text-nx-ink">{t("profile.avatar.clickOrDrag")}</p>
          <p className="text-xs text-nx-ink-3">{t("profile.avatar.formats")}</p>
          <p className="text-xs text-nx-ink-3">{t("profile.avatar.recommended")}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {displayError && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">{displayError}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleUpload}
          loading={isUploading}
          disabled={!selectedFile}
          className="min-w-[120px]"
        >
          {!isUploading && <Upload className="me-2 h-4 w-4" aria-hidden="true" />}
          {t("profile.avatar.upload")}
        </Button>

        {currentImageUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemove()}
            loading={isRemoving}
            className="text-destructive hover:text-destructive"
          >
            {!isRemoving && <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />}
            {t("profile.avatar.remove")}
          </Button>
        )}
      </div>
    </div>
  );
}
