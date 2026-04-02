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
import type { CanvasComponent, CanvasComponentType, CanvasBackground, PositionMode, AuthPageId } from "../../domain/entities/CanvasComponent";
import {
  DEFAULT_CANVAS_COMPONENTS,
  DEFAULT_CANVAS_GRID_ROWS,
  DEFAULT_CANVAS_BACKGROUND,
  DEFAULT_POSITION_MODE,
  COMPONENT_CATALOG,
  CANVAS_WIDTH,
  generateComponentId,
  findNextAvailableRow,
  findNextAvailableY,
  snapToGridValue,
  checkOverlap,
  hasSingletonComponent,
  getDefaultComponentsForPage,
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
  positionMode: PositionMode;
  zoom: number;

  // Per-page component storage
  activePage: AuthPageId;
  pageComponents: Record<AuthPageId, CanvasComponent[]>;
  pageGridRows: Record<AuthPageId, number>;
  pageBackgrounds: Record<AuthPageId, CanvasBackground>;

  // History
  _past: CanvasSnapshot[];
  _future: CanvasSnapshot[];

  // Computed
  canUndo: boolean;
  canRedo: boolean;

  // Track if a drag/resize is in progress
  _isDragging: boolean;
  _preInteractionSnapshot: CanvasSnapshot | null;

  // ── Actions ──
  /** Initialize builder from draft data */
  initialize: (components: CanvasComponent[], gridRows: number, background: CanvasBackground, pageComps?: Record<string, CanvasComponent[]>) => void;

  /** Switch active auth page — saves current, loads target */
  setActivePage: (page: AuthPageId) => void;

  /** Add a new component to the canvas */
  addComponent: (type: CanvasComponentType) => CanvasComponent | null;

  /** Remove a component by ID */
  removeComponent: (id: string) => boolean;

  /** Update a component's properties */
  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;

  /** Move a component to a new grid position */
  moveComponent: (id: string, gridColumn: string, gridRow: string) => void;

  /** Move a component to absolute x/y position — LIVE during drag, no history push */
  moveComponentAbsolute: (id: string, x: number, y: number) => void;

  /** Resize a component — LIVE during drag, no history push */
  resizeComponent: (id: string, width: number, height: number) => void;

  /** Start a drag/resize interaction — saves snapshot for undo */
  beginInteraction: () => void;

  /** End a drag/resize interaction — commits the snapshot to undo history */
  commitInteraction: () => void;

  /** Lock a component from drag and resize */
  lockComponent: (id: string) => void;
  /** Unlock a component */
  unlockComponent: (id: string) => void;

  /** Select a component (or null to deselect) */
  selectComponent: (id: string | null) => void;

  /** Reorder z-index: 'forward' or 'back' */
  reorderZ: (id: string, direction: 'forward' | 'back') => void;

  /** Reorder components by swapping two components identified by ID */
  reorderComponents: (fromId: string, toId: string) => void;

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

  /** Set position mode */
  setPositionMode: (mode: PositionMode) => void;

  /** Set zoom level */
  setZoom: (zoom: number) => void;

  /** Get list of overlapping component ID pairs */
  getOverlaps: () => [string, string][];

  /** Undo last action */
  undo: () => void;

  /** Redo last undone action */
  redo: () => void;

  /** Reset to default canvas */
  reset: () => void;

  /** Load a template — replaces ONLY the current active page's components (safe for per-page isolation) */
  loadTemplate: (components: CanvasComponent[], gridRows: number, background: CanvasBackground) => void;
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
  positionMode: DEFAULT_POSITION_MODE,
  zoom: 100,

  activePage: 'login' as AuthPageId,
  pageComponents: {
    login: [],
    forgotPassword: [],
    resetPassword: [],
  },
  pageGridRows: {
    login: DEFAULT_CANVAS_GRID_ROWS,
    forgotPassword: DEFAULT_CANVAS_GRID_ROWS,
    resetPassword: DEFAULT_CANVAS_GRID_ROWS,
  },
  pageBackgrounds: {
    login: DEFAULT_CANVAS_BACKGROUND,
    forgotPassword: DEFAULT_CANVAS_BACKGROUND,
    resetPassword: DEFAULT_CANVAS_BACKGROUND,
  },

  _past: [],
  _future: [],
  canUndo: false,
  canRedo: false,
  _isDragging: false,
  _preInteractionSnapshot: null,

  // ── Initialize from draft ──
  initialize: (components, gridRows, background, pageComps) => {
    const loginComps = components.length > 0 ? components : DEFAULT_CANVAS_COMPONENTS;
    set({
      components: loginComps,
      canvasGridRows: gridRows || DEFAULT_CANVAS_GRID_ROWS,
      canvasBackground: background || DEFAULT_CANVAS_BACKGROUND,
      selectedComponentId: null,
      activePage: 'login',
      pageComponents: {
        login: loginComps,
        forgotPassword: pageComps?.forgotPassword || getDefaultComponentsForPage('forgotPassword'),
        resetPassword: pageComps?.resetPassword || getDefaultComponentsForPage('resetPassword'),
      },
      pageGridRows: {
        login: gridRows || DEFAULT_CANVAS_GRID_ROWS,
        forgotPassword: DEFAULT_CANVAS_GRID_ROWS,
        resetPassword: DEFAULT_CANVAS_GRID_ROWS,
      },
      pageBackgrounds: {
        login: background || DEFAULT_CANVAS_BACKGROUND,
        forgotPassword: DEFAULT_CANVAS_BACKGROUND,
        resetPassword: DEFAULT_CANVAS_BACKGROUND,
      },
      _past: [],
      _future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  // ── Set Active Page ──
  setActivePage: (page) => {
    const state = get();
    if (state.activePage === page) return;

    // Save current page's state
    const updatedPageComponents = {
      ...state.pageComponents,
      [state.activePage]: state.components.map(c => ({ ...c, props: { ...c.props } })),
    };
    const updatedPageGridRows = {
      ...state.pageGridRows,
      [state.activePage]: state.canvasGridRows,
    };
    const updatedPageBackgrounds = {
      ...state.pageBackgrounds,
      [state.activePage]: { ...state.canvasBackground },
    };

    // Load target page's state
    const targetComponents = updatedPageComponents[page].length > 0
      ? updatedPageComponents[page]
      : getDefaultComponentsForPage(page);

    set({
      activePage: page,
      components: targetComponents,
      canvasGridRows: updatedPageGridRows[page] || DEFAULT_CANVAS_GRID_ROWS,
      canvasBackground: updatedPageBackgrounds[page] || DEFAULT_CANVAS_BACKGROUND,
      pageComponents: updatedPageComponents,
      pageGridRows: updatedPageGridRows,
      pageBackgrounds: updatedPageBackgrounds,
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
    const nextY = findNextAvailableY(state.components);
    // Center horizontally on canvas
    const centerX = Math.max(0, Math.round((CANVAS_WIDTH - catalog.defaultWidth) / 2));

    const newComponent: CanvasComponent = {
      id: generateComponentId(),
      type,
      gridColumn: catalog.defaultGridColumn,
      gridRow: `${nextRow} / ${nextRow + 1}`,
      alignment: 'center',
      verticalAlignment: 'center',
      x: centerX,
      y: nextY,
      width: catalog.defaultWidth,
      height: catalog.defaultHeight,
      locked: false,
      props: { ...catalog.defaultProps },
      zIndex: state.components.length + 1,
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

  // ── Move Component (grid mode) ──
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

  // ── Move Component (absolute mode) — LIVE, no history push ──
  moveComponentAbsolute: (id, x, y) => {
    const state = get();
    const comp = state.components.find(c => c.id === id);
    if (!comp || comp.locked) return;

    const finalX = state.snapToGrid ? snapToGridValue(x) : x;
    const finalY = state.snapToGrid ? snapToGridValue(y) : y;

    // Direct update — no history push during continuous drag
    set({
      components: state.components.map(c =>
        c.id === id ? { ...c, x: Math.max(0, finalX), y: Math.max(0, finalY) } : c
      ),
    });
  },

  // ── Resize Component — LIVE, no history push ──
  resizeComponent: (id, width, height) => {
    const state = get();
    const comp = state.components.find(c => c.id === id);
    if (!comp || comp.locked) return;

    const catalog = COMPONENT_CATALOG.find(c => c.type === comp.type);
    const minW = catalog?.minWidth || 40;
    const minH = catalog?.minHeight || 20;

    // Direct update — no history push during continuous resize
    set({
      components: state.components.map(c =>
        c.id === id ? {
          ...c,
          width: Math.max(minW, state.snapToGrid ? snapToGridValue(width) : width),
          height: Math.max(minH, state.snapToGrid ? snapToGridValue(height) : height),
        } : c
      ),
    });
  },

  // ── Begin interaction (saves snapshot for undo) ──
  beginInteraction: () => {
    const state = get();
    set({
      _isDragging: true,
      _preInteractionSnapshot: takeSnapshot(state),
    });
  },

  // ── Commit interaction (pushes saved snapshot to history) ──
  commitInteraction: () => {
    const state = get();
    if (state._preInteractionSnapshot) {
      const newPast = [...state._past, state._preInteractionSnapshot].slice(-MAX_HISTORY);
      set({
        _isDragging: false,
        _preInteractionSnapshot: null,
        _past: newPast,
        _future: [],
        canUndo: true,
        canRedo: false,
      });
    } else {
      set({ _isDragging: false });
    }
  },

  // ── Lock/Unlock ──
  lockComponent: (id) => {
    const state = get();
    set({
      components: state.components.map(c =>
        c.id === id ? { ...c, locked: true } : c
      ),
    });
  },

  unlockComponent: (id) => {
    const state = get();
    set({
      components: state.components.map(c =>
        c.id === id ? { ...c, locked: false } : c
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

  // ── Reorder Components (grid drag / layer panel drag) ──
  // Accepts component IDs (not array indices) to be immune to sort-order mismatches.
  // In grid mode, swaps gridColumn/gridRow so components visually trade positions.
  reorderComponents: (fromId, toId) => {
    const state = get();
    if (fromId === toId) return;

    const fromIndex = state.components.findIndex(c => c.id === fromId);
    const toIndex = state.components.findIndex(c => c.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const history = pushHistory(state);
    const newComponents = [...state.components.map(c => ({ ...c, props: { ...c.props } }))];

    // If in grid mode, swap grid positions so components visually swap
    if (state.positionMode === 'grid') {
      const fromComp = newComponents[fromIndex];
      const toComp = newComponents[toIndex];
      const tempGridCol = fromComp.gridColumn;
      const tempGridRow = fromComp.gridRow;
      fromComp.gridColumn = toComp.gridColumn;
      fromComp.gridRow = toComp.gridRow;
      toComp.gridColumn = tempGridCol;
      toComp.gridRow = tempGridRow;
    }

    // Reorder array
    const [moved] = newComponents.splice(fromIndex, 1);
    newComponents.splice(toIndex, 0, moved);

    // Re-assign zIndex based on new order
    const reIndexed = newComponents.map((c, i) => ({ ...c, zIndex: i + 1 }));
    set({
      ...history,
      components: reIndexed,
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
      x: comp.x + 24, // Offset so duplicate is visually distinct
      y: comp.y + 24,
      locked: false,
      props: { ...comp.props },
      zIndex: state.components.length + 1,
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

  setPositionMode: (mode) => {
    set({ positionMode: mode });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(50, Math.min(200, zoom)) });
  },

  getOverlaps: () => {
    const state = get();
    const visible = state.components.filter(c => c.visible);
    const pairs: [string, string][] = [];
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        if (checkOverlap(visible[i], visible[j])) {
          pairs.push([visible[i].id, visible[j].id]);
        }
      }
    }
    return pairs;
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
      positionMode: DEFAULT_POSITION_MODE,
      zoom: 100,
      selectedComponentId: null,
    });
  },

  // ── Load Template (per-page safe) ──
  // Replaces the CURRENT active page's components only — does NOT reset activePage
  // or wipe other pages' data. Safe to call from any page.
  loadTemplate: (components, gridRows, background) => {
    const state = get();
    const history = pushHistory(state);
    set({
      ...history,
      components,
      canvasGridRows: gridRows || DEFAULT_CANVAS_GRID_ROWS,
      canvasBackground: background || DEFAULT_CANVAS_BACKGROUND,
      selectedComponentId: null,
      zoom: 100,
    });
  },
}));
