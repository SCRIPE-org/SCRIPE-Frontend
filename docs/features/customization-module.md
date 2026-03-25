# Login Customizer Studio — Feature Documentation

> Full-featured login page customization platform with 22 layouts, design tokens, content blocks, and WCAG AA accessibility suite.

---

## Overview

The Login Customizer Studio (`/system/customization`) is a visual design tool that lets tenant admins customize their login page through a split-pane editor with live preview.

**Architecture**: Domain-driven modular design following the NEXORA clean architecture pattern:

```
customization/
├── src/
│   ├── domain/
│   │   └── entities/StudioDraft.ts       # 130+ fields (incl. 32 a11y)
│   ├── data/
│   │   └── useStudioViewModel.ts         # Serialization, publish, draft
│   └── presentation/
│       ├── views/CustomizerStudioView.tsx # Split-pane layout
│       ├── components/
│       │   ├── AccessibilityPanel.tsx     # ♿ 8 sections, 6 profiles
│       │   ├── BrandingPanel.tsx          # Logo, headline, colors
│       │   ├── LayoutPanel.tsx            # 22 layout picker
│       │   ├── StylePanel.tsx             # Typography, spacing
│       │   ├── BlockPanel.tsx             # Slot content editor
│       │   ├── AdvancedPanel.tsx          # Custom CSS, safe mode
│       │   ├── LoginPreviewShell.tsx      # Sandboxed iframe preview
│       │   └── PublishBar.tsx             # Save/publish/reset
│       └── hooks/
│           └── useAccessibilityChecker.ts # WCAG audit engine
```

---

## Studio Panels

| Tab | Controls | Description |
|-----|----------|-------------|
| **Layout** | 22 layout templates | Visual grid picker with device-specific previews |
| **Branding** | Logo, favicon, headline, subtitle, company name, copyright | Core brand identity |
| **Appearance** | Light/dark colors (9 each), theme mode (unified/split), backgrounds, overlays | Full color system |
| **Typography** | Font family (EN/AR), heading font, sizes, weights, line height, letter spacing | Type system |
| **Spacing** | Border radius, form width, card padding, element gap, input height, button size | Layout metrics |
| **Blocks** | Slot content editor (6 block types) | Content in platform-defined zones |
| **Advanced** | Custom CSS, safe mode toggle | Power-user tools |
| **Accessibility** | 32 controls across 8 categories, 6 profiles, WCAG audit | See below |

---

## 22 Login Layouts

Split-right, Split-left, Centered, Branded-full, Overlay, Minimal, Magazine, Sidebar-compact, Floating, Immersive, Glass-morphism, Corner-card, Vertical-split, Split-diagonal, Carousel, Stacked, Gradient-wave, Spotlight, Dual-panel, Fullscreen-form, Mosaic, Asymmetric.

All layouts support light/dark themes, RTL/LTR, background images/gradients/overlays, and all accessibility features.

---

## Accessibility Suite

### 8 Settings Categories

| Category | Controls |
|----------|----------|
| **Focus & Keyboard** | Focus ring (on/off, color, width, style), skip link, highlight focus |
| **Screen Reader** | ARIA landmarks, form labels, error announcements, page title |
| **Contrast & Colors** | High contrast, contrast presets (5), saturation, highlight links |
| **Typography** | Min font size, content scaling, line/letter/word spacing, dyslexic font, text align |
| **Cursor & Reading Aids** | Big cursor, reading guide, reading mask |
| **Motion & Animation** | Reduced motion, animation duration, autoplay disabled, pause all |
| **Content & Media** | Hide decorative images, enhanced tooltips |
| **Touch & Targets** | Large targets (≥44×44px), forced colors (Windows High Contrast) |

### 6 One-Click Profiles

| Profile | Activates |
|---------|-----------|
| ♿ Motor Impaired | Large targets, big cursor, thick focus ring, skip link |
| 👁 Vision Impaired | High contrast, big font, 150% scaling, highlight links |
| 🧠 Cognitive/ADHD | Reading guide, no animations, large text, line height |
| 📖 Dyslexia Friendly | OpenDyslexic font, line height 2×, letter spacing 2px, word spacing 4px |
| ⚡ Seizure Safe | No animations, desaturate, no autoplay, pause all |
| 🔊 Screen Reader | ARIA landmarks, form labels, error announce, skip link, page title |

### WCAG Audit

Real-time validation in the Accessibility tab with visual score ring:

- **Contrast checks**: Text-on-bg (4.5:1), primary-on-surface (3:1), error-on-surface, dark mode variants
- **Touch targets**: Input height ≥ 44px
- **Overlay readability**: Opacity ≥ 0.4 when text over image
- **Motion**: Reduced motion setting validation

All failing checks include **one-click auto-fix** that applies corrective draft values.

---

## Design Tokens

All customization is expressed as design tokens serialized to `LoginBrandingJson`:

- **Color tokens**: `color.primary`, `color.background`, `color.text`, etc. (9 light + 9 dark)
- **Typography tokens**: `font.body`, `font.heading`, `font.bodyAr`, size/weight tokens
- **Layout tokens**: `radius.card`, `radius.button`, `form.width`, `card.padding`
- **Accessibility tokens**: `a11y.focusRing.enabled`, `a11y.highContrast`, etc. (32 tokens)

Tokens are injected as CSS custom properties via `useLoginBrandingTokens.ts` (`:root {}` + `.dark {}` cascade).

---

## Draft / Publish Workflow

1. **Edit** — Changes update `StudioDraft` in memory (not persisted)
2. **Save Draft** — Persists to `DraftBrandingJson` on backend
3. **Preview** — Live iframe preview via `postMessage` updates
4. **Publish** — Snapshot current → audit log → apply → increment `SettingsVersion`
5. **Rollback** — Restore from any audit log snapshot

Optimistic concurrency via `expectedVersion` prevents stale overwrites (409 on conflict).

---

## Key Source Files

| File | Purpose |
|------|---------|
| `StudioDraft.ts` | 130+ field entity with 32 a11y fields + defaults |
| `useStudioViewModel.ts` | Draft ↔ JSON serialization, publish, API calls |
| `AccessibilityPanel.tsx` | 8 sections, 32 controls, 6 profiles, WCAG audit UI |
| `useAccessibilityChecker.ts` | Real-time WCAG AA validation with auto-fix patches |
| `useLoginBrandingTokens.ts` | CSS injection engine (23 a11y rules + branding tokens) |
| `LoginPreviewShell.tsx` | Sandboxed preview (reading guide, mask, a11y badge) |
