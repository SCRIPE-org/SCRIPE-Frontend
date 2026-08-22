/**
 * Pieces both of this control's comboboxes need -- extracted so neither the record picker
 * nor the type selector owns something the other also reads.
 *
 * There is nothing here but the locale prefix, the skeleton list and the display-name rule:
 * three facts that were shared between the two panels while they lived in one file, and that
 * would otherwise have had to be duplicated the moment they were split. Nothing in this file
 * is part of the submodule's public surface -- it is not exported from the barrel, and both
 * of its consumers sit beside it in this folder.
 */
import * as React from "react";
import { Skeleton } from "@core/ui/skeleton";
import type { EntityLookupType } from "../../../../../entity-lookup/src/data/models/EntityLookupModel";

/**
 * Locale key prefix for everything this control says. Collected in one
 * constant so the whole surface of strings this component depends on is
 * greppable from one place, rather than being spelled out fourteen times.
 */
export const I18N = "customField.entityReference";

/** Skeleton rows shown while the first page is in flight -- same count `SelectPanel` uses, so the panel keeps its height and the list does not jump when results land. */
const LOADING_ROW_COUNT = 5;

/**
 * An entity type's name in the reader's language.
 *
 * These two names are SERVER-supplied, not locale keys -- they come from the
 * module registry, so they are not in our dictionaries and must not be looked
 * up there. The `||` chain is not defensive noise: a blank name renders a row
 * with nothing to click on, and the registry key is at least identifiable.
 *
 * Shared by the list rows and the closed field, so the same type cannot read
 * one way in the panel and another way in the field it was chosen into.
 */
export function typeDisplayName(type: EntityLookupType, language: string): string {
  const localized = language === "ar" ? type.displayNameAr : type.displayNameEn;
  return localized || type.displayNameEn || type.key;
}

/** The skeleton list both panels show while their first request is in flight. */
export function LoadingRows(): React.ReactElement {
  return (
    <div className="space-y-1 p-1" aria-hidden="true">
      {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full rounded-nx-sm" />
      ))}
    </div>
  );
}
