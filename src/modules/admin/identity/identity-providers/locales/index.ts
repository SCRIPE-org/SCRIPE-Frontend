// Locale barrel — the module's base dictionary merged with its per-package
// shards. Loaded lazily via: import("./locales") in useModuleLocales()
import { deepMerge } from "@core/utils/deep-merge";

import { en as baseEn } from "./identity-providers.en";
import { ar as baseAr } from "./identity-providers.ar";
import { en as shardsEn, ar as shardsAr } from "./shards";

export const en: Record<string, unknown> = deepMerge({}, baseEn, shardsEn);
export const ar: Record<string, unknown> = deepMerge({}, baseAr, shardsAr);
