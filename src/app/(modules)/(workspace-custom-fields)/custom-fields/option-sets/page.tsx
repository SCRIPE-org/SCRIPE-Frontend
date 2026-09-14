/**
 * Option Sets Page -- P-4 (shared, versioned option sets)
 *
 * Server component that renders the Option Sets admin screen. A plain route rather than a dialog
 * over the definitions list, for the same reason /custom-fields/field-groups is one: the screen owns
 * a second surface (the version chain, and inside it the options table) that an admin works in for
 * minutes at a time, and nesting that under a modal is what Wave 5 row 5.6 removed from this module.
 * See OptionSetListView.tsx for the full page-shape reasoning.
 *
 * Reached from the "Option Sets" link in the definitions screen header -- this path has no
 * backend-seeded sidebar nav entry of its own -- and gated by
 * PAGE_PERMISSIONS["/custom-fields/option-sets"] on `custom-field-option-sets.view`. The view ALSO
 * self-handles a missing view permission (it renders the refusal and keeps the read idle), so a
 * caller who arrives here by typing the URL gets an explanation either way.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { OptionSetListView } from "@modules/custom-fields/option-set";

export const metadata: Metadata = {
  title: "Option Sets",
  description: "Manage shared, versioned option sets for select and multi-select custom fields",
};

export default function OptionSetsPage() {
  return (
    <ModuleErrorBoundary moduleName="optionSet.title">
      <OptionSetListView />
    </ModuleErrorBoundary>
  );
}
