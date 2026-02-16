"use client";

import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Separator } from "@core/ui/separator";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import { Paintbrush, RotateCcw } from "lucide-react";
import ColorPickerField from "@/core/ui/rich-text-editor/ColorPickerField";

// ─── Types ──────────────────────────────────────────────────
export interface DesignVariables {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      headerFontSize: string;
      bodyFontSize: string;
      borderRadius: string;
      logoUrl: string;
      footerText: string;
}

export interface DesignVariablesPanelProps {
      value: DesignVariables;
      onChange: (v: DesignVariables) => void;
}

// ─── Defaults ───────────────────────────────────────────────
export const DEFAULT_DESIGN: DesignVariables = {
      primaryColor: "#3b82f6",
      secondaryColor: "#6366f1",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      fontFamily: "Inter, sans-serif",
      headerFontSize: "24",
      bodyFontSize: "14",
      borderRadius: "8",
      logoUrl: "",
      footerText: "© {{currentYear}} {{companyName}}. All rights reserved.",
};

const FONT_OPTIONS = [
      { value: "Inter, sans-serif", label: "Inter" },
      { value: "Roboto, sans-serif", label: "Roboto" },
      { value: "'Segoe UI', sans-serif", label: "Segoe UI" },
      { value: "Arial, sans-serif", label: "Arial" },
      { value: "Georgia, serif", label: "Georgia" },
      { value: "'Courier New', monospace", label: "Courier New" },
      { value: "Cairo, sans-serif", label: "Cairo (Arabic)" },
];

// ─── Main ───────────────────────────────────────────────────
export function DesignVariablesPanel({ value, onChange }: DesignVariablesPanelProps) {
      const update = (key: keyof DesignVariables, val: string) => {
            onChange({ ...value, [key]: val });
      };

      return (
            <Card>
                  <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-base">
                                    <Paintbrush className="h-4 w-4" />
                                    Design Variables
                              </CardTitle>
                              <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => onChange(DEFAULT_DESIGN)}
                              >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset
                              </Button>
                        </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                        {/* Colors */}
                        <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</h4>
                              <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                          <ColorPickerField
                                                label="Primary"
                                                value={value.primaryColor}
                                                onChange={(c: string) => update("primaryColor", c)}
                                          />
                                    </div>
                                    <div className="space-y-1">
                                          <ColorPickerField
                                                label="Secondary"
                                                value={value.secondaryColor}
                                                onChange={(c: string) => update("secondaryColor", c)}
                                          />
                                    </div>
                                    <div className="space-y-1">
                                          <ColorPickerField
                                                label="Background"
                                                value={value.backgroundColor}
                                                onChange={(c: string) => update("backgroundColor", c)}
                                          />
                                    </div>
                                    <div className="space-y-1">
                                          <ColorPickerField
                                                label="Text"
                                                value={value.textColor}
                                                onChange={(c: string) => update("textColor", c)}
                                          />
                                    </div>
                              </div>
                        </div>

                        <Separator />

                        {/* Typography */}
                        <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Typography</h4>
                              <div className="space-y-2">
                                    <Label className="text-xs">Font Family</Label>
                                    <Select value={value.fontFamily} onValueChange={(v) => update("fontFamily", v)}>
                                          <SelectTrigger className="text-sm">
                                                <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                                {FONT_OPTIONS.map((f) => (
                                                      <SelectItem key={f.value} value={f.value}>
                                                            <span style={{ fontFamily: f.value }}>{f.label}</span>
                                                      </SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                          <Label className="text-xs">Header Size (px)</Label>
                                          <Input
                                                type="number"
                                                min={16}
                                                max={48}
                                                value={value.headerFontSize}
                                                onChange={(e) => update("headerFontSize", e.target.value)}
                                                className="text-sm"
                                          />
                                    </div>
                                    <div className="space-y-1">
                                          <Label className="text-xs">Body Size (px)</Label>
                                          <Input
                                                type="number"
                                                min={10}
                                                max={24}
                                                value={value.bodyFontSize}
                                                onChange={(e) => update("bodyFontSize", e.target.value)}
                                                className="text-sm"
                                          />
                                    </div>
                              </div>
                        </div>

                        <Separator />

                        {/* Layout */}
                        <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layout</h4>
                              <div className="space-y-2">
                                    <Label className="text-xs">Border Radius (px)</Label>
                                    <Input
                                          type="number"
                                          min={0}
                                          max={32}
                                          value={value.borderRadius}
                                          onChange={(e) => update("borderRadius", e.target.value)}
                                          className="text-sm"
                                    />
                              </div>
                        </div>

                        <Separator />

                        {/* Branding */}
                        <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Branding</h4>
                              <div className="space-y-2">
                                    <Label className="text-xs">Logo URL</Label>
                                    <Input
                                          value={value.logoUrl}
                                          onChange={(e) => update("logoUrl", e.target.value)}
                                          placeholder="https://example.com/logo.png"
                                          className="text-sm"
                                    />
                              </div>
                              <div className="space-y-2">
                                    <Label className="text-xs">Footer Text</Label>
                                    <Input
                                          value={value.footerText}
                                          onChange={(e) => update("footerText", e.target.value)}
                                          placeholder="© {{currentYear}} Company"
                                          className="text-sm"
                                    />
                              </div>
                        </div>

                        {/* Live Preview Swatch */}
                        <Separator />
                        <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</h4>
                              <div
                                    className="rounded-lg border overflow-hidden"
                                    style={{
                                          backgroundColor: value.backgroundColor,
                                          fontFamily: value.fontFamily,
                                          borderRadius: `${value.borderRadius}px`,
                                    }}
                              >
                                    <div
                                          className="px-4 py-3"
                                          style={{ backgroundColor: value.primaryColor }}
                                    >
                                          <span
                                                style={{
                                                      color: "#ffffff",
                                                      fontSize: `${Math.min(16, parseInt(value.headerFontSize) || 24)}px`,
                                                      fontWeight: 700,
                                                }}
                                          >
                                                Header
                                          </span>
                                    </div>
                                    <div className="px-4 py-3">
                                          <p
                                                style={{
                                                      color: value.textColor,
                                                      fontSize: `${value.bodyFontSize}px`,
                                                }}
                                          >
                                                Body text preview
                                          </p>
                                          <button
                                                type="button"
                                                className="mt-2 px-3 py-1 text-xs text-white font-medium"
                                                style={{
                                                      backgroundColor: value.secondaryColor,
                                                      borderRadius: `${value.borderRadius}px`,
                                                }}
                                          >
                                                Button
                                          </button>
                                    </div>
                              </div>
                        </div>
                  </CardContent>
            </Card>
      );
}

export default DesignVariablesPanel;
