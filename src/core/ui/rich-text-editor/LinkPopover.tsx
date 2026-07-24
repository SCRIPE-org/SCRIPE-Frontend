"use client";

import { useId, useState } from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { Link as LinkIcon } from "lucide-react";
import type { Editor } from "@tiptap/react";

// ─── Component ──────────────────────────────────────────────
export function LinkPopover({ editor }: { editor: Editor }) {
  const { t } = useI18n();
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const urlId = useId();

  const isLinked = editor.isActive("link");

  const handleApply = () => {
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setOpen(false);
    setUrl("");
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
                className={cn("h-8 w-8 p-0", isLinked && "bg-nx-accent-wash text-nx-accent")}
                onClick={() => {
                  const existing = editor.getAttributes("link").href;
                  setUrl(existing || "");
                  setOpen(true);
                }}
                aria-label={t("editor.toolbar.link.trigger")}
                aria-pressed={isLinked}
              >
                <LinkIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t("editor.toolbar.link.trigger")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          {/* htmlFor/id, not proximity: a floating label with no association is
              read as loose text and the field announces itself as unlabelled. */}
          <Label htmlFor={urlId} className="text-xs">
            {t("editor.toolbar.link.url")}
          </Label>
          <Input
            id={urlId}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("editor.toolbar.link.urlPlaceholder")}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
          />
          {/* Overlay footer order: the secondary/destructive escape first in DOM,
              the primary last, so it lands on the inline-end edge in both
              directions without a physical alignment class. */}
          <div className="flex justify-end gap-1.5">
            {isLinked && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setOpen(false);
                }}
              >
                {t("editor.toolbar.link.remove")}
              </Button>
            )}
            <Button type="button" size="sm" className="h-7 text-xs" onClick={handleApply}>
              {t("editor.toolbar.link.apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
