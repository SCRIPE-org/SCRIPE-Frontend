"use client";

import React from "react";
import type { CustomFieldControlProps } from "./renderCustomFieldControlProps";
import { renderStandardControls } from "./renderStandardControls";
import { renderComplexControls } from "./renderComplexControls";
import { renderInputControls } from "./renderInputControls";

export type { CustomFieldControlProps };

/**
 * Shared per-type EDIT control renderer.
 * Dispatches to specialized sub-renderers for standard, complex, and input controls.
 */
export function renderCustomFieldControl(props: CustomFieldControlProps): React.ReactNode {
  return (
    renderStandardControls(props) ??
    renderComplexControls(props) ??
    renderInputControls(props)
  );
}
