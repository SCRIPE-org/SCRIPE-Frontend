## Description

<!-- Describe what this PR does. Link related issues with "Closes #123". -->

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that causes existing functionality to change)
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🧪 Tests (adding or updating tests)
- [ ] 🔧 Configuration / DevOps

## Checklist

### Required

- [ ] Code follows frontend [architecture rules](https://github.com/seifmoustafa/SCRIPE/blob/development/.agents/rules/frontend-architecture.md)
- [ ] Code uses `@core/ui/*` UI components (no raw HTML form elements)
- [ ] I have run `pnpm run build` locally — **0 errors**
- [ ] I have run `pnpm run lint` and resolved all errors
- [ ] All tests pass locally

### If Applicable

- [ ] I have updated translation files (EN + AR parity check)
- [ ] I have registered new sub-module locales in `core/locales/module-registry.ts`
- [ ] I have updated relevant documentation in the docs portal

## Testing

- [ ] Unit tests pass (Vitest)
- [ ] Manual testing completed
