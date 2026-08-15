/**
 * Side-effect-only import: registers this module's CustomFieldsExtensionApi
 * implementation with core's registry (see customFieldsCrudIntegration.tsx).
 * Imported exactly once, from src/app/layout.tsx — the app's composition
 * root — so it runs before any screen's GenericCrudView can mount.
 */
"use client";

import "./custom-field-value/src/integration/customFieldsCrudIntegration";
