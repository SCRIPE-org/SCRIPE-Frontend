// FILE-EXCEPTION: file length
import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Introduction ────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.plugins.sdk.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.plugins.sdk.infoTitle",
    contentKey: "modules.plugins.sdk.infoContent",
  },

  // ─── Message Protocol ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.protocolTitle",
    id: "message-protocol",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.protocolIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "types.ts",
    code: `// Messages the HOST sends TO the plugin iframe
type HostToPluginMessage =
  | { type: "THEME_UPDATE";     payload: { mode: "dark"|"light"; accent: string; direction: "ltr"|"rtl" } }
  | { type: "AUTH_TOKEN";       payload: { accessToken: string; expiresAt: number } }
  | { type: "LANGUAGE_CHANGE";  payload: { language: "en"|"ar"; direction: "ltr"|"rtl" } }
  | { type: "TENANT_CONTEXT";   payload: { tenantId: string; tenantName: string; features: string[] } }
  | { type: "NAVIGATE_CONFIRMED"; payload: { path: string } }
  | { type: "PLUGIN_EVENT";     payload: { eventType: string; data: unknown } };

// Messages the PLUGIN sends TO the host
type PluginToHostMessage =
  | { type: "READY" }
  | { type: "NAVIGATE_REQUEST"; payload: { path: string } }
  | { type: "TOAST";            payload: { variant: "success"|"error"|"warning"|"info"; title: string; message?: string } }
  | { type: "RESIZE";           payload: { height: number } }
  | { type: "AUTH_TOKEN_REQUEST" }
  | { type: "OPEN_DIALOG";      payload: { title: string; content: string } }
  | { type: "CLOSE";            payload?: { reason?: string } };`,
    highlightLines: [2, 9],
  },

  // ─── PluginBridge ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.bridgeTitle",
    id: "plugin-bridge",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.bridgeIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "PluginBridge usage",
    code: `const iframeRef = useRef<HTMLIFrameElement>(null);
const bridge = new PluginBridge("https://plugin.example.com", iframeRef);

bridge.mount(); // starts listening to window messages

const unsub = bridge.onMessage((msg) => {
  if (msg.type === "READY") console.log("Plugin loaded!");
  if (msg.type === "TOAST") showToast(msg.payload);
});

bridge.send({ type: "THEME_UPDATE", payload: { mode: "dark", accent: "#6366f1", direction: "ltr" } });

// Cleanup
bridge.unmount();
unsub();`,
  },

  // ─── PluginFrame ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.frameTitle",
    id: "plugin-frame",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.frameIntro" },
  {
    type: "code",
    language: "tsx",
    filename: "PluginFrame usage",
    code: `import { PluginFrame } from "@core/plugins/plugin-sdk/PluginFrame";

<PluginFrame
  pluginKey="my-tier2-plugin"
  frontendUrl="https://plugin.example.com/ui"
  installationId={installationId}
  className="min-h-[500px]"
/>`,
  },

  // ─── Bridge Classes ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.bridgesTitle",
    id: "bridge-classes",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.bridgesIntro" },
  {
    type: "table",
    headers: [
      "modules.plugins.sdk.bridgeClass",
      "modules.plugins.sdk.bridgeRole",
      "modules.plugins.sdk.bridgeMsg",
    ],
    rows: [
      ["PluginThemeSync", "modules.plugins.sdk.roleTheme", "THEME_UPDATE"],
      ["PluginAuthRelay", "modules.plugins.sdk.roleAuth", "AUTH_TOKEN_REQUEST → AUTH_TOKEN"],
      [
        "PluginNavigationBridge",
        "modules.plugins.sdk.roleNav",
        "NAVIGATE_REQUEST → NAVIGATE_CONFIRMED",
      ],
      ["PluginToastBridge", "modules.plugins.sdk.roleToast", "TOAST"],
    ],
  },
  {
    type: "code",
    language: "typescript",
    filename: "Mounting all relays",
    code: `const navBridge   = new PluginNavigationBridge(bridge, (path) => router.push(path));
const toastBridge = new PluginToastBridge(bridge, { success, error, info, warning });
const authRelay   = new PluginAuthRelay(bridge, () => fetchScopedToken(installationId));

navBridge.mount();
toastBridge.mount();
authRelay.mount();

// On unmount:
return () => { navBridge.unmount(); toastBridge.unmount(); authRelay.unmount(); };`,
  },

  // ─── PluginHostProvider ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.providerTitle",
    id: "host-provider",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.providerIntro" },
  {
    type: "code",
    language: "tsx",
    filename: "PluginHostProvider setup",
    code: `import { PluginHostProvider } from "@core/plugins/plugin-host/PluginHostProvider";

// In your root layout or plugin page:
<PluginHostProvider getPluginToken={(installationId) => fetchPluginToken(installationId)}>
  <PluginFrame ... />
</PluginHostProvider>

// Inside a child component:
const { createBridgeFor, syncTheme, mountRelays } = usePluginHostContext();`,
  },

  // ─── PluginEventBus ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.eventBusTitle",
    id: "event-bus",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.eventBusIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "PluginEventBus",
    code: `import { pluginEventBus } from "@core/plugins/plugin-sdk/PluginEventBus";

// Subscribe anywhere
const unsub = pluginEventBus.on<{ installationId: string }>("plugin.activated", (data) => {
  console.log("Plugin activated:", data.installationId);
});

// Emit from lifecycle handlers
pluginEventBus.emit("plugin.activated", { installationId: "abc-123" });

// Cleanup
unsub();`,
  },

  // ─── Tier 1 Plugin Development ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.tier1Title",
    id: "tier1-development",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.tier1Intro" },
  {
    type: "tabs",
    tabs: [
      {
        label: "modules.plugins.sdk.tab1Backend",
        code: `// Implement IPluginStartup in your plugin project
public class MyPluginStartup : IPluginStartup
{
    public void ConfigureServices(IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<IMyService, MyService>();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        // optional middleware
    }
}`,
        language: "csharp",
      },
      {
        label: "modules.plugins.sdk.tab1Frontend",
        code: `// Expose your component via Module Federation
/**
 * Exported function defining parameters and fields for my plugin configurations.
 */
export default function MyPlugin({ installationId }: { installationId: string }) {
  return <div>Tier 1 Plugin — {installationId}</div>;
}

// webpack.config.js
new ModuleFederationPlugin({
  name: "my_plugin",           // workspaceKey with underscores
  filename: "remoteEntry.js",
  exposes: { "./Plugin": "./src/Plugin" },
  shared: { react: { singleton: true, requiredVersion: "^19.0.0" } },
})`,
        language: "tsx",
      },
      {
        label: "modules.plugins.sdk.tab1Host",
        code: `import { ModuleFederationLoader } from "@core/plugins/tier1/ModuleFederationLoader";

<ModuleFederationLoader
  pluginKey="my-plugin"
  baseUrl="https://my-plugin.internal"
  installationId={installationId}
/>`,
        language: "tsx",
      },
    ],
  },

  // ─── Tier 2 Plugin Development ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.tier2Title",
    id: "tier2-development",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.tier2Intro" },
  {
    type: "code",
    language: "typescript",
    filename: "Tier 2 iframe contract",
    code: `// 1. Announce readiness (required — host shows skeleton until received)
window.parent.postMessage({ type: "READY" }, "*");

// 2. Request a scoped auth token
window.parent.postMessage({ type: "AUTH_TOKEN_REQUEST" }, "*");

// 3. Listen for host messages (ALWAYS validate origin)
window.addEventListener("message", (event) => {
  if (event.origin !== "https://your-scripe-host.com") return;

  const msg = event.data;
  if (msg.type === "AUTH_TOKEN") {
    myApiClient.setToken(msg.payload.accessToken);
  }
  if (msg.type === "THEME_UPDATE") {
    document.documentElement.dataset.theme = msg.payload.mode;
    document.dir = msg.payload.direction;
  }
});

// 4. Trigger host notifications
window.parent.postMessage({ type: "TOAST", payload: { variant: "success", title: "Saved!" } }, "*");

// 5. Request internal navigation (only "/" prefix allowed)
window.parent.postMessage({ type: "NAVIGATE_REQUEST", payload: { path: "/plugins/installed" } }, "*");

// 6. Resize the container
window.parent.postMessage({ type: "RESIZE", payload: { height: 800 } }, "*");`,
    highlightLines: [1, 4, 7, 20, 23, 26],
  },

  // ─── Data Store API ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.plugins.sdk.dataStoreTitle",
    id: "data-store",
  },
  { type: "paragraph", contentKey: "modules.plugins.sdk.dataStoreIntro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.plugins.sdk.dataStoreWarningTitle",
    contentKey: "modules.plugins.sdk.dataStoreWarningContent",
  },
  {
    type: "code",
    language: "http",
    filename: "Data Store API",
    code: `# Upsert a key (max 64KB value)
PUT /api/v1/plugin-api/v1/data/{installationId}/{namespace}/{key}
X-Plugin-Api-Key: {your-api-key}
Content-Type: application/json
Body: { "value": "{\\"language\\":\\"en\\"}" }

# Read all keys in namespace
GET /api/v1/plugin-api/v1/data/{installationId}/{namespace}

# Delete a key
DELETE /api/v1/plugin-api/v1/data/{installationId}/{namespace}/{key}`,
  },
];

registerPage({
  slug: "modules/plugins-sdk",
  titleKey: "modules.plugins.sdk.title",
  descriptionKey: "modules.plugins.sdk.description",
  category: "modules",
  order: 2,
  sections,
  relatedSlugs: ["modules/plugins-overview", "architecture/frontend"],
  lastUpdated: "2026-05-10",
});
