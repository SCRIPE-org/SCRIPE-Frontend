// Pure re-exports — BOTH languages in one chunk.
// Loaded lazily via: import("./locales") in useModuleLocales()
// Next.js bundles profile.en.ts + profile.ar.ts into a single chunk.
export { en } from "./profile.en";
export { ar } from "./profile.ar";
