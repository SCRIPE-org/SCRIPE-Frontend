/**
 * CommercialMegaPanel Component
 *
 * Renders the full-width animated dropdown panel for the commercial documentation header.
 * Displays category overview icons, titles, and a multi-column link grid with descriptions.
 */
"use client";

import { type CSSProperties, type RefObject, type KeyboardEvent } from "react";
import Link from "next/link";
import { SECTION_ICONS } from "./CommercialHeaderIcons";
import {
  MEGA_PANEL_ID,
  sectionItemKey,
  type NavSection,
} from "./CommercialNavData";

/**
 * Properties for the CommercialMegaPanel component.
 */
export interface CommercialMegaPanelProps {
  /** The currently active navigation category data, or undefined when closed. */
  activeData: NavSection | undefined;
  /** Localized display label for the active section. */
  activeLabel: string;
  /** Whether the panel is currently transitioned into view. */
  panelVisible: boolean;
  /** DOM ref attached to the panel container for focus trapping. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** Current browser router pathname to highlight active route. */
  pathname: string;
  /** Callback fired when pointer enters panel, cancelling scheduled close timers. */
  onCancelClose: () => void;
  /** Callback fired when pointer leaves panel, scheduling a delayed close. */
  onScheduleClose: () => void;
  /** Keyboard event handler implementing focus trapping for Tab navigation. */
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  /** Callback fired to close the panel immediately. */
  onClose: () => void;
  /** Localization translation function. */
  t: (key: string, params?: Record<string, unknown>) => string;
}

/**
 * Renders the mega menu popup panel and its dismiss backdrop overlay.
 */
export function CommercialMegaPanel({
  activeData,
  activeLabel,
  panelVisible,
  panelRef,
  pathname,
  onCancelClose,
  onScheduleClose,
  onKeyDown,
  onClose,
  t,
}: CommercialMegaPanelProps) {
  if (!activeData) return null;

  return (
    <>
      <div
        id={MEGA_PANEL_ID}
        ref={panelRef}
        className="com-mega-panel"
        data-state={panelVisible ? "open" : "closed"}
        onMouseEnter={onCancelClose}
        onMouseLeave={onScheduleClose}
        onKeyDown={onKeyDown}
        role="region"
        aria-label={t("commercialHeader.megaPanelAria", { label: activeLabel })}
      >
        <div className="com-mega-panel-inner">
          {/* Panel Header */}
          <div className="com-mega-panel-header">
            <span style={{ color: "var(--com-violet)", display: "flex", alignItems: "center" }}>
              {SECTION_ICONS[activeData.id]}
            </span>
            <span className="com-mega-panel-label">{activeLabel}</span>
            <div className="com-mega-panel-divider" />
          </div>

          {/* Links — 2-column grid */}
          {activeData.items.map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="com-mega-link"
              style={{ "--di": idx } as CSSProperties}
              data-active={pathname === item.href ? "true" : "false"}
              onClick={onClose}
            >
              <span className="com-mega-link-icon" aria-hidden="true">
                {SECTION_ICONS[activeData.id]}
              </span>
              <span className="com-mega-link-text">
                <span className="com-mega-link-title">
                  {t(sectionItemKey(activeData.id, item.key, "title"))}
                </span>
                <span className="com-mega-link-desc">
                  {t(sectionItemKey(activeData.id, item.key, "desc"))}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Backdrop overlay to close on outside click */}
      {panelVisible && (
        <div className="com-mega-backdrop" onClick={onClose} aria-hidden="true" />
      )}
    </>
  );
}
