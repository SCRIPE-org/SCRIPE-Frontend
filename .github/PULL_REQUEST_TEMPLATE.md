## 📋 Frontend Summary

<!-- Briefly describe the UI views, components, viewmodels, or hooks modified. -->

Closes #<!-- Issue Number -->

---

## 🏷️ Change Type

- [ ] 🚀 **Feature** (new view, modal, or interactive workflow)
- [ ] 🐛 **Bug Fix** (UI glitch, state bug, or rendering issue)
- [ ] 🎨 **Design System** (updates to `@core/ui/*` or theme tokens)
- [ ] 🌐 **Localization** (EN / AR translation keys or RTL layout fix)
- [ ] ⚡ **Performance** (bundle optimization, memoization, dynamic imports)

---

## 🛡️ Frontend Architectural Checklist

- [ ] **Sub-Module Architecture:** All code lives in a named sub-module (no root-level `src/` or `locales/`).
- [ ] **Data Flow:** View -> ViewModel (hook) -> Repository -> Service -> HTTP. No DTOs in presentation layer.
- [ ] **Design System Mandate:** Uses `@core/ui/*` shared components. Zero raw unstyled `<input>` or `<button>`.
- [ ] **Bilingual Parity:** All new keys added to both `.en.ts` and `.ar.ts`.
- [ ] **RTL Tested:** UI displays correctly in both LTR (English) and RTL (Arabic).
- [ ] **React Compiler Safe:** No invalid nested optional-chain dependencies in `useMemo`.

---

## 📸 Visual Evidence (Screenshots / Recordings)

<!-- Attach LTR and RTL screenshots of the changes -->
