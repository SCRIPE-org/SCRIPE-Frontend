"use client";

import { useId, useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { TerminalTab as ITab } from "../../../domain/entities/DocSection";
import { TerminalTab } from "../ui/TerminalTab";

interface InteractiveTerminalProps {
  tabs: ITab[];
  titleKey: string;
}

/**
 * Documentation for module export
 */
export function InteractiveTerminal({ tabs, titleKey }: InteractiveTerminalProps) {
  const { t } = useDocsI18n();
  const [activeIdx, setActiveIdx] = useState(0);
  const panelId = useId();

  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 text-lg font-semibold leading-none tracking-tight text-nx-ink">
        {t(titleKey)}
      </div>
      <div className="docs-terminal-window">
        <div className="docs-terminal-header">
          <div className="docs-terminal-dots" aria-hidden="true">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="docs-terminal-tabs" role="tablist">
            {tabs.map((tab, idx) => (
              <TerminalTab
                key={tab.tabId}
                label={tab.label}
                isActive={idx === activeIdx}
                onClick={() => setActiveIdx(idx)}
              />
            ))}
          </div>
        </div>
        <div className="docs-terminal-body" role="tabpanel" id={panelId}>
          <div className="docs-terminal-line">
            <span className="prompt">$</span> <span className="cmd">{tabs[activeIdx].command}</span>
          </div>
          <div className="docs-terminal-output">{t(tabs[activeIdx].outputKey)}</div>
        </div>
      </div>
    </div>
  );
}
