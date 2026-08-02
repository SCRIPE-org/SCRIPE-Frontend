"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { PageHeader } from "@core/ui/page-header";
import { useI18n } from "@core/providers/i18n-provider";
import { Check, Clock, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * ComingSoonView — the placeholder a route shows before its module exists.
 *
 * It used to hand-roll its own page header (a text-2xl h1, louder than the
 * system's), its own glyph tile and its own empty block. All three now come
 * from the primitives, so a not-yet-built route opens like every built one.
 *
 * The old `accentColor` prop is gone: it built classes by interpolation
 * (`bg-${accentColor}/10`), which Tailwind cannot see and therefore never
 * emitted — the tint it promised was never on screen. The page's single
 * chromatic anchor is PageHeader's accent icon tile.
 */
interface ComingSoonViewProps {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  featuresKeys: Record<string, string>;
  /** The next step, when there is one — a waitlist, a docs link, a related page. */
  action?: ReactNode;
}

export function ComingSoonView({
  icon: Icon,
  titleKey,
  descriptionKey,
  featuresKeys,
  action,
}: ComingSoonViewProps) {
  const { t } = useI18n();
  const features = Object.entries(featuresKeys);

  return (
    <>
      <PageHeader
        icon={Icon}
        title={t(titleKey)}
        description={t(descriptionKey)}
        badges={
          <Badge variant="warning">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {t("common.comingSoon")}
          </Badge>
        }
      />

      <Card>
        <CardContent>
          {/* No description: the page header already carries that sentence, and
              md rather than lg keeps this block grouped with the feature list
              below, which is what actually explains what is coming. */}
          <EmptyState
            bare
            size="md"
            icon={Sparkles}
            title={t("common.comingSoon")}
            action={action}
          />

          {features.length > 0 && (
            <ul className="mx-auto grid w-full max-w-lg gap-3 text-start">
              {features.map(([key, localeKey]) => (
                <li
                  key={key}
                  className="flex items-start gap-3 rounded-nx-md border border-nx-line bg-nx-raised px-4 py-3"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  <span className="text-sm leading-relaxed text-nx-ink-2">{t(localeKey)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
