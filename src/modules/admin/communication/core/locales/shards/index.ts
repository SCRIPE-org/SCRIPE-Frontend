/**
 * Shard aggregate — one entry per package that contributes copy to this module.
 *
 * Registering a shard is a single import plus a single merge argument, so two
 * packages adding copy at the same time never touch the same lines.
 */
import { deepMerge } from "@core/utils/deep-merge";

import { en as templateEn, ar as templateAr } from "./_template";
import { en as w84En, ar as w84Ar } from "./W8-4";

export const en: Record<string, unknown> = deepMerge({}, templateEn, w84En);
export const ar: Record<string, unknown> = deepMerge({}, templateAr, w84Ar);
