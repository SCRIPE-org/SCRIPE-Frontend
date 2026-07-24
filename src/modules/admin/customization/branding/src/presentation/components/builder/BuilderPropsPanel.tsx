/**
 * BuilderPropsPanel — Properties editor for the selected canvas component
 *
 * Shows grid placement controls and component-specific props.
 * Renders dynamically based on the selected component's type.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { cn } from "@/core/common/utils";
import { sanitizeCss, sanitizeRichHtml } from "@core/common/sanitize";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";
import { Checkbox } from "@core/ui/checkbox";
import { Trash2, Eye, EyeOff, Copy, ArrowUp, ArrowDown, Lock, Unlock } from "lucide-react";
import { ImageUploadField } from "@core/ui/image-upload-field";
import { VideoUploadField } from "@core/ui/video-upload-field";
import { CodeEditorField } from "@core/ui/code-editor-field";
import type {
  CanvasComponent,
  CanvasComponentType,
  GridAlignment,
  PositionMode,
} from "../../../domain/entities/CanvasComponent";
import { COMPONENT_CATALOG } from "../../../domain/entities/CanvasComponent";
import { useI18n } from "@core/providers/i18n-provider";

interface BuilderPropsPanelProps {
  component: CanvasComponent;
  positionMode: PositionMode;
  onUpdate: (id: string, updates: Partial<CanvasComponent>) => void;
  onUpdateProps: (id: string, props: Record<string, unknown>) => void;
  onRemove: (id: string) => boolean;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorderZ: (id: string, direction: "forward" | "back") => void;
  onLock: (id: string) => void;
  onUnlock: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
}

const ALIGNMENT_OPTIONS: { value: GridAlignment; label: string }[] = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
];

/** Parse "N / M" grid string into [start, end] */
function parseGridSpan(span: string): [number, number] {
  const match = span.match(/(\d+)\s*\/\s*(\d+)/);
  if (match) return [parseInt(match[1], 10), parseInt(match[2], 10)];
  return [1, 2];
}

export function BuilderPropsPanel({
  component,
  positionMode,
  onUpdate,
  onUpdateProps,
  onRemove,
  onDuplicate,
  onToggleVisibility,
  onReorderZ,
  onLock,
  onUnlock,
  onResize,
}: BuilderPropsPanelProps) {
  const { t } = useI18n();
  const catalog = COMPONENT_CATALOG.find((c) => c.type === component.type);
  const [colStart, colEnd] = parseGridSpan(component.gridColumn);
  const [rowStart, rowEnd] = parseGridSpan(component.gridRow);
  const isAbsolute = positionMode === "absolute";

  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">
          {t(catalog?.labelKey || "") || component.type}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleVisibility(component.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
            title={component.visible ? "Hide" : "Show"}
          >
            {component.visible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => onDuplicate(component.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted"
            title={t("studio.builder.duplicate") || "Duplicate"}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {!catalog?.required && (
            <button
              onClick={() => onRemove(component.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
              title={t("studio.builder.remove") || "Remove"}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Position Section */}
      <div className="space-y-3">
        {isAbsolute ? (
          /* ── Free-form position controls ── */
          <>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("studio.builder.props.position") || "Position"}
              </p>
              <button
                onClick={() => (component.locked ? onUnlock(component.id) : onLock(component.id))}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                  component.locked
                    ? "bg-destructive/10 text-destructive"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title={component.locked ? "Unlock" : "Lock"}
              >
                {component.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">X</Label>
                <Input
                  type="number"
                  min={0}
                  value={component.x}
                  onChange={(e) => onUpdate(component.id, { x: parseInt(e.target.value, 10) || 0 })}
                  className="h-8 font-mono text-xs"
                  disabled={component.locked}
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Y</Label>
                <Input
                  type="number"
                  min={0}
                  value={component.y}
                  onChange={(e) => onUpdate(component.id, { y: parseInt(e.target.value, 10) || 0 })}
                  className="h-8 font-mono text-xs"
                  disabled={component.locked}
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">W</Label>
                <Input
                  type="number"
                  min={catalog?.minWidth || 40}
                  value={component.width || ""}
                  onChange={(e) =>
                    onResize(
                      component.id,
                      parseInt(e.target.value, 10) || 200,
                      component.height || 0
                    )
                  }
                  className="h-8 font-mono text-xs"
                  disabled={component.locked}
                  placeholder="auto"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">H</Label>
                <Input
                  type="number"
                  min={catalog?.minHeight || 20}
                  value={component.height || ""}
                  onChange={(e) =>
                    onResize(
                      component.id,
                      component.width || 200,
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                  className="h-8 font-mono text-xs"
                  disabled={component.locked}
                  placeholder="auto"
                />
              </div>
            </div>
          </>
        ) : (
          /* ── Grid placement controls ── */
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("studio.builder.props.gridPlacement") || "Grid Placement"}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Col Start</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={colStart}
                  onChange={(e) =>
                    onUpdate(component.id, { gridColumn: `${e.target.value} / ${colEnd}` })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Col End</Label>
                <Input
                  type="number"
                  min={2}
                  max={13}
                  value={colEnd}
                  onChange={(e) =>
                    onUpdate(component.id, { gridColumn: `${colStart} / ${e.target.value}` })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Row Start</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={rowStart}
                  onChange={(e) =>
                    onUpdate(component.id, { gridRow: `${e.target.value} / ${rowEnd}` })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Row End</Label>
                <Input
                  type="number"
                  min={2}
                  max={21}
                  value={rowEnd}
                  onChange={(e) =>
                    onUpdate(component.id, { gridRow: `${rowStart} / ${e.target.value}` })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Alignment */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">H-Align</Label>
                <select
                  value={component.alignment}
                  onChange={(e) =>
                    onUpdate(component.id, { alignment: e.target.value as GridAlignment })
                  }
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  {ALIGNMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">V-Align</Label>
                <select
                  value={component.verticalAlignment}
                  onChange={(e) =>
                    onUpdate(component.id, { verticalAlignment: e.target.value as GridAlignment })
                  }
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  {ALIGNMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Z-Order */}
        <div className="flex items-center gap-2">
          <Label className="flex-1 text-[10px] text-muted-foreground">Layer</Label>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onReorderZ(component.id, "forward")}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center font-mono text-xs">{component.zIndex}</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onReorderZ(component.id, "back")}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Component-Specific Props */}
      <div className="space-y-3 border-t border-border pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("studio.builder.props.componentSettings") || "Settings"}
        </p>
        <ComponentSpecificProps
          type={component.type}
          props={component.props}
          onUpdateProps={(newProps) => onUpdateProps(component.id, newProps)}
        />
      </div>
    </div>
  );
}

/** Render props editor based on component type */
function ComponentSpecificProps({
  type,
  props,
  onUpdateProps,
}: {
  type: CanvasComponentType;
  props: Record<string, unknown>;
  onUpdateProps: (props: Record<string, unknown>) => void;
}) {
  const { t } = useI18n();
  switch (type) {
    case "logo":
      return (
        <div className="space-y-2">
          <ImageUploadField
            value={(props.src as string) || ""}
            onChange={(url) => onUpdateProps({ src: url })}
            label={t("studio.builder.props.logoImage") || "Logo Image"}
            description={
              t("studio.builder.props.logoImageDesc") ||
              "Upload or paste a URL. Leave empty to use the default app logo."
            }
            maxSizeBytes={2 * 1024 * 1024}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Max Width (px)</Label>
              <Input
                type="number"
                min={50}
                max={400}
                value={(props.maxWidth as number) || 200}
                onChange={(e) => onUpdateProps({ maxWidth: parseInt(e.target.value, 10) || 200 })}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">
                {t("studio.builder.props.shape") || "Shape"}
              </Label>
              <select
                value={(props.shape as string) || "auto"}
                onChange={(e) => onUpdateProps({ shape: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="auto">Auto</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Link URL</Label>
            <Input
              value={(props.linkUrl as string) || ""}
              onChange={(e) => onUpdateProps({ linkUrl: e.target.value })}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Opacity</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={(props.opacity as number) ?? 100}
              onChange={(e) => onUpdateProps({ opacity: parseInt(e.target.value, 10) })}
              className="h-2 w-full accent-primary"
            />
            <span className="text-[9px] text-muted-foreground">
              {(props.opacity as number) ?? 100}%
            </span>
          </div>
        </div>
      );

    case "loginForm":
      return (
        <div className="space-y-2">
          <Label className="text-[10px] font-semibold text-muted-foreground">Visibility</Label>
          {[
            { key: "showSocial", label: "Show Social Login" },
            { key: "showRemember", label: "Show Remember Me" },
            { key: "showForgot", label: "Show Forgot Password" },
            { key: "showRegister", label: "Show Register Link" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-foreground">{label}</span>
              <Switch
                checked={Boolean(props[key])}
                onCheckedChange={(checked) => onUpdateProps({ [key]: checked })}
              />
            </div>
          ))}
          <div className="border-t border-border/50 pt-2">
            <Label className="text-[10px] font-semibold text-muted-foreground">Form Style</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Style</Label>
              <select
                value={(props.formStyle as string) || "card"}
                onChange={(e) => onUpdateProps({ formStyle: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="card">Card</option>
                <option value="flat">Flat</option>
                <option value="glass">Glass</option>
                <option value="bordered">Bordered</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Border Radius</Label>
              <Input
                type="number"
                min={0}
                max={32}
                value={(props.borderRadius as number) ?? 12}
                onChange={(e) => onUpdateProps({ borderRadius: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Card Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(props.cardBg as string) || "#ffffff"}
                onChange={(e) => onUpdateProps({ cardBg: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <Input
                value={(props.cardBg as string) || ""}
                onChange={(e) => onUpdateProps({ cardBg: e.target.value })}
                placeholder="auto"
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Padding (px)</Label>
            <Input
              type="number"
              min={0}
              max={60}
              value={(props.padding as number) ?? 24}
              onChange={(e) => onUpdateProps({ padding: parseInt(e.target.value, 10) })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      );

    case "forgotForm":
      return (
        <div className="space-y-2">
          {[
            { key: "showBackToLogin", label: "Show Back to Login" },
            { key: "showIcon", label: "Show Key Icon" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-foreground">{label}</span>
              <Switch
                checked={Boolean(props[key] ?? true)}
                onCheckedChange={(checked) => onUpdateProps({ [key]: checked })}
              />
            </div>
          ))}
          <div>
            <Label className="text-[10px] text-muted-foreground">Description Text</Label>
            <Input
              value={(props.description as string) || ""}
              onChange={(e) => onUpdateProps({ description: e.target.value })}
              placeholder="Enter your email to receive a reset link"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Button Label</Label>
            <Input
              value={(props.buttonLabel as string) || ""}
              onChange={(e) => onUpdateProps({ buttonLabel: e.target.value })}
              placeholder="Send Reset Link"
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Style</Label>
              <select
                value={(props.formStyle as string) || "card"}
                onChange={(e) => onUpdateProps({ formStyle: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="card">Card</option>
                <option value="flat">Flat</option>
                <option value="glass">Glass</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Border Radius</Label>
              <Input
                type="number"
                min={0}
                max={32}
                value={(props.borderRadius as number) ?? 12}
                onChange={(e) => onUpdateProps({ borderRadius: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      );

    case "resetForm":
      return (
        <div className="space-y-2">
          {[
            { key: "showPasswordStrength", label: "Show Password Strength" },
            { key: "showConfirmPassword", label: "Show Confirm Password" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-foreground">{label}</span>
              <Switch
                checked={Boolean(props[key] ?? true)}
                onCheckedChange={(checked) => onUpdateProps({ [key]: checked })}
              />
            </div>
          ))}
          <div>
            <Label className="text-[10px] text-muted-foreground">Button Label</Label>
            <Input
              value={(props.buttonLabel as string) || ""}
              onChange={(e) => onUpdateProps({ buttonLabel: e.target.value })}
              placeholder="Reset Password"
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Style</Label>
              <select
                value={(props.formStyle as string) || "card"}
                onChange={(e) => onUpdateProps({ formStyle: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="card">Card</option>
                <option value="flat">Flat</option>
                <option value="glass">Glass</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Border Radius</Label>
              <Input
                type="number"
                min={0}
                max={32}
                value={(props.borderRadius as number) ?? 12}
                onChange={(e) => onUpdateProps({ borderRadius: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      );

    case "heading":
    case "subtitle":
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Text</Label>
            <Input
              value={(props.text as string) || ""}
              onChange={(e) => onUpdateProps({ text: e.target.value })}
              placeholder={type === "heading" ? "Welcome Back" : "Sign in to continue"}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Font Size (px)</Label>
              <Input
                type="number"
                min={10}
                max={72}
                value={(props.fontSize as number) || (type === "heading" ? 32 : 16)}
                onChange={(e) => onUpdateProps({ fontSize: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Font Weight</Label>
              <select
                value={(props.fontWeight as number) || (type === "heading" ? 700 : 400)}
                onChange={(e) => onUpdateProps({ fontWeight: parseInt(e.target.value, 10) })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                  <option key={w} value={w}>
                    {w}
                    {w === 400 ? " (Regular)" : w === 700 ? " (Bold)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">
              {t("studio.builder.props.color") || "Color"}
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  (props.color as string) !== "inherit"
                    ? (props.color as string) || "#000000"
                    : "#000000"
                }
                onChange={(e) => onUpdateProps({ color: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <Input
                value={(props.color as string) || "inherit"}
                onChange={(e) => onUpdateProps({ color: e.target.value })}
                placeholder="inherit"
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Text Align</Label>
            <div className="mt-0.5 flex gap-1">
              {/* UI-EXCEPTION: compact studio layout */}
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdateProps({ textAlign: align })}
                  className={cn(
                    "h-7 flex-1 rounded-md border text-[10px] font-medium transition-colors",
                    (props.textAlign || "center") === align
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Text Transform</Label>
              <select
                value={(props.textTransform as string) || "none"}
                onChange={(e) => onUpdateProps({ textTransform: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="capitalize">Capitalize</option>
                <option value="lowercase">lowercase</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Letter Spacing</Label>
              <Input
                type="number"
                min={-2}
                max={10}
                step={0.5}
                value={(props.letterSpacing as number) || 0}
                onChange={(e) => onUpdateProps({ letterSpacing: parseFloat(e.target.value) })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Line Height</Label>
            <Input
              type="number"
              min={0.8}
              max={3}
              step={0.1}
              value={(props.lineHeight as number) || 1.4}
              onChange={(e) => onUpdateProps({ lineHeight: parseFloat(e.target.value) })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Opacity</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={(props.opacity as number) ?? 100}
              onChange={(e) => onUpdateProps({ opacity: parseInt(e.target.value, 10) })}
              className="h-2 w-full accent-primary"
            />
            <span className="text-[9px] text-muted-foreground">
              {(props.opacity as number) ?? 100}%
            </span>
          </div>
        </div>
      );

    case "ctaButton":
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Label</Label>
            <Input
              value={(props.label as string) || ""}
              onChange={(e) => onUpdateProps({ label: e.target.value })}
              placeholder="Get Started"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">URL</Label>
            <Input
              value={(props.url as string) || ""}
              onChange={(e) => onUpdateProps({ url: e.target.value })}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Variant</Label>
              <select
                value={(props.variant as string) || "default"}
                onChange={(e) => onUpdateProps({ variant: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="default">Filled</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
                <option value="secondary">Secondary</option>
                <option value="destructive">Destructive</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">
                {t("studio.builder.props.size") || "Size"}
              </Label>
              <select
                value={(props.size as string) || "md"}
                onChange={(e) => onUpdateProps({ size: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground">Full Width</span>
            <Switch
              checked={Boolean(props.fullWidth)}
              onCheckedChange={(checked) => onUpdateProps({ fullWidth: checked })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Border Radius (px)</Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={(props.borderRadius as number) ?? 8}
                onChange={(e) => onUpdateProps({ borderRadius: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Icon Position</Label>
              <select
                value={(props.iconPosition as string) || "none"}
                onChange={(e) => onUpdateProps({ iconPosition: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="none">No Icon</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(props.bgColor as string) || "#6366f1"}
                onChange={(e) => onUpdateProps({ bgColor: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <Input
                value={(props.bgColor as string) || ""}
                onChange={(e) => onUpdateProps({ bgColor: e.target.value })}
                placeholder="auto"
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(props.textColor as string) || "#ffffff"}
                onChange={(e) => onUpdateProps({ textColor: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <Input
                value={(props.textColor as string) || ""}
                onChange={(e) => onUpdateProps({ textColor: e.target.value })}
                placeholder="auto"
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <ImageUploadField
            value={(props.src as string) || ""}
            onChange={(url) => onUpdateProps({ src: url })}
            label={t("studio.builder.props.imageSource") || "Image"}
            description={
              t("studio.builder.props.imageSourceDesc") || "Upload an image or paste a direct URL."
            }
          />
          <div>
            <Label className="text-[10px] text-muted-foreground">Alt Text</Label>
            <Input
              value={(props.alt as string) || ""}
              onChange={(e) => onUpdateProps({ alt: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Object Fit</Label>
              <select
                value={(props.objectFit as string) || "cover"}
                onChange={(e) => onUpdateProps({ objectFit: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
                <option value="scale-down">Scale Down</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Object Position</Label>
              <select
                value={(props.objectPosition as string) || "center"}
                onChange={(e) => onUpdateProps({ objectPosition: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Border Radius (px)</Label>
              <Input
                type="number"
                min={0}
                max={200}
                value={(props.borderRadius as number) || 8}
                onChange={(e) => onUpdateProps({ borderRadius: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Shadow</Label>
              <select
                value={(props.shadow as string) || "none"}
                onChange={(e) => onUpdateProps({ shadow: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
                <option value="2xl">Dramatic</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Opacity</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={(props.opacity as number) ?? 100}
              onChange={(e) => onUpdateProps({ opacity: parseInt(e.target.value, 10) })}
              className="h-2 w-full accent-primary"
            />
            <span className="text-[9px] text-muted-foreground">
              {(props.opacity as number) ?? 100}%
            </span>
          </div>
        </div>
      );

    case "testimonial":
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Quote</Label>
            <Textarea
              value={(props.quote as string) || ""}
              onChange={(e) => onUpdateProps({ quote: e.target.value })}
              placeholder="This product changed our lives..."
              className="h-20 resize-none text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Author</Label>
              <Input
                value={(props.author as string) || ""}
                onChange={(e) => onUpdateProps({ author: e.target.value })}
                placeholder="John Doe"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Role</Label>
              <Input
                value={(props.role as string) || ""}
                onChange={(e) => onUpdateProps({ role: e.target.value })}
                placeholder="CEO at Company"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <ImageUploadField
            value={(props.avatar as string) || ""}
            onChange={(url) => onUpdateProps({ avatar: url })}
            label="Avatar"
            description="Author photo"
          />
          <div>
            <Label className="text-[10px] text-muted-foreground">Rating</Label>
            <div className="mt-0.5 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                // UI-EXCEPTION: compact studio layout
                <button
                  key={star}
                  onClick={() => onUpdateProps({ rating: star })}
                  className={cn(
                    "text-lg transition-colors",
                    star <= ((props.rating as number) || 0)
                      ? "text-warning"
                      : "text-muted-foreground/30 hover:text-warning/70"
                  )}
                >
                  ★
                </button>
              ))}
              <button
                onClick={() => onUpdateProps({ rating: 0 })}
                className="ml-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Style</Label>
              <select
                value={(props.variant as string) || "card"}
                onChange={(e) => onUpdateProps({ variant: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="card">Card</option>
                <option value="minimal">Minimal</option>
                <option value="bordered">Bordered</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Quote Style</Label>
              <select
                value={(props.quoteStyle as string) || "italic"}
                onChange={(e) => onUpdateProps({ quoteStyle: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="italic">Italic</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Type</Label>
              <select
                value={(props.style as string) || "line"}
                onChange={(e) => onUpdateProps({ style: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="line">Line</option>
                <option value="space">Space</option>
                <option value="dots">Dots</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Line Style</Label>
              <select
                value={(props.lineStyle as string) || "solid"}
                onChange={(e) => onUpdateProps({ lineStyle: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">
              {t("studio.builder.props.color") || "Color"}
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(props.color as string) || "#cccccc"}
                onChange={(e) => onUpdateProps({ color: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <Input
                value={(props.color as string) || "inherit"}
                onChange={(e) => onUpdateProps({ color: e.target.value })}
                placeholder="inherit"
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Thickness (px)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={(props.thickness as number) || 1}
                onChange={(e) => onUpdateProps({ thickness: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Width (%)</Label>
              <Input
                type="number"
                min={10}
                max={100}
                value={(props.widthPercent as number) || 100}
                onChange={(e) => onUpdateProps({ widthPercent: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Vertical Margin (px)</Label>
            <Input
              type="number"
              min={0}
              max={60}
              value={(props.marginY as number) || 16}
              onChange={(e) => onUpdateProps({ marginY: parseInt(e.target.value, 10) })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      );

    case "copyright":
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Text</Label>
            <Input
              value={(props.text as string) || ""}
              onChange={(e) => onUpdateProps({ text: e.target.value })}
              placeholder="© 2026 Company Name"
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">
                {t("studio.builder.props.year") || "Year"}
              </Label>
              <select
                value={(props.year as string) || "auto"}
                onChange={(e) => onUpdateProps({ year: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="auto">Auto (current year)</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Font Size</Label>
              <Input
                type="number"
                min={8}
                max={18}
                value={(props.fontSize as number) || 12}
                onChange={(e) => onUpdateProps({ fontSize: parseInt(e.target.value, 10) })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground">Show &quot;Powered by&quot;</span>
            <Switch
              checked={Boolean(props.poweredBy)}
              onCheckedChange={(checked) => onUpdateProps({ poweredBy: checked })}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">
              {t("studio.builder.props.color") || "Color"}
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  (props.color as string) !== "inherit"
                    ? (props.color as string) || "#888888"
                    : "#888888"
                }
                onChange={(e) => onUpdateProps({ color: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-border"
              />
              <Input
                value={(props.color as string) || "inherit"}
                onChange={(e) => onUpdateProps({ color: e.target.value })}
                placeholder="inherit"
                className="h-8 flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Text Align</Label>
            <div className="mt-0.5 flex gap-1">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdateProps({ textAlign: align })}
                  className={cn(
                    "h-7 flex-1 rounded-md border text-[10px] font-medium transition-colors",
                    (props.textAlign || "center") === align
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case "socialLogin":
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">
              {t("studio.builder.props.providers") || "Providers"}
            </Label>
            <div className="mt-1 space-y-1.5">
              {["google", "microsoft", "github", "apple"].map((provider) => {
                const providers = (
                  Array.isArray(props.providers) ? props.providers : []
                ) as string[];
                return (
                  <div key={provider} className="flex items-center gap-2">
                    <Checkbox
                      id={`provider-${provider}`}
                      checked={providers.includes(provider)}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...providers, provider]
                          : providers.filter((p) => p !== provider);
                        onUpdateProps({ providers: updated });
                      }}
                    />
                    <label
                      htmlFor={`provider-${provider}`}
                      className="cursor-pointer text-xs capitalize text-foreground"
                    >
                      {provider}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Layout</Label>
            <select
              value={(props.layout as string) || "row"}
              onChange={(e) => onUpdateProps({ layout: e.target.value })}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="grid">Grid</option>
            </select>
          </div>
        </div>
      );

    case "featureList": {
      const featureItems = (Array.isArray(props.items) ? props.items : []) as Array<{
        title: string;
        desc?: string;
      }>;
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">
              {t("studio.builder.props.variant") || "Variant"}
            </Label>
            <select
              value={(props.variant as string) || "list"}
              onChange={(e) => onUpdateProps({ variant: e.target.value })}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="list">{t("studio.builder.props.variantList") || "List"}</option>
              <option value="grid">{t("studio.builder.props.variantGrid") || "Grid"}</option>
            </select>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">
              {t("studio.builder.props.maxItems") || "Max Items"}
            </Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={(props.maxItems as number) || 6}
              onChange={(e) => onUpdateProps({ maxItems: parseInt(e.target.value, 10) || 6 })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">
                {t("studio.builder.props.items") || "Items"}
              </Label>
              <button
                onClick={() => {
                  const newItems = [
                    ...featureItems,
                    { title: `Feature ${featureItems.length + 1}`, desc: "" },
                  ];
                  onUpdateProps({ items: newItems });
                }}
                className="text-[10px] text-primary transition-colors hover:text-primary/80"
              >
                + {t("studio.builder.props.addItem") || "Add"}
              </button>
            </div>
            {featureItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-1 rounded border border-border/50 bg-muted/20 p-1.5"
              >
                <div className="flex-1 space-y-1">
                  <Input
                    value={item.title || ""}
                    onChange={(e) => {
                      const updated = [...featureItems];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      onUpdateProps({ items: updated });
                    }}
                    placeholder={t("studio.builder.props.featureTitle") || "Title"}
                    className="h-6 text-[10px]"
                  />
                  <Input
                    value={item.desc || ""}
                    onChange={(e) => {
                      const updated = [...featureItems];
                      updated[idx] = { ...updated[idx], desc: e.target.value };
                      onUpdateProps({ items: updated });
                    }}
                    placeholder={t("studio.builder.props.featureDesc") || "Description"}
                    className="h-6 text-[10px]"
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = featureItems.filter((_, i) => i !== idx);
                    onUpdateProps({ items: updated });
                  }}
                  className="mt-0.5 shrink-0 p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {featureItems.length === 0 && (
              <p className="text-[10px] italic text-muted-foreground">
                {t("studio.builder.props.noItems") ||
                  "Default items shown. Add custom items above."}
              </p>
            )}
          </div>
        </div>
      );
    }

    case "footer": {
      const footerLinks = (Array.isArray(props.links) ? props.links : []) as Array<{
        label: string;
        url: string;
      }>;
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">
              {t("studio.builder.props.links") || "Links"}
            </Label>
            <button
              onClick={() => {
                const newLinks = [
                  ...footerLinks,
                  { label: `Link ${footerLinks.length + 1}`, url: "#" },
                ];
                onUpdateProps({ links: newLinks });
              }}
              className="text-[10px] text-primary transition-colors hover:text-primary/80"
            >
              + {t("studio.builder.props.addLink") || "Add"}
            </button>
          </div>
          {footerLinks.map((link, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 rounded border border-border/50 bg-muted/20 p-1.5"
            >
              <div className="flex-1 space-y-1">
                <Input
                  value={link.label || ""}
                  onChange={(e) => {
                    const updated = [...footerLinks];
                    updated[idx] = { ...updated[idx], label: e.target.value };
                    onUpdateProps({ links: updated });
                  }}
                  placeholder={t("studio.builder.props.linkLabel") || "Label"}
                  className="h-6 text-[10px]"
                />
                <Input
                  value={link.url || ""}
                  onChange={(e) => {
                    const updated = [...footerLinks];
                    updated[idx] = { ...updated[idx], url: e.target.value };
                    onUpdateProps({ links: updated });
                  }}
                  placeholder={t("studio.builder.props.linkUrl") || "URL"}
                  className="h-6 text-[10px]"
                />
              </div>
              <button
                onClick={() => {
                  const updated = footerLinks.filter((_, i) => i !== idx);
                  onUpdateProps({ links: updated });
                }}
                className="shrink-0 p-0.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {footerLinks.length === 0 && (
            <p className="text-[10px] italic text-muted-foreground">
              {t("studio.builder.props.noLinks") || "Default links shown. Add custom links above."}
            </p>
          )}
        </div>
      );
    }

    case "customHtml":
      return (
        <div className="space-y-2">
          <CodeEditorField
            label={t("studio.builder.props.htmlContent") || "Custom HTML + CSS"}
            description={
              t("studio.builder.props.htmlWarning") || "⚠ Content is sanitized before rendering."
            }
            height={120}
            showPreview
            renderPreview={() => (
              <div className="scripe-custom-html text-sm">
                {(props.css as string) && (
                  <style dangerouslySetInnerHTML={{ __html: sanitizeCss(props.css as string) }} />
                )}
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      sanitizeRichHtml(props.content as string) ||
                      '<p class="text-nx-ink-3">No content yet</p>',
                  }}
                />
              </div>
            )}
            tabs={[
              {
                id: "html",
                label: "HTML",
                language: "html",
                value: (props.content as string) || "",
                onChange: (val) => onUpdateProps({ content: val }),
              },
              {
                id: "css",
                label: "CSS",
                language: "css",
                value: (props.css as string) || "",
                onChange: (val) => onUpdateProps({ css: val }),
              },
            ]}
          />
        </div>
      );

    case "videoBg":
      return (
        <div className="space-y-2">
          <VideoUploadField
            value={(props.src as string) || ""}
            onChange={(url) => onUpdateProps({ src: url })}
            label={t("studio.builder.props.videoUrl") || "Video URL"}
            description={
              t("studio.builder.props.videoUrlHint") || "Direct .mp4, .webm, or .ogg URL"
            }
          />
          <ImageUploadField
            value={(props.poster as string) || ""}
            onChange={(url) => onUpdateProps({ poster: url })}
            label={t("studio.builder.props.posterImage") || "Poster Image"}
            description={
              t("studio.builder.props.posterImageDesc") || "Shown while video loads or on mobile."
            }
          />
          {[
            { key: "autoplay", label: t("studio.builder.props.autoplay") || "Autoplay" },
            { key: "muted", label: t("studio.builder.props.muted") || "Muted" },
            { key: "loop", label: t("studio.builder.props.loop") || "Loop" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-foreground">{label}</span>
              <Switch
                checked={Boolean(props[key] ?? true)}
                onCheckedChange={(checked) => onUpdateProps({ [key]: checked })}
              />
            </div>
          ))}
        </div>
      );

    // forgotForm and resetForm are handled above (lines ~437-552)
    // with full form style/radius/button controls

    default:
      return (
        <p className="text-[10px] italic text-muted-foreground">
          {t("studio.builder.props.noSettings") || "No configurable settings"}
        </p>
      );
  }
}
