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

export function ContentModeSection({ vm }: ContentModeSectionProps) {
  const { t } = useI18n();
  const mode = vm.content?.contentMode ?? "Seeded";
  const isLive = mode === "Live";

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Shield className="h-4 w-4 text-indigo-400" />
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
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                }
              >
                {isLive ? t("signupContent.mode.live") : t("signupContent.mode.seeded")}
              </Badge>
            </div>
            <p className="text-sm text-zinc-400">
              {isLive ? t("signupContent.mode.liveDesc") : t("signupContent.mode.seededDesc")}
            </p>
            {isLive && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <p className="text-xs text-amber-300">{t("signupContent.mode.liveWarning")}</p>
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">{t("signupContent.mode.seeded")}</span>
              <Switch
                checked={isLive}
                disabled={vm.isSettingMode}
                onCheckedChange={(checked) => vm.handleSetMode(checked ? "Live" : "Seeded")}
              />
              <span className="text-xs text-zinc-500">{t("signupContent.mode.live")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
