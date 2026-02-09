'use client';

/**
 * Audit Filter Panel
 *
 * Filter bar for audit log table — event type, date range, user, entity, status.
 */
import { memo } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { Input } from '@core/ui/input';
import { Button } from '@core/ui/button';
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from '@core/ui/select';
import { Search, X, Filter } from 'lucide-react';
import type { AuditFilterState } from '../viewmodels/useAuditViewModel';

interface Props {
      filters: AuditFilterState;
      updateFilter: <K extends keyof AuditFilterState>(key: K, value: AuditFilterState[K]) => void;
      resetFilters: () => void;
      hasActiveFilters: boolean;
}

const EVENT_TYPES = [
      'Create', 'Update', 'Delete',
      'LoginSuccess', 'LoginFailed',
      'RoleAssigned', 'RoleUnassigned',
      'PermissionGranted', 'PermissionRevoked',
      'AccountLocked', 'AccessDenied',
      'PasswordReset', 'SessionRevoked',
];

export const AuditFilterPanel = memo(function AuditFilterPanel({ filters, updateFilter, resetFilters, hasActiveFilters }: Props) {
      const { t } = useI18n();

      return (
            <div className="space-y-4">
                  {/* Search Row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder={t('audit.filters.searchPlaceholder')}
                                    value={filters.search}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                    className="pl-9"
                              />
                        </div>
                        <div className="flex gap-2">
                              <Input
                                    type="date"
                                    placeholder={t('audit.filters.dateFrom')}
                                    value={filters.dateFrom}
                                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                                    className="w-36"
                                    aria-label={t('audit.filters.dateFrom')}
                              />
                              <Input
                                    type="date"
                                    placeholder={t('audit.filters.dateTo')}
                                    value={filters.dateTo}
                                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                                    className="w-36"
                                    aria-label={t('audit.filters.dateTo')}
                              />
                        </div>
                  </div>

                  {/* Filter Row */}
                  <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Filter className="h-4 w-4" />
                              <span>{t('common.filter')}</span>
                        </div>

                        {/* Event Type */}
                        <Select
                              value={filters.eventType || 'all'}
                              onValueChange={(v) => updateFilter('eventType', v === 'all' ? '' : v)}
                        >
                              <SelectTrigger className="w-44">
                                    <SelectValue placeholder={t('audit.filters.eventType')} />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value="all">{t('audit.filters.allEvents')}</SelectItem>
                                    {EVENT_TYPES.map((type) => (
                                          <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                              </SelectContent>
                        </Select>

                        {/* Username */}
                        <Input
                              placeholder={t('audit.filters.username')}
                              value={filters.username}
                              onChange={(e) => updateFilter('username', e.target.value)}
                              className="w-40"
                        />

                        {/* Entity Type */}
                        <Input
                              placeholder={t('audit.filters.entityType')}
                              value={filters.entityType}
                              onChange={(e) => updateFilter('entityType', e.target.value)}
                              className="w-40"
                        />

                        {/* Status Filter */}
                        <Select
                              value={filters.isSuccess === undefined ? 'all' : filters.isSuccess ? 'success' : 'failed'}
                              onValueChange={(v) => updateFilter('isSuccess', v === 'all' ? undefined : v === 'success')}
                        >
                              <SelectTrigger className="w-32">
                                    <SelectValue placeholder={t('audit.filters.status')} />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value="all">{t('audit.filters.allStatus')}</SelectItem>
                                    <SelectItem value="success">{t('audit.filters.success')}</SelectItem>
                                    <SelectItem value="failed">{t('audit.filters.failed')}</SelectItem>
                              </SelectContent>
                        </Select>

                        {/* Reset */}
                        {hasActiveFilters && (
                              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
                                    <X className="h-3.5 w-3.5" />
                                    {t('audit.filters.reset')}
                              </Button>
                        )}
                  </div>
            </div>
      );
});
