"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { cn } from "@core/common/utils";
import { Share2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";

// ─── Types ──────────────────────────────────────────────────
export interface SocialBlockProps {
  onInsert: (attrs: { html: string; label?: string; blockType?: string }) => void;
}

interface SocialPlatform {
  id: string;
  label: string;
  defaultUrl: string;
  brandColor: string;
  monoColor: string;
  /** SVG path data for the brand icon (viewBox 24x24) */
  svgPath: string;
}

interface SocialEntry {
  platformId: string;
  url: string;
  enabled: boolean;
}

// ─── Platform Definitions with SVG Paths ────────────────────
// SVG paths from Simple Icons (https://simpleicons.org/) — MIT licensed
//
// COLOUR EXCEPTION — brandColor below is each identity provider's own mark
// (same rule as brand-icons.tsx: Facebook blue is Facebook's, not ours;
// re-tinting it to the workspace accent makes the icon unrecognisable).
// MONO_ICON_COLOR is a genuine neutral, not a brand color, but it is ALSO
// literal: both values end up as an inline background-color in HTML emailed
// to a third-party mail client, which will not resolve var(--nx-*) custom
// properties. The white glyph fill (fill="#ffffff") is literal for the same
// reason and because it must stay legible against whichever of the two
// literal circle colors is active — it cannot be currentColor. Everything
// else — the settings panel's borders, radii, panel backgrounds — is
// structural UI chrome and reads --nx- tokens as normal.
const MONO_ICON_COLOR = "#6b7280";

const PLATFORMS: SocialPlatform[] = [
  {
    id: "facebook",
    label: "Facebook",
    defaultUrl: "https://facebook.com/",
    brandColor: "#1877F2",
    monoColor: MONO_ICON_COLOR,
    svgPath:
      "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.044 1.613.115V7.78h-1.009c-1.42 0-1.971.537-1.971 1.934v2.021h3.384l-.669 3.667h-2.715v8.007A12.003 12.003 0 0 0 24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.628 3.874 10.35 9.101 11.691Z",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    defaultUrl: "https://x.com/",
    brandColor: "#000000",
    monoColor: MONO_ICON_COLOR,
    svgPath:
      "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    id: "instagram",
    label: "Instagram",
    defaultUrl: "https://instagram.com/",
    brandColor: "#E4405F",
    monoColor: MONO_ICON_COLOR,
    svgPath:
      "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8504.6151 19.0872.32 18.2143.1197 16.9366.0633 15.6588.0067 15.2479-.0067 12-.0067 8.7521-.0067 8.3413.0067 7.0301.084Zm.1399 21.6159c-1.1726-.0535-1.8099-.2496-2.2337-.4147-.5614-.2182-.9623-.4787-1.3833-.8994-.4213-.4209-.6803-.8217-.8986-1.3835-.1644-.4236-.3605-1.0617-.4139-2.2346-.0577-1.2683-.0698-1.6494-.0757-4.8583-.006-3.209.0044-3.5905.0478-4.8593.0536-1.1724.2494-1.8102.4145-2.2332.2183-.5614.4791-.9627.8997-1.3837.4208-.4208.822-.6803 1.3837-.8986.4237-.1644 1.061-.3605 2.2341-.4143 1.2687-.0576 1.6498-.069 4.859-.0756 3.209-.006 3.5907.005 4.8587.0487 1.1724.0535 1.8098.2494 2.2338.4147.5614.2179.9623.4783 1.3833.8991.4209.4208.6803.8218.8987 1.3839.1644.424.3604 1.0609.4139 2.234.0577 1.2684.0697 1.6493.0756 4.8585.006 3.2088-.0044 3.5904-.0478 4.859-.0534 1.1725-.2494 1.8102-.4145 2.2339-.2183.5612-.4791.9624-.8998 1.3834-.4208.421-.822.6806-1.3837.899-.4236.164-1.0609.3601-2.2342.4139-1.2684.0578-1.6496.0699-4.8585.0762-3.2088.006-3.5905-.005-4.859-.0487ZM8.3397 12.0002c.0063 2.0229 1.6461 3.6574 3.6689 3.651 2.0228-.0063 3.6573-1.6464 3.651-3.6693-.0063-2.0229-1.6465-3.6573-3.6693-3.651-2.0228.0063-3.6569 1.6464-3.6506 3.6693Zm1.9506-.006c-.0034-1.0944.8839-1.984 1.9783-1.9874 1.0944-.0034 1.984.8839 1.9874 1.9783.0034 1.0944-.8839 1.984-1.9783 1.9874-1.0944.0034-1.984-.8839-1.9874-1.9783ZM16.9479 5.587c.001.7996.6504 1.4472 1.45 1.4462.7996-.001 1.4472-.6504 1.4462-1.45-.001-.7996-.6504-1.4472-1.45-1.4462-.7996.001-1.4472.6504-1.4462 1.45Z",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    defaultUrl: "https://linkedin.com/company/",
    brandColor: "#0A66C2",
    monoColor: MONO_ICON_COLOR,
    svgPath:
      "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    id: "youtube",
    label: "YouTube",
    defaultUrl: "https://youtube.com/@",
    brandColor: "#FF0000",
    monoColor: MONO_ICON_COLOR,
    svgPath:
      "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    id: "github",
    label: "GitHub",
    defaultUrl: "https://github.com/",
    brandColor: "#181717",
    monoColor: MONO_ICON_COLOR,
    svgPath:
      "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    id: "tiktok",
    label: "TikTok",
    defaultUrl: "https://tiktok.com/@",
    brandColor: "#000000",
    monoColor: MONO_ICON_COLOR,
    svgPath:
      "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    defaultUrl: "https://wa.me/",
    brandColor: "#25D366",
    monoColor: MONO_ICON_COLOR,
    svgPath:
      "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  },
];

// ─── Helper: build inline SVG data URI for email ────────────
function buildSvgDataUri(svgPath: string, fillColor: string = "#ffffff"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fillColor}" width="20" height="20"><path d="${svgPath}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

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
  const [shape, setShape] = useState<"circle" | "rounded">("circle");

  const updateEntry = (platformId: string, updates: Partial<SocialEntry>) => {
    setEntries((prev) => prev.map((e) => (e.platformId === platformId ? { ...e, ...updates } : e)));
  };

  const enabledEntries = entries.filter((e) => e.enabled);

  // Generate email-safe TABLE-based social icons HTML
  const generateHtml = (): string => {
    const align = alignment;
    const cells = enabledEntries
      .map((entry) => {
        const platform = PLATFORMS.find((p) => p.id === entry.platformId)!;
        const bgColor = iconStyle === "colored" ? platform.brandColor : platform.monoColor;
        const borderRadius = shape === "circle" ? "50%" : "6px";
        const iconUri = buildSvgDataUri(platform.svgPath, "#ffffff");

        return `<td style="padding:0 4px;"><a href="${entry.url}" target="_blank" rel="noopener noreferrer" title="${platform.label}" style="display:inline-block;width:36px;height:36px;border-radius:${borderRadius};background-color:${bgColor};text-align:center;line-height:36px;text-decoration:none;"><img src="${iconUri}" alt="${platform.label}" width="20" height="20" style="vertical-align:middle;border:0;"/></a></td>`;
      })
      .join("");

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto;border-collapse:collapse;"><tr>${cells}</tr></table>`;
  };

  const handleInsert = () => {
    if (enabledEntries.length === 0) return;
    onInsert({
      html: generateHtml(),
      label: `Social Links (${enabledEntries.length})`,
      blockType: "social",
    });
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
      <PopoverContent className="w-80 p-0" align="start" side="bottom" sideOffset={8}>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto overscroll-contain p-4">
          <h4 className="text-sm font-semibold">Social Media Links</h4>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Style</Label>
              <Select
                value={iconStyle}
                onValueChange={(v) => setIconStyle(v as "colored" | "mono")}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colored">Colored</SelectItem>
                  <SelectItem value="mono">Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Shape</Label>
              <Select value={shape} onValueChange={(v) => setShape(v as "circle" | "rounded")}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Align</Label>
              <Select
                value={alignment}
                onValueChange={(v) => setAlignment(v as "left" | "center" | "right")}
              >
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

          {/* Platform List with SVG brand icons */}
          <div className="space-y-2">
            {entries.map((entry) => {
              const platform = PLATFORMS.find((p) => p.id === entry.platformId)!;
              const bgColor = iconStyle === "colored" ? platform.brandColor : platform.monoColor;
              return (
                <div
                  key={entry.platformId}
                  className={cn(
                    "space-y-1.5 rounded-nx-md border p-2 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    entry.enabled
                      ? "border-nx-accent bg-nx-accent-wash"
                      : "border-nx-line opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        style={{ backgroundColor: bgColor }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#ffffff"
                          className="h-4 w-4"
                        >
                          <path d={platform.svgPath} />
                        </svg>
                      </span>
                      <span className="text-sm font-medium">{platform.label}</span>
                    </div>
                    <Switch
                      checked={entry.enabled}
                      onCheckedChange={(v) => updateEntry(entry.platformId, { enabled: v })}
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

          {/* Preview */}
          {enabledEntries.length > 0 && (
            <div
              className="rounded-nx-md border border-nx-line bg-nx-ground p-3"
              style={{ textAlign: alignment }}
            >
              {enabledEntries.map((entry) => {
                const platform = PLATFORMS.find((p) => p.id === entry.platformId)!;
                const bgColor = iconStyle === "colored" ? platform.brandColor : platform.monoColor;
                return (
                  <span
                    key={entry.platformId}
                    className={cn(
                      "mx-0.5 inline-flex h-9 w-9 items-center justify-center text-white",
                      shape === "circle" ? "rounded-full" : "rounded-nx-sm"
                    )}
                    style={{ backgroundColor: bgColor }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#ffffff"
                      className="h-5 w-5"
                    >
                      <path d={platform.svgPath} />
                    </svg>
                  </span>
                );
              })}
            </div>
          )}

          {/* Insert */}
          <Button onClick={handleInsert} className="w-full" disabled={enabledEntries.length === 0}>
            Insert Social Links ({enabledEntries.length})
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default SocialBlock;
