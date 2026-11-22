"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRightLeft, X, Home, Lock, Check, RotateCcw } from "lucide-react";
import type { MenuItem } from "@core/navigation";
import { cn, resolveBilingualLabel } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
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

  const isActive = !!item.href && cleanPath(item.href) === cleanPath(activeHref);

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

  const indent = depth * 14; // Increased indent for better hierarchy

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingBlock: 8,
    paddingInlineStart: 12 + indent,
    paddingInlineEnd: 10,
    borderRadius: "var(--nx-radius-control)",
    cursor: "pointer",
    textDecoration: "none",
    background: isActive
      ? "var(--nx-accent-wash, hsl(var(--primary) / 0.1))"
      : hovered
        ? "var(--nx-raised, hsl(var(--muted)))"
        : "transparent",
    userSelect: "none",
    position: "relative",
    overflow: "hidden",
  };

  // Row colour transitions live in classes so motion-reduce can strip them.
  const rowClassName = cn("transition-colors duration-nx-micro motion-reduce:transition-none");

  const dotStyle: React.CSSProperties = {
    width: 5,
    height: 5,
    borderRadius: "50%",
    flexShrink: 0,
    background: isActive
      ? "var(--nx-accent, hsl(var(--primary)))"
      : "var(--nx-line-hi, hsl(var(--border)))",
    transform: isActive ? "scale(1.4)" : "scale(1)",
  };

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
          className={cn(rowClassName, "w-full border-0 text-start", FOCUS_RING)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onToggle(item.id)}
        >
          <span
            aria-hidden="true"
            style={dotStyle}
            className="transition-[background-color,transform] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
          />
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
          className={cn(rowClassName, "w-full border-0 text-start", FOCUS_RING)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => {
            switchWorkspace(workspaceKey!);
            onNavigate();
          }}
        >
          <span
            aria-hidden="true"
            style={dotStyle}
            className="transition-[background-color,transform] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
          />
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
        className={cn(rowClassName, FOCUS_RING)}
        aria-current={isActive ? "page" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          aria-hidden="true"
          style={dotStyle}
          className="transition-[background-color,transform] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
        />
        <span
          style={labelStyle}
          className="min-w-0 truncate transition-colors duration-nx-micro motion-reduce:transition-none"
        >
          {label}
        </span>

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
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--nx-ink-3, hsl(var(--muted-foreground)))",
        textTransform: "uppercase",
        letterSpacing: "1px",
        padding: "16px 12px 8px",
        marginTop: 4,
      }}
    >
      {label}
    </div>
  );
}

export function RailContent({
  menuItems,
  pathname,
  language,
  onNavigate,
}: {
  menuItems: MenuItem[];
  pathname: string;
  language: string;
  onNavigate: () => void;
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
  t,
}: {
  contextLabel: string;
  title: string;
  onClose?: () => void;
  closeLabel?: string;
  startPageAction?: RailStartPageActionState;
  t?: (key: string, params?: Record<string, string | number>) => string;
}) {
  const showStartPageBar = Boolean(startPageAction && startPageAction.kind !== "hidden" && t);

  const renderStartPageControl = () => {
    if (!startPageAction || !t || startPageAction.kind === "hidden") return null;

    if (startPageAction.kind === "locked") {
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

      return (
        <div className="relative mt-2.5 flex items-center">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  tabIndex={0}
                  aria-label={`${enforcedLabel} — ${enforcedText}`}
                  className="max-w-full cursor-default gap-1 text-[11px] font-medium text-nx-ink-3"
                >
                  <Lock className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{enforcedLabel}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                {enforcedNode}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }

    if (startPageAction.kind === "current_custom") {
      const currentLabel = t("chrome.currentStartPage");
      const resetLabel = t("chrome.resetStartPage");

      return (
        <div className="relative mt-2.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="default" className="max-w-full gap-1 text-[11px] font-medium">
            <Check className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{currentLabel}</span>
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={startPageAction.isPending}
            onClick={() => void startPageAction.onResetStartPage()}
            aria-label={resetLabel}
            className={cn(
              "h-7 shrink-0 gap-1 px-2 text-[11px] font-medium text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink",
              FOCUS_RING
            )}
          >
            <RotateCcw className="size-3 shrink-0" aria-hidden="true" />
            <span>{resetLabel}</span>
          </Button>
        </div>
      );
    }

    if (startPageAction.kind === "current_default") {
      const currentLabel = t("chrome.currentStartPage");
      return (
        <div className="relative mt-2.5 flex items-center">
          <Badge variant="default" className="max-w-full gap-1 text-[11px] font-medium">
            <Check className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{currentLabel}</span>
          </Badge>
        </div>
      );
    }

    const setActionText = t("chrome.setAsStartPage", {
      workspace: startPageAction.workspaceName,
    });
    const setActionNode = renderBidiSingleToken(
      t("chrome.setAsStartPage", { workspace: RAIL_BIDI_TOKEN }),
      startPageAction.workspaceName
    );

    return (
      <div className="relative mt-2.5">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={startPageAction.isPending}
                onClick={() => void startPageAction.onSetAsStartPage()}
                aria-label={setActionText}
                className={cn(
                  "min-h-7 h-auto w-full justify-start gap-1.5 rounded-nx-control border border-nx-line bg-nx-raised/50 px-2.5 py-1.5 text-xs font-medium leading-snug !whitespace-normal text-start text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink",
                  FOCUS_RING
                )}
              >
                <Home className="size-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
                <span className="min-w-0 flex-1 whitespace-normal text-start leading-snug">
                  {setActionNode}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              {setActionNode}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: showStartPageBar ? "24px 20px 14px" : "24px 20px 20px",
        borderBottom: "1px solid var(--nx-line, hsl(var(--border)))",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Subtle accent wash bleeding from the top edge — a wash, not a glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          insetInlineEnd: 0,
          height: "60px",
          background:
            "linear-gradient(180deg, var(--nx-accent-wash, hsl(var(--primary) / 0.1)) 0%, transparent 100%)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      <div className="relative flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div
            className="truncate transition-colors duration-nx-standard ease-nx-enter motion-reduce:transition-none"
            style={{
              fontSize: 10,
              color: "var(--nx-ink-3, hsl(var(--muted-foreground)))",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {contextLabel}
          </div>
          <div
            className="truncate"
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--nx-ink, hsl(var(--foreground)))",
              letterSpacing: "-0.3px",
            }}
          >
            {title}
          </div>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={closeLabel}
            className="-mt-1 h-9 w-9 shrink-0 text-nx-ink-2 hover:text-nx-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {showStartPageBar ? renderStartPageControl() : null}
    </div>
  );
}
