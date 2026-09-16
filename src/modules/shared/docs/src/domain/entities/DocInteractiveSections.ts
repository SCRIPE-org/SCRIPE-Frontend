/**
 * DocInteractiveSections — Domain interfaces and types for interactive and block-level doc sections.
 * Defines models for simulations, diagrams, visualizers, hero blocks, and marketing components.
 */

import type { DocSectionBase } from "./DocSection";

/**
 * Interactive persona selector section, allowing doc readers to tailor content to their role.
 */
export interface PersonaSelectorSection extends DocSectionBase {
  type: "persona-selector";
}

/**
 * Marketing landing hero block section featuring animated headings, CTAs, and trust indicators.
 */
export interface LandingHeroBlockSection extends DocSectionBase {
  type: "landing-hero-block";
  kickerKey?: string;
  title1Key: string;
  title2Key?: string;
  subtitleKey: string;
  primaryCtaKey: string;
  primaryCtaHref: string;
  secondaryCtaKey?: string;
  secondaryCtaHref?: string;
}

/**
 * Single statistical counter item for stats strips.
 */
export interface StatItem {
  value: string;
  labelKey: string;
}

/**
 * High-impact numerical stats ribbon highlighting platform metrics.
 */
export interface StatsStripBlockSection extends DocSectionBase {
  type: "stats-strip-block";
  stats: StatItem[];
}

/**
 * Feature or value proposition highlight card definition.
 */
export interface ValuePropItem {
  icon: string;
  titleKey: string;
  descKey: string;
}

/**
 * Value proposition grid showcasing key architectural and business advantages.
 */
export interface ValuePropsBlockSection extends DocSectionBase {
  type: "value-props-block";
  titleKey: string;
  props: ValuePropItem[];
}

/**
 * Call-to-action banner block encouraging conversion or documentation onboarding.
 */
export interface CtaBannerBlockSection extends DocSectionBase {
  type: "cta-banner-block";
  titleKey: string;
  subtitleKey: string;
  primaryCtaKey: string;
  primaryCtaHref: string;
  secondaryCtaKey?: string;
  secondaryCtaHref?: string;
}

/**
 * Tab configuration for the interactive terminal component.
 */
export interface TerminalTab {
  tabId: string;
  label: string;
  command: string;
  outputKey: string;
}

/**
 * Interactive terminal section with runnable command simulation.
 */
export interface InteractiveTerminalSection extends DocSectionBase {
  type: "interactive-terminal";
  tabs: TerminalTab[];
  titleKey: string;
}

/**
 * Virtual file system node representation for the interactive file explorer.
 */
export interface ExplorerFile {
  path: string;
  name: string;
  type: "dir" | "file";
  depth: number;
  descriptionKey: string;
}

/**
 * Interactive repository file explorer illustrating clean architecture folder hierarchy.
 */
export interface FileExplorerSection extends DocSectionBase {
  type: "file-explorer";
  moduleName: string;
  files: ExplorerFile[];
}

/**
 * Diagram node specification for interactive flowcharts and architectural topologies.
 */
export interface DiagramNode {
  id: string;
  labelKey: string;
  type: "default" | "primary" | "success" | "warning";
  descriptionKey: string;
}

/**
 * Edge connection between diagram nodes.
 */
export interface DiagramConnection {
  from: string;
  to: string;
  labelKey?: string;
}

/**
 * Interactive architectural diagram section with clickable nodes and relationships.
 */
export interface InteractiveDiagramSection extends DocSectionBase {
  type: "interactive-diagram";
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  titleKey?: string;
}

/**
 * Dual-language terminology definition for technical glossaries.
 */
export interface GlossaryTerm {
  termEn: string;
  termAr: string;
  descriptionKey: string;
}

/**
 * Bilingual technical glossary section supporting English and Arabic domain definitions.
 */
export interface BilingualGlossarySection extends DocSectionBase {
  type: "bilingual-glossary";
  terms: GlossaryTerm[];
}

/**
 * Individual cell entry in a feature or environment compatibility matrix.
 */
export interface MatrixCell {
  value: string;
  status: "supported" | "partial" | "unsupported";
}

/**
 * Multi-dimensional compatibility matrix section comparing features across editions or providers.
 */
export interface CompatibilityMatrixSection extends DocSectionBase {
  type: "compatibility-matrix";
  headers: string[];
  rows: { nameKey: string; cells: MatrixCell[] }[];
}

/**
 * Interactive webhook or integration pipeline simulator section.
 */
export interface PipelineSimulatorSection extends DocSectionBase {
  type: "pipeline-simulator";
  titleKey: string;
  samplePayloadKey: string;
}

/**
 * Interactive JSON/YAML configuration builder section for platform settings.
 */
export interface ConfigBuilderSection extends DocSectionBase {
  type: "config-builder";
  titleKey: string;
}

/**
 * Column definition for relational schema visualization.
 */
export interface SchemaColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  nullable: boolean;
  notesKey: string;
}

/**
 * Table structure for entity relationship diagram and schema viewer.
 */
export interface SchemaTable {
  tableName: string;
  columns: SchemaColumn[];
}

/**
 * Relational schema visualizer section displaying table structures and key constraints.
 */
export interface SchemaVisualizerSection extends DocSectionBase {
  type: "schema-visualizer";
  tables: SchemaTable[];
  titleKey: string;
}

/**
 * Command-line interface simulator section providing interactive command testing.
 */
export interface CliSimulatorSection extends DocSectionBase {
  type: "cli-simulator";
  titleKey: string;
}

/**
 * Execution step within an application request lifecycle.
 */
export interface LifecycleStep {
  id: string;
  actor: "view" | "viewmodel" | "repository" | "controller" | "handler" | "database";
  labelKey: string;
  descriptionKey: string;
  direction: "inbound" | "outbound";
}

/**
 * End-to-end request lifecycle tracer section documenting CQRS dispatch and persistence flows.
 */
export interface LifecycleTracerSection extends DocSectionBase {
  type: "lifecycle-tracer";
  steps: LifecycleStep[];
  titleKey: string;
}
