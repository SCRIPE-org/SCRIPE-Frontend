"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { 
  convertFileToBase64, 
  validateImageFile, 
  type ImageConversionOptions,
  formatFileSize,
  getImageDimensions 
} from "@core/common/image-utils";

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
  const { t, direction } = useI18n();
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    value && (value.startsWith("data:image") || value.startsWith("http")) ? value : null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Update preview when value changes externally
  React.useEffect(() => {
    if (value && (value.startsWith("data:image") || value.startsWith("http"))) {
      setPreview(value);
      // Get dimensions for display
      getImageDimensions(value).then((dims: { width: number; height: number } | null) => setImageDimensions(dims));
    } else if (!value) {
      setPreview(null);
      setImageDimensions(null);
    }
  }, [value]);

  const handleFileConversion = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    // Validate first
    const validation = validateImageFile(file, { maxSize });
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      setIsUploading(false);
      return;
    }

    // Simulate progress (since FileReader doesn't have progress events)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
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
        setError(result.error || 'Failed to convert image');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [maxSize, conversionOptions, onChange]);

  const handleFileSelect = useCallback((file: File) => {
    handleFileConversion(file);
  }, [handleFileConversion]);

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

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setImageDimensions(null);
    onChange?.("");
    onRemove?.();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange, onRemove]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const containerClasses = cn(
    "relative border-2 border-dashed rounded-xl transition-all duration-300",
    "flex flex-col items-center justify-center overflow-hidden",
    "group cursor-pointer",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    isDragging
      ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20"
      : preview
      ? "border-border hover:border-primary/50 bg-muted/30"
      : "border-border hover:border-primary/50 hover:bg-muted/30 hover:shadow-md",
    aspectRatio ? `aspect-[${aspectRatio}]` : "min-h-[240px]",
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        aria-label={placeholder || t("imageUploader.placeholder") || "Upload image"}
        tabIndex={disabled ? -1 : 0}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${uploadProgress}%, 0 ${uploadProgress}%)`
                }}
              ></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                {t("imageUploader.uploading") || "Uploading..."}
              </p>
              <p className="text-xs text-muted-foreground">
                {uploadProgress}%
              </p>
            </div>
          </div>
        ) : preview && showPreview ? (
          <div className="relative w-full h-full group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
            <img
              src={preview}
              alt={t("imageUploader.preview") || "Preview"}
              className={cn(
                "w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105",
                aspectRatio && `aspect-[${aspectRatio}]`
              )}
            />
            {imageDimensions && (
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs">
                  {imageDimensions.width} × {imageDimensions.height}px
                </div>
              </div>
            )}
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-lg hover:scale-110"
                onClick={handleRemove}
                aria-label={t("imageUploader.remove") || "Remove image"}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <div className="bg-green-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 space-y-5 text-center w-full">
            {/* Icon Container */}
            <div className={cn(
              "rounded-2xl p-6 transition-all duration-300",
              isDragging 
                ? "bg-primary/20 scale-110" 
                : "bg-gradient-to-br from-muted via-muted/50 to-background group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-muted"
            )}>
              <ImageIcon className={cn(
                "h-10 w-10 transition-colors duration-300",
                isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
            </div>
            
            {/* Text Content */}
            <div className="space-y-2 max-w-sm">
              <p className={cn(
                "text-base font-semibold transition-colors duration-300",
                isDragging ? "text-primary" : "text-foreground"
              )}>
                {isDragging 
                  ? (t("imageUploader.dropHere") || "Drop image here")
                  : (placeholder || t("imageUploader.placeholder") || "Click to upload or drag and drop")
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {t("imageUploader.supportedFormats") || "PNG, JPG, GIF, WEBP"} up to{" "}
                <span className="font-medium text-foreground">
                  {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </span>
              </p>
            </div>

            {/* Upload Button */}
            <Button
              type="button"
              variant={isDragging ? "default" : "outline"}
              size="lg"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className={cn(
                "transition-all duration-300",
                isDragging && "scale-105 shadow-lg shadow-primary/20"
              )}
            >
              <Upload className={cn(
                "h-4 w-4 transition-transform duration-300",
                direction === "rtl" ? "ml-2" : "mr-2",
                isDragging && "scale-110"
              )} />
              {t("imageUploader.selectFile") || "Select File"}
            </Button>
          </div>
        )}

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 border-4 border-dashed border-primary rounded-xl z-30 flex items-center justify-center">
            <div className="bg-primary/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-primary/30">
              <Upload className="h-12 w-12 text-primary animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Helper Text */}
      {!error && !preview && required && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="text-destructive">*</span>
          {t("common.required") || "Required"}
        </p>
      )}

      {/* Image Info */}
      {preview && imageDimensions && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <span>
            {imageDimensions.width} × {imageDimensions.height}px
          </span>
          {value && value.length > 0 && (
            <span>
              {formatFileSize(value.length)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
