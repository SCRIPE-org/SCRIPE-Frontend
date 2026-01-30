# ✨ Code Quality: Prettier & Husky

We enforce code quality automatically so you don't have to argue about semicolons in Code Reviews.

---

## 1. Prettier (Formatting)

Your code is automatically formatted on save (if configured in VSCode) or on commit.

### Configuration

Uses `.prettierrc` with:

- No Semicolons (Optional, strict mode handles types)
- Double Quotes (JSON standard)
- Tailwind Plugin (Sorts classes automatically!)

```bash
# Run manually
pnpm format
```

---

## 2. Husky (Git Hooks)

We use **Husky** to run scripts _before_ you commit.

### Pre-Commit Hook

Every time you run `git commit`, Husky runs:

1.  `lint-staged`: Only checks the files you changed.
2.  `eslint --fix`: Fixes lint errors.
3.  `prettier --write`: Formats code.

**If any error occurs (like a TypeScript error), the commit is BLOCKED.** 🚫

---

## 3. Troubleshooting "Commit Failed"

If you can't commit, check the terminal output.

- **Lint Error?** Fix the code issue (e.g. unused variable).
- **Type Error?** Fix the TypeScript issue.
- **Emergency?** (Not Recommended) Use `git commit --no-verify` to bypass checks.
