"use client";

import React, { useId, useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Separator } from "@core/ui/separator";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { Image as ImageIcon } from "lucide-react";
import type { Editor } from "@tiptap/react";

// ─── Component ──────────────────────────────────────────────
export function ImageInsert({
  editor,
  onUpload,
}: {
  editor: Editor;
  onUpload?: (file: File) => Promise<string>;
}) {
  const { t } = useI18n();
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const urlId = useId();
  const uploadId = useId();

  const insertFromUrl = () => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      setUrl("");
      setOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    try {
      setUploading(true);
      const uploadedUrl = await onUpload(file);
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
      setOpen(false);
    } catch {
      // Error handled by parent
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label={t("editor.toolbar.image.trigger")}
              >
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t("editor.toolbar.image.trigger")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={urlId} className="text-xs">
              {t("editor.toolbar.image.url")}
            </Label>
            <div className="flex gap-1.5">
              <Input
                id={urlId}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t("editor.toolbar.image.urlPlaceholder")}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={insertFromUrl}
                disabled={!url}
              >
                {t("editor.toolbar.image.insert")}
              </Button>
            </div>
          </div>
          {onUpload && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <Label htmlFor={uploadId} className="text-xs">
                  {t("editor.toolbar.image.upload")}
                </Label>
                {/* The shared field primitive, not a raw input: it already skins
                    the ::file-selector-button off the token ladder, including
                    the disabled arm this control needs while an upload is in
                    flight. The hand-rolled file-button chrome it replaces
                    carried the last shadcn colour pair left in the editor. */}
                <Input
                  ref={fileRef}
                  id={uploadId}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  // A real in-flight loader, so this is the one place in the
                  // file allowed to move. The banned pattern was the opposite:
                  // a perpetual pulse on the TEXT, which breathes whether or
                  // not anything is happening.
                  //
                  // A div, not a p: the inline spinner is itself a block-level
                  // element, and the parser closes an open paragraph the moment
                  // it meets one — which shows up as a hydration mismatch, not
                  // as anything visible.
                  <div role="status" className="flex items-center gap-2 text-xs text-nx-ink-3">
                    <LoadingSpinner size="inline" showText={false} />
                    {t("editor.toolbar.image.uploading")}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
