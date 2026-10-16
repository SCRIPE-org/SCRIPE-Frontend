/**
 * MockRecentUsersTable Component
 *
 * Renders the mock user table inside the customizer studio dashboard preview.
 * Displays user avatars, names, roles, statuses, and registration timestamps.
 */
// UI-EXCEPTION: compact studio layout - mock dashboard canvas preview controls
"use client";

import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

/**
 * Properties for the MockRecentUsersTable component.
 */
export interface MockRecentUsersTableProps {
  /** Optional custom CSS class name. */
  className?: string;
}

/**
 * Renders the recent users tabular section in the mock dashboard preview.
 */
export function MockRecentUsersTable({ className }: MockRecentUsersTableProps) {
  const { t } = useI18n();

  const tableRows = [
    { name: "John Doe", email: "john@example.com", role: "admin", status: "active", date: "Today" },
    {
      name: "Sarah Miller",
      email: "sarah@example.com",
      role: "editor",
      status: "active",
      date: "Yesterday",
    },
    {
      name: "Alex Kim",
      email: "alex@example.com",
      role: "viewer",
      status: "pending",
      date: "2 days ago",
    },
    {
      name: "Maria Garcia",
      email: "maria@example.com",
      role: "admin",
      status: "active",
      date: "3 days ago",
    },
    {
      name: "James Wilson",
      email: "james@example.com",
      role: "editor",
      status: "inactive",
      date: "1 week ago",
    },
  ];

  const roleLabels: Record<string, string> = {
    admin: t("studio.dashboardPreview.roles.admin"),
    editor: t("studio.dashboardPreview.roles.editor"),
    viewer: t("studio.dashboardPreview.roles.viewer"),
  };

  const statusLabels: Record<string, string> = {
    active: t("studio.dashboardPreview.statuses.active"),
    pending: t("studio.dashboardPreview.statuses.pending"),
    inactive: t("studio.dashboardPreview.statuses.inactive"),
  };

  return (
    <div
      className={cn("rounded-nx-md border border-nx-line bg-nx-surface shadow-nx-sm", className)}
    >
      <div className="flex items-center justify-between border-b border-nx-line p-4">
        <div>
          <h3 className="font-semibold text-nx-ink">{t("studio.dashboardPreview.recentUsers")}</h3>
          <p className="text-xs text-nx-ink-3">
            {t("studio.dashboardPreview.latestRegistrations")}
          </p>
        </div>
        <button className="flex items-center gap-1 text-xs text-nx-accent">
          {t("studio.dashboardPreview.viewAll")}{" "}
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nx-line">
              {[
                t("studio.dashboardPreview.columns.name"),
                t("studio.dashboardPreview.columns.email"),
                t("studio.dashboardPreview.columns.role"),
                t("studio.dashboardPreview.columns.status"),
                t("studio.dashboardPreview.columns.date"),
              ].map((h) => (
                <th key={h} className="p-3 text-start text-xs font-medium text-nx-ink-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-nx-line transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none"
              >
                <td className="p-3 text-sm font-medium text-nx-ink">{row.name}</td>
                <td className="p-3 text-sm text-nx-ink-3">{row.email}</td>
                <td className="p-3">
                  <span className="rounded-full bg-nx-raised px-2 py-0.5 text-xs text-nx-ink-3">
                    {roleLabels[row.role]}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      row.status === "active"
                        ? "bg-success/10 text-success"
                        : row.status === "pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-nx-raised text-nx-ink-3"
                    )}
                  >
                    {statusLabels[row.status]}
                  </span>
                </td>
                <td className="p-3 text-sm text-nx-ink-3">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
