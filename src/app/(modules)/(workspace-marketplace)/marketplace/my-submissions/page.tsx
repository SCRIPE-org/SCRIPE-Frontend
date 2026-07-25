"use client";

import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { PageHeader } from "@core/ui/page-header";
import { useI18n } from "@core/providers/i18n-provider";
import { Check, Clock, Upload } from "lucide-react";

// Real translated title/description via PageHeader, plus an EmptyState body
// that names what is actually on the way — replaces the old hand-rolled
// text-2xl h1 and hardcoded placeholder paragraph.
const FEATURE_KEYS = [
  "marketplace.vendor.submissionsFeatureStatus",
  "marketplace.vendor.submissionsFeatureVersions",
  "marketplace.vendor.submissionsFeatureFeedback",
];

export default function VendorSubmissionsPage() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader
        icon={Upload}
        title={t("marketplace.vendor.submissionsTitle")}
        description={t("marketplace.vendor.submissionsDescription")}
        badges={
          <Badge variant="warning">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {t("common.comingSoon")}
          </Badge>
        }
      />

      <Card>
        <CardContent>
          <EmptyState bare size="md" icon={Upload} title={t("common.comingSoon")} />

          <ul className="mx-auto grid w-full max-w-lg gap-3 text-start">
            {FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-nx-md border border-nx-line bg-nx-raised px-4 py-3"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-nx-ink-2">{t(key)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
