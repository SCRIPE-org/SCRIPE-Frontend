"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { ScrollArea } from "@core/ui/scroll-area";
import { cn } from "@core/common/utils";
import { Share2 } from "lucide-react";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";

// ─── Types ──────────────────────────────────────────────────
export interface SocialBlockProps {
      onInsert: (html: string) => void;
}

interface SocialPlatform {
      id: string;
      label: string;
      defaultUrl: string;
      svgColor: string;
      svgMono: string;
}

interface SocialEntry {
      platformId: string;
      url: string;
      enabled: boolean;
}

// ─── Platform Definitions ───────────────────────────────────
// Using simple text icons because SVG in email is tricky — we use Unicode + styling
const PLATFORMS: SocialPlatform[] = [
      {
            id: "facebook",
            label: "Facebook",
            defaultUrl: "https://facebook.com/",
            svgColor: "#1877F2",
            svgMono: "#6b7280",
      },
      {
            id: "twitter",
            label: "X (Twitter)",
            defaultUrl: "https://x.com/",
            svgColor: "#000000",
            svgMono: "#6b7280",
      },
      {
            id: "instagram",
            label: "Instagram",
            defaultUrl: "https://instagram.com/",
            svgColor: "#E4405F",
            svgMono: "#6b7280",
      },
      {
            id: "linkedin",
            label: "LinkedIn",
            defaultUrl: "https://linkedin.com/company/",
            svgColor: "#0A66C2",
            svgMono: "#6b7280",
      },
      {
            id: "youtube",
            label: "YouTube",
            defaultUrl: "https://youtube.com/@",
            svgColor: "#FF0000",
            svgMono: "#6b7280",
      },
      {
            id: "github",
            label: "GitHub",
            defaultUrl: "https://github.com/",
            svgColor: "#181717",
            svgMono: "#6b7280",
      },
      {
            id: "tiktok",
            label: "TikTok",
            defaultUrl: "https://tiktok.com/@",
            svgColor: "#000000",
            svgMono: "#6b7280",
      },
      {
            id: "whatsapp",
            label: "WhatsApp",
            defaultUrl: "https://wa.me/",
            svgColor: "#25D366",
            svgMono: "#6b7280",
      },
];

const PLATFORM_INITIALS: Record<string, string> = {
      facebook: "f",
      twitter: "𝕏",
      instagram: "📷",
      linkedin: "in",
      youtube: "▶",
      github: "⬡",
      tiktok: "♪",
      whatsapp: "✆",
};

// ─── Main Component ─────────────────────────────────────────
export function SocialBlock({ onInsert }: SocialBlockProps) {
      const [open, setOpen] = useState(false);
      const [entries, setEntries] = useState<SocialEntry[]>(
            PLATFORMS.map((p) => ({
                  platformId: p.id,
                  url: p.defaultUrl,
                  enabled: false,
            }))
      );
      const [iconStyle, setIconStyle] = useState<"colored" | "mono">("colored");
      const [alignment, setAlignment] = useState<"left" | "center" | "right">("center");

      const updateEntry = (platformId: string, updates: Partial<SocialEntry>) => {
            setEntries((prev) =>
                  prev.map((e) => (e.platformId === platformId ? { ...e, ...updates } : e))
            );
      };

      const enabledEntries = entries.filter((e) => e.enabled);

      const generateHtml = (): string => {
            const align = alignment;
            const items = enabledEntries
                  .map((entry) => {
                        const platform = PLATFORMS.find((p) => p.id === entry.platformId)!;
                        const color = iconStyle === "colored" ? platform.svgColor : platform.svgMono;
                        const initial = PLATFORM_INITIALS[platform.id] || platform.label[0];

                        return `<a href="${entry.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 50%; background-color: ${color}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; font-family: -apple-system, sans-serif; margin: 0 4px;" title="${platform.label}">${initial}</a>`;
                  })
                  .join("\n");

            return `<div style="text-align: ${align}; padding: 16px 0;">\n${items}\n</div>`;
      };

      const handleInsert = () => {
            if (enabledEntries.length === 0) return;
            onInsert(generateHtml());
            setOpen(false);
      };

      return (
            <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1.5 px-2 text-xs font-medium"
                              title="Social Media Links"
                        >
                              <Share2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Social</span>
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                        <div className="space-y-4">
                              <h4 className="text-sm font-semibold">Social Media Links</h4>

                              {/* Settings */}
                              <div className="flex gap-3">
                                    <div className="flex-1 space-y-1">
                                          <Label className="text-xs">Icon Style</Label>
                                          <Select value={iconStyle} onValueChange={(v) => setIconStyle(v as "colored" | "mono")}>
                                                <SelectTrigger className="h-8 text-xs">
                                                      <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      <SelectItem value="colored">Colored</SelectItem>
                                                      <SelectItem value="mono">Monochrome</SelectItem>
                                                </SelectContent>
                                          </Select>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                          <Label className="text-xs">Alignment</Label>
                                          <Select value={alignment} onValueChange={(v) => setAlignment(v as "left" | "center" | "right")}>
                                                <SelectTrigger className="h-8 text-xs">
                                                      <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      <SelectItem value="left">Left</SelectItem>
                                                      <SelectItem value="center">Center</SelectItem>
                                                      <SelectItem value="right">Right</SelectItem>
                                                </SelectContent>
                                          </Select>
                                    </div>
                              </div>

                              {/* Platform List */}
                              <ScrollArea className="max-h-56">
                                    <div className="space-y-2">
                                          {entries.map((entry) => {
                                                const platform = PLATFORMS.find((p) => p.id === entry.platformId)!;
                                                return (
                                                      <div
                                                            key={entry.platformId}
                                                            className={cn(
                                                                  "rounded-lg border p-2 space-y-1.5 transition-colors",
                                                                  entry.enabled ? "bg-accent/30 border-accent" : "opacity-60"
                                                            )}
                                                      >
                                                            <div className="flex items-center justify-between">
                                                                  <div className="flex items-center gap-2">
                                                                        <span
                                                                              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                                                              style={{
                                                                                    backgroundColor:
                                                                                          iconStyle === "colored"
                                                                                                ? platform.svgColor
                                                                                                : platform.svgMono,
                                                                              }}
                                                                        >
                                                                              {PLATFORM_INITIALS[platform.id]}
                                                                        </span>
                                                                        <span className="text-sm font-medium">{platform.label}</span>
                                                                  </div>
                                                                  <Switch
                                                                        checked={entry.enabled}
                                                                        onCheckedChange={(v) =>
                                                                              updateEntry(entry.platformId, { enabled: v })
                                                                        }
                                                                  />
                                                            </div>
                                                            {entry.enabled && (
                                                                  <Input
                                                                        value={entry.url}
                                                                        onChange={(e) =>
                                                                              updateEntry(entry.platformId, {
                                                                                    url: e.target.value,
                                                                              })
                                                                        }
                                                                        placeholder={platform.defaultUrl}
                                                                        className="h-7 text-xs"
                                                                  />
                                                            )}
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </ScrollArea>

                              {/* Preview */}
                              {enabledEntries.length > 0 && (
                                    <div
                                          className="border rounded-lg p-3 bg-muted/20"
                                          style={{ textAlign: alignment }}
                                    >
                                          {enabledEntries.map((entry) => {
                                                const platform = PLATFORMS.find((p) => p.id === entry.platformId)!;
                                                return (
                                                      <span
                                                            key={entry.platformId}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold mx-0.5"
                                                            style={{
                                                                  backgroundColor:
                                                                        iconStyle === "colored"
                                                                              ? platform.svgColor
                                                                              : platform.svgMono,
                                                            }}
                                                      >
                                                            {PLATFORM_INITIALS[platform.id]}
                                                      </span>
                                                );
                                          })}
                                    </div>
                              )}

                              {/* Insert */}
                              <Button
                                    onClick={handleInsert}
                                    className="w-full"
                                    disabled={enabledEntries.length === 0}
                              >
                                    Insert Social Links ({enabledEntries.length})
                              </Button>
                        </div>
                  </PopoverContent>
            </Popover>
      );
}

export default SocialBlock;
