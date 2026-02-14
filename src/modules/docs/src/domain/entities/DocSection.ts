/**
 * DocSection — Represents a single content section within a doc page.
 * Each section has a type that determines how it is rendered.
 */

// ─── Flowchart Types ───────────────────────────────────────────────
export interface FlowNode {
      id: string;
      label: string;
      type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
      description?: string;
}

export interface FlowConnection {
      from: string;
      to: string;
      label?: string;
      style?: 'solid' | 'dashed';
}

// ─── API Table Types ───────────────────────────────────────────────
export interface ApiEndpoint {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      path: string;
      description: string;
      auth: boolean;
      permission?: string;
}

// ─── Tab Types ─────────────────────────────────────────────────────
export interface CodeTab {
      label: string;
      language: string;
      code: string;
      filename?: string;
}

// ─── Step Guide Types ──────────────────────────────────────────────
export interface StepItem {
      titleKey: string;
      contentKey: string;
      code?: string;
      codeLanguage?: string;
      codeFilename?: string;
}

// ─── Section Types ─────────────────────────────────────────────────
export type DocSectionType =
      | 'heading'
      | 'paragraph'
      | 'code'
      | 'tabs'
      | 'flowchart'
      | 'api-table'
      | 'info'
      | 'step-guide'
      | 'table'
      | 'list'
      | 'image';

export interface DocSectionBase {
      type: DocSectionType;
      id?: string; // For TOC anchor linking
}

export interface HeadingSection extends DocSectionBase {
      type: 'heading';
      level: 2 | 3 | 4;
      titleKey: string;
}

export interface ParagraphSection extends DocSectionBase {
      type: 'paragraph';
      contentKey: string;
}

export interface CodeSection extends DocSectionBase {
      type: 'code';
      language: string;
      code: string;
      filename?: string;
      highlightLines?: number[];
}

export interface TabsSection extends DocSectionBase {
      type: 'tabs';
      tabs: CodeTab[];
}

export interface FlowchartSection extends DocSectionBase {
      type: 'flowchart';
      nodes: FlowNode[];
      connections: FlowConnection[];
      direction?: 'vertical' | 'horizontal';
      title?: string;
}

export interface ApiTableSection extends DocSectionBase {
      type: 'api-table';
      endpoints: ApiEndpoint[];
}

export interface InfoSection extends DocSectionBase {
      type: 'info';
      variant: 'note' | 'tip' | 'warning' | 'danger';
      contentKey: string;
      titleKey?: string;
}

export interface StepGuideSection extends DocSectionBase {
      type: 'step-guide';
      steps: StepItem[];
}

export interface TableSection extends DocSectionBase {
      type: 'table';
      headers: string[];
      rows: string[][];
}

export interface ListSection extends DocSectionBase {
      type: 'list';
      variant: 'ordered' | 'unordered';
      items: string[];
}

export interface ImageSection extends DocSectionBase {
      type: 'image';
      src: string;
      alt: string;
      caption?: string;
}

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
      | ImageSection;
