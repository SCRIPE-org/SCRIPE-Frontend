/**
 * Locale barrel — the module's base dictionary merged with its per-package shards.
 *
 * Shards exist so that several packages can add copy to this module without
 * queueing on one file: a package owns `./shards/<package-id>.ts` and nothing
 * else here. The merge is eager so the first render is already translated.
 */
import { deepMerge } from "@core/utils/deep-merge";

import { en as baseEn } from "./regulations.en";
import { ar as baseAr } from "./regulations.ar";
import { en as shardsEn, ar as shardsAr } from "./shards";

export const en: Record<string, unknown> = deepMerge({}, baseEn, shardsEn);
export const ar: Record<string, unknown> = deepMerge({}, baseAr, shardsAr);
