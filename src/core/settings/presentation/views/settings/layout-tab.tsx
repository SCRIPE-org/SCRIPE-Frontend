"use client";

import { StylesTab } from "./layout-tab/styles-tab";

// ────────────────────────────────────────────
// Layout Tab
//
// Wave G: the layout-template picker was retired when the product collapsed to
// a single shell (nexus). Every category sub-view (sidebar, structural,
// visual, …) existed only to choose a `layoutTemplate` value that no longer
// varies, so the pickers and their shared grid were deleted. Card style is the
// one live customization that lived under this tab, so it is all that remains
// here — the tab keeps its "layout" registration and now hosts card style
// alone.
// ────────────────────────────────────────────
export function LayoutTab() {
  return <StylesTab />;
}
