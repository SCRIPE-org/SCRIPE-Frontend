"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { ErrorMessage } from "@core/ui/error-message";

/** Props for {@link AccountSliceErrorState}. */
export interface AccountSliceErrorStateProps {
  /** Optional page heading rendered above the error card. */
  title?: string;
  /** Optional page subtitle rendered below the heading. */
  description?: string;
  /** Error detail message; falls back to localized load error copy when omitted. */
  message?: string | null;
  /** Retry callback wired to query `refetch`. */
  onRetry?: () => void;
  /** Optional test ID for targeted verification. */
  testId?: string;
}

/**
 * Shared Nexus error and retry card for Account Console pages whose primary slice query failed.
 */
export function AccountSliceErrorState({
  title,
  description,
  message,
  onRetry,
  testId = "account-slice-error",
}: AccountSliceErrorStateProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6 min-w-0" data-testid={testId}>
      {title && (
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">{title}</h1>
          {description && <p className="text-xs text-nx-ink-3 mt-1">{description}</p>}
        </div>
      )}

      <Card className="border border-nx-line bg-nx-surface">
        <CardContent className="p-2">
          <ErrorMessage
            message={message?.trim() ? message : t("profile.loadError.description")}
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    </div>
  );
}
