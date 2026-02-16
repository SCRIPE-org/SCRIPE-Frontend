"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import { cn } from "@core/common/utils";
import {
      Paperclip,
      Upload,
      X,
      FileText,
      ImageIcon,
      Video,
      FileArchive,
      FileSpreadsheet,
      File,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────
export interface AttachmentFile {
      id: string;
      name: string;
      size: number;
      type: string;
      /** URL after upload — null means pending */
      url?: string;
      progress?: number;
      error?: string;
}

export interface AttachmentUploaderProps {
      attachments: AttachmentFile[];
      onAdd: (files: File[]) => void;
      onRemove: (id: string) => void;
      maxFiles?: number;
      maxSizeMb?: number;
      accept?: string;
      disabled?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────
function getFileIcon(type: string) {
      if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-blue-500" />;
      if (type.startsWith("video/")) return <Video className="h-4 w-4 text-purple-500" />;
      if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />;
      if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
            return <FileArchive className="h-4 w-4 text-amber-500" />;
      if (type.includes("sheet") || type.includes("csv") || type.includes("excel"))
            return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
      return <File className="h-4 w-4 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main ───────────────────────────────────────────────────
export function AttachmentUploader({
      attachments,
      onAdd,
      onRemove,
      maxFiles = 10,
      maxSizeMb = 25,
      accept = "*/*",
      disabled,
}: AttachmentUploaderProps) {
      const inputRef = useRef<HTMLInputElement>(null);
      const [dragOver, setDragOver] = useState(false);

      const handleFiles = useCallback(
            (fileList: FileList) => {
                  const files = Array.from(fileList);
                  const remaining = maxFiles - attachments.length;
                  const valid = files
                        .filter((f) => f.size <= maxSizeMb * 1024 * 1024)
                        .slice(0, Math.max(0, remaining));
                  if (valid.length > 0) onAdd(valid);
            },
            [attachments.length, maxFiles, maxSizeMb, onAdd]
      );

      const handleDrop = useCallback(
            (e: React.DragEvent) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (!disabled && e.dataTransfer.files.length > 0) {
                        handleFiles(e.dataTransfer.files);
                  }
            },
            [disabled, handleFiles]
      );

      const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);

      return (
            <div className="space-y-3">
                  {/* Drop Zone */}
                  <div
                        className={cn(
                              "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                              dragOver && "border-primary bg-primary/5",
                              !dragOver && "border-muted-foreground/20 hover:border-primary/50",
                              disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => !disabled && inputRef.current?.click()}
                        onDragOver={(e) => {
                              e.preventDefault();
                              if (!disabled) setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                  >
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                              Drop files here or <span className="text-primary font-medium">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                              Max {maxSizeMb}MB per file · {maxFiles} files total
                        </p>
                        <input
                              ref={inputRef}
                              type="file"
                              accept={accept}
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                    if (e.target.files) handleFiles(e.target.files);
                                    e.target.value = "";
                              }}
                              disabled={disabled}
                        />
                  </div>

                  {/* Attachment List */}
                  {attachments.length > 0 && (
                        <div className="space-y-1.5">
                              {attachments.map((file) => (
                                    <div
                                          key={file.id}
                                          className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg border bg-card/50 group",
                                                file.error && "border-destructive/30 bg-destructive/5"
                                          )}
                                    >
                                          {getFileIcon(file.type)}
                                          <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate font-medium">{file.name}</p>
                                                <div className="flex items-center gap-2">
                                                      <span className="text-xs text-muted-foreground">
                                                            {formatFileSize(file.size)}
                                                      </span>
                                                      {file.progress !== undefined && file.progress < 100 && (
                                                            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden max-w-24">
                                                                  <div
                                                                        className="h-full bg-primary rounded-full transition-all"
                                                                        style={{ width: `${file.progress}%` }}
                                                                  />
                                                            </div>
                                                      )}
                                                      {file.url && (
                                                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                                                  Uploaded
                                                            </Badge>
                                                      )}
                                                      {file.error && (
                                                            <span className="text-[10px] text-destructive">{file.error}</span>
                                                      )}
                                                </div>
                                          </div>
                                          <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => onRemove(file.id)}
                                                disabled={disabled}
                                          >
                                                <X className="h-3.5 w-3.5" />
                                          </Button>
                                    </div>
                              ))}

                              {/* Summary */}
                              <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                          <Paperclip className="h-3 w-3" />
                                          {attachments.length} file{attachments.length !== 1 ? "s" : ""}
                                    </span>
                                    <span>Total: {formatFileSize(totalSize)}</span>
                              </div>
                        </div>
                  )}
            </div>
      );
}

export default AttachmentUploader;
