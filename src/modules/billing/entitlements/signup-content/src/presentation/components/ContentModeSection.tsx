"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { Alert, AlertDescription } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";
import { Shield, AlertTriangle } from "lucide-react";
import type { useSignupContentViewModel } from "../viewmodels/useSignupContentViewModel";

type SignupContentViewModel = ReturnType<typeof useSignupContentViewModel>;

interface ContentModeSectionProps {
  vm: SignupContentViewModel;
}

/**
 * Presentation UI component rendering the content mode section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ContentModeSection({ vm }: ContentModeSectionProps) {
  const { t } = useI18n();
  const mode = vm.content?.contentMode ?? "Seeded";
  const isLive = mode === "Live";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-info" aria-hidden="true" />
          {t("signupContent.mode.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Badge variant={isLive ? "success" : "warning"}>
              {isLive ? t("signupContent.mode.live") : t("signupContent.mode.seeded")}
            </Badge>
            <p className="text-sm text-nx-ink-2">
              {isLive ? t("signupContent.mode.liveDesc") : t("signupContent.mode.seededDesc")}
            </p>
          </div>

          <Switch
            checked={isLive}
            disabled={vm.isSettingMode}
            onCheckedChange={(checked) => vm.handleSetMode(checked ? "Live" : "Seeded")}
            showLabels
            onLabel={t("signupContent.mode.live")}
            offLabel={t("signupContent.mode.seeded")}
            aria-label={t("signupContent.mode.title")}
          />
        </div>

        {isLive && (
          <Alert variant="warning">
            <AlertTriangle aria-hidden="true" />
            <AlertDescription>{t("signupContent.mode.liveWarning")}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
