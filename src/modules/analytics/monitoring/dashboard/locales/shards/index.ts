/**
 * Shard aggregate — one entry per package that contributes copy to this module.
 *
 * Registering a shard is a single import plus a single merge argument, so two
 * packages adding copy at the same time never touch the same lines.
 */
import { deepMerge } from "@core/utils/deep-merge";

import { en as templateEn, ar as templateAr } from "./_template";
import { en as builderEn, ar as builderAr } from "./W3-2";
import { en as chartsEn, ar as chartsAr } from "./W5-5";

export const en: Record<string, unknown> = deepMerge({}, templateEn, builderEn, chartsEn);
export const ar: Record<string, unknown> = deepMerge({}, templateAr, builderAr, chartsAr);
