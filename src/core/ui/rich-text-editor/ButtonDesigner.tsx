"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Slider } from "@core/ui/slider";
import { Switch } from "@core/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@core/ui/form";
import { useI18n } from "@core/providers/i18n-provider";
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

// `text` is filled in at mount from the locale pack — the panel opens with a
// usable label already typed, and that label has to be readable in both builds.
const DEFAULT_CONFIG: Omit<ButtonConfig, "text"> = {
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

// COLOUR EXCEPTION — bgColor/textColor above and CTA_SHADOW below are
// deliberately literal. This designer emits raw inline-styled HTML for a
// TRANSACTIONAL EMAIL, rendered by third-party mail clients that do not
// evaluate our app's CSS (custom properties like var(--nx-accent) are
// unsupported or stripped in Outlook, Gmail and Apple Mail). The literals are
// just a sensible starting colour for the CTA the user is designing, not this
// app's own chrome — they must stay literal so the live preview stays
// byte-for-byte identical to the exported HTML. Every surrounding surface in
// this panel is on tokens.
const CTA_SHADOW = "0 4px 14px 0 rgba(0,0,0,0.15)";

// ─── Main Component ─────────────────────────────────────────
export function ButtonDesigner({ onInsert }: ButtonDesignerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  // The label the recipient reads when the author clears the field. Resolved
  // once here so the preview, the exported HTML and the block title cannot
  // drift apart.
  const fallbackText = t("editorBlocks.button.textFallback");
  const buildDefaults = (): ButtonConfig => ({ ...DEFAULT_CONFIG, text: fallbackText });

  const form = useForm<ButtonConfig>({ defaultValues: buildDefaults() });
  // useWatch, not form.watch(): watch() hands back a function the React
  // Compiler cannot memoize, so the whole component drops out of compilation.
  // The defaultValue makes every key present, which is what the cast asserts.
  const config = useWatch({ control: form.control, defaultValue: buildDefaults() }) as ButtonConfig;

  // Generate email-safe TABLE-based button HTML (works in Outlook, Gmail, Apple Mail)
  const generateHtml = (values: ButtonConfig): string => {
    const widthStyle = values.fullWidth ? "width:100%;" : "";
    const shadowStyle = values.shadow ? `box-shadow:${CTA_SHADOW};` : "";

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto;border-collapse:collapse;${widthStyle}"><tr><td align="center" style="background:${values.bgColor};border-radius:${values.borderRadius}px;padding:${values.paddingY}px ${values.paddingX}px;${shadowStyle}"><a href="${values.url}" target="_blank" rel="noopener noreferrer" style="color:${values.textColor};font-size:${values.fontSize}px;font-weight:600;text-decoration:none;display:inline-block;line-height:1.4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${values.text || fallbackText}</a></td></tr></table>`;
  };

  const handleInsert = () => {
    const values = form.getValues();
    onInsert({
      html: generateHtml(values),
      label: t("editorBlocks.button.blockLabel", { text: values.text || fallbackText }),
      blockType: "button",
    });
    setOpen(false);
    form.reset(buildDefaults());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs font-medium"
          aria-label={t("editorBlocks.button.triggerLabel")}
        >
          <MousePointerClick className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("editorBlocks.button.trigger")}</span>
        </Button>
      </PopoverTrigger>
      {/* PopoverContent already caps its own height against the viewport and
          scrolls with overscroll containment — the panel does not re-cut it. */}
      <PopoverContent className="w-80" align="start" side="bottom" sideOffset={8}>
        <Form {...form}>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-nx-ink">
              {t("editorBlocks.button.title")}
            </h4>

            {/* Live Preview — mirrors generateHtml() byte-for-byte, including
                the literal colors/shadow (see COLOUR EXCEPTION above). It is a
                rendering of the CTA, not a control: a real <a> here was a tab
                stop that went nowhere. */}
            <div
              role="group"
              aria-label={t("editorBlocks.common.preview")}
              className="flex justify-center rounded-nx-md border border-nx-line bg-nx-ground p-4"
            >
              <span
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
                  boxShadow: config.shadow ? CTA_SHADOW : "none",
                }}
              >
                {config.text || fallbackText}
              </span>
            </div>

            {/* Text & URL */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">{t("editorBlocks.button.text")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("editorBlocks.button.textPlaceholder")}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">{t("editorBlocks.button.url")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("editorBlocks.button.urlPlaceholder")}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormDescription>{t("editorBlocks.button.urlHint")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Colors (side by side) — ColorPickerField owns its own field
                anatomy, so it is not wrapped in a second FormItem here. */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="bgColor"
                render={({ field }) => (
                  <ColorPickerField
                    label={t("editorBlocks.button.background")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <ColorPickerField
                    label={t("editorBlocks.button.textColor")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Border Radius */}
            <FormField
              control={form.control}
              name="borderRadius"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel className="text-xs">{t("editorBlocks.button.radius")}</FormLabel>
                    <span className="text-xs tabular-nums text-nx-ink-3">
                      {t("editorBlocks.common.px", { value: field.value })}
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([v]) => field.onChange(v)}
                      min={0}
                      max={50}
                      step={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Font Size */}
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel className="text-xs">{t("editorBlocks.button.fontSize")}</FormLabel>
                    <span className="text-xs tabular-nums text-nx-ink-3">
                      {t("editorBlocks.common.px", { value: field.value })}
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([v]) => field.onChange(v)}
                      min={12}
                      max={24}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Toggles */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="fullWidth"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 space-y-0">
                    <FormLabel className="text-xs">
                      {t("editorBlocks.button.fullWidth")}
                    </FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shadow"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 space-y-0">
                    <FormLabel className="text-xs">{t("editorBlocks.button.shadow")}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Insert */}
            <Button
              type="button"
              onClick={handleInsert}
              className="w-full"
              disabled={!config.text.trim() || !config.url.trim()}
            >
              {t("editorBlocks.button.insert")}
            </Button>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  );
}

export default ButtonDesigner;
