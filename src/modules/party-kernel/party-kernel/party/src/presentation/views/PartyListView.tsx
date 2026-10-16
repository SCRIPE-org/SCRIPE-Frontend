/**
 * Party List View
 *
 * Enterprise-grade People & Organizations directory workspace for PartyKernel.
 * Renders PartyDirectoryView with full backwards compatibility.
 */
"use client";

import React from "react";
import { PartyDirectoryView } from "./PartyDirectoryView";

/**
 * Screen metadata for FLS and custom fields governance.
 */
export const PARTY_SCREEN_CONFIG = {
  resource: "parties",
  entityTypeKey: "party.party",
} as const;

/**
 * Backward-compatible Party List View wrapper around PartyDirectoryView.
 */
export const PartyListView = React.memo(function PartyListView() {
  return <PartyDirectoryView />;
});

export { PartyDirectoryView };
