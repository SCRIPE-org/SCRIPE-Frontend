/**
 * The shape every shard in this directory follows.
 *
 * Copy it to `<package-id>.ts`, fill BOTH languages, then register the copy in
 * `./index.ts`. A key present in `en` but missing from `ar` is a shipped defect.
 */
export const en = {} as const;
export const ar = {} as const;
