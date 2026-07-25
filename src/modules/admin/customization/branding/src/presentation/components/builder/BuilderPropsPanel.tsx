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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Slider } from "@core/ui/slider";
import { Trash2, Eye, EyeOff, Copy, ArrowUp, ArrowDown, Lock, Unlock } from "lucide-react";
import { ImageUploadField } from "@core/ui/image-upload-field";
import { VideoUploadField } from "@core/ui/video-upload-field";
import { CodeEditorField } from "@core/ui/code-editor-field";
import { ColorInput } from "../ColorInput";
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

const ALIGNMENT_VALUES: GridAlignment[] = ["start", "center", "end"];

/** Translate a grid-alignment value into its display label. */
function alignmentLabel(t: (key: string) => string, value: GridAlignment): string {
  switch (value) {
    case "start":
      return t("studio.builder.props.optionStart");
    case "end":
      return t("studio.builder.props.optionEnd");
    default:
      return t("studio.builder.props.optionCenter");
  }
}

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
  const visibilityLabel = component.visible
    ? t("studio.builder.visibility")
    : t("studio.builder.visibility");

  return (
    <div className="mt-4 space-y-4 border-t border-nx-line pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-nx-ink">
          {t(catalog?.labelKey || "") || component.type}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleVisibility(component.id)}
            className="flex h-7 w-7 items-center justify-center rounded-nx-sm transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus"
            title={visibilityLabel}
            aria-label={visibilityLabel}
          >
            {component.visible ? (
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
            )}
          </button>
          <button
            onClick={() => onDuplicate(component.id)}
            className="flex h-7 w-7 items-center justify-center rounded-nx-sm transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus"
            title={t("studio.builder.duplicate")}
            aria-label={t("studio.builder.duplicate")}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {!catalog?.required && (
            <button
              onClick={() => onRemove(component.id)}
              className="flex h-7 w-7 items-center justify-center rounded-nx-sm text-nx-danger transition-colors duration-nx-micro ease-nx-enter hover:bg-destructive/10 motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus"
              title={t("studio.builder.remove")}
              aria-label={t("studio.builder.remove")}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
              <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
                {t("studio.builder.props.position")}
              </p>
              <button
                onClick={() => (component.locked ? onUnlock(component.id) : onLock(component.id))}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-nx-sm transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
                  component.locked
                    ? "bg-destructive/10 text-nx-danger"
                    : "text-nx-ink-3 hover:bg-nx-hover"
                )}
                title={component.locked ? t("studio.builder.unlock") : t("studio.builder.lock")}
                aria-label={component.locked ? t("studio.builder.unlock") : t("studio.builder.lock")}
              >
                {component.locked ? (
                  <Lock className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Unlock className="h-3 w-3" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.posX")}
                </Label>
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
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.posY")}
                </Label>
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
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.dimW")}
                </Label>
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
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.dimH")}
                </Label>
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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("studio.builder.props.gridPlacement")}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.colStart")}
                </Label>
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
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.colEnd")}
                </Label>
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
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.rowStart")}
                </Label>
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
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.rowEnd")}
                </Label>
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
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.hAlign")}
                </Label>
                <Select
                  value={component.alignment}
                  onValueChange={(v) => onUpdate(component.id, { alignment: v as GridAlignment })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALIGNMENT_VALUES.map((value) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {alignmentLabel(t, value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-nx-ink-3">
                  {t("studio.builder.props.vAlign")}
                </Label>
                <Select
                  value={component.verticalAlignment}
                  onValueChange={(v) =>
                    onUpdate(component.id, { verticalAlignment: v as GridAlignment })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALIGNMENT_VALUES.map((value) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {alignmentLabel(t, value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Z-Order */}
        <div className="flex items-center gap-2">
          <Label className="flex-1 text-[10px] text-nx-ink-3">
            {t("studio.builder.props.zIndex")}
          </Label>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onReorderZ(component.id, "forward")}
            aria-label={t("studio.builder.bringForward")}
          >
            <ArrowUp className="h-3 w-3" aria-hidden="true" />
          </Button>
          <span className="w-6 text-center font-mono text-xs tabular-nums">
            {component.zIndex}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onReorderZ(component.id, "back")}
            aria-label={t("studio.builder.sendBack")}
          >
            <ArrowDown className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Component-Specific Props */}
      <div className="space-y-3 border-t border-nx-line pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
          {t("studio.builder.props.componentSettings")}
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
            label={t("studio.builder.props.logoImage")}
            description={t("studio.builder.props.logoImageDesc")}
            maxSizeBytes={2 * 1024 * 1024}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.maxWidthPx")}
              </Label>
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
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.shape")}
              </Label>
              <Select
                value={(props.shape as string) || "auto"}
                onValueChange={(v) => onUpdateProps({ shape: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto" className="text-xs">
                    {t("studio.builder.props.shapeAuto")}
                  </SelectItem>
                  <SelectItem value="circle" className="text-xs">
                    {t("studio.builder.props.shapeCircle")}
                  </SelectItem>
                  <SelectItem value="square" className="text-xs">
                    {t("studio.builder.props.shapeSquare")}
                  </SelectItem>
                  <SelectItem value="rounded" className="text-xs">
                    {t("studio.builder.props.shapeRounded")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.linkUrl")}
            </Label>
            <Input
              value={(props.linkUrl as string) || ""}
              onChange={(e) => onUpdateProps({ linkUrl: e.target.value })}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.opacity")}
            </Label>
            <Slider
              value={[(props.opacity as number) ?? 100]}
              onValueChange={([v]) => onUpdateProps({ opacity: v })}
              min={0}
              max={100}
              step={1}
            />
            <span className="text-[9px] tabular-nums text-nx-ink-3">
              {(props.opacity as number) ?? 100}%
            </span>
          </div>
        </div>
      );

    case "loginForm":
      return (
        <div className="space-y-2">
          <Label className="text-[10px] font-semibold text-nx-ink-3">
            {t("studio.builder.props.visibilitySection")}
          </Label>
          {[
            { key: "showSocial", label: t("studio.builder.props.showSocial") },
            { key: "showRemember", label: t("studio.builder.props.showRemember") },
            { key: "showForgot", label: t("studio.builder.props.showForgot") },
            { key: "showRegister", label: t("studio.builder.props.showRegister") },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-nx-ink">{label}</span>
              <Switch
                checked={Boolean(props[key])}
                onCheckedChange={(checked) => onUpdateProps({ [key]: checked })}
              />
            </div>
          ))}
          <div className="border-t border-nx-line/50 pt-2">
            <Label className="text-[10px] font-semibold text-nx-ink-3">
              {t("studio.builder.props.formStyleSection")}
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.style")}
              </Label>
              <Select
                value={(props.formStyle as string) || "card"}
                onValueChange={(v) => onUpdateProps({ formStyle: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card" className="text-xs">
                    {t("studio.builder.props.styleCard")}
                  </SelectItem>
                  <SelectItem value="flat" className="text-xs">
                    {t("studio.builder.props.styleFlat")}
                  </SelectItem>
                  <SelectItem value="glass" className="text-xs">
                    {t("studio.builder.props.styleGlass")}
                  </SelectItem>
                  <SelectItem value="bordered" className="text-xs">
                    {t("studio.builder.props.styleBordered")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.borderRadius")}
              </Label>
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
            <ColorInput
              label={t("studio.builder.props.cardBackground")}
              value={(props.cardBg as string) || ""}
              onChange={(v) => onUpdateProps({ cardBg: v })}
            />
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.paddingPx")}
            </Label>
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
            { key: "showBackToLogin", label: t("studio.builder.props.showBackToLogin") },
            { key: "showIcon", label: t("studio.builder.props.showKeyIcon") },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-nx-ink">{label}</span>
              <Switch
                checked={Boolean(props[key] ?? true)}
                onCheckedChange={(checked) => onUpdateProps({ [key]: checked })}
              />
            </div>
          ))}
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.descriptionText")}
            </Label>
            <Input
              value={(props.description as string) || ""}
              onChange={(e) => onUpdateProps({ description: e.target.value })}
              placeholder={t("studio.builder.props.forgotDescriptionPlaceholder")}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.buttonLabel")}
            </Label>
            <Input
              value={(props.buttonLabel as string) || ""}
              onChange={(e) => onUpdateProps({ buttonLabel: e.target.value })}
              placeholder={t("studio.builder.props.forgotButtonPlaceholder")}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.style")}
              </Label>
              <Select
                value={(props.formStyle as string) || "card"}
                onValueChange={(v) => onUpdateProps({ formStyle: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card" className="text-xs">
                    {t("studio.builder.props.styleCard")}
                  </SelectItem>
                  <SelectItem value="flat" className="text-xs">
                    {t("studio.builder.props.styleFlat")}
                  </SelectItem>
                  <SelectItem value="glass" className="text-xs">
                    {t("studio.builder.props.styleGlass")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.borderRadius")}
              </Label>
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
            {
              key: "showPasswordStrength",
              label: t("studio.builder.props.showPasswordStrength"),
            },
            {
              key: "showConfirmPassword",
              label: t("studio.builder.props.showConfirmPassword"),
            },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-nx-ink">{label}</span>
              <Switch
                checked={Boolean(props[key] ?? true)}
                onCheckedChange={(checked) => onUpdateProps({ [key]: checked })}
              />
            </div>
          ))}
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.buttonLabel")}
            </Label>
            <Input
              value={(props.buttonLabel as string) || ""}
              onChange={(e) => onUpdateProps({ buttonLabel: e.target.value })}
              placeholder={t("studio.builder.props.resetButtonPlaceholder")}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.style")}
              </Label>
              <Select
                value={(props.formStyle as string) || "card"}
                onValueChange={(v) => onUpdateProps({ formStyle: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card" className="text-xs">
                    {t("studio.builder.props.styleCard")}
                  </SelectItem>
                  <SelectItem value="flat" className="text-xs">
                    {t("studio.builder.props.styleFlat")}
                  </SelectItem>
                  <SelectItem value="glass" className="text-xs">
                    {t("studio.builder.props.styleGlass")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.borderRadius")}
              </Label>
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
            <Label className="text-[10px] text-nx-ink-3">{t("studio.builder.props.text")}</Label>
            <Input
              value={(props.text as string) || ""}
              onChange={(e) => onUpdateProps({ text: e.target.value })}
              placeholder={
                type === "heading"
                  ? t("studio.builder.comp.headingDesc")
                  : t("studio.builder.comp.subtitleDesc")
              }
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.fontSizePx")}
              </Label>
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
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.fontWeight")}
              </Label>
              <Select
                value={String((props.fontWeight as number) || (type === "heading" ? 700 : 400))}
                onValueChange={(v) => onUpdateProps({ fontWeight: parseInt(v, 10) })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                    <SelectItem key={w} value={String(w)} className="text-xs">
                      {w}
                      {w === 400
                        ? ` (${t("studio.builder.props.fontWeightRegular")})`
                        : w === 700
                          ? ` (${t("studio.builder.props.fontWeightBold")})`
                          : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <ColorInput
              label={t("studio.builder.props.color")}
              value={(props.color as string) !== "inherit" ? (props.color as string) || "" : ""}
              onChange={(v) => onUpdateProps({ color: v })}
            />
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.textAlign")}
            </Label>
            <div className="mt-0.5 flex gap-1">
              {/* UI-EXCEPTION: compact studio layout */}
              {(
                [
                  { value: "left", label: t("studio.builder.props.dirLeft") },
                  { value: "center", label: t("studio.builder.props.optionCenter") },
                  { value: "right", label: t("studio.builder.props.dirRight") },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdateProps({ textAlign: value })}
                  className={cn(
                    "h-7 flex-1 rounded-nx-sm border text-[10px] font-medium transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
                    (props.textAlign || "center") === value
                      ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
                      : "border-nx-line bg-nx-ground text-nx-ink-3 hover:bg-nx-hover"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.textTransform")}
              </Label>
              <Select
                value={(props.textTransform as string) || "none"}
                onValueChange={(v) => onUpdateProps({ textTransform: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    {t("studio.builder.props.optionNone")}
                  </SelectItem>
                  <SelectItem value="uppercase" className="text-xs">
                    {t("studio.builder.props.transformUppercase")}
                  </SelectItem>
                  <SelectItem value="capitalize" className="text-xs">
                    {t("studio.builder.props.transformCapitalize")}
                  </SelectItem>
                  <SelectItem value="lowercase" className="text-xs">
                    {t("studio.builder.props.transformLowercase")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.letterSpacing")}
              </Label>
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
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.lineHeight")}
            </Label>
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
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.opacity")}
            </Label>
            <Slider
              value={[(props.opacity as number) ?? 100]}
              onValueChange={([v]) => onUpdateProps({ opacity: v })}
              min={0}
              max={100}
              step={1}
            />
            <span className="text-[9px] tabular-nums text-nx-ink-3">
              {(props.opacity as number) ?? 100}%
            </span>
          </div>
        </div>
      );

    case "ctaButton":
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-nx-ink-3">{t("studio.builder.props.label")}</Label>
            <Input
              value={(props.label as string) || ""}
              onChange={(e) => onUpdateProps({ label: e.target.value })}
              placeholder={t("studio.builder.comp.ctaButton")}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.linkUrl")}
            </Label>
            <Input
              value={(props.url as string) || ""}
              onChange={(e) => onUpdateProps({ url: e.target.value })}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.variant")}
              </Label>
              <Select
                value={(props.variant as string) || "default"}
                onValueChange={(v) => onUpdateProps({ variant: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" className="text-xs">
                    {t("studio.builder.props.ctaVariantFilled")}
                  </SelectItem>
                  <SelectItem value="outline" className="text-xs">
                    {t("studio.builder.props.ctaVariantOutline")}
                  </SelectItem>
                  <SelectItem value="ghost" className="text-xs">
                    {t("studio.builder.props.ctaVariantGhost")}
                  </SelectItem>
                  <SelectItem value="secondary" className="text-xs">
                    {t("studio.builder.props.ctaVariantSecondary")}
                  </SelectItem>
                  <SelectItem value="destructive" className="text-xs">
                    {t("studio.builder.props.ctaVariantDestructive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.size")}
              </Label>
              <Select
                value={(props.size as string) || "md"}
                onValueChange={(v) => onUpdateProps({ size: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm" className="text-xs">
                    {t("studio.builder.props.scaleSmall")}
                  </SelectItem>
                  <SelectItem value="md" className="text-xs">
                    {t("studio.builder.props.scaleMedium")}
                  </SelectItem>
                  <SelectItem value="lg" className="text-xs">
                    {t("studio.builder.props.scaleLarge")}
                  </SelectItem>
                  <SelectItem value="xl" className="text-xs">
                    {t("studio.builder.props.scaleExtraLarge")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-nx-ink">{t("studio.builder.props.fullWidth")}</span>
            <Switch
              checked={Boolean(props.fullWidth)}
              onCheckedChange={(checked) => onUpdateProps({ fullWidth: checked })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.borderRadiusPx")}
              </Label>
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
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.iconPosition")}
              </Label>
              <Select
                value={(props.iconPosition as string) || "none"}
                onValueChange={(v) => onUpdateProps({ iconPosition: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    {t("studio.builder.props.iconPositionNone")}
                  </SelectItem>
                  <SelectItem value="left" className="text-xs">
                    {t("studio.builder.props.dirLeft")}
                  </SelectItem>
                  <SelectItem value="right" className="text-xs">
                    {t("studio.builder.props.dirRight")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <ColorInput
              label={t("studio.builder.props.bgColor")}
              value={(props.bgColor as string) || ""}
              onChange={(v) => onUpdateProps({ bgColor: v })}
            />
          </div>
          <div>
            <ColorInput
              label={t("studio.builder.props.textColorField")}
              value={(props.textColor as string) || ""}
              onChange={(v) => onUpdateProps({ textColor: v })}
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <ImageUploadField
            value={(props.src as string) || ""}
            onChange={(url) => onUpdateProps({ src: url })}
            label={t("studio.builder.props.imageSource")}
            description={t("studio.builder.props.imageSourceDesc")}
          />
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.altText")}
            </Label>
            <Input
              value={(props.alt as string) || ""}
              onChange={(e) => onUpdateProps({ alt: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.objectFit")}
              </Label>
              <Select
                value={(props.objectFit as string) || "cover"}
                onValueChange={(v) => onUpdateProps({ objectFit: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover" className="text-xs">
                    {t("studio.builder.props.objectFitCover")}
                  </SelectItem>
                  <SelectItem value="contain" className="text-xs">
                    {t("studio.builder.props.objectFitContain")}
                  </SelectItem>
                  <SelectItem value="fill" className="text-xs">
                    {t("studio.builder.props.objectFitFill")}
                  </SelectItem>
                  <SelectItem value="none" className="text-xs">
                    {t("studio.builder.props.optionNone")}
                  </SelectItem>
                  <SelectItem value="scale-down" className="text-xs">
                    {t("studio.builder.props.objectFitScaleDown")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.objectPosition")}
              </Label>
              <Select
                value={(props.objectPosition as string) || "center"}
                onValueChange={(v) => onUpdateProps({ objectPosition: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center" className="text-xs">
                    {t("studio.builder.props.optionCenter")}
                  </SelectItem>
                  <SelectItem value="top" className="text-xs">
                    {t("studio.builder.props.dirTop")}
                  </SelectItem>
                  <SelectItem value="bottom" className="text-xs">
                    {t("studio.builder.props.dirBottom")}
                  </SelectItem>
                  <SelectItem value="left" className="text-xs">
                    {t("studio.builder.props.dirLeft")}
                  </SelectItem>
                  <SelectItem value="right" className="text-xs">
                    {t("studio.builder.props.dirRight")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.borderRadiusPx")}
              </Label>
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
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.shadowLabel")}
              </Label>
              <Select
                value={(props.shadow as string) || "none"}
                onValueChange={(v) => onUpdateProps({ shadow: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    {t("studio.builder.props.optionNone")}
                  </SelectItem>
                  <SelectItem value="sm" className="text-xs">
                    {t("studio.builder.props.scaleSmall")}
                  </SelectItem>
                  <SelectItem value="md" className="text-xs">
                    {t("studio.builder.props.scaleMedium")}
                  </SelectItem>
                  <SelectItem value="lg" className="text-xs">
                    {t("studio.builder.props.scaleLarge")}
                  </SelectItem>
                  <SelectItem value="xl" className="text-xs">
                    {t("studio.builder.props.scaleExtraLarge")}
                  </SelectItem>
                  <SelectItem value="2xl" className="text-xs">
                    {t("studio.builder.props.scaleDramatic")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.opacity")}
            </Label>
            <Slider
              value={[(props.opacity as number) ?? 100]}
              onValueChange={([v]) => onUpdateProps({ opacity: v })}
              min={0}
              max={100}
              step={1}
            />
            <span className="text-[9px] tabular-nums text-nx-ink-3">
              {(props.opacity as number) ?? 100}%
            </span>
          </div>
        </div>
      );

    case "testimonial":
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-nx-ink-3">{t("studio.builder.props.quote")}</Label>
            <Textarea
              value={(props.quote as string) || ""}
              onChange={(e) => onUpdateProps({ quote: e.target.value })}
              placeholder={t("studio.builder.comp.testimonialDesc")}
              className="h-20 resize-none text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.author")}
              </Label>
              <Input
                value={(props.author as string) || ""}
                onChange={(e) => onUpdateProps({ author: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">{t("studio.builder.props.role")}</Label>
              <Input
                value={(props.role as string) || ""}
                onChange={(e) => onUpdateProps({ role: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <ImageUploadField
            value={(props.avatar as string) || ""}
            onChange={(url) => onUpdateProps({ avatar: url })}
            label={t("studio.builder.props.avatar")}
            description={t("studio.builder.props.avatarDesc")}
          />
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.rating")}
            </Label>
            <div className="mt-0.5 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                // UI-EXCEPTION: compact studio layout
                <button
                  key={star}
                  onClick={() => onUpdateProps({ rating: star })}
                  className={cn(
                    "text-lg transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
                    star <= ((props.rating as number) || 0)
                      ? "text-warning"
                      : "text-nx-ink-3 hover:text-warning/70"
                  )}
                  aria-label={t("studio.builder.props.ratingValue", { count: star })}
                >
                  ★
                </button>
              ))}
              <button
                onClick={() => onUpdateProps({ rating: 0 })}
                className="ms-1 text-[10px] text-nx-ink-3 hover:text-nx-ink"
              >
                {t("studio.builder.props.clear")}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.style")}
              </Label>
              <Select
                value={(props.variant as string) || "card"}
                onValueChange={(v) => onUpdateProps({ variant: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card" className="text-xs">
                    {t("studio.builder.props.styleCard")}
                  </SelectItem>
                  <SelectItem value="minimal" className="text-xs">
                    {t("studio.builder.props.styleMinimal")}
                  </SelectItem>
                  <SelectItem value="bordered" className="text-xs">
                    {t("studio.builder.props.styleBordered")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.quoteStyle")}
              </Label>
              <Select
                value={(props.quoteStyle as string) || "italic"}
                onValueChange={(v) => onUpdateProps({ quoteStyle: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="italic" className="text-xs">
                    {t("studio.builder.props.quoteStyleItalic")}
                  </SelectItem>
                  <SelectItem value="normal" className="text-xs">
                    {t("studio.builder.props.quoteStyleNormal")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.dividerType")}
              </Label>
              <Select
                value={(props.style as string) || "line"}
                onValueChange={(v) => onUpdateProps({ style: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line" className="text-xs">
                    {t("studio.builder.props.dividerTypeLine")}
                  </SelectItem>
                  <SelectItem value="space" className="text-xs">
                    {t("studio.builder.props.dividerTypeSpace")}
                  </SelectItem>
                  <SelectItem value="dots" className="text-xs">
                    {t("studio.builder.props.dividerTypeDots")}
                  </SelectItem>
                  <SelectItem value="gradient" className="text-xs">
                    {t("studio.builder.props.dividerTypeGradient")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.lineStyle")}
              </Label>
              <Select
                value={(props.lineStyle as string) || "solid"}
                onValueChange={(v) => onUpdateProps({ lineStyle: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid" className="text-xs">
                    {t("studio.builder.props.lineStyleSolid")}
                  </SelectItem>
                  <SelectItem value="dashed" className="text-xs">
                    {t("studio.builder.props.lineStyleDashed")}
                  </SelectItem>
                  <SelectItem value="dotted" className="text-xs">
                    {t("studio.builder.props.lineStyleDotted")}
                  </SelectItem>
                  <SelectItem value="double" className="text-xs">
                    {t("studio.builder.props.lineStyleDouble")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <ColorInput
              label={t("studio.builder.props.color")}
              value={(props.color as string) !== "inherit" ? (props.color as string) || "" : ""}
              onChange={(v) => onUpdateProps({ color: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.thicknessPx")}
              </Label>
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
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.widthPercent")}
              </Label>
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
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.marginYPx")}
            </Label>
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
            <Label className="text-[10px] text-nx-ink-3">{t("studio.builder.props.text")}</Label>
            <Input
              value={(props.text as string) || ""}
              onChange={(e) => onUpdateProps({ text: e.target.value })}
              placeholder={t("studio.builder.comp.copyrightDesc")}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.year")}
              </Label>
              <Select
                value={(props.year as string) || "auto"}
                onValueChange={(v) => onUpdateProps({ year: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto" className="text-xs">
                    {t("studio.builder.props.yearAuto")}
                  </SelectItem>
                  <SelectItem value="2024" className="text-xs">
                    2024
                  </SelectItem>
                  <SelectItem value="2025" className="text-xs">
                    2025
                  </SelectItem>
                  <SelectItem value="2026" className="text-xs">
                    2026
                  </SelectItem>
                  <SelectItem value="2027" className="text-xs">
                    2027
                  </SelectItem>
                  <SelectItem value="2028" className="text-xs">
                    2028
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.fontSize")}
              </Label>
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
            <span className="text-xs text-nx-ink">{t("studio.builder.props.poweredBy")}</span>
            <Switch
              checked={Boolean(props.poweredBy)}
              onCheckedChange={(checked) => onUpdateProps({ poweredBy: checked })}
            />
          </div>
          <div>
            <ColorInput
              label={t("studio.builder.props.color")}
              value={(props.color as string) !== "inherit" ? (props.color as string) || "" : ""}
              onChange={(v) => onUpdateProps({ color: v })}
            />
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.textAlign")}
            </Label>
            <div className="mt-0.5 flex gap-1">
              {(
                [
                  { value: "left", label: t("studio.builder.props.dirLeft") },
                  { value: "center", label: t("studio.builder.props.optionCenter") },
                  { value: "right", label: t("studio.builder.props.dirRight") },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdateProps({ textAlign: value })}
                  className={cn(
                    "h-7 flex-1 rounded-nx-sm border text-[10px] font-medium transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
                    (props.textAlign || "center") === value
                      ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
                      : "border-nx-line bg-nx-ground text-nx-ink-3 hover:bg-nx-hover"
                  )}
                >
                  {label}
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
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.providers")}
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
                    {/* Provider names are brand names — not localized. */}
                    <label
                      htmlFor={`provider-${provider}`}
                      className="cursor-pointer text-xs capitalize text-nx-ink"
                    >
                      {provider}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.layout")}
            </Label>
            <Select
              value={(props.layout as string) || "row"}
              onValueChange={(v) => onUpdateProps({ layout: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="row" className="text-xs">
                  {t("studio.builder.props.layoutRow")}
                </SelectItem>
                <SelectItem value="column" className="text-xs">
                  {t("studio.builder.props.layoutColumn")}
                </SelectItem>
                <SelectItem value="grid" className="text-xs">
                  {t("studio.builder.props.optionGrid")}
                </SelectItem>
              </SelectContent>
            </Select>
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
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.variant")}
            </Label>
            <Select
              value={(props.variant as string) || "list"}
              onValueChange={(v) => onUpdateProps({ variant: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list" className="text-xs">
                  {t("studio.builder.props.variantList")}
                </SelectItem>
                <SelectItem value="grid" className="text-xs">
                  {t("studio.builder.props.optionGrid")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.maxItems")}
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
              <Label className="text-[10px] text-nx-ink-3">
                {t("studio.builder.props.items")}
              </Label>
              <button
                onClick={() => {
                  const newItems = [
                    ...featureItems,
                    { title: `Feature ${featureItems.length + 1}`, desc: "" },
                  ];
                  onUpdateProps({ items: newItems });
                }}
                className="text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-ink"
              >
                + {t("studio.builder.props.addItem")}
              </button>
            </div>
            {featureItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-1 rounded-nx-sm border border-nx-line bg-nx-raised p-1.5"
              >
                <div className="flex-1 space-y-1">
                  <Input
                    value={item.title || ""}
                    onChange={(e) => {
                      const updated = [...featureItems];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      onUpdateProps({ items: updated });
                    }}
                    placeholder={t("studio.builder.props.featureTitle")}
                    className="h-6 text-[10px]"
                  />
                  <Input
                    value={item.desc || ""}
                    onChange={(e) => {
                      const updated = [...featureItems];
                      updated[idx] = { ...updated[idx], desc: e.target.value };
                      onUpdateProps({ items: updated });
                    }}
                    placeholder={t("studio.builder.props.featureDesc")}
                    className="h-6 text-[10px]"
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = featureItems.filter((_, i) => i !== idx);
                    onUpdateProps({ items: updated });
                  }}
                  className="mt-0.5 shrink-0 p-0.5 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-danger"
                  aria-label={t("studio.builder.props.removeItem")}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ))}
            {featureItems.length === 0 && (
              <p className="text-[10px] italic text-nx-ink-3">
                {t("studio.builder.props.noItems")}
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
            <Label className="text-[10px] text-nx-ink-3">
              {t("studio.builder.props.links")}
            </Label>
            <button
              onClick={() => {
                const newLinks = [
                  ...footerLinks,
                  { label: `Link ${footerLinks.length + 1}`, url: "#" },
                ];
                onUpdateProps({ links: newLinks });
              }}
              className="text-[10px] text-nx-accent transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-ink"
            >
              + {t("studio.builder.props.addLink")}
            </button>
          </div>
          {footerLinks.map((link, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 rounded-nx-sm border border-nx-line bg-nx-raised p-1.5"
            >
              <div className="flex-1 space-y-1">
                <Input
                  value={link.label || ""}
                  onChange={(e) => {
                    const updated = [...footerLinks];
                    updated[idx] = { ...updated[idx], label: e.target.value };
                    onUpdateProps({ links: updated });
                  }}
                  placeholder={t("studio.builder.props.linkLabel")}
                  className="h-6 text-[10px]"
                />
                <Input
                  value={link.url || ""}
                  onChange={(e) => {
                    const updated = [...footerLinks];
                    updated[idx] = { ...updated[idx], url: e.target.value };
                    onUpdateProps({ links: updated });
                  }}
                  placeholder={t("studio.builder.props.linkUrl")}
                  className="h-6 text-[10px]"
                />
              </div>
              <button
                onClick={() => {
                  const updated = footerLinks.filter((_, i) => i !== idx);
                  onUpdateProps({ links: updated });
                }}
                className="shrink-0 p-0.5 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-danger"
                aria-label={t("studio.builder.props.removeItem")}
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ))}
          {footerLinks.length === 0 && (
            <p className="text-[10px] italic text-nx-ink-3">
              {t("studio.builder.props.noLinks")}
            </p>
          )}
        </div>
      );
    }

    case "customHtml":
      return (
        <div className="space-y-2">
          <CodeEditorField
            label={t("studio.builder.props.htmlContent")}
            description={t("studio.builder.props.htmlWarning")}
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
            label={t("studio.builder.props.videoUrl")}
            description={t("studio.builder.props.videoUrlHint")}
          />
          <ImageUploadField
            value={(props.poster as string) || ""}
            onChange={(url) => onUpdateProps({ poster: url })}
            label={t("studio.builder.props.posterImage")}
            description={t("studio.builder.props.posterImageDesc")}
          />
          {[
            { key: "autoplay", label: t("studio.builder.props.autoplay") },
            { key: "muted", label: t("studio.builder.props.muted") },
            { key: "loop", label: t("studio.builder.props.loop") },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-nx-ink">{label}</span>
              <Switch
                checked={Boolean(props[key] ?? true)}
                onCheckedChange={(checked) => onUpdateProps({ [key]: checked })}
              />
            </div>
          ))}
        </div>
      );

    // forgotForm and resetForm are handled above
    // with full form style/radius/button controls

    default:
      return (
        <p className="text-[10px] italic text-nx-ink-3">
          {t("studio.builder.props.noSettings")}
        </p>
      );
  }
}
