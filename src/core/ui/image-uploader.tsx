"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import {
  convertFileToBase64,
  validateImageFile,
  type ImageConversionOptions,
  formatFileSize,
  getImageDimensions,
} from "@core/common/image-utils";
import Image from "next/image";

export interface ImageUploaderProps {
  id?: string;
  value?: string; // Base64 string or image URL
  onChange?: (base64: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  accept?: string; // e.g., "image/*" or "image/png,image/jpeg"
  maxSize?: number; // Max file size in bytes (default: 5MB)
  showPreview?: boolean; // Whether to show image preview
  aspectRatio?: string; // e.g., "16/9", "1/1"
  conversionOptions?: ImageConversionOptions; // Options for image conversion
}

/**
 * Generic Image Uploader Component
 *
 * A professional, reusable image upload component that:
 * - Converts uploaded images to base64 format using centralized utilities
 * - Shows beautiful preview with loading states
 * - Handles validation (file type, size) with helpful error messages
 * - Supports drag & drop with visual feedback
 * - Fully customizable and accessible
 *
 * @example
 * ```tsx
 * <ImageUploader
 *   value={imageBase64}
 *   onChange={(base64) => setImageBase64(base64)}
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024}
 *   showPreview={true}
 * />
 * ```
 */
export function ImageUploader({
  id,
  value,
  onChange,
  onRemove,
  placeholder,
  required = false,
  disabled = false,
  className,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  showPreview = true,
  aspectRatio,
  conversionOptions = {},
}: ImageUploaderProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    value && (value.startsWith("data:image") || value.startsWith("http")) ? value : null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(
    null
  );

  // Update preview when value changes externally
  React.useEffect(() => {
    queueMicrotask(() => {
      if (value && (value.startsWith("data:image") || value.startsWith("http"))) {
        setPreview(value);
        // Get dimensions for display
        getImageDimensions(value).then((dims: { width: number; height: number } | null) =>
          setImageDimensions(dims)
        );
      } else if (!value) {
        setPreview(null);
        setImageDimensions(null);
      }
    });
  }, [value]);

  const handleFileConversion = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validate first
      const validation = validateImageFile(file, { maxSize });
      if (!validation.isValid) {
        setError(validation.error || "Invalid file");
        setIsUploading(false);
        return;
      }

      // Simulate progress (since FileReader doesn't have progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 50);

      try {
        // Use centralized conversion utility
        const result = await convertFileToBase64(file, {
          ...conversionOptions,
          maxSize,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.success && result.base64) {
          setPreview(result.base64);
          setImageDimensions(result.dimensions || null);
          onChange?.(result.base64);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 300);
        } else {
          setError(result.error || "Failed to convert image");
          setIsUploading(false);
          setUploadProgress(0);
        }
      } catch (error) {
        clearInterval(progressInterval);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [maxSize, conversionOptions, onChange]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      handleFileConversion(file);
    },
    [handleFileConversion]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreview(null);
      setImageDimensions(null);
      onChange?.("");
      onRemove?.();
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onChange, onRemove]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  // The drop zone. Rest is a dashed hairline over the sunken field ground;
  // hover lifts the hairline; DRAGGING is the one moment light collects — the
  // accent edge and the accent wash, at 140ms, with no scale, no coloured
  // shadow and no bounce. Inert is the raised slab.
  //
  // The old `aspect-[${aspectRatio}]` never compiled (Tailwind cannot see a
  // runtime string), so a caller-supplied ratio silently did nothing; it is an
  // inline style now and actually works.
  const containerClasses = cn(
    "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-nx-control border border-dashed",
    "transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
    isDragging
      ? "border-nx-accent bg-nx-accent-wash"
      : "border-nx-line bg-nx-ground hover:border-nx-line-hi hover:bg-nx-hover",
    // dashed = an invitation to drop; once there IS an image the frame goes
    // solid, because the zone is now a container, not an empty slot
    preview && showPreview && !isDragging && "border-solid",
    disabled &&
      "cursor-not-allowed border-nx-line bg-nx-raised hover:border-nx-line hover:bg-nx-raised",
    !aspectRatio && "min-h-60",
    className
  );

  return (
    <div className="w-full space-y-2">
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
        required={required && !preview}
      />

      <div
        className={containerClasses}
        style={aspectRatio ? { aspectRatio } : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (disabled || isUploading) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        aria-label={placeholder || t("imageUploader.placeholder")}
        aria-disabled={disabled || undefined}
        aria-busy={isUploading || undefined}
        tabIndex={disabled ? -1 : 0}
      >
        {isUploading ? (
          // Honest progress: a determinate bar and a tabular percentage, not a
          // clip-path ring pretending to be a loader.
          <div className="flex w-full max-w-xs flex-col items-center gap-3 p-8">
            <p className="text-sm font-medium text-nx-ink">{t("imageUploader.uploading")}</p>
            <Progress value={uploadProgress} className="h-1 w-full bg-nx-raised" />
            <p className="text-xs tabular-nums text-nx-ink-3">{uploadProgress}%</p>
          </div>
        ) : preview && showPreview ? (
          // Filled: the image is the content, so nothing hovers over it — no
          // gradient scrim, no zoom on hover, and the remove control is
          // ALWAYS visible instead of hiding until the pointer arrives.
          <div className="relative h-full w-full">
            <Image
              src={preview}
              alt={t("imageUploader.preview")}
              fill
              unoptimized
              className="h-full w-full object-cover"
              style={aspectRatio ? { aspectRatio } : undefined}
            />
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute end-3 top-3 z-raised h-8 w-8 bg-nx-surface text-nx-ink-3 hover:text-nx-danger"
                onClick={handleRemove}
                aria-label={t("imageUploader.remove")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        ) : (
          // Empty: one neutral tile, one instruction, one action. The tile is a
          // raised step, not a gradient; the accent appears only while a file
          // is actually over the zone.
          <div className="flex w-full flex-col items-center justify-center gap-4 p-8 text-center">
            <div
              className={cn(
                "rounded-nx-md p-5 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                isDragging ? "bg-nx-accent-wash" : "bg-nx-raised"
              )}
            >
              <ImageIcon
                className={cn("h-8 w-8", isDragging ? "text-nx-accent" : "text-nx-ink-3")}
                aria-hidden="true"
              />
            </div>

            <div className="max-w-sm space-y-1">
              <p className="text-sm font-medium text-nx-ink">
                {isDragging
                  ? t("imageUploader.dropHere")
                  : placeholder || t("imageUploader.placeholder")}
              </p>
              <p className="text-xs text-nx-ink-3">
                {t("imageUploader.supportedFormats")} up to{" "}
                <span className="font-medium tabular-nums text-nx-ink-2">
                  {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Upload className="me-2 h-4 w-4" aria-hidden="true" />
              {t("imageUploader.selectFile")}
            </Button>
          </div>
        )}
      </div>

      {/* Error — a hairline block in danger ink; the tint is a color-mix of the
          measured token, so it holds in both themes. */}
      {error && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-nx-control border border-nx-danger bg-[color-mix(in_srgb,var(--nx-danger)_10%,transparent)] p-3 text-nx-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {/* Helper Text */}
      {!error && !preview && required && (
        <p className="flex items-center gap-1 text-xs text-nx-ink-3">
          <span aria-hidden="true" className="text-nx-danger">
            *
          </span>
          {t("common.required")}
        </p>
      )}

      {/* Image Info — the metadata the hover chip used to hide: always on, on a
          hairline strip, digits tabular. */}
      {preview && imageDimensions && (
        <div className="flex items-center justify-between gap-3 rounded-nx-control border border-nx-line bg-nx-surface px-3 py-2 text-xs text-nx-ink-3">
          <span className="tabular-nums">
            {imageDimensions.width} × {imageDimensions.height}px
          </span>
          {value && value.length > 0 && (
            <span className="tabular-nums">{formatFileSize(value.length)}</span>
          )}
        </div>
      )}
    </div>
  );
}
