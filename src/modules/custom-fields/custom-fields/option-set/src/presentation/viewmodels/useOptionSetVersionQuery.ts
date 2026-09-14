/**
 * useOptionSetVersionQuery -- the read that loads ONE option-set version WITH its items (P-4)
 *
 * `GET {id}` (the set detail) carries versions as SUMMARY rows: `OptionSetVersion.hasLoadedItems`
 * is false and `items` is deliberately `null`, because `items` on a summary means "not loaded",
 * never "loaded and empty". Editing or even DISPLAYING one version's options therefore needs a
 * second read, `GET versions/{versionId}`, and that read is this hook.
 *
 * WHY IT IS A VIEWMODEL AND NOT A HOOK INSIDE THE PANEL THAT USES IT
 * -----------------------------------------------------------------
 * `OptionSetDetailPanel` is the only consumer, and this hook used to live inside it -- which made
 * that panel the one VIEW in the whole CustomFields module reaching into `getCustomFieldsContainer()`
 * for itself. The cost was not stylistic: a view holding its own repository call cannot be mounted or
 * unit-tested without mocking DI, so every test of the panel's markup paid for a data-layer stub it
 * had no interest in. The container lives behind the `presentation/viewmodels` (and
 * `presentation/hooks`) boundary in this module for exactly that reason, and this hook now sits on
 * the correct side of it.
 *
 * The panel still decides WHICH version is read -- it owns `openVersionId` -- and that is the right
 * split: the selection is screen state, the fetch is not.
 *
 * KEYED WITH THE SHARED FACTORY, NEVER A HAND-BUILT ARRAY
 * ------------------------------------------------------
 * `optionSetVersionQueryKey` is the SAME factory `useOptionSetVersionEditor` invalidates after a
 * save. Any other key here would leave a saved draft rendering its pre-save item list until a
 * reload, which is exactly the class of bug a shared key factory exists to prevent.
 *
 * The read goes through `optionSetRepository`, never the service beneath it: this hook hands the panel
 * ENTITIES, so no wire model reaches presentation.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomFieldsContainer } from "../../../../di";
import { optionSetVersionQueryKey } from "./useOptionSetViewModel";

/**
 * Loads one version WITH its items.
 *
 * A hook rather than an inline `useQuery` so the enabled-guard and the shared key factory sit
 * together: an id-less request has no endpoint to hit, and a hand-built key here would silently stop
 * `useOptionSetVersionEditor`'s post-save invalidation from landing.
 *
 * @param versionId The version to load, or `null` while none is open -- which keeps the query idle
 * rather than firing a request with no id in its path.
 */
export function useOptionSetVersionQuery(versionId: string | null) {
  const { optionSetRepository } = getCustomFieldsContainer();

  return useQuery({
    queryKey: optionSetVersionQueryKey(versionId ?? ""),
    // Safe cast: `enabled` below keeps the function from running while the id is null.
    queryFn: () => optionSetRepository.getVersion(versionId as string),
    enabled: versionId !== null,
  });
}
