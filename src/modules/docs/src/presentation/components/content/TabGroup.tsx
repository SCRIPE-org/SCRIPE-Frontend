// UI-EXCEPTION: compact studio layout
"use client";

import { useState } from "react";
import type { CodeTab } from "../../../domain/entities/DocSection";
import { CodeBlock } from "./CodeBlock";

interface TabGroupProps {
  tabs: CodeTab[];
}

export function TabGroup({ tabs }: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="docs-tabs">
      <div className="docs-tabs-header">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className="docs-tab-btn"
            data-active={idx === activeTab}
            onClick={() => setActiveTab(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[activeTab] && (
        <div>
          <div className="docs-code-pre">
            <CodeBlockInline
              code={tabs[activeTab].code}
              language={tabs[activeTab].language}
              filename={tabs[activeTab].filename}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Inline code block for tabs — no wrapping border (tabs provide it) */
function CodeBlockInline({
  code,
  language,
  filename,
}: {
  code: string;
  language: string;
  filename?: string;
}) {
  return <CodeBlock code={code} language={language} filename={filename} />;
}
