'use client';

import { useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@core/ui/button';
import { cn } from '@core/common/utils';
import { useNotificationViewModel } from './useNotificationViewModel';
import { useI18n } from '@core/providers/i18n-provider';

interface NotificationBellProps {
      /** Icon size class */
      iconClassName?: string;
      /** Button class overrides */
      className?: string;
}

/**
 * NotificationBell — reusable bell icon with unread badge and dropdown panel.
 * Drop-in replacement for static Bell icons in layout headers.
 */
export function NotificationBell({ iconClassName = 'h-10 w-10', className }: NotificationBellProps) {
      const vm = useNotificationViewModel();
      const { t } = useI18n();
      const panelRef = useRef<HTMLDivElement>(null);

      // Close on outside click
      useEffect(() => {
            if (!vm.isOpen) return;
            const handler = (e: MouseEvent) => {
                  if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                        vm.close();
                  }
            };
            document.addEventListener('mousedown', handler);
            return () => document.removeEventListener('mousedown', handler);
      }, [vm.isOpen, vm.close]);

      return (
            <div className="relative" ref={panelRef}>
                  {/* Bell Button */}
                  <Button
                        variant="ghost"
                        size="icon"
                        className={cn('hover-lift relative', className)}
                        onClick={vm.toggleOpen}
                        aria-label={t('notifications.title') || 'Notifications'}
                  >
                        <Bell className={iconClassName} />
                        {vm.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                    {vm.unreadCount > 99 ? '99+' : vm.unreadCount}
                              </span>
                        )}
                  </Button>

                  {/* Dropdown Panel */}
                  {vm.isOpen && (
                        <div className="absolute end-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-popover shadow-xl animate-in fade-in slide-in-from-top-2">
                              {/* Header */}
                              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                    <h3 className="text-sm font-semibold">
                                          {t('notifications.title') || 'Notifications'}
                                    </h3>
                                    {vm.unreadCount > 0 && (
                                          <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={vm.markAllAsRead}
                                          >
                                                <CheckCheck className="mr-1 h-3 w-3" />
                                                {t('notifications.markAllRead') || 'Mark all read'}
                                          </Button>
                                    )}
                              </div>

                              {/* Notification List */}
                              <div className="max-h-80 overflow-y-auto">
                                    {vm.isLoading ? (
                                          <div className="flex items-center justify-center py-8">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                          </div>
                                    ) : vm.notifications.length === 0 ? (
                                          <div className="py-8 text-center text-sm text-muted-foreground">
                                                {t('notifications.empty') || 'No notifications'}
                                          </div>
                                    ) : (
                                          vm.notifications.map((n) => (
                                                <button
                                                      key={n.id}
                                                      className={cn(
                                                            'flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50',
                                                            !n.isRead && 'bg-primary/5'
                                                      )}
                                                      onClick={() => {
                                                            if (!n.isRead) vm.markAsRead(n.id);
                                                            if (n.actionUrl) window.location.href = n.actionUrl;
                                                      }}
                                                >
                                                      {/* Unread indicator */}
                                                      <div className="mt-1.5 flex-shrink-0">
                                                            {n.isRead ? (
                                                                  <Check className="h-3 w-3 text-muted-foreground/50" />
                                                            ) : (
                                                                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                                            )}
                                                      </div>

                                                      {/* Content */}
                                                      <div className="min-w-0 flex-1">
                                                            <p className={cn(
                                                                  'text-sm truncate',
                                                                  !n.isRead ? 'font-medium' : 'text-muted-foreground'
                                                            )}>
                                                                  {n.title}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                                                  {n.body}
                                                            </p>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                  <time className="text-[10px] text-muted-foreground/70">
                                                                        {formatTimeAgo(n.createdAt)}
                                                                  </time>
                                                                  {n.actionUrl && (
                                                                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/50" />
                                                                  )}
                                                            </div>
                                                      </div>
                                                </button>
                                          ))
                                    )}
                              </div>
                        </div>
                  )}
            </div>
      );
}

/**
 * Simple time-ago formatter.
 */
function formatTimeAgo(dateStr: string): string {
      const now = Date.now();
      const date = new Date(dateStr).getTime();
      const diff = now - date;

      const seconds = Math.floor(diff / 1000);
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d`;
      return new Date(dateStr).toLocaleDateString();
}
