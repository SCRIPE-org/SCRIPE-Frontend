"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Slider } from "@core/ui/slider";
import { Switch } from "@core/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { MousePointerClick } from "lucide-react";
import { ColorPickerField } from "./ColorPickerField";

// ─── Types ──────────────────────────────────────────────────
export interface ButtonDesignerProps {
  onInsert: (attrs: { html: string; label?: string; blockType?: string }) => void;
}

interface ButtonConfig {
  text: string;
  url: string;
  bgColor: string;
  textColor: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fullWidth: boolean;
  shadow: boolean;
  fontSize: number;
}

const DEFAULT_CONFIG: ButtonConfig = {
  text: "Click Here",
  url: "https://",
  bgColor: "#3b82f6",
  textColor: "#ffffff",
  borderRadius: 6,
  paddingX: 32,
  paddingY: 14,
  fullWidth: false,
  shadow: false,
  fontSize: 16,
};

// ─── Main Component ─────────────────────────────────────────
export function ButtonDesigner({ onInsert }: ButtonDesignerProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ButtonConfig>({ ...DEFAULT_CONFIG });

  const update = <K extends keyof ButtonConfig>(key: K, val: ButtonConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  // Generate email-safe TABLE-based button HTML (works in Outlook, Gmail, Apple Mail)
  const generateHtml = (): string => {
    const widthStyle = config.fullWidth ? "width:100%;" : "";
    const shadowStyle = config.shadow ? "box-shadow:0 4px 14px 0 rgba(0,0,0,0.15);" : "";

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto;border-collapse:collapse;${widthStyle}"><tr><td align="center" style="background:${config.bgColor};border-radius:${config.borderRadius}px;padding:${config.paddingY}px ${config.paddingX}px;${shadowStyle}"><a href="${config.url}" target="_blank" rel="noopener noreferrer" style="color:${config.textColor};font-size:${config.fontSize}px;font-weight:600;text-decoration:none;display:inline-block;line-height:1.4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${config.text || "Click Here"}</a></td></tr></table>`;
  };

  const handleInsert = () => {
    onInsert({
      html: generateHtml(),
      label: `CTA: ${config.text || "Click Here"}`,
      blockType: "button",
    });
    setOpen(false);
    setConfig({ ...DEFAULT_CONFIG });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs font-medium"
          title="Insert CTA Button"
        >
          <MousePointerClick className="h-4 w-4" />
          <span className="hidden sm:inline">Button</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="bottom" sideOffset={8}>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto overscroll-contain p-4">
          <h4 className="text-sm font-semibold">CTA Button Designer</h4>

          {/* Live Preview */}
          <div className="flex justify-center rounded-lg border bg-muted/20 p-4">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                display: "inline-block",
                backgroundColor: config.bgColor,
                color: config.textColor,
                borderRadius: `${config.borderRadius}px`,
                padding: `${config.paddingY}px ${config.paddingX}px`,
                fontSize: `${config.fontSize}px`,
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
                lineHeight: 1.4,
                width: config.fullWidth ? "100%" : "auto",
                boxShadow: config.shadow ? "0 4px 14px 0 rgba(0,0,0,0.15)" : "none",
              }}
            >
              {config.text || "Click Here"}
            </a>
          </div>

          {/* Text & URL */}
          <div className="space-y-2">
            <Label className="text-xs">Button Text</Label>
            <Input
              value={config.text}
              onChange={(e) => update("text", e.target.value)}
              placeholder="Click Here"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Link URL</Label>
            <Input
              value={config.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://example.com"
              className="h-8 text-sm"
            />
          </div>

          {/* Colors (side by side) */}
          <div className="grid grid-cols-2 gap-3">
            <ColorPickerField
              label="Background"
              value={config.bgColor}
              onChange={(c) => update("bgColor", c)}
            />
            <ColorPickerField
              label="Text Color"
              value={config.textColor}
              onChange={(c) => update("textColor", c)}
            />
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Border Radius</Label>
              <span className="text-xs text-muted-foreground">{config.borderRadius}px</span>
            </div>
            <Slider
              value={[config.borderRadius]}
              onValueChange={([v]) => update("borderRadius", v)}
              min={0}
              max={50}
              step={2}
            />
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Font Size</Label>
              <span className="text-xs text-muted-foreground">{config.fontSize}px</span>
            </div>
            <Slider
              value={[config.fontSize]}
              onValueChange={([v]) => update("fontSize", v)}
              min={12}
              max={24}
              step={1}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Full Width</Label>
              <Switch checked={config.fullWidth} onCheckedChange={(v) => update("fullWidth", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Shadow</Label>
              <Switch checked={config.shadow} onCheckedChange={(v) => update("shadow", v)} />
            </div>
          </div>

          {/* Insert */}
          <Button
            onClick={handleInsert}
            className="w-full"
            disabled={!config.text.trim() || !config.url.trim()}
          >
            Insert Button
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ButtonDesigner;
