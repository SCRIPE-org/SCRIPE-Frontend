/**
 * Party List View
 *
 * Enterprise-grade People & Organizations directory workspace for PartyKernel.
 * Renders PartyDirectoryView with full backwards compatibility.
 */
"use client";

import React from "react";
import { PartyDirectoryView } from "./PartyDirectoryView";

export const PartyListView = React.memo(function PartyListView() {
  return <PartyDirectoryView />;
});

export { PartyDirectoryView };
