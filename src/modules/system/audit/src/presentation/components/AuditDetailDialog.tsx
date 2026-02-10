'use client';

/**
 * Audit Detail Dialog
 *
 * Shows full audit log entry details including old/new JSON values diff.
 */
import { useI18n } from '@core/providers/i18n-provider';
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
} from '@core/ui/dialog';
import { Badge } from '@core/ui/badge';
import { Skeleton } from '@core/ui/skeleton';
import { Separator } from '@core/ui/separator';
import { ScrollArea } from '@core/ui/scroll-area';
import type { AuditLogDetail } from '@modules/system/dashboard/src/domain/entities/DashboardEntities';
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
} from 'lucide-react';

interface Props {
      open: boolean;
      onClose: () => void;
      data?: AuditLogDetail;
      isLoading: boolean;
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: React.ReactNode }) {
      if (!value) return null;
      return (
            <div className="flex items-start gap-3 py-2">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <div className="text-sm font-medium break-all">{value}</div>
                  </div>
            </div>
      );
}

function JsonDiff({ label, value }: { label: string; value: string | null }) {
      if (!value) return null;

      let parsed: Record<string, unknown>;
      try {
            parsed = JSON.parse(value);
      } catch {
            return (
                  <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                        <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-x-auto whitespace-pre-wrap">{value}</pre>
                  </div>
            );
      }

      return (
            <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(parsed, null, 2)}
                  </pre>
            </div>
      );
}

export function AuditDetailDialog({ open, onClose, data, isLoading }: Props) {
      const { t, direction } = useI18n();

      return (
            <Dialog open={open} onOpenChange={(v) => !v && onClose()} >
                  <DialogContent className="max-w-2xl max-h-[85vh]" >
                        <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                    {data?.eventType ?? t('audit.detail.title')}
                                    {data && (
                                          <Badge variant={data.isSuccess ? 'default' : 'destructive'}>
                                                {data.isSuccess ? t('audit.filters.success') : t('audit.filters.failed')}
                                          </Badge>
                                    )}
                              </DialogTitle>
                              <DialogDescription>
                                    {t('audit.detail.description')}
                              </DialogDescription>
                        </DialogHeader>

                        {isLoading ? (
                              <div className="space-y-4" role="status" aria-label={t('common.loading')}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                          <Skeleton key={i} className="h-10 w-full" />
                                    ))}
                              </div>
                        ) : data ? (
                              <ScrollArea className="max-h-[60vh]" dir={direction}>
                                    <div className="space-y-1 pr-4">
                                          {/* Core Details */}
                                          <DetailRow icon={Clock} label={t('audit.detail.timestamp')} value={new Date(data.timestamp).toLocaleString()} />
                                          <DetailRow icon={User} label={t('audit.detail.user')} value={
                                                <span className="flex items-center gap-1.5">
                                                      {data.username ?? t('common.unknown')}
                                                      {data.isAdmin && <Badge variant="secondary" className="text-[10px] py-0">Admin</Badge>}
                                                </span>
                                          } />
                                          <DetailRow icon={Globe} label={t('audit.detail.ipAddress')} value={data.ipAddress} />
                                          <DetailRow icon={Monitor} label={t('audit.detail.userAgent')} value={data.userAgent} />
                                          <DetailRow icon={ArrowRightLeft} label={t('audit.detail.endpoint')} value={
                                                data.endpoint ? `${data.httpMethod} ${data.endpoint}` : null
                                          } />
                                          <DetailRow icon={Hash} label={t('audit.detail.entity')} value={
                                                data.entityType ? `${data.entityType} #${data.entityId?.slice(0, 8) ?? ''}` : null
                                          } />
                                          <DetailRow icon={Hash} label={t('audit.detail.correlationId')} value={data.correlationId} />
                                          <DetailRow icon={Timer} label={t('audit.detail.duration')} value={
                                                data.durationMs !== null ? `${data.durationMs}ms` : null
                                          } />
                                          {data.statusCode !== null && (
                                                <DetailRow icon={data.isSuccess ? CheckCircle2 : XCircle} label={t('audit.detail.statusCode')} value={String(data.statusCode)} />
                                          )}
                                          {data.errorMessage && (
                                                <DetailRow icon={XCircle} label={t('audit.detail.errorMessage')} value={
                                                      <span className="text-destructive">{data.errorMessage}</span>
                                                } />
                                          )}

                                          {/* Value Diff */}
                                          {(data.oldValues || data.newValues) && (
                                                <>
                                                      <Separator className="my-3" />
                                                      <h4 className="text-sm font-semibold mb-2">{t('audit.detail.changes')}</h4>
                                                      {data.changedProperties && (
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                  {t('audit.detail.changedFields')}: {data.changedProperties}
                                                            </p>
                                                      )}
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <JsonDiff label={t('audit.detail.oldValues')} value={data.oldValues} />
                                                            <JsonDiff label={t('audit.detail.newValues')} value={data.newValues} />
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
