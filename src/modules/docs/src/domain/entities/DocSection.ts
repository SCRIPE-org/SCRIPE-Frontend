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
 * Interface structure detailing the properties and attributes of Flow Connection.
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
 * Interface structure detailing the properties and attributes of Api Endpoint.
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
 * Interface structure detailing the properties and attributes of Code Tab.
 */
export interface CodeTab {
  label: string;
  language: string;
  code: string;
  filename?: string;
}

// ─── Step Guide Types ──────────────────────────────────────────────
/**
 * Interface structure detailing the properties and attributes of Step Item.
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
 * Interface structure detailing the properties and attributes of Comparison Column.
 */
export interface ComparisonColumn {
  titleKey: string;
  variant: "positive" | "negative" | "neutral";
  items: string[];
}

// ─── Feature Grid Types ────────────────────────────────────────────
/**
 * Interface structure detailing the properties and attributes of Feature Grid Item.
 */
export interface FeatureGridItem {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

// ─── Section Types ─────────────────────────────────────────────────
/**
 * Type declaration definition describing the schema of doc section type.
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
  | "feature-grid";

/**
 * Interface structure detailing the properties and attributes of Doc Section Base.
 */
export interface DocSectionBase {
  type: DocSectionType;
  id?: string; // For TOC anchor linking
}

/**
 * Interface structure detailing the properties and attributes of Heading Section.
 */
export interface HeadingSection extends DocSectionBase {
  type: "heading";
  level: 2 | 3 | 4;
  titleKey: string;
}

/**
 * Interface structure detailing the properties and attributes of Paragraph Section.
 */
export interface ParagraphSection extends DocSectionBase {
  type: "paragraph";
  contentKey: string;
}

/**
 * Interface structure detailing the properties and attributes of Code Section.
 */
export interface CodeSection extends DocSectionBase {
  type: "code";
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
}

/**
 * Interface structure detailing the properties and attributes of Tabs Section.
 */
export interface TabsSection extends DocSectionBase {
  type: "tabs";
  tabs: CodeTab[];
}

/**
 * Interface structure detailing the properties and attributes of Flowchart Section.
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
 * Interface structure detailing the properties and attributes of Api Table Section.
 */
export interface ApiTableSection extends DocSectionBase {
  type: "api-table";
  endpoints: ApiEndpoint[];
}

/**
 * Interface structure detailing the properties and attributes of Info Section.
 */
export interface InfoSection extends DocSectionBase {
  type: "info";
  variant: "note" | "tip" | "warning" | "danger";
  contentKey: string;
  titleKey?: string;
}

/**
 * Interface structure detailing the properties and attributes of Step Guide Section.
 */
export interface StepGuideSection extends DocSectionBase {
  type: "step-guide";
  steps: StepItem[];
}

/**
 * Interface structure detailing the properties and attributes of Table Section.
 */
export interface TableSection extends DocSectionBase {
  type: "table";
  headers: string[];
  rows: string[][];
}

/**
 * Interface structure detailing the properties and attributes of List Section.
 */
export interface ListSection extends DocSectionBase {
  type: "list";
  variant: "ordered" | "unordered";
  items: string[];
}

/**
 * Interface structure detailing the properties and attributes of Image Section.
 */
export interface ImageSection extends DocSectionBase {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Interface structure detailing the properties and attributes of Comparison Section.
 */
export interface ComparisonSection extends DocSectionBase {
  type: "comparison";
  columns: ComparisonColumn[];
}

/**
 * Interface structure detailing the properties and attributes of Feature Grid Section.
 */
export interface FeatureGridSection extends DocSectionBase {
  type: "feature-grid";
  items: FeatureGridItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Type declaration definition describing the schema of doc section.
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
  | FeatureGridSection;
