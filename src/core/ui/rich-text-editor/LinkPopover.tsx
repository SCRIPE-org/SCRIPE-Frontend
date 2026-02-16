"use client";

import { useState } from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { Link as LinkIcon } from "lucide-react";
import type { Editor } from "@tiptap/react";

// ─── Component ──────────────────────────────────────────────
export function LinkPopover({ editor }: { editor: Editor }) {
      const [url, setUrl] = useState("");
      const [open, setOpen] = useState(false);

      const handleApply = () => {
            if (url) {
                  editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: url, target: "_blank" })
                        .run();
            } else {
                  editor.chain().focus().unsetLink().run();
            }
            setOpen(false);
            setUrl("");
      };

      return (
            <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={cn(
                                    "h-8 w-8 p-0",
                                    editor.isActive("link") && "bg-accent text-accent-foreground"
                              )}
                              onClick={() => {
                                    const existing = editor.getAttributes("link").href;
                                    setUrl(existing || "");
                                    setOpen(true);
                              }}
                              title="Link"
                        >
                              <LinkIcon className="h-4 w-4" />
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                              <Label className="text-xs">URL</Label>
                              <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleApply();
                                          }
                                    }}
                              />
                              <div className="flex gap-1.5 justify-end">
                                    {editor.isActive("link") && (
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
                                                Remove
                                          </Button>
                                    )}
                                    <Button
                                          type="button"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={handleApply}
                                    >
                                          Apply
                                    </Button>
                              </div>
                        </div>
                  </PopoverContent>
            </Popover>
      );
}
