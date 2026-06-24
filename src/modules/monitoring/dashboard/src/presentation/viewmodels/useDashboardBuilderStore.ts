// FILE-EXCEPTION: file length
/**
 * useDashboardBuilderStore — Zustand store for the Dashboard Builder (M11)
 *
 * Manages dashboard widgets, selection, and undo/redo history.
 * Mirrors the M10 login builder store pattern.
 *
 * @module dashboard/presentation/viewmodels
 */
"use client";

import { create } from "zustand";
import type {
  DashboardWidget,
  DashboardWidgetType,
  DashboardBuilderCanvas,
} from "../../domain/entities/DashboardWidget";
import {
  DEFAULT_DASHBOARD_WIDGETS,
  DEFAULT_BUILDER_GRID_ROWS,
  WIDGET_CATALOG,
  generateWidgetId,
  findNextAvailableRow,
  hasSingletonWidget,
} from "../../domain/entities/DashboardWidget";

// ── History Snapshot ──────────────────────────────────────
interface CanvasSnapshot {
  widgets: DashboardWidget[];
  gridRows: number;
}

const MAX_HISTORY = 50;

// ── Store State ──────────────────────────────────────────
interface DashboardBuilderState {
  // Canvas state
  widgets: DashboardWidget[];
  selectedWidgetId: string | null;
  gridRows: number;
  snapToGrid: boolean;
  enabled: boolean;

  // History
  _past: CanvasSnapshot[];
  _future: CanvasSnapshot[];
  canUndo: boolean;
  canRedo: boolean;

  // ── Actions ──
  initialize: (canvas: DashboardBuilderCanvas) => void;
  setEnabled: (enabled: boolean) => void;
  addWidget: (type: DashboardWidgetType) => DashboardWidget | null;
  removeWidget: (id: string) => boolean;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  moveWidget: (id: string, gridColumn: string, gridRow: string) => void;
  selectWidget: (id: string | null) => void;
  reorderZ: (id: string, direction: "forward" | "back") => void;
  duplicateWidget: (id: string) => void;
  toggleVisibility: (id: string) => void;
  setGridRows: (rows: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  /** Export current state as serializable canvas config */
  toCanvas: () => DashboardBuilderCanvas;
}

// ── Helpers ───────────────────────────────────────────────
function takeSnapshot(state: DashboardBuilderState): CanvasSnapshot {
  return {
    widgets: state.widgets.map((w) => ({ ...w, props: { ...w.props } })),
    gridRows: state.gridRows,
  };
}

function pushHistory(state: DashboardBuilderState): Partial<DashboardBuilderState> {
  const snapshot = takeSnapshot(state);
  const newPast = [...state._past, snapshot].slice(-MAX_HISTORY);
  return {
    _past: newPast,
    _future: [],
    canUndo: true,
    canRedo: false,
  };
}

// ── Store ────────────────────────────────────────────────
/**
 * Constant definition representing use dashboard builder store.
 */
export const useDashboardBuilderStore = create<DashboardBuilderState>((set, get) => ({
  widgets: DEFAULT_DASHBOARD_WIDGETS,
  selectedWidgetId: null,
  gridRows: DEFAULT_BUILDER_GRID_ROWS,
  snapToGrid: true,
  enabled: false,

  _past: [],
  _future: [],
  canUndo: false,
  canRedo: false,

  // ── Initialize ──
  initialize: (canvas) => {
    set({
      widgets: canvas.widgets.length > 0 ? canvas.widgets : DEFAULT_DASHBOARD_WIDGETS,
      gridRows: canvas.gridRows || DEFAULT_BUILDER_GRID_ROWS,
      enabled: canvas.enabled,
      selectedWidgetId: null,
      _past: [],
      _future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  setEnabled: (enabled) => set({ enabled }),

  // ── Add Widget ──
  addWidget: (type) => {
    const state = get();
    const catalog = WIDGET_CATALOG.find((c) => c.type === type);
    if (!catalog) return null;

    if (catalog.singleton && hasSingletonWidget(state.widgets, type)) {
      return null;
    }

    const nextRow = findNextAvailableRow(state.widgets);
    const newWidget: DashboardWidget = {
      id: generateWidgetId(),
      type,
      gridColumn: catalog.defaultGridColumn,
      gridRow: `${nextRow} / ${nextRow + 1}`,
      alignment: "stretch",
      props: { ...catalog.defaultProps },
      zIndex: 1,
      visible: true,
    };

    const history = pushHistory(state);
    const newGridRows = Math.max(state.gridRows, nextRow + 1);

    set({
      ...history,
      widgets: [...state.widgets, newWidget],
      selectedWidgetId: newWidget.id,
      gridRows: newGridRows,
    });
    return newWidget;
  },

  // ── Remove Widget ──
  removeWidget: (id) => {
    const state = get();
    const widget = state.widgets.find((w) => w.id === id);
    if (!widget) return false;

    const history = pushHistory(state);
    set({
      ...history,
      widgets: state.widgets.filter((w) => w.id !== id),
      selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId,
    });
    return true;
  },

  // ── Update Widget ──
  updateWidget: (id, updates) => {
    const state = get();
    const history = pushHistory(state);
    set({
      ...history,
      widgets: state.widgets.map((w) =>
        w.id === id
          ? { ...w, ...updates, props: updates.props ? { ...w.props, ...updates.props } : w.props }
          : w
      ),
    });
  },

  // ── Move Widget ──
  moveWidget: (id, gridColumn, gridRow) => {
    const state = get();
    const history = pushHistory(state);
    set({
      ...history,
      widgets: state.widgets.map((w) => (w.id === id ? { ...w, gridColumn, gridRow } : w)),
    });
  },

  selectWidget: (id) => set({ selectedWidgetId: id }),

  // ── Reorder Z ──
  reorderZ: (id, direction) => {
    const state = get();
    const widget = state.widgets.find((w) => w.id === id);
    if (!widget) return;

    const history = pushHistory(state);
    const delta = direction === "forward" ? 1 : -1;
    set({
      ...history,
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, zIndex: Math.max(0, w.zIndex + delta) } : w
      ),
    });
  },

  // ── Duplicate Widget ──
  duplicateWidget: (id) => {
    const state = get();
    const widget = state.widgets.find((w) => w.id === id);
    if (!widget) return;

    const catalog = WIDGET_CATALOG.find((c) => c.type === widget.type);
    if (catalog?.singleton && hasSingletonWidget(state.widgets, widget.type)) return;

    const nextRow = findNextAvailableRow(state.widgets);
    const newWidget: DashboardWidget = {
      ...widget,
      id: generateWidgetId(),
      gridRow: `${nextRow} / ${nextRow + 1}`,
      props: { ...widget.props },
    };

    const history = pushHistory(state);
    const newGridRows = Math.max(state.gridRows, nextRow + 1);

    set({
      ...history,
      widgets: [...state.widgets, newWidget],
      selectedWidgetId: newWidget.id,
      gridRows: newGridRows,
    });
  },

  toggleVisibility: (id) => {
    const state = get();
    const history = pushHistory(state);
    set({
      ...history,
      widgets: state.widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)),
    });
  },

  setGridRows: (rows) => {
    const state = get();
    const history = pushHistory(state);
    set({ ...history, gridRows: Math.max(3, Math.min(20, rows)) });
  },

  setSnapToGrid: (snap) => set({ snapToGrid: snap }),

  // ── Undo ──
  undo: () => {
    const state = get();
    if (state._past.length === 0) return;

    const previous = state._past[state._past.length - 1];
    const currentSnapshot = takeSnapshot(state);

    set({
      widgets: previous.widgets,
      gridRows: previous.gridRows,
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
      widgets: next.widgets,
      gridRows: next.gridRows,
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
      widgets: DEFAULT_DASHBOARD_WIDGETS,
      gridRows: DEFAULT_BUILDER_GRID_ROWS,
      selectedWidgetId: null,
    });
  },

  // ── Export ──
  toCanvas: () => {
    const state = get();
    return {
      enabled: state.enabled,
      widgets: state.widgets,
      gridRows: state.gridRows,
    };
  },
}));
