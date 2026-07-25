/**
 * Shard aggregate — one entry per package that contributes copy to this module.
 *
 * Registering a shard is a single import plus a single merge argument, so two
 * packages adding copy at the same time never touch the same lines.
 */
import { deepMerge } from "@core/utils/deep-merge";

import { en as templateEn, ar as templateAr } from "./_template";
import { en as w73En, ar as w73Ar } from "./W7-3";

export const en: Record<string, unknown> = deepMerge({}, templateEn, w73En);
export const ar: Record<string, unknown> = deepMerge({}, templateAr, w73Ar);
