"use client";

/**
 * AvatarUpload — Profile picture upload component
 *
 * Features: drag & drop, file validation, preview, upload/remove buttons.
 */
import { useRef, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Upload, Trash2, Camera, Loader2 } from "lucide-react";

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

  const fileUrl = process.env.NEXT_PUBLIC_File_URL || "";
  const resolvedImageUrl = currentImageUrl ? `${fileUrl}${currentImageUrl}` : null;
  const displayUrl = previewUrl || resolvedImageUrl;

  const handleFile = useCallback(
    (file: File) => {
      try {
        setLocalError(null);
        const validated = onFileSelect(file);
        setSelectedFile(validated);
      } catch (err: any) {
        setLocalError(err.message);
      }
    },
    [onFileSelect]
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
          "flex flex-col items-center gap-6 rounded-xl border-2 border-dashed p-6 transition-all duration-200 sm:flex-row",
          isDragging ? "border-primary bg-primary/5" : "border-border/40 hover:border-border"
        )}
      >
        <div className="group relative cursor-pointer" onClick={() => inputRef.current?.click()}>
          <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-lg transition-transform group-hover:scale-105">
            {displayUrl && <AvatarImage src={displayUrl} alt="Profile" />}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="space-y-1.5 text-center sm:text-start rtl:sm:text-end">
          <p className="text-sm font-medium">{t("profile.avatar.clickOrDrag")}</p>
          <p className="text-xs text-muted-foreground">{t("profile.avatar.formats")}</p>
          <p className="text-xs text-muted-foreground">{t("profile.avatar.recommended")}</p>
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
          {!isUploading && <Upload className="me-2 h-4 w-4" />}
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
            {!isRemoving && <Trash2 className="me-2 h-4 w-4" />}
            {t("profile.avatar.remove")}
          </Button>
        )}
      </div>
    </div>
  );
}
