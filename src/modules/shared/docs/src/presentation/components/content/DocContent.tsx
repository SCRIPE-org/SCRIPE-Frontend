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
import { InteractiveTerminal } from "./InteractiveTerminal";
import { FileExplorer } from "./FileExplorer";
import { InteractiveDiagram } from "./InteractiveDiagram";
import { BilingualGlossary } from "./BilingualGlossary";
import { CompatibilityMatrix } from "./CompatibilityMatrix";
import { PipelineSimulator } from "./PipelineSimulator";
import { ConfigBuilder } from "./ConfigBuilder";
import { SchemaVisualizer } from "./SchemaVisualizer";
import { CliSimulator } from "./CliSimulator";
import { LifecycleTracer } from "./LifecycleTracer";
import { PersonaSelector } from "./PersonaSelector";
import { LandingHeroBlock } from "./LandingHeroBlock";
import { StatsStripBlock } from "./StatsStripBlock";
import { ValuePropsBlock } from "./ValuePropsBlock";
import { CtaBannerBlock } from "./CtaBannerBlock";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";
import Image from "next/image";

interface DocContentProps {
  sections: DocSection[];
}

/**
 * DocContent — Renders an ordered list of typed sections.
 * Acts as a dispatcher: each section type maps to a component.
 */
export function DocContent({ sections }: DocContentProps) {
  const { t, direction } = useDocsI18n();

  return (
    <div>
      {sections.map((section, idx) => {
        const key = section.id || `section-${idx}`;

        switch (section.type) {
          case "heading": {
            const id = section.id || section.titleKey.split(".").pop() || `h-${idx}`;
            const Tag = `h${section.level}` as "h2" | "h3" | "h4";
            const className = `docs-h${section.level} group relative flex items-center`;

            const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              const url = `${window.location.origin}${window.location.pathname}#${id}`;
              navigator.clipboard
                .writeText(url)
                .then(() => {
                  window.history.pushState(null, "", `#${id}`);
                  const element = document.getElementById(id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                })
                .catch((err) => {
                  console.error("Failed to copy anchor link: ", err);
                });
            };

            return (
              <Tag key={key} id={id} className={className}>
                <span className="flex-1">{t(section.titleKey)}</span>
                <a
                  href={`#${id}`}
                  onClick={handleAnchorClick}
                  className="docs-heading-anchor-link ms-2 opacity-0 transition-opacity duration-nx-micro ease-nx-enter focus:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
                  aria-label={`Link to ${t(section.titleKey)}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline-block text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-accent motion-reduce:transition-none"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
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
              <div key={key} className="mb-6 overflow-hidden rounded-nx-md border border-nx-line">
                <Table dir={direction}>
                  <TableHeader className="bg-nx-raised">
                    <TableRow>
                      {section.headers.map((h, i) => (
                        <TableHead key={i}>{t(h)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.rows.map((row, ri) => (
                      <TableRow key={ri}>
                        {row.map((cell, ci) => (
                          <TableCell key={ci}>{t(cell)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Image
                  src={section.src}
                  alt={section.alt}
                  width={800}
                  height={450}
                  unoptimized
                  style={{ maxWidth: "100%", borderRadius: "var(--nx-radius-lg)" }}
                />
                {section.caption && (
                  <figcaption
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--nx-ink-3)",
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

          case "interactive-terminal":
            return (
              <InteractiveTerminal key={key} tabs={section.tabs} titleKey={section.titleKey} />
            );

          case "file-explorer":
            return <FileExplorer key={key} moduleName={section.moduleName} files={section.files} />;

          case "interactive-diagram":
            return (
              <InteractiveDiagram
                key={key}
                nodes={section.nodes}
                connections={section.connections}
                titleKey={section.titleKey}
              />
            );

          case "bilingual-glossary":
            return <BilingualGlossary key={key} terms={section.terms} />;

          case "compatibility-matrix":
            return <CompatibilityMatrix key={key} headers={section.headers} rows={section.rows} />;

          case "pipeline-simulator":
            return (
              <PipelineSimulator
                key={key}
                titleKey={section.titleKey}
                samplePayloadKey={section.samplePayloadKey}
              />
            );

          case "config-builder":
            return <ConfigBuilder key={key} titleKey={section.titleKey} />;

          case "schema-visualizer":
            return (
              <SchemaVisualizer key={key} tables={section.tables} titleKey={section.titleKey} />
            );

          case "cli-simulator":
            return <CliSimulator key={key} titleKey={section.titleKey} />;

          case "lifecycle-tracer":
            return <LifecycleTracer key={key} steps={section.steps} titleKey={section.titleKey} />;

          case "persona-selector":
            return <PersonaSelector key={key} />;

          case "landing-hero-block":
            return <LandingHeroBlock key={key} section={section} />;

          case "stats-strip-block":
            return <StatsStripBlock key={key} section={section} />;

          case "value-props-block":
            return <ValuePropsBlock key={key} section={section} />;

          case "cta-banner-block":
            return <CtaBannerBlock key={key} section={section} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
