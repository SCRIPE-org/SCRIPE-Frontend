/**
 * Shard aggregate — one entry per package that contributes copy to this module.
 *
 * Registering a shard is a single import plus a single merge argument, so two
 * packages adding copy at the same time never touch the same lines.
 */
import { deepMerge } from "@core/utils/deep-merge";

import { en as w41En, ar as w41Ar } from "./W4-1";

export const en: Record<string, unknown> = deepMerge({}, w41En);
export const ar: Record<string, unknown> = deepMerge({}, w41Ar);
