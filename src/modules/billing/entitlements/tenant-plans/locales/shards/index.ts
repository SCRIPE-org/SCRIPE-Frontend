/**
 * Shard aggregate — one entry per package that contributes copy to this module.
 *
 * Registering a shard is a single import plus a single merge argument, so two
 * packages adding copy at the same time never touch the same lines.
 */
import { deepMerge } from "@core/utils/deep-merge";

import { en as templateEn, ar as templateAr } from "./_template";
import { en as w72En, ar as w72Ar } from "./W7-2";

export const en: Record<string, unknown> = deepMerge({}, templateEn, w72En);
export const ar: Record<string, unknown> = deepMerge({}, templateAr, w72Ar);
