/**
 * Shard aggregate — one entry per package that contributes copy to this module.
 *
 * Registering a shard is a single import plus a single merge argument, so two
 * packages adding copy at the same time never touch the same lines.
 */
import { deepMerge } from "@core/utils/deep-merge";

import { en as templateEn, ar as templateAr } from "./_template";
import { en as w42En, ar as w42Ar } from "./W4-2";
import { en as w52En, ar as w52Ar } from "./W5-2";
import { en as w62En, ar as w62Ar } from "./W6-2";

export const en: Record<string, unknown> = deepMerge({}, templateEn, w42En, w52En, w62En);
export const ar: Record<string, unknown> = deepMerge({}, templateAr, w42Ar, w52Ar, w62Ar);
