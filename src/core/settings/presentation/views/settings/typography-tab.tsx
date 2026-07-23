"use client";

import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { Toast, ToastContent, ToastProvider } from "@core/ui/enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings, type ToastStyle } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Separator } from "@core/ui/separator";
import { Check, Sparkles, Shield, ImageIcon, Type } from "lucide-react";
import { Logo } from "@core/ui/logo";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

/**
 * Wave C: pickers now list only the surviving variants. toastStyle collapsed
 * to classic/minimal/modern and switchStyle to default/ios/android (the
 * merge-engine migration maps stored legacy values onto these survivors).
 * The toast auto-dismiss duration picker was removed with its culled field.
 * Picker cards
 * are real focusable controls (buttons, or keyboard-operable cards where the
 * preview embeds interactive primitives that must not nest inside a button).
 */

/** Shared classes for selectable picker cards — focus law + transform motion. */
const pickerCardClass = (isSelected: boolean) =>
  cn(
    "relative cursor-pointer rounded-lg border-2 p-4 text-start transition-transform duration-nx-micro hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:shadow-nx-focus",
    isSelected
      ? "border-primary ring-2 ring-primary/20"
      : "border-muted hover:border-muted-foreground/50"
  );

/** Keyboard activation for role="button" cards (Enter / Space). */
const cardKeyHandler = (activate: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate();
  }
};

export function TypographyTab() {
  const { t } = useI18n();
  const settings = useSettings();
  const { success, error, warning, info } = useEnhancedToast();

  const fontSizes = [
    {
      value: "xs",
      name: t("fontSize.xs"),
      example: "text-xs",
      description: t("fontSize.xsDesc"),
    },
    {
      value: "small",
      name: t("fontSize.small"),
      example: "text-sm",
      description: t("fontSize.smallDesc"),
    },
    {
      value: "medium",
      name: t("fontSize.medium"),
      example: "text-base",
      description: t("fontSize.mediumDesc"),
    },
    {
      value: "default",
      name: t("fontSize.default"),
      example: "text-lg",
      description: t("fontSize.defaultDesc"),
    },
    {
      value: "large",
      name: t("fontSize.large"),
      example: "text-xl",
      description: t("fontSize.largeDesc"),
    },
    {
      value: "xl",
      name: t("fontSize.xl"),
      example: "text-2xl",
      description: t("fontSize.xlDesc"),
    },
  ];

  const borderRadiusOptions = [
    { value: "none", name: t("radius.none"), class: "rounded-none", px: "0px" },
    { value: "small", name: t("radius.small"), class: "rounded-sm", px: "2px" },
    { value: "default", name: t("radius.default"), class: "rounded", px: "4px" },
    { value: "large", name: t("radius.large"), class: "rounded-lg", px: "8px" },
    { value: "full", name: t("radius.full"), class: "rounded-full", px: "9999px" },
  ];

  const spacingOptions = [
    {
      value: "compact",
      name: t("settings.spacing.options.compact"),
      spacing: "p-2 gap-1",
    },
    {
      value: "default",
      name: t("settings.spacing.options.default"),
      spacing: "p-4 gap-2",
    },
    {
      value: "comfortable",
      name: t("settings.spacing.options.comfortable"),
      spacing: "p-6 gap-3",
    },
    {
      value: "spacious",
      name: t("settings.spacing.options.spacious"),
      spacing: "p-8 gap-4",
    },
  ];

  return (
    <>
      {/* Font Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.fontSizeSection.title")}</CardTitle>
          <CardDescription>{t("settings.fontSizeSection.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                type="button"
                className={pickerCardClass(settings.fontSize === size.value)}
                onClick={() => settings.setFontSize(size.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{size.name}</h4>
                  <p className={cn("text-muted-foreground", size.example)}>
                    {t(`settings.fontSizeSection.sampleTexts.${size.value}`)}
                  </p>
                  <p className="text-xs text-muted-foreground">{size.description}</p>
                </div>
                {settings.fontSize === size.value && (
                  <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.borderRadius.title")}</CardTitle>
          <CardDescription>{t("settings.borderRadius.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {borderRadiusOptions.map((radius) => (
              <button
                key={radius.value}
                type="button"
                className={cn(pickerCardClass(settings.borderRadius === radius.value), radius.class)}
                onClick={() => settings.setBorderRadius(radius.value as any)}
              >
                <div className={cn("h-8 w-full bg-muted", radius.class)}></div>
                <p className="mt-2 w-full text-center text-sm font-medium">{radius.name}</p>
                <p className="w-full text-center text-xs text-muted-foreground">{radius.px}</p>
                {settings.borderRadius === radius.value && (
                  <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.spacing.title")}</CardTitle>
          <CardDescription>{t("settings.spacing.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {spacingOptions.map((spacing) => (
              <button
                key={spacing.value}
                type="button"
                className={cn(pickerCardClass(settings.spacingSize === spacing.value), spacing.spacing)}
                onClick={() => settings.setSpacingSize(spacing.value as any)}
              >
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-full rounded bg-muted"></div>
                <p className="w-full text-center text-sm font-medium">{spacing.name}</p>
                {settings.spacingSize === spacing.value && (
                  <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.logo.title")}</CardTitle>
          <CardDescription>{t("settings.logo.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.logo.typeLabel")}</Label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { value: "sparkles", name: t("logoType.sparkles"), icon: Sparkles },
                { value: "shield", name: t("logoType.shield"), icon: Shield },
                { value: "image", name: t("logoType.image"), icon: ImageIcon },
                { value: "custom", name: t("logoType.customText"), icon: Type },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={pickerCardClass(settings.logoType === type.value)}
                  onClick={() => settings.setLogoType(type.value as any)}
                >
                  <div className="w-full space-y-2">
                    <div className="flex justify-center">
                      <type.icon className="h-8 w-8" />
                    </div>
                    <p className="text-center text-sm font-medium">{type.name}</p>
                  </div>
                  {settings.logoType === type.value && (
                    <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Logo Size */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.logo.sizeLabel")}</Label>
            <div className="grid grid-cols-5 gap-4">
              {[
                { value: "xs", name: t("settings.logo.sizeOptions.xs"), size: "h-4 w-4" },
                { value: "sm", name: t("settings.logo.sizeOptions.sm"), size: "h-5 w-5" },
                { value: "md", name: t("settings.logo.sizeOptions.md"), size: "h-6 w-6" },
                { value: "lg", name: t("settings.logo.sizeOptions.lg"), size: "h-8 w-8" },
                { value: "xl", name: t("settings.logo.sizeOptions.xl"), size: "h-10 w-10" },
              ].map((size) => (
                <button
                  key={size.value}
                  type="button"
                  className={pickerCardClass(settings.logoSize === size.value)}
                  onClick={() => settings.setLogoSize(size.value as any)}
                >
                  <div className="w-full space-y-2">
                    <div className="flex justify-center">
                      <Sparkles className={cn(size.size)} />
                    </div>
                    <p className="text-center text-xs font-medium">{size.name}</p>
                  </div>
                  {settings.logoSize === size.value && (
                    <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Logo Animation */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.logo.animationLabel")}</Label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  value: "none",
                  name: t("settings.logo.animationOptions.none.name"),
                  description: t("settings.logo.animationOptions.none.description"),
                },
                {
                  value: "spin",
                  name: t("settings.logo.animationOptions.spin.name"),
                  description: t("settings.logo.animationOptions.spin.description"),
                },
                {
                  value: "pulse",
                  name: t("settings.logo.animationOptions.pulse.name"),
                  description: t("settings.logo.animationOptions.pulse.description"),
                },
                {
                  value: "fancy",
                  name: t("settings.logo.animationOptions.fancy.name"),
                  description: t("settings.logo.animationOptions.fancy.description"),
                },
              ].map((animation) => (
                <button
                  key={animation.value}
                  type="button"
                  className={pickerCardClass(settings.logoAnimation === animation.value)}
                  onClick={() => settings.setLogoAnimation(animation.value as any)}
                >
                  <div className="w-full space-y-2">
                    <div className="flex justify-center">
                      <Sparkles
                        className={cn(
                          "h-6 w-6",
                          animation.value === "spin" && "animate-spin",
                          animation.value === "pulse" && "animate-pulse",
                          animation.value === "fancy" && "transition-transform hover:rotate-12"
                        )}
                      />
                    </div>
                    <p className="text-center text-sm font-medium">{animation.name}</p>
                    <p className="text-center text-xs text-muted-foreground">
                      {animation.description}
                    </p>
                  </div>
                  {settings.logoAnimation === animation.value && (
                    <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Logo Text */}
          {settings.logoType === "custom" && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t("settings.logo.textLabel")}</Label>
                <Input
                  value={settings.logoText}
                  onChange={(e) => settings.setLogoText(e.target.value)}
                  placeholder={t("settings.logo.textPlaceholder")}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">{t("settings.logo.textHelp")}</p>
              </div>
              <Separator />
            </>
          )}

          {settings.logoType === "image" && (
            <>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("settings.logo.imageInfo")}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Logo Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.logo.previewLabel")}</Label>
            <div className="flex items-center justify-center rounded-lg border bg-muted/20 p-6">
              <Logo showText={true} />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {t("settings.logo.previewHelp")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Toast Design Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.toast.title")}</CardTitle>
          <CardDescription>{t("settings.toast.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toast Design — surviving designs only; the toast component itself
              collapses stored legacy names onto these three. Cards stay divs
              (role="button") because the live Toast previews render list items
              that must not nest inside a native button. */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.toast.designLabel")}</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  value: "classic",
                  name: t("settings.toast.designOptions.classic.name"),
                  description: t("settings.toast.designOptions.classic.description"),
                },
                {
                  value: "minimal",
                  name: t("settings.toast.designOptions.minimal.name"),
                  description: t("settings.toast.designOptions.minimal.description"),
                },
                {
                  value: "modern",
                  name: t("settings.toast.designOptions.modern.name"),
                  description: t("settings.toast.designOptions.modern.description"),
                },
              ].map((design) => (
                <div
                  key={design.value}
                  role="button"
                  tabIndex={0}
                  aria-pressed={settings.toastStyle === design.value}
                  className={pickerCardClass(settings.toastStyle === design.value)}
                  onClick={() => settings.setToastStyle(design.value as ToastStyle)}
                  onKeyDown={cardKeyHandler(() => settings.setToastStyle(design.value as ToastStyle))}
                >
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="font-semibold">{design.name}</h4>
                      <p className="text-xs text-muted-foreground">{design.description}</p>
                    </div>

                    {/* Toast Preview — inert: purely decorative */}
                    <div inert className="flex flex-col items-center space-y-2">
                      {/* Success State Preview */}
                      <div className="w-full">
                        <ToastProvider>
                          <Toast
                            variant="success"
                            design={design.value as ToastStyle}
                            className="pointer-events-none text-xs"
                          >
                            <ToastContent
                              variant="success"
                              title={t("settings.toast.preview.successTitle")}
                              description={t("settings.toast.preview.successDesc")}
                              showIcon={true}
                            />
                          </Toast>
                        </ToastProvider>
                      </div>

                      {/* Error State Preview */}
                      <div className="w-full">
                        <ToastProvider>
                          <Toast
                            variant="destructive"
                            design={design.value as ToastStyle}
                            className="pointer-events-none text-xs"
                          >
                            <ToastContent
                              variant="destructive"
                              title={t("settings.toast.preview.errorTitle")}
                              description={t("settings.toast.preview.errorDesc")}
                              showIcon={true}
                            />
                          </Toast>
                        </ToastProvider>
                      </div>
                    </div>
                  </div>
                  {settings.toastStyle === design.value && (
                    <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Toast Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t("settings.toast.testLabel")}</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  success({
                    title: t("settings.toast.testMessages.success.title"),
                    description: t("settings.toast.testMessages.success.desc"),
                    design: settings.toastStyle as any,
                  })
                }
              >
                {t("settings.toast.testButtons.success")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  error({
                    title: t("settings.toast.testMessages.error.title"),
                    description: t("settings.toast.testMessages.error.desc"),
                    design: settings.toastStyle as any,
                  })
                }
              >
                {t("settings.toast.testButtons.error")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  warning({
                    title: t("settings.toast.testMessages.warning.title"),
                    description: t("settings.toast.testMessages.warning.desc"),
                    design: settings.toastStyle as any,
                  })
                }
              >
                {t("settings.toast.testButtons.warning")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  info({
                    title: t("settings.toast.testMessages.info.title"),
                    description: t("settings.toast.testMessages.info.desc"),
                    design: settings.toastStyle as any,
                  })
                }
              >
                {t("settings.toast.testButtons.info")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("settings.toast.testHint")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Switch Styles — surviving skins only (Wave A collapse); the Switch
          component maps stored legacy skins onto these. Cards stay divs
          (role="button") because the previews embed live Switch buttons. */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.switchStyle.title")}</CardTitle>
          <CardDescription>{t("settings.switchStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                value: "default",
                name: t("settings.switchStyle.options.default.title"),
                description: t("settings.switchStyle.options.default.description"),
              },
              {
                value: "ios",
                name: t("settings.switchStyle.options.ios.title"),
                description: t("settings.switchStyle.options.ios.description"),
              },
              {
                value: "android",
                name: t("settings.switchStyle.options.android.title"),
                description: t("settings.switchStyle.options.android.description"),
              },
            ].map((style) => (
              <div
                key={style.value}
                role="button"
                tabIndex={0}
                aria-pressed={settings.switchStyle === style.value}
                className={pickerCardClass(settings.switchStyle === style.value)}
                onClick={() => settings.setSwitchStyle(style.value as any)}
                onKeyDown={cardKeyHandler(() => settings.setSwitchStyle(style.value as any))}
              >
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold">{style.name}</h4>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </div>

                  {/* Switch Preview — inert: purely decorative */}
                  <div inert className="flex flex-col items-center space-y-3">
                    {/* OFF State Preview */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-muted-foreground">
                        {t("settings.switchStyle.labels.off")}
                      </span>
                      <Switch
                        checked={false}
                        switchStyle={style.value as any}
                        className="pointer-events-none"
                      />
                      <span className="text-xs text-muted-foreground opacity-50">
                        {t("settings.switchStyle.labels.on")}
                      </span>
                    </div>

                    {/* ON State Preview */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-muted-foreground opacity-50">
                        {t("settings.switchStyle.labels.off")}
                      </span>
                      <Switch
                        checked={true}
                        switchStyle={style.value as any}
                        className="pointer-events-none"
                      />
                      <span className="text-xs text-muted-foreground">
                        {t("settings.switchStyle.labels.on")}
                      </span>
                    </div>
                  </div>
                </div>
                {settings.switchStyle === style.value && (
                  <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
