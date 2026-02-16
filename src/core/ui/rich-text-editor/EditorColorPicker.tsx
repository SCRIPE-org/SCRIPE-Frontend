"use client";

import React, { useState } from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Separator } from "@core/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";

// ─── Types ──────────────────────────────────────────────────
export interface EditorColorPickerProps {
      colors: string[];
      currentColor?: string;
      onSelect: (color: string) => void;
      icon: React.ReactNode;
      title: string;
}

// ─── Component ──────────────────────────────────────────────
export function EditorColorPicker({
      colors,
      currentColor,
      onSelect,
      icon,
      title,
}: EditorColorPickerProps) {
      const [custom, setCustom] = useState("");

      return (
            <Popover>
                  <PopoverTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 relative"
                              title={title}
                        >
                              {icon}
                              {currentColor && (
                                    <span
                                          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full"
                                          style={{ backgroundColor: currentColor }}
                                    />
                              )}
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-3" align="start">
                        <div className="grid grid-cols-8 gap-1 mb-2">
                              {colors.map((c) => (
                                    <button
                                          key={c}
                                          type="button"
                                          className={cn(
                                                "h-5 w-5 rounded-sm border border-border hover:scale-110 transition-transform",
                                                currentColor === c && "ring-2 ring-primary ring-offset-1"
                                          )}
                                          style={{ backgroundColor: c }}
                                          onClick={() => onSelect(c)}
                                    />
                              ))}
                        </div>
                        <Separator className="my-2" />
                        <div className="flex gap-1.5 items-center">
                              <Input
                                    value={custom}
                                    onChange={(e) => setCustom(e.target.value)}
                                    placeholder="#hex"
                                    className="h-7 text-xs font-mono"
                              />
                              <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs px-2"
                                    onClick={() => {
                                          if (custom.startsWith("#") && custom.length >= 4) {
                                                onSelect(custom);
                                          }
                                    }}
                              >
                                    Apply
                              </Button>
                        </div>
                  </PopoverContent>
            </Popover>
      );
}
