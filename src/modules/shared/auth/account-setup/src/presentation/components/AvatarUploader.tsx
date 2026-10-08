"use client";

import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import { Camera, Upload, Trash2, AlertCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Documentation for module export
 */
export interface AvatarUploaderProps {
  profileImageUrl: string;
  name: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  error?: string | null;
}

/**
 * Avatar photo uploader with preview, file dropzone, and remove capability.
 */
export function AvatarUploader({
  profileImageUrl,
  name,
  onUpload,
  onRemove,
  error,
}: AvatarUploaderProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "AD";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card/60 p-4 sm:flex-row">
      <div className="group relative shrink-0">
        <Avatar className="shadow-xs h-16 w-16 border border-border sm:h-20 sm:w-20">
          {profileImageUrl ? (
            <AvatarImage src={profileImageUrl} alt={name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-base font-bold text-primary sm:text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="ghost"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 p-0 text-white opacity-0 transition-opacity hover:bg-black/50 hover:text-white group-hover:opacity-100"
          aria-label={t("auth.accountSetup.photoUpload")}
        >
          <Camera className="h-5 w-5" />
        </Button>
      </div>

      <div className="min-w-0 flex-1 space-y-1 text-center sm:text-start">
        <h4 className="text-sm font-medium text-foreground">
          {t("auth.accountSetup.photoUpload")}
        </h4>
        <p className="text-xs text-muted-foreground">{t("auth.accountSetup.photoHint")}</p>
        {error && (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <div className="flex items-center justify-center gap-2 pt-1.5 sm:justify-start">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shadow-xs h-8 gap-1.5 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{t("auth.accountSetup.photoUpload")}</span>
          </Button>
          {profileImageUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t("auth.accountSetup.photoRemove")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
