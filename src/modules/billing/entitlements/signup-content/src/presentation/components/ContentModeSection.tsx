"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Shield className="h-4 w-4 text-info" />
          {t("signupContent.mode.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  isLive
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-warning/40 bg-warning/10 text-warning"
                }
              >
                {isLive ? t("signupContent.mode.live") : t("signupContent.mode.seeded")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isLive ? t("signupContent.mode.liveDesc") : t("signupContent.mode.seededDesc")}
            </p>
            {isLive && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                <p className="text-xs text-warning">{t("signupContent.mode.liveWarning")}</p>
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{t("signupContent.mode.seeded")}</span>
              <Switch
                checked={isLive}
                disabled={vm.isSettingMode}
                onCheckedChange={(checked) => vm.handleSetMode(checked ? "Live" : "Seeded")}
              />
              <span className="text-xs text-muted-foreground">{t("signupContent.mode.live")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
