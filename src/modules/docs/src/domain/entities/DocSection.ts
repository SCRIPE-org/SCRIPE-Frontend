/**
 * DocSection — Represents a single content section within a doc page.
 * Each section has a type that determines how it is rendered.
 */

// ─── Flowchart Types ───────────────────────────────────────────────
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
 * Domain model representing a Flow Connection structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Api Endpoint structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Code Tab structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CodeTab {
  label: string;
  language: string;
  code: string;
  filename?: string;
}

// ─── Step Guide Types ──────────────────────────────────────────────
/**
 * Domain model representing a Step Item structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Comparison Column structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ComparisonColumn {
  titleKey: string;
  variant: "positive" | "negative" | "neutral" | "warning" | "info";
  items: string[];
}

// ─── Feature Grid Types ────────────────────────────────────────────
/**
 * Domain model representing a Feature Grid Item structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface FeatureGridItem {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

// ─── Section Types ─────────────────────────────────────────────────
/**
 * Domain model representing a Doc Section Type structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
  | "lifecycle-tracer";

/**
 * Domain model representing a Doc Section Base structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DocSectionBase {
  type: DocSectionType;
  id?: string; // For TOC anchor linking
}

/**
 * Domain model representing a Heading Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface HeadingSection extends DocSectionBase {
  type: "heading";
  level: 2 | 3 | 4;
  titleKey: string;
}

/**
 * Domain model representing a Paragraph Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ParagraphSection extends DocSectionBase {
  type: "paragraph";
  contentKey: string;
}

/**
 * Domain model representing a Code Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CodeSection extends DocSectionBase {
  type: "code";
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
}

/**
 * Domain model representing a Tabs Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface TabsSection extends DocSectionBase {
  type: "tabs";
  tabs: CodeTab[];
}

/**
 * Domain model representing a Flowchart Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Api Table Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ApiTableSection extends DocSectionBase {
  type: "api-table";
  endpoints: ApiEndpoint[];
}

/**
 * Domain model representing a Info Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface InfoSection extends DocSectionBase {
  type: "info";
  variant: "note" | "tip" | "warning" | "danger" | "info" | "success" | "caution";
  contentKey: string;
  titleKey?: string;
}

/**
 * Domain model representing a Step Guide Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface StepGuideSection extends DocSectionBase {
  type: "step-guide";
  steps: StepItem[];
}

/**
 * Domain model representing a Table Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface TableSection extends DocSectionBase {
  type: "table";
  headers: string[];
  rows: string[][];
}

/**
 * Domain model representing a List Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ListSection extends DocSectionBase {
  type: "list";
  variant: "ordered" | "unordered";
  items: string[];
}

/**
 * Domain model representing a Image Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ImageSection extends DocSectionBase {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Domain model representing a Comparison Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ComparisonSection extends DocSectionBase {
  type: "comparison";
  columns: ComparisonColumn[];
}

/**
 * Domain model representing a Feature Grid Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface FeatureGridSection extends DocSectionBase {
  type: "feature-grid";
  items: FeatureGridItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Domain model representing a Doc Section structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
  | LifecycleTracerSection;

export interface TerminalTab {
  tabId: string;
  label: string;
  command: string;
  outputKey: string;
}

export interface InteractiveTerminalSection extends DocSectionBase {
  type: "interactive-terminal";
  tabs: TerminalTab[];
  titleKey: string;
}

export interface ExplorerFile {
  path: string;
  name: string;
  type: "dir" | "file";
  depth: number;
  descriptionKey: string;
}

export interface FileExplorerSection extends DocSectionBase {
  type: "file-explorer";
  moduleName: string;
  files: ExplorerFile[];
}

export interface DiagramNode {
  id: string;
  labelKey: string;
  type: "default" | "primary" | "success" | "warning";
  descriptionKey: string;
}

export interface DiagramConnection {
  from: string;
  to: string;
  labelKey?: string;
}

export interface InteractiveDiagramSection extends DocSectionBase {
  type: "interactive-diagram";
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  titleKey?: string;
}

export interface GlossaryTerm {
  termEn: string;
  termAr: string;
  descriptionKey: string;
}

export interface BilingualGlossarySection extends DocSectionBase {
  type: "bilingual-glossary";
  terms: GlossaryTerm[];
}

export interface MatrixCell {
  value: string;
  status: "supported" | "partial" | "unsupported";
}

export interface CompatibilityMatrixSection extends DocSectionBase {
  type: "compatibility-matrix";
  headers: string[];
  rows: { nameKey: string; cells: MatrixCell[] }[];
}

export interface PipelineSimulatorSection extends DocSectionBase {
  type: "pipeline-simulator";
  titleKey: string;
  samplePayloadKey: string;
}

export interface ConfigBuilderSection extends DocSectionBase {
  type: "config-builder";
  titleKey: string;
}

export interface SchemaColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  nullable: boolean;
  notesKey: string;
}

export interface SchemaTable {
  tableName: string;
  columns: SchemaColumn[];
}

export interface SchemaVisualizerSection extends DocSectionBase {
  type: "schema-visualizer";
  tables: SchemaTable[];
  titleKey: string;
}

export interface CliSimulatorSection extends DocSectionBase {
  type: "cli-simulator";
  titleKey: string;
}

export interface LifecycleStep {
  id: string;
  actor: "view" | "viewmodel" | "repository" | "controller" | "handler" | "database";
  labelKey: string;
  descriptionKey: string;
  direction: "inbound" | "outbound";
}

export interface LifecycleTracerSection extends DocSectionBase {
  type: "lifecycle-tracer";
  steps: LifecycleStep[];
  titleKey: string;
}
