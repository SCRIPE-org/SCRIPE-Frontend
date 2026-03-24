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
import {
      Upload,
      Link2,
      Trash2,
      ImageIcon,
      Loader2,
      Check,
      X,
} from "lucide-react";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
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
                  if (!allowedExts.some((ext) => file.type === ext || file.type.startsWith(ext.replace("*", "")))) {
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
                  const result = await api.post<{ url: string }>(
                        API_ENDPOINTS.UPLOADS.IMAGE,
                        formData
                  );
                  // Append cache-buster so browser fetches the new image (not a stale cached one)
                  const resolved = resolveFileUrl(result.url);
                  const cacheBusted = resolved.includes("?") ? `${resolved}&v=${Date.now()}` : `${resolved}?v=${Date.now()}`;
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
                  setError(t("imageUpload.invalidUrl") || "Please enter a valid URL starting with http:// or https://");
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
                  {/* Label */}
                  {label && <Label className="text-sm font-medium">{label}</Label>}
                  {description && (
                        <p className="text-xs text-muted-foreground -mt-1">{description}</p>
                  )}

                  {/* Current image preview */}
                  {displayUrl && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                              <img
                                    src={displayUrl}
                                    alt="Logo preview"
                                    className="h-14 w-14 rounded-lg object-contain border bg-white p-1 shrink-0"
                                    onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                    }}
                              />
                              <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground truncate font-mono">
                                          {value}
                                    </p>
                                    {isUploading && (
                                          <div className="flex items-center gap-1.5 mt-1">
                                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                <span className="text-xs text-primary">
                                                      {t("imageUpload.uploading") || "Uploading..."}
                                                </span>
                                          </div>
                                    )}
                              </div>
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600"
                                    onClick={handleRemove}
                                    disabled={disabled || isUploading}
                              >
                                    <Trash2 className="h-4 w-4" />
                              </Button>
                        </div>
                  )}

                  {/* Tabs: Upload | URL */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} dir={direction}>
                        <TabsList className="grid w-full grid-cols-2 h-9">
                              <TabsTrigger value="upload" className="gap-1.5 text-xs">
                                    <Upload className="h-3.5 w-3.5" />
                                    {t("imageUpload.uploadTab") || "Upload"}
                              </TabsTrigger>
                              <TabsTrigger value="url" className="gap-1.5 text-xs">
                                    <Link2 className="h-3.5 w-3.5" />
                                    {t("imageUpload.urlTab") || "URL"}
                              </TabsTrigger>
                        </TabsList>

                        {/* Upload Tab */}
                        <TabsContent value="upload" className="mt-3">
                              <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !disabled && !isUploading && inputRef.current?.click()}
                                    className={cn(
                                          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all duration-200",
                                          isDragging
                                                ? "border-primary bg-primary/5"
                                                : "border-border/40 hover:border-border hover:bg-muted/30",
                                          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                                    )}
                              >
                                    {isUploading ? (
                                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    ) : (
                                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                    <div className="text-center">
                                          <p className="text-sm font-medium">
                                                {t("imageUpload.dragDrop") || "Drop an image here or click to browse"}
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-0.5">
                                                PNG, JPG, SVG, WebP · {t("imageUpload.maxSize") || "Max"} {maxSizeMB}MB
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
                                          placeholder={
                                                t("imageUpload.urlPlaceholder") ||
                                                "https://example.com/logo.png"
                                          }
                                          className="font-mono text-sm flex-1"
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
                              <p className="text-xs text-muted-foreground mt-1.5">
                                    {t("imageUpload.urlHelp") ||
                                          "Paste a direct link to an image. Best for well-known provider logos."}
                              </p>
                        </TabsContent>
                  </Tabs>

                  {/* Error */}
                  {error && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                              <X className="h-3.5 w-3.5 shrink-0" />
                              {error}
                        </p>
                  )}
            </div>
      );
}
