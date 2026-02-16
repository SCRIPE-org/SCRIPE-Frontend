"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Separator } from "@core/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
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
      const [url, setUrl] = useState("");
      const [open, setOpen] = useState(false);
      const [uploading, setUploading] = useState(false);
      const fileRef = React.useRef<HTMLInputElement>(null);

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
                  <PopoverTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Insert Image"
                        >
                              <ImageIcon className="h-4 w-4" />
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-3">
                              <div className="space-y-1.5">
                                    <Label className="text-xs">Image URL</Label>
                                    <div className="flex gap-1.5">
                                          <Input
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                placeholder="https://example.com/image.png"
                                                className="h-8 text-sm"
                                          />
                                          <Button
                                                type="button"
                                                size="sm"
                                                className="h-8 text-xs px-2"
                                                onClick={insertFromUrl}
                                                disabled={!url}
                                          >
                                                Insert
                                          </Button>
                                    </div>
                              </div>
                              {onUpload && (
                                    <>
                                          <Separator />
                                          <div className="space-y-1.5">
                                                <Label className="text-xs">Upload Image</Label>
                                                <input
                                                      ref={fileRef}
                                                      type="file"
                                                      accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                                                      onChange={handleFileUpload}
                                                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 w-full"
                                                      disabled={uploading}
                                                />
                                                {uploading && (
                                                      <p className="text-xs text-muted-foreground animate-pulse">
                                                            Uploading...
                                                      </p>
                                                )}
                                          </div>
                                    </>
                              )}
                        </div>
                  </PopoverContent>
            </Popover>
      );
}
