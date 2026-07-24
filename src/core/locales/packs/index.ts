/**
 * Core Locale Packs — surface-scoped slices of the shared dictionary.
 *
 * WHY: the shared dictionary in core/locales/{en,ar}.ts grew into a single
 * flat object where a key's owning surface was unknowable, so keys were
 * duplicated, orphaned, and translated in one language only. A pack is one
 * surface's slice with EN and AR sitting in the same file, which makes a
 * half-translated key visible at review time instead of at runtime.
 *
 * WHY EAGER, AND WHY BY NAME: the merged dictionary must be complete on the
 * very first render — a lazily loaded pack paints raw key paths for a frame.
 * A glob loader would defeat the bundler's static analysis, so every pack is
 * listed below explicitly.
 *
 * ADDING A PACK: create packs/<surface>.ts exporting { en, ar }, then add the
 * import and both spread lines below. Both languages, same commit.
 */

import { deepMerge } from "@core/utils/deep-merge";

// ─── Shell & navigation ────────────────────────────────
import { en as navEn, ar as navAr } from "./nav";
import { en as shellEn, ar as shellAr } from "./shell";
import { en as chromeEn, ar as chromeAr } from "./chrome";

// ─── Shared primitives ─────────────────────────────────
import { en as selectEn, ar as selectAr } from "./select";
import { en as crudEn, ar as crudAr } from "./crud";
import { en as errorsEn, ar as errorsAr } from "./errors";

// ─── Rich text editor ──────────────────────────────────
import { en as editorToolbarEn, ar as editorToolbarAr } from "./editor-toolbar";
import { en as editorBlocksEn, ar as editorBlocksAr } from "./editor-blocks";

export const en: Record<string, unknown> = deepMerge(
  {},
  navEn,
  shellEn,
  chromeEn,
  selectEn,
  crudEn,
  errorsEn,
  editorToolbarEn,
  editorBlocksEn,
);

export const ar: Record<string, unknown> = deepMerge(
  {},
  navAr,
  shellAr,
  chromeAr,
  selectAr,
  crudAr,
  errorsAr,
  editorToolbarAr,
  editorBlocksAr,
);
