"use client";

/**
 * ScripePanel — secondary navigation panel (EDGE skin)
 *
 * Lists the children of the active root item, grouped. The active leaf is the
 * only element carrying the emission colour within the panel.
 *
 * Fully logical CSS (inset-inline, padding-inline) so RTL needs no branch.
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";
import type { MenuItem } from "@core/navigation";

interface ScripePanelProps {
  collapsed?: boolean;
}

/**
 * Presentation UI component rendering the secondary navigation panel.
 */
export function ScripePanel({ collapsed = false }: ScripePanelProps) {
  const { activeWorkspace, activeRootItem } = useWorkspace();
  const { language, t } = useI18n();
  const pathname = usePathname();

  const label = (item: { nameEn: string; nameAr: string }) =>
    language === "ar" ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;

  const items: MenuItem[] = activeRootItem?.children ?? [];

  if (collapsed) {
    return null;
  }

  const renderLeaf = (item: MenuItem) => {
    const href = item.href && item.href !== "#" ? item.href : null;
    const isActive = href !== null && pathname === href;
    const content = (
      <>
        <DynamicIcon name={item.icon} size={15} />
        <span className="truncate">{label(item)}</span>
      </>
    );

    if (!href) {
      return (
        <span key={item.id} className="sx-nav-item sx-nav-item--static">
          {content}
        </span>
      );
    }

    return (
      <Link
        key={item.id}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn("sx-nav-item", isActive && "sx-nav-item--active")}
      >
        {content}
      </Link>
    );
  };

  return (
    <nav
      aria-label={t("nav.secondary") || "Sections"}
      className="sx-panel flex h-full flex-col overflow-y-auto px-2.5 py-3.5"
      style={{
        width: "var(--sx-panel-w)",
        background: "var(--sx-sub)",
        borderInlineEnd: "1px solid var(--sx-edge)",
      }}
    >
      {/* Workspace identity card */}
      {activeWorkspace && (
        <div
          className="mb-2 flex items-center gap-2.5 px-2 pb-3.5"
          style={{ borderBlockEnd: "1px solid var(--sx-edge)" }}
        >
          <span
            className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] text-[0.62rem] font-bold"
            style={{
              background: "var(--sx-accent-wash)",
              border: "1px solid var(--sx-accent)",
              color: "var(--sx-accent)",
            }}
          >
            {activeWorkspace.abbreviation}
          </span>
          <span className="min-w-0">
            <span
              className="block truncate text-[0.84rem] font-bold leading-tight"
              style={{ color: "var(--sx-ink)" }}
            >
              {language === "ar"
                ? activeWorkspace.workspaceNameAr || activeWorkspace.workspaceNameEn
                : activeWorkspace.workspaceNameEn || activeWorkspace.workspaceNameAr}
            </span>
            {activeRootItem && (
              <span className="block truncate text-[0.68rem]" style={{ color: "var(--sx-ink-3)" }}>
                {label(activeRootItem)}
              </span>
            )}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        {items.map((item) =>
          item.children && item.children.length > 0 ? (
            <React.Fragment key={item.id}>
              <span className="sx-nav-group">{label(item)}</span>
              {item.children.map(renderLeaf)}
            </React.Fragment>
          ) : (
            renderLeaf(item)
          )
        )}
      </div>
    </nav>
  );
}
