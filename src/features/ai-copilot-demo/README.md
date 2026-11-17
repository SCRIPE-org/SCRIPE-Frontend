# SCRIPE AI Copilot — Interactive Product Demo

Self-contained, deterministic, frontend-only interactive product demonstration of **SCRIPE AI Copilot** inside `SCRIPE-Frontend`.

> **Presentation Safety Notice:**  
> This feature is an intentionally simulated product demonstration. It contains zero LLM integrations, zero backend/database changes, and executes zero live business operations.

---

## 1. How to Enable

Set the environment variable in `SCRIPE-Frontend/.env.local` (or your deployment environment):

```env
NEXT_PUBLIC_SCRIPE_AI_DEMO=true
```

Restart or rebuild `SCRIPE-Frontend` so Next.js exposes the public env flag.  
When the variable is absent or set to anything other than `"true"`, the demo defaults to **disabled**, does not mount, and does not alter the application.

---

## 2. How to Access

1. Sign in to SCRIPE and open any workspace route wrapped by the authenticated Nexus shell (e.g., `/overview`, `/venue/calendar`, `/crm/leads`).
2. Click the **AI Copilot · Demo** button in the top navigation bar (`NexusTopbar`).
3. On desktop (`>= 1024px`), the contextual Copilot side panel docks alongside the live dashboard. On smaller viewports, it opens as a responsive slide-over sheet.

---

## 3. How to Switch Scenarios & Reset

- **Welcome Screen:** Click either featured prompt card to populate the input (**Populate Prompt**) or execute immediately (**Run Scenario**).
- **Mode Tabs:** Switch between **Ask & Explore**, **Execute**, **Analyze**, and **Monitor** to inspect conceptual modes or launch linked scenarios.
- **Manual Prompting:** Type either the English or Arabic presentation prompt (or matching keywords) and press **Send** / `Enter`.
- **Financial Workspace:** In Scenario 2, click **View Full Report**, **Inspect Sources**, or **View Attachments** to expand the split-screen Financial Intelligence Workspace while keeping the conversation panel visible.
- **Reset:** Click the **Reset Demo** icon button in the Copilot header at any time to cancel pending simulation timers and return to the clean welcome state.

---

## 4. How to Disable

Remove `NEXT_PUBLIC_SCRIPE_AI_DEMO=true` from `.env.local` (or set it to `false`) and restart/rebuild the frontend.

---

## 5. How to Remove Completely

This demonstration is isolated to a single feature directory and a single shell integration point:

1. **Delete the feature directory:**
   ```text
   SCRIPE-Frontend/src/features/ai-copilot-demo/
   ```
2. **Revert the single shell integration in `SCRIPE-Frontend/src/core/ui/layout/nexus/nexus-layout.tsx`:**
   - Remove the `dynamic` import, `AI_COPILOT_DEMO_ENABLED`, `AiCopilotDemoHost`, and `renderShell(...)` wrapper.
3. **Optional cleanup in `SCRIPE-Frontend/src/core/ui/layout/nexus/nexus-topbar.tsx`:**
   - Remove the optional `extraActions?: React.ReactNode` prop (harmless if left in place, clean to remove).
4. **Remove the environment variable:**
   - Delete `NEXT_PUBLIC_SCRIPE_AI_DEMO=true` from `.env.local` (if added).
5. **Delete the verification spec (if present):**
   - `SCRIPE-Frontend/e2e/ai-copilot-demo.spec.ts`

---

## 6. Existing Files Modified

| File | Change |
|---|---|
| `SCRIPE-Frontend/src/core/ui/layout/nexus/nexus-layout.tsx` | Single feature-flagged `AiCopilotDemoHost` integration point + `minWidth: 0` on content flex column |
| `SCRIPE-Frontend/src/core/ui/layout/nexus/nexus-topbar.tsx` | Added optional `extraActions?: React.ReactNode` slot prop |
