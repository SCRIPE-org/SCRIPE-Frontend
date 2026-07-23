"use client";

import { useState } from "react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { GenericModal } from "@core/crud/components/generic-modal";
import { Check } from "lucide-react";
import { cn } from "@core/common/utils";

export function ModalStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();
  const [testModalOpen, setTestModalOpen] = useState<string | null>(null);
  // Exercises GenericModal's revived `size` prop: undefined keeps the
  // settings-derived (modalStyle) footprint, an explicit sm/lg must win over
  // it. This preview is the permanent regression canary for that contract.
  const [previewSize, setPreviewSize] = useState<"sm" | "lg" | undefined>(undefined);

  const modalStyles = [
    {
      value: "default",
      name: t("settings.modalStyle.options.default.name"),
      description: t("settings.modalStyle.options.default.description"),
    },
    {
      value: "centered",
      name: t("settings.modalStyle.options.centered.name"),
      description: t("settings.modalStyle.options.centered.description"),
    },
    {
      value: "fullscreen",
      name: t("settings.modalStyle.options.fullscreen.name"),
      description: t("settings.modalStyle.options.fullscreen.description"),
    },
    {
      value: "drawer",
      name: t("settings.modalStyle.options.drawer.name"),
      description: t("settings.modalStyle.options.drawer.description"),
    },
    {
      value: "glass",
      name: t("settings.modalStyle.options.glass.name"),
      description: t("settings.modalStyle.options.glass.description"),
    },
    {
      value: "floating",
      name: t("settings.modalStyle.options.floating.name"),
      description: t("settings.modalStyle.options.floating.description"),
    },
    {
      value: "card",
      name: t("settings.modalStyle.options.card.name"),
      description: t("settings.modalStyle.options.card.description"),
    },
    {
      value: "overlay",
      name: t("settings.modalStyle.options.overlay.name"),
      description: t("settings.modalStyle.options.overlay.description"),
    },
  ];

  const previewStyleName = modalStyles.find((s) => s.value === testModalOpen)?.name;

  const modalPreviewMap: Record<string, React.ReactNode> = {
    default: (
      <div className="absolute left-1/2 top-1/2 h-6 w-8 -translate-x-1/2 -translate-y-1/2 rounded border bg-white shadow" />
    ),
    centered: (
      <div className="absolute left-1/2 top-1/2 h-6 w-8 -translate-x-1/2 -translate-y-1/2 rounded border bg-white shadow" />
    ),
    fullscreen: <div className="absolute inset-1 rounded border bg-white shadow" />,
    drawer: <div className="absolute bottom-1 right-1 top-1 w-6 rounded border bg-white shadow" />,
  };

  return (
    <>
      {/* Style selector */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.modalStyle.title")}</CardTitle>
          <CardDescription>{t("settings.modalStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {modalStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.modalStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setModalStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">{style.description}</p>
                  <div className="relative h-12 rounded bg-muted">
                    {modalPreviewMap[style.value]}
                  </div>
                </div>
                {settings.modalStyle === style.value && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test buttons */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.modalStyle.title")}</CardTitle>
          <CardDescription>{t("settings.modalStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {modalStyles.map((style) => (
              <div key={style.value} className="space-y-2">
                <Button
                  variant={settings.modalStyle === style.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => settings.setModalStyle(style.value as any)}
                  className="w-full"
                >
                  {style.name}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTestModalOpen(style.value)}
                  className="w-full text-xs"
                >
                  {t("settings.modalStyle.testButton", { style: style.name })}
                </Button>
              </div>
            ))}
          </div>
          {/* Size override toggle — undefined = the modalStyle footprint,
              "sm"/"lg" = the explicit size ladder that must out-rank it */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={previewSize === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewSize(undefined)}
            >
              {t("settings.modalStyle.options.default.name")}
            </Button>
            <Button
              variant={previewSize === "sm" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewSize("sm")}
            >
              sm
            </Button>
            <Button
              variant={previewSize === "lg" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewSize("lg")}
            >
              lg
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {t("settings.modalStyle.testInstructions")}
          </div>
        </CardContent>
      </Card>

      {/* Test modal */}
      <GenericModal
        open={testModalOpen !== null}
        onOpenChange={(open) => !open && setTestModalOpen(null)}
        title={t("settings.modalStyle.previewTitle", { style: previewStyleName || "" })}
        size={previewSize}
      >
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {t("settings.modalStyle.previewDescription", { style: previewStyleName || "" })}
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">{t("settings.modalStyle.sampleContentTitle")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("settings.modalStyle.sampleContentDescription", {
                  style: previewStyleName || "",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setTestModalOpen(null)}>
                {t("settings.modalStyle.closePreview")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (testModalOpen) {
                    settings.setModalStyle(testModalOpen as any);
                    setTestModalOpen(null);
                  }
                }}
              >
                {t("settings.modalStyle.applyStyle")}
              </Button>
            </div>
          </div>
        </div>
      </GenericModal>
    </>
  );
}
