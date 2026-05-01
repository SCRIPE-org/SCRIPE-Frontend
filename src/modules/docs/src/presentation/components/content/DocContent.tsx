"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DocSection } from "../../../domain/entities/DocSection";
import { CodeBlock } from "./CodeBlock";
import { FlowChart } from "./FlowChart";
import { ApiTable } from "./ApiTable";
import { InfoBlock } from "./InfoBlock";
import { StepGuide } from "./StepGuide";
import { TabGroup } from "./TabGroup";
import { ComparisonBlock } from "./ComparisonBlock";
import { FeatureGrid } from "./FeatureGrid";

interface DocContentProps {
  sections: DocSection[];
}

/**
 * DocContent — Renders an ordered list of typed sections.
 * Acts as a dispatcher: each section type maps to a component.
 */
export function DocContent({ sections }: DocContentProps) {
  const { t } = useDocsI18n();

  return (
    <div>
      {sections.map((section, idx) => {
        const key = section.id || `section-${idx}`;

        switch (section.type) {
          case "heading": {
            const id = section.id || section.titleKey.split(".").pop() || `h-${idx}`;
            const Tag = `h${section.level}` as "h2" | "h3" | "h4";
            const className = `docs-h${section.level}`;
            return (
              <Tag key={key} id={id} className={className}>
                <a href={`#${id}`} className="docs-heading-anchor">
                  {t(section.titleKey)}
                  <span className="docs-heading-hash">#</span>
                </a>
              </Tag>
            );
          }

          case "paragraph":
            return (
              <p key={key} className="docs-paragraph">
                {t(section.contentKey)}
              </p>
            );

          case "code":
            return (
              <div key={key}>
                <CodeBlock
                  code={section.code}
                  language={section.language}
                  filename={section.filename}
                  highlightLines={section.highlightLines}
                />
              </div>
            );

          case "tabs":
            return <TabGroup key={key} tabs={section.tabs} />;

          case "flowchart":
            return (
              <FlowChart
                key={key}
                nodes={section.nodes}
                connections={section.connections}
                direction={section.direction}
                title={section.title}
              />
            );

          case "api-table":
            return <ApiTable key={key} endpoints={section.endpoints} />;

          case "info":
            return (
              <InfoBlock
                key={key}
                variant={section.variant}
                contentKey={section.contentKey}
                titleKey={section.titleKey}
              />
            );

          case "step-guide":
            return <StepGuide key={key} steps={section.steps} />;

          case "table":
            return (
              <div key={key} style={{ overflowX: "auto" }}>
                <table className="docs-table">
                  <thead>
                    <tr>
                      {section.headers.map((h, i) => (
                        <th key={i}>{t(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{t(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "list":
            if (section.variant === "ordered") {
              return (
                <ol key={key} className="docs-list">
                  {section.items.map((item, i) => (
                    <li key={i}>{t(item)}</li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={key} className="docs-list">
                {section.items.map((item, i) => (
                  <li key={i}>{t(item)}</li>
                ))}
              </ul>
            );

          case "image":
            return (
              <figure key={key} style={{ marginBottom: "1.5rem" }}>
                <img
                  src={section.src}
                  alt={section.alt}
                  style={{ maxWidth: "100%", borderRadius: "var(--radius)" }}
                />
                {section.caption && (
                  <figcaption
                    style={{
                      fontSize: "0.8125rem",
                      color: "hsl(var(--muted-foreground))",
                      marginTop: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "comparison":
            return <ComparisonBlock key={key} columns={section.columns} />;

          case "feature-grid":
            return <FeatureGrid key={key} items={section.items} columns={section.columns} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
