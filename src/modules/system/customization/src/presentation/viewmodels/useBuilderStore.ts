/**
 * useBuilderStore — Zustand store for the Login Page Drag-and-Drop Builder
 *
 * Manages canvas components, selection, and undo/redo history.
 * Follows Clean Architecture: no API calls — pure state management.
 * The parent useStudioViewModel syncs builder state → draft → postMessage.
 *
 * @module customization/presentation/viewmodels
 */
"use client";

import { create } from "zustand";
import type { CanvasComponent, CanvasComponentType, CanvasBackground } from "../../domain/entities/CanvasComponent";
import {
  DEFAULT_CANVAS_COMPONENTS,
  DEFAULT_CANVAS_GRID_ROWS,
  DEFAULT_CANVAS_BACKGROUND,
  COMPONENT_CATALOG,
  generateComponentId,
  findNextAvailableRow,
  hasSingletonComponent,
} from "../../domain/entities/CanvasComponent";

// ── History Snapshot ──────────────────────────────────────
interface CanvasSnapshot {
  components: CanvasComponent[];
  canvasGridRows: number;
  canvasBackground: CanvasBackground;
}

const MAX_HISTORY = 50;

// ── Store State ──────────────────────────────────────────
interface BuilderState {
  // Canvas state
  components: CanvasComponent[];
  selectedComponentId: string | null;
  canvasGridRows: number;
  canvasBackground: CanvasBackground;
  snapToGrid: boolean;

  // History
  _past: CanvasSnapshot[];
  _future: CanvasSnapshot[];

  // Computed
  canUndo: boolean;
  canRedo: boolean;

  // ── Actions ──
  /** Initialize builder from draft data */
  initialize: (components: CanvasComponent[], gridRows: number, background: CanvasBackground) => void;

  /** Add a new component to the canvas */
  addComponent: (type: CanvasComponentType) => CanvasComponent | null;

  /** Remove a component by ID */
  removeComponent: (id: string) => boolean;

  /** Update a component's properties */
  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;

  /** Move a component to a new grid position */
  moveComponent: (id: string, gridColumn: string, gridRow: string) => void;

  /** Select a component (or null to deselect) */
  selectComponent: (id: string | null) => void;

  /** Reorder z-index: 'forward' or 'back' */
  reorderZ: (id: string, direction: 'forward' | 'back') => void;

  /** Duplicate a component */
  duplicateComponent: (id: string) => void;

  /** Toggle visibility of a component */
  toggleVisibility: (id: string) => void;

  /** Set canvas grid rows */
  setCanvasGridRows: (rows: number) => void;

  /** Set canvas background */
  setCanvasBackground: (bg: CanvasBackground) => void;

  /** Toggle snap to grid */
  setSnapToGrid: (snap: boolean) => void;

  /** Undo last action */
  undo: () => void;

  /** Redo last undone action */
  redo: () => void;

  /** Reset to default canvas */
  reset: () => void;
}

// ── Helper: Create a snapshot of current canvas state ─────
function takeSnapshot(state: BuilderState): CanvasSnapshot {
  return {
    components: state.components.map(c => ({ ...c, props: { ...c.props } })),
    canvasGridRows: state.canvasGridRows,
    canvasBackground: { ...state.canvasBackground },
  };
}

// ── Helper: Push current state to history before mutation ─
function pushHistory(state: BuilderState): Partial<BuilderState> {
  const snapshot = takeSnapshot(state);
  const newPast = [...state._past, snapshot].slice(-MAX_HISTORY);
  return {
    _past: newPast,
    _future: [], // Clear future on new action
    canUndo: true,
    canRedo: false,
  };
}

// ── Store ────────────────────────────────────────────────
export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Initial state
  components: DEFAULT_CANVAS_COMPONENTS,
  selectedComponentId: null,
  canvasGridRows: DEFAULT_CANVAS_GRID_ROWS,
  canvasBackground: DEFAULT_CANVAS_BACKGROUND,
  snapToGrid: true,

  _past: [],
  _future: [],
  canUndo: false,
  canRedo: false,

  // ── Initialize from draft ──
  initialize: (components, gridRows, background) => {
    set({
      components: components.length > 0 ? components : DEFAULT_CANVAS_COMPONENTS,
      canvasGridRows: gridRows || DEFAULT_CANVAS_GRID_ROWS,
      canvasBackground: background || DEFAULT_CANVAS_BACKGROUND,
      selectedComponentId: null,
      _past: [],
      _future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  // ── Add Component ──
  addComponent: (type) => {
    const state = get();
    const catalog = COMPONENT_CATALOG.find(c => c.type === type);
    if (!catalog) return null;

    // Singleton check
    if (catalog.singleton && hasSingletonComponent(state.components, type)) {
      return null;
    }

    const nextRow = findNextAvailableRow(state.components);
    const newComponent: CanvasComponent = {
      id: generateComponentId(),
      type,
      gridColumn: catalog.defaultGridColumn,
      gridRow: `${nextRow} / ${nextRow + 1}`,
      alignment: 'center',
      verticalAlignment: 'center',
      props: { ...catalog.defaultProps },
      zIndex: 1,
      visible: true,
    };

    const history = pushHistory(state);
    const newGridRows = Math.max(state.canvasGridRows, nextRow + 1);

    set({
      ...history,
      components: [...state.components, newComponent],
      selectedComponentId: newComponent.id,
      canvasGridRows: newGridRows,
    });

    return newComponent;
  },

  // ── Remove Component ──
  removeComponent: (id) => {
    const state = get();
    const comp = state.components.find(c => c.id === id);
    if (!comp) return false;

    // Cannot remove required components
    const catalog = COMPONENT_CATALOG.find(c => c.type === comp.type);
    if (catalog?.required) return false;

    const history = pushHistory(state);
    set({
      ...history,
      components: state.components.filter(c => c.id !== id),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    });
    return true;
  },

  // ── Update Component ──
  updateComponent: (id, updates) => {
    const state = get();
    const history = pushHistory(state);
    set({
      ...history,
      components: state.components.map(c =>
        c.id === id ? { ...c, ...updates, props: updates.props ? { ...c.props, ...updates.props } : c.props } : c
      ),
    });
  },

  // ── Move Component ──
  moveComponent: (id, gridColumn, gridRow) => {
    const state = get();
    const history = pushHistory(state);
    set({
      ...history,
      components: state.components.map(c =>
        c.id === id ? { ...c, gridColumn, gridRow } : c
      ),
    });
  },

  // ── Select Component ──
  selectComponent: (id) => {
    set({ selectedComponentId: id });
  },

  // ── Reorder Z ──
  reorderZ: (id, direction) => {
    const state = get();
    const comp = state.components.find(c => c.id === id);
    if (!comp) return;

    const history = pushHistory(state);
    const delta = direction === 'forward' ? 1 : -1;
    set({
      ...history,
      components: state.components.map(c =>
        c.id === id ? { ...c, zIndex: Math.max(0, c.zIndex + delta) } : c
      ),
    });
  },

  // ── Duplicate Component ──
  duplicateComponent: (id) => {
    const state = get();
    const comp = state.components.find(c => c.id === id);
    if (!comp) return;

    // Singleton check
    const catalog = COMPONENT_CATALOG.find(c => c.type === comp.type);
    if (catalog?.singleton && hasSingletonComponent(state.components, comp.type)) return;

    const nextRow = findNextAvailableRow(state.components);
    const newComp: CanvasComponent = {
      ...comp,
      id: generateComponentId(),
      gridRow: `${nextRow} / ${nextRow + 1}`,
      props: { ...comp.props },
    };

    const history = pushHistory(state);
    const newGridRows = Math.max(state.canvasGridRows, nextRow + 1);

    set({
      ...history,
      components: [...state.components, newComp],
      selectedComponentId: newComp.id,
      canvasGridRows: newGridRows,
    });
  },

  // ── Toggle Visibility ──
  toggleVisibility: (id) => {
    const state = get();
    const history = pushHistory(state);
    set({
      ...history,
      components: state.components.map(c =>
        c.id === id ? { ...c, visible: !c.visible } : c
      ),
    });
  },

  // ── Canvas Settings ──
  setCanvasGridRows: (rows) => {
    const state = get();
    const history = pushHistory(state);
    set({ ...history, canvasGridRows: Math.max(4, Math.min(20, rows)) });
  },

  setCanvasBackground: (bg) => {
    const state = get();
    const history = pushHistory(state);
    set({ ...history, canvasBackground: bg });
  },

  setSnapToGrid: (snap) => {
    set({ snapToGrid: snap });
  },

  // ── Undo ──
  undo: () => {
    const state = get();
    if (state._past.length === 0) return;

    const previous = state._past[state._past.length - 1];
    const currentSnapshot = takeSnapshot(state);

    set({
      components: previous.components,
      canvasGridRows: previous.canvasGridRows,
      canvasBackground: previous.canvasBackground,
      _past: state._past.slice(0, -1),
      _future: [currentSnapshot, ...state._future].slice(0, MAX_HISTORY),
      canUndo: state._past.length > 1,
      canRedo: true,
    });
  },

  // ── Redo ──
  redo: () => {
    const state = get();
    if (state._future.length === 0) return;

    const next = state._future[0];
    const currentSnapshot = takeSnapshot(state);

    set({
      components: next.components,
      canvasGridRows: next.canvasGridRows,
      canvasBackground: next.canvasBackground,
      _past: [...state._past, currentSnapshot].slice(-MAX_HISTORY),
      _future: state._future.slice(1),
      canUndo: true,
      canRedo: state._future.length > 1,
    });
  },

  // ── Reset ──
  reset: () => {
    const state = get();
    const history = pushHistory(state);
    set({
      ...history,
      components: DEFAULT_CANVAS_COMPONENTS,
      canvasGridRows: DEFAULT_CANVAS_GRID_ROWS,
      canvasBackground: DEFAULT_CANVAS_BACKGROUND,
      selectedComponentId: null,
    });
  },
}));
