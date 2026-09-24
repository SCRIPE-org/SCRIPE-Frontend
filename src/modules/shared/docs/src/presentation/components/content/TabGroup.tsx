// UI-EXCEPTION: compact studio layout
"use client";

import { useCallback, useId, useState } from "react";
import type { CodeTab } from "../../../domain/entities/DocSection";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { CodeBlock } from "./CodeBlock";

interface TabGroupProps {
  tabs: CodeTab[];
}

/**
 * TabGroup — a set of alternative code samples for the same task.
 *
 * Built on the tablist pattern rather than styled buttons: without
 * role/aria-selected/aria-controls a screen reader reads seven unlabelled
 * buttons and a slab of code with no stated relationship between them.
 * Arrow keys move between tabs and resolve against the live writing
 * direction, so ArrowRight still means "the next tab" in Arabic.
 */
export function TabGroup({ tabs }: TabGroupProps) {
  const { t, direction } = useDocsI18n();
  const [activeTab, setActiveTab] = useState(0);
  const baseId = useId();

  const tabId = (idx: number) => `${baseId}-tab-${idx}`;
  const panelId = (idx: number) => `${baseId}-panel-${idx}`;

  const tabsCount = tabs.length;
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (tabsCount === 0) return;
      const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
      const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";

      let next: number | null = null;
      if (event.key === forward) next = (activeTab + 1) % tabsCount;
      else if (event.key === backward) next = (activeTab - 1 + tabsCount) % tabsCount;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabsCount - 1;

      if (next === null) return;
      event.preventDefault();
      setActiveTab(next);
      document.getElementById(`${baseId}-tab-${next}`)?.focus();
    },
    [activeTab, direction, tabsCount, baseId]
  );

  return (
    <div className="docs-tabs">
      <div
        className="docs-tabs-header"
        role="tablist"
        aria-label={t("common.codeSamples")}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            id={tabId(idx)}
            className="docs-tab-btn"
            role="tab"
            aria-selected={idx === activeTab}
            aria-controls={panelId(idx)}
            tabIndex={idx === activeTab ? 0 : -1}
            onClick={() => setActiveTab(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[activeTab] && (
        <div role="tabpanel" id={panelId(activeTab)} aria-labelledby={tabId(activeTab)}>
          <CodeBlock
            code={tabs[activeTab].code}
            language={tabs[activeTab].language}
            filename={tabs[activeTab].filename}
          />
        </div>
      )}
    </div>
  );
}
