"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ArrowRightLeft,
  X,
  Home,
  Lock,
  Check,
  RotateCcw,
  MoreHorizontal,
  SlidersHorizontal,
} from "lucide-react";
import type { MenuItem } from "@core/navigation";
import { cn, resolveBilingualLabel } from "@core/common/utils";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { DynamicIcon } from "@core/ui/layout/shared/dynamic-icon";
import { useWorkspaceTransitionContext } from "../nexus-layout";
import type { RailStartPageActionState } from "../use-rail-start-page-toggle";

// All colour reads the --nx- token layer — theme resolves in CSS, so these
// parts never see isDark or a JS palette object.
// Active leaf = accent text + inline-start edge light. NO glow here: the
// primary rail's active root item owns the one glow per screen.
// One ring token for the whole product — --nx-focus already carries the inset
// accent edge these rows want, so the rail no longer draws its own.
const FOCUS_RING = "focus-visible:outline-none focus-visible:shadow-nx-focus";

export function cleanPath(p: string | undefined | null): string {
  if (!p) return "";
  const cleaned = p.split("?")[0].split("#")[0];
  // Preserve the root "/" — only strip trailing slash from longer paths
  if (cleaned.length > 1 && cleaned.endsWith("/")) {
    return cleaned.slice(0, -1);
  }
  return cleaned;
}

export interface NavItemProps {
  item: MenuItem;
  depth?: number;
  pathname: string;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onNavigate: () => void;
  language: string;
  activeHref: string;
  switchWorkspace: (key: string) => void;
  customStartPageHref?: string | null;
  startPageIndicatorLabel?: string;
}

export function NavItem({
  item,
  depth = 0,
  pathname,
  expandedIds,
  onToggle,
  onNavigate,
  language,
  activeHref,
  switchWorkspace,
  customStartPageHref,
  startPageIndicatorLabel,
}: NavItemProps) {
  const [hovered, setHovered] = useState(false);
  const label =
    resolveBilingualLabel(item.nameEn, item.nameAr, language) ||
    resolveBilingualLabel(item.nameAr, item.nameEn, language);

  // Detect workspace-switch hrefs (#workspace:<key>)
  const workspaceKey = item.href?.startsWith("#workspace:")
    ? item.href.slice("#workspace:".length)
    : null;
  const isWorkspaceSwitcher = !!workspaceKey;

  const normalizedHref = cleanPath(item.href);
  const isActive = !!item.href && normalizedHref === cleanPath(activeHref);
  const isCustomStartPage =
    Boolean(customStartPageHref) &&
    Boolean(normalizedHref) &&
    normalizedHref.toLowerCase() === cleanPath(customStartPageHref).toLowerCase();

  const hasChildren = item.children.length > 0;
  const isExpanded = expandedIds.includes(item.id);

  const itemChildren = item.children;
  const hasActiveChild = React.useMemo(() => {
    if (!activeHref) return false;
    const cleanedActive = cleanPath(activeHref);
    const check = (node: MenuItem): boolean => {
      if (cleanPath(node.href) === cleanedActive) return true;
      if (node.children) return node.children.some(check);
      return false;
    };
    return itemChildren.some(check);
  }, [itemChildren, activeHref]);

  // Auto-expand if a child is active
  useEffect(() => {
    if (hasActiveChild && !isExpanded) {
      onToggle(item.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveChild]);

  const indent = depth * 12;

  const itemStyle: React.CSSProperties = {
    paddingInlineStart: 12 + indent,
    paddingInlineEnd: 10,
    background: isActive
      ? "var(--nx-accent-wash, hsl(var(--primary) / 0.1))"
      : hovered
        ? "var(--nx-raised, hsl(var(--muted)))"
        : "transparent",
  };

  // Row colour transitions live in classes so motion-reduce can strip them.
  const rowClassName = cn(
    "relative flex min-h-9 select-none items-center gap-2.5 overflow-hidden rounded-nx-control no-underline transition-colors duration-nx-micro motion-reduce:transition-none cursor-pointer",
    FOCUS_RING
  );

  const hasExplicitIcon = Boolean(item.icon?.trim());
  const iconColorClass = isActive ? "text-nx-accent" : hovered ? "text-nx-ink" : "text-nx-ink-3";

  const leadingGlyph = hasExplicitIcon ? (
    <DynamicIcon
      name={item.icon}
      size={depth === 0 ? 16 : 15}
      strokeWidth={1.6}
      className={cn(
        "shrink-0 transition-colors duration-nx-micro motion-reduce:transition-none",
        iconColorClass
      )}
    />
  ) : (
    <span className="size-4 shrink-0" aria-hidden="true" />
  );

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: isActive
      ? "var(--nx-accent, hsl(var(--primary)))"
      : hovered
        ? "var(--nx-ink, hsl(var(--foreground)))"
        : "var(--nx-ink-2, hsl(var(--muted-foreground)))",
    flex: 1,
    fontWeight: isActive ? 600 : 500,
  };

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          type="button"
          aria-expanded={isExpanded || hasActiveChild}
          style={itemStyle}
          className={cn(rowClassName, "w-full border-0 text-start")}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onToggle(item.id)}
        >
          {leadingGlyph}
          <span
            style={labelStyle}
            className="min-w-0 truncate transition-colors duration-nx-micro motion-reduce:transition-none"
          >
            {label}
          </span>
          <ChevronRight
            size={14}
            aria-hidden="true"
            className={cn(
              "shrink-0 transition-transform duration-nx-standard ease-nx-enter motion-reduce:transition-none",
              isExpanded || hasActiveChild ? "rotate-90 rtl:-rotate-90" : "rtl:rotate-180"
            )}
            style={{
              color: "var(--nx-ink-3, hsl(var(--muted-foreground)))",
            }}
          />
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
          style={{
            gridTemplateRows: isExpanded || hasActiveChild ? "1fr" : "0fr",
          }}
        >
          <div
            aria-hidden={!(isExpanded || hasActiveChild) || undefined}
            inert={!(isExpanded || hasActiveChild)}
            className={cn(
              "min-h-0 overflow-hidden",
              !(isExpanded || hasActiveChild) && "invisible"
            )}
          >
            <div style={{ paddingTop: 4, paddingBottom: 4 }}>
              {item.children.map((child) => (
                <NavItem
                  key={child.id}
                  item={child}
                  depth={depth + 1}
                  pathname={pathname}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onNavigate={onNavigate}
                  language={language}
                  activeHref={activeHref}
                  switchWorkspace={switchWorkspace}
                  customStartPageHref={customStartPageHref}
                  startPageIndicatorLabel={startPageIndicatorLabel}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Workspace-switcher items render as native buttons (not links)
  if (isWorkspaceSwitcher) {
    return (
      <div className="mb-0.5">
        <button
          type="button"
          style={itemStyle}
          className={cn(rowClassName, "w-full border-0 text-start")}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => {
            switchWorkspace(workspaceKey!);
            onNavigate();
          }}
        >
          {leadingGlyph}
          <span
            style={labelStyle}
            className="min-w-0 truncate transition-colors duration-nx-micro motion-reduce:transition-none"
          >
            {label}
          </span>
          <ArrowRightLeft
            size={12}
            aria-hidden="true"
            style={{ color: "var(--nx-ink-3, hsl(var(--muted-foreground)))", flexShrink: 0 }}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-0.5">
      <Link
        href={item.href ?? "#"}
        onClick={onNavigate}
        style={itemStyle}
        className={rowClassName}
        aria-current={isActive ? "page" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {leadingGlyph}
        <span
          style={labelStyle}
          className="min-w-0 truncate transition-colors duration-nx-micro motion-reduce:transition-none"
        >
          {label}
        </span>

        {isCustomStartPage && (
          <Home
            className="size-3 shrink-0 text-nx-ink-3/70"
            aria-label={startPageIndicatorLabel || undefined}
          />
        )}

        {/* Active leaf edge light — accent bar at the inline start, no glow */}
        {isActive && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              insetInlineStart: 0,
              top: "20%",
              bottom: "20%",
              width: 3,
              borderStartStartRadius: 0,
              borderEndStartRadius: 0,
              borderStartEndRadius: "var(--nx-radius-sm)",
              borderEndEndRadius: "var(--nx-radius-sm)",
              background: "var(--nx-accent, hsl(var(--primary)))",
            }}
          />
        )}
      </Link>
    </div>
  );
}

export function GroupLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pb-1.5 pt-5 text-[11px] font-medium leading-none text-nx-ink-3">
      {label}
    </div>
  );
}

export function RailContent({
  menuItems,
  pathname,
  language,
  onNavigate,
  customStartPageHref,
  startPageIndicatorLabel,
}: {
  menuItems: MenuItem[];
  pathname: string;
  language: string;
  onNavigate: () => void;
  customStartPageHref?: string | null;
  startPageIndicatorLabel?: string;
}) {
  const { switchWorkspace } = useWorkspaceTransitionContext();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const handleToggle = useCallback(
    (id: string) =>
      setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])),
    []
  );

  // Find the most specific active href
  const activeHref = React.useMemo(() => {
    let bestMatch = "";
    const cleanedPathname = cleanPath(pathname);
    const traverse = (items: MenuItem[]) => {
      for (const item of items) {
        if (item.href) {
          const itemHref = cleanPath(item.href);
          if (cleanedPathname === itemHref) {
            bestMatch = item.href;
            return; // exact match — stop immediately
          }
          // Prefix match only for non-root paths (avoid "/" matching everything)
          if (
            itemHref !== "/" &&
            cleanedPathname.startsWith(itemHref + "/") &&
            itemHref.length > cleanPath(bestMatch).length
          ) {
            bestMatch = item.href;
          }
        }
        if (item.children?.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(menuItems);
    return bestMatch;
  }, [menuItems, pathname]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px",
        scrollbarWidth: "thin",
        scrollbarColor: "var(--nx-line, hsl(var(--border))) transparent",
      }}
      className="nexus-custom-scrollbar"
    >
      {menuItems.map((item) => {
        // Item has no href but has children → treat as group header
        const isGroup = item.children.length > 0 && !item.href;
        if (isGroup) {
          return (
            <div key={item.id} className="mb-2">
              <GroupLabel
                label={
                  resolveBilingualLabel(item.nameEn, item.nameAr, language) ||
                  resolveBilingualLabel(item.nameAr, item.nameEn, language)
                }
              />
              {item.children.map((child) => (
                <NavItem
                  key={child.id}
                  item={child}
                  depth={0}
                  pathname={pathname}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  onNavigate={onNavigate}
                  language={language}
                  activeHref={activeHref}
                  switchWorkspace={switchWorkspace}
                  customStartPageHref={customStartPageHref}
                  startPageIndicatorLabel={startPageIndicatorLabel}
                />
              ))}
            </div>
          );
        }
        return (
          <NavItem
            key={item.id}
            item={item}
            depth={0}
            pathname={pathname}
            expandedIds={expandedIds}
            onToggle={handleToggle}
            onNavigate={onNavigate}
            language={language}
            activeHref={activeHref}
            switchWorkspace={switchWorkspace}
            customStartPageHref={customStartPageHref}
            startPageIndicatorLabel={startPageIndicatorLabel}
          />
        );
      })}
    </div>
  );
}

const RAIL_BIDI_TOKEN = "__SCRIPE_RAIL_BDI__";

function renderBidiSingleToken(text: string, value: string): React.ReactNode {
  if (!text.includes(RAIL_BIDI_TOKEN)) {
    return text;
  }
  const parts = text.split(RAIL_BIDI_TOKEN);
  return (
    <>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {part}
          {idx < parts.length - 1 ? <bdi>{value}</bdi> : null}
        </React.Fragment>
      ))}
    </>
  );
}

export function RailHeader({
  contextLabel,
  title,
  onClose,
  closeLabel,
  startPageAction,
  onManageStartPages,
  t,
}: {
  contextLabel: string;
  title: string;
  onClose?: () => void;
  closeLabel?: string;
  startPageAction?: RailStartPageActionState;
  onManageStartPages?: () => void;
  t?: (key: string, params?: Record<string, string | number>) => string;
}) {
  const showOverflowMenu = Boolean(startPageAction && startPageAction.kind !== "hidden" && t);
  const trimmedContext = contextLabel.trim();
  const showContextKicker =
    Boolean(trimmedContext) && !title.toLowerCase().includes(trimmedContext.toLowerCase());

  const renderOverflowMenu = () => {
    if (!startPageAction || !t || startPageAction.kind === "hidden") return null;

    const enforcedLabel = t("chrome.startPageLocked");
    const enforcedText = startPageAction.enforcingRoleName
      ? t("chrome.startPageEnforcedTooltip", { role: startPageAction.enforcingRoleName })
      : t("chrome.startPageEnforcedGenericTooltip");
    const enforcedNode = startPageAction.enforcingRoleName
      ? renderBidiSingleToken(
          t("chrome.startPageEnforcedTooltip", { role: RAIL_BIDI_TOKEN }),
          startPageAction.enforcingRoleName
        )
      : enforcedText;

    const currentLabel = t("chrome.currentStartPage");
    const resetLabel = t("chrome.resetStartPage");
    const setActionNode = renderBidiSingleToken(
      t("chrome.setAsStartPage", { workspace: RAIL_BIDI_TOKEN }),
      startPageAction.workspaceName
    );
    const manageLabel = t("chrome.manageStartPages");
    const optionsLabel = t("chrome.workspaceOptions");

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-testid="rail-workspace-options-trigger"
            aria-label={optionsLabel}
            className={cn(
              "h-7 w-7 shrink-0 rounded-nx-control text-nx-ink-3 hover:bg-nx-raised hover:text-nx-ink",
              FOCUS_RING
            )}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-52 border-nx-line bg-nx-popover opacity-100 !animate-none"
        >
          {startPageAction.kind === "settable" && (
            <DropdownMenuItem
              disabled={startPageAction.isPending}
              onSelect={() => void startPageAction.onSetAsStartPage()}
              className="cursor-pointer gap-2 text-xs font-medium"
            >
              <Home className="size-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <span className="min-w-0 flex-1 whitespace-normal leading-snug text-start">
                {setActionNode}
              </span>
            </DropdownMenuItem>
          )}

          {startPageAction.kind === "current_custom" && (
            <>
              <div
                data-testid="rail-start-page-status"
                className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-nx-ink-2"
              >
                <Check className="size-3.5 shrink-0 text-nx-accent" aria-hidden="true" />
                <span className="min-w-0 flex-1 leading-snug">{currentLabel}</span>
              </div>
              <DropdownMenuItem
                disabled={startPageAction.isPending}
                onSelect={() => void startPageAction.onResetStartPage()}
                className="cursor-pointer gap-2 text-xs font-medium"
              >
                <RotateCcw className="size-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
                <span className="min-w-0 flex-1 leading-snug">{resetLabel}</span>
              </DropdownMenuItem>
            </>
          )}

          {startPageAction.kind === "current_default" && (
            <div
              data-testid="rail-start-page-status"
              className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-nx-ink-2"
            >
              <Check className="size-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <span className="min-w-0 flex-1 leading-snug">{currentLabel}</span>
            </div>
          )}

          {startPageAction.kind === "locked" && (
            <div
              data-testid="rail-start-page-locked"
              aria-label={`${enforcedLabel} — ${enforcedText}`}
              className="flex items-start gap-2 px-2 py-1.5"
            >
              <Lock className="mt-0.5 size-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-xs font-medium leading-snug text-nx-ink">{enforcedLabel}</div>
                <div className="text-[11px] leading-snug text-nx-ink-3">{enforcedNode}</div>
              </div>
            </div>
          )}

          {onManageStartPages && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onManageStartPages()}
                className="cursor-pointer gap-2 text-xs font-medium"
              >
                <SlidersHorizontal className="size-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
                <span className="min-w-0 flex-1 leading-snug">{manageLabel}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-2 border-b border-nx-line px-4 py-3">
      <div className="min-w-0 flex-1">
        {showContextKicker && (
          <div className="mb-1 truncate text-[11px] font-medium leading-none text-nx-ink-3 transition-colors duration-nx-standard ease-nx-enter motion-reduce:transition-none">
            {trimmedContext}
          </div>
        )}
        <div className="truncate text-[15px] font-semibold leading-snug tracking-[-0.01em] text-nx-ink">
          {title}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {showOverflowMenu ? renderOverflowMenu() : null}
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={closeLabel}
            className="h-8 w-8 shrink-0 text-nx-ink-2 hover:text-nx-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
