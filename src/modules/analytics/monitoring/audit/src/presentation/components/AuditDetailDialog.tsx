"use client";

/**
 * Audit Detail Dialog
 *
 * Shows full audit log entry details including old/new JSON values diff.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Separator } from "@core/ui/separator";
import { ScrollArea } from "@core/ui/scroll-area";
import { DetailRow } from "@core/ui/detail-row";
import type { AuditLogDetail } from "../../domain/entities/AuditEntities";
import {
  Clock,
  User,
  Globe,
  Monitor,
  Hash,
  ArrowRightLeft,
  Timer,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  data?: AuditLogDetail;
  isLoading: boolean;
}

function JsonDiff({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(value);
  } catch {
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-nx-ink-3">{label}</p>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-nx-md bg-nx-raised p-3 text-xs text-nx-ink-2">
          {value}
        </pre>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-nx-ink-3">{label}</p>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-nx-md bg-nx-raised p-3 text-xs text-nx-ink-2">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Presentation UI component rendering the audit detail dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function AuditDetailDialog({ open, onClose, data, isLoading }: Props) {
  const { t, direction } = useI18n();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {data?.eventType ?? t("audit.detail.title")}
            {data && (
              <Badge variant={data.isSuccess ? "success" : "destructive"}>
                {data.isSuccess ? t("audit.filters.success") : t("audit.filters.failed")}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{t("audit.detail.description")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4" role="status" aria-label={t("common.loading")}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data ? (
          <ScrollArea className="max-h-[60vh]" dir={direction}>
            <div className="space-y-1 pe-4">
              {/* Core Details */}
              <DetailRow
                icon={Clock}
                label={t("audit.detail.timestamp")}
                value={formatDateTimeUtc(data.timestamp)}
              />
              <DetailRow
                icon={User}
                label={t("audit.detail.user")}
                value={
                  <span className="flex items-center gap-1.5">
                    {data.username ?? t("common.unknown")}
                    {data.isAdmin && (
                      <Badge variant="secondary" className="py-0 text-[10px]">
                        {t("audit.badges.admin")}
                      </Badge>
                    )}
                  </span>
                }
              />
              {data.ipAddress && (
                <DetailRow
                  icon={Globe}
                  label={t("audit.detail.ipAddress")}
                  value={data.ipAddress}
                  mono
                />
              )}
              {data.userAgent && (
                <DetailRow
                  icon={Monitor}
                  label={t("audit.detail.userAgent")}
                  value={data.userAgent}
                  wrap
                />
              )}
              {data.endpoint && (
                <DetailRow
                  icon={ArrowRightLeft}
                  label={t("audit.detail.endpoint")}
                  value={`${data.httpMethod} ${data.endpoint}`}
                  mono
                  wrap
                />
              )}
              {data.entityType && (
                <DetailRow
                  icon={Hash}
                  label={t("audit.detail.entity")}
                  value={`${data.entityType} #${data.entityId?.slice(0, 8) ?? ""}`}
                  mono
                />
              )}
              {data.correlationId && (
                <DetailRow
                  icon={Hash}
                  label={t("audit.detail.correlationId")}
                  value={data.correlationId}
                  mono
                  copyable={data.correlationId}
                />
              )}
              {data.durationMs !== null && (
                <DetailRow
                  icon={Timer}
                  label={t("audit.detail.duration")}
                  value={`${data.durationMs}ms`}
                />
              )}
              {data.statusCode !== null && (
                <DetailRow
                  icon={data.isSuccess ? CheckCircle2 : XCircle}
                  label={t("audit.detail.statusCode")}
                  value={String(data.statusCode)}
                />
              )}
              {data.errorMessage && (
                <DetailRow
                  icon={XCircle}
                  label={t("audit.detail.errorMessage")}
                  value={data.errorMessage}
                  valueClassName="text-destructive"
                  wrap
                />
              )}

              {/* Value Diff */}
              {(data.oldValues || data.newValues) && (
                <>
                  <Separator className="my-3" />
                  <h4 className="mb-2 text-sm font-semibold">{t("audit.detail.changes")}</h4>
                  {data.changedProperties && (
                    <p className="mb-2 text-xs text-nx-ink-3">
                      {t("audit.detail.changedFields")}: {data.changedProperties}
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <JsonDiff label={t("audit.detail.oldValues")} value={data.oldValues} />
                    <JsonDiff label={t("audit.detail.newValues")} value={data.newValues} />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
