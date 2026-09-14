/**
 * DocSection — Represents content sections within documentation pages.
 * Each section specifies a type determining its presentation behavior and semantic layout.
 */

export * from "./DocInteractiveSections";

import type {
  PersonaSelectorSection,
  LandingHeroBlockSection,
  StatsStripBlockSection,
  ValuePropsBlockSection,
  CtaBannerBlockSection,
  InteractiveTerminalSection,
  FileExplorerSection,
  InteractiveDiagramSection,
  BilingualGlossarySection,
  CompatibilityMatrixSection,
  PipelineSimulatorSection,
  ConfigBuilderSection,
  SchemaVisualizerSection,
  CliSimulatorSection,
  LifecycleTracerSection,
} from "./DocInteractiveSections";

// ─── Flowchart Types ───────────────────────────────────────────────
/**
 * Visual flowchart node with semantic variant and optional icon.
 */
export interface FlowNode {
  id: string;
  label?: string;
  labelKey?: string;
  type?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  description?: string;
  descriptionKey?: string;
  icon?: string;
}

/**
 * Directed connection between flowchart nodes with customizable edge styling.
 */
export interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  labelKey?: string;
  style?: "solid" | "dashed";
}

// ─── API Table Types ───────────────────────────────────────────────
/**
 * HTTP endpoint metadata definition for API reference documentation tables.
 */
export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  descriptionKey: string;
  auth: string;
  permission?: string;
}

// ─── Tab Types ─────────────────────────────────────────────────────
/**
 * Multi-language code snippet tab definition.
 */
export interface CodeTab {
  label: string;
  language: string;
  code: string;
  filename?: string;
}

// ─── Step Guide Types ──────────────────────────────────────────────
/**
 * Sequential procedural guide item with optional code sample.
 */
export interface StepItem {
  titleKey: string;
  contentKey: string;
  code?: string;
  codeLanguage?: string;
  codeFilename?: string;
}

// ─── Comparison Types ──────────────────────────────────────────────
/**
 * Architectural or feature comparison column with sentiment styling.
 */
export interface ComparisonColumn {
  titleKey: string;
  variant: "positive" | "negative" | "neutral" | "warning" | "info";
  items: string[];
}

// ─── Feature Grid Types ────────────────────────────────────────────
/**
 * Visual feature grid card with icon and localized copy.
 */
export interface FeatureGridItem {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

// ─── Section Types ─────────────────────────────────────────────────
/**
 * Discriminated union of all supported documentation section identifier strings.
 */
export type DocSectionType =
  | "heading"
  | "paragraph"
  | "code"
  | "tabs"
  | "flowchart"
  | "api-table"
  | "info"
  | "step-guide"
  | "table"
  | "list"
  | "image"
  | "comparison"
  | "feature-grid"
  | "interactive-terminal"
  | "file-explorer"
  | "interactive-diagram"
  | "bilingual-glossary"
  | "compatibility-matrix"
  | "pipeline-simulator"
  | "config-builder"
  | "schema-visualizer"
  | "cli-simulator"
  | "lifecycle-tracer"
  | "persona-selector"
  | "landing-hero-block"
  | "stats-strip-block"
  | "value-props-block"
  | "cta-banner-block";

/**
 * Base contract common to all documentation sections.
 */
export interface DocSectionBase {
  type: DocSectionType;
  id?: string;
}

/**
 * Structural heading section (H2, H3, H4) with table of contents anchor tracking.
 */
export interface HeadingSection extends DocSectionBase {
  type: "heading";
  level: 2 | 3 | 4;
  titleKey: string;
}

/**
 * Text paragraph section with markdown or localized string interpolation.
 */
export interface ParagraphSection extends DocSectionBase {
  type: "paragraph";
  contentKey: string;
}

/**
 * Syntax-highlighted code block section with line highlighting and file badge.
 */
export interface CodeSection extends DocSectionBase {
  type: "code";
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
}

/**
 * Tabbed code block switching across multiple languages or package managers.
 */
export interface TabsSection extends DocSectionBase {
  type: "tabs";
  tabs: CodeTab[];
}

/**
 * Visual architectural flowchart section displaying nodes and directional links.
 */
export interface FlowchartSection extends DocSectionBase {
  type: "flowchart";
  nodes: FlowNode[];
  connections: FlowConnection[];
  direction?: "vertical" | "horizontal";
  title?: string;
  titleKey?: string;
}

/**
 * REST API table documenting routes, HTTP verbs, and permissions.
 */
export interface ApiTableSection extends DocSectionBase {
  type: "api-table";
  endpoints: ApiEndpoint[];
}

/**
 * Callout alert box conveying contextual notes, tips, warnings, or caution advisories.
 */
export interface InfoSection extends DocSectionBase {
  type: "info";
  variant: "note" | "tip" | "warning" | "danger" | "info" | "success" | "caution";
  contentKey: string;
  titleKey?: string;
}

/**
 * Numbered implementation guide breaking down tasks into distinct instructions.
 */
export interface StepGuideSection extends DocSectionBase {
  type: "step-guide";
  steps: StepItem[];
}

/**
 * Standard relational data table with headers and data rows.
 */
export interface TableSection extends DocSectionBase {
  type: "table";
  headers: string[];
  rows: string[][];
}

/**
 * Bulleted or numbered list section.
 */
export interface ListSection extends DocSectionBase {
  type: "list";
  variant: "ordered" | "unordered";
  items: string[];
}

/**
 * Media section displaying illustrations, screenshots, or architectural diagrams.
 */
export interface ImageSection extends DocSectionBase {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Pros/cons or capability comparison matrix across different architectural choices.
 */
export interface ComparisonSection extends DocSectionBase {
  type: "comparison";
  columns: ComparisonColumn[];
}

/**
 * Grid section highlighting capabilities with icon markers.
 */
export interface FeatureGridSection extends DocSectionBase {
  type: "feature-grid";
  items: FeatureGridItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Comprehensive discriminated union representing any renderable documentation section.
 */
export type DocSection =
  | HeadingSection
  | ParagraphSection
  | CodeSection
  | TabsSection
  | FlowchartSection
  | ApiTableSection
  | InfoSection
  | StepGuideSection
  | TableSection
  | ListSection
  | ImageSection
  | ComparisonSection
  | FeatureGridSection
  | InteractiveTerminalSection
  | FileExplorerSection
  | InteractiveDiagramSection
  | BilingualGlossarySection
  | CompatibilityMatrixSection
  | PipelineSimulatorSection
  | ConfigBuilderSection
  | SchemaVisualizerSection
  | CliSimulatorSection
  | LifecycleTracerSection
  | PersonaSelectorSection
  | LandingHeroBlockSection
  | StatsStripBlockSection
  | ValuePropsBlockSection
  | CtaBannerBlockSection;
