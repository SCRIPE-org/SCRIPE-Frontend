"use client";

/**
 * Components Tab — Orchestrator
 *
 * DEEP REFACTORED: Split from a single 2854-line file into focused sub-components.
 * Each sub-component owns its data arrays, preview rendering, and selection logic.
 * The parent file is now a thin layout orchestrator (~60 lines).
 *
 * Sub-components:
 *   - ButtonStyleSection: button radius styles (8 options)
 *   - TreeStyleSection: tree/org hierarchy styles (2 surviving options w/ previews)
 *   - DatePickerStyleSection: datepicker visual styles (2 surviving options)
 *   - CalendarStyleSection: calendar popup styles (2 surviving options)
 *   - InputStyleSection: input field styles (4 options)
 *   - TableStyleSection: data table styles (11 options w/ previews)
 *   - HoverEffectsSection: hover type + intensity + preview
 *   - BadgeStyleSection: badge pill styles (10 options w/ preview)
 *   - AvatarStyleSection: avatar shape styles (4 options)
 *   - FormStyleSection: form layout styles (11 options w/ previews)
 *   - LoadingStyleSection: loading animation styles (3 surviving options w/ animated previews)
 *   - TooltipStyleSection: tooltip styles (8 options w/ live tooltip preview)
 *   - ModalStyleSection: modal styles (8 options w/ previews + test buttons)
 *   - SelectStyleSection: unified select component showcase (18 style demos)
 *
 * Wave G: NavigationStyleSection and IconStyleSection were retired. Both knobs
 * (navigationStyle, iconStyle) were only ever honoured by the navigation
 * layout, which was removed in the one-shell collapse to nexus. With no
 * rendering surface left to read them, their pickers were dead UI, so they were
 * deleted rather than left rendering nothing.
 */

import { ButtonStyleSection } from "./components-tab/button-style-section";
import { TreeStyleSection } from "./components-tab/tree-style-section";
import { DatePickerStyleSection } from "./components-tab/datepicker-style-section";
import { CalendarStyleSection } from "./components-tab/calendar-style-section";
import { InputStyleSection } from "./components-tab/input-style-section";
import { TableStyleSection } from "./components-tab/table-style-section";
import { HoverEffectsSection } from "./components-tab/hover-effects-section";
import { BadgeStyleSection } from "./components-tab/badge-style-section";
import { AvatarStyleSection } from "./components-tab/avatar-style-section";
import { FormStyleSection } from "./components-tab/form-style-section";
import { LoadingStyleSection } from "./components-tab/loading-style-section";
import { TooltipStyleSection } from "./components-tab/tooltip-style-section";
import { ModalStyleSection } from "./components-tab/modal-style-section";
import { SelectStyleSection } from "./components-tab/select-style-section";

export function ComponentsTab() {
  return (
    <>
      <ButtonStyleSection />
      <TreeStyleSection />
      <DatePickerStyleSection />
      <CalendarStyleSection />
      <InputStyleSection />
      <TableStyleSection />
      <HoverEffectsSection />
      <BadgeStyleSection />
      <AvatarStyleSection />
      <FormStyleSection />
      <LoadingStyleSection />
      <TooltipStyleSection />
      <ModalStyleSection />
      <SelectStyleSection />
    </>
  );
}
