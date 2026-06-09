import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/plugins-sdk",
  titleKey: "modules.plugins..sdk.title",
  category: "modules",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_1_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.plugins..sdk.section_2_title",
    "contentKey": "modules.plugins..sdk.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_4_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_5_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// Messages the HOST sends TO the plugin iframe\ntype HostToPluginMessage =\n  | { type: \"THEME_UPDATE\";     payload: { mode: \"dark\"|\"light\"; accent: string; direction: \"ltr\"|\"rtl\" } }\n  | { type: \"AUTH_TOKEN\";       payload: { accessToken: string; expiresAt: number } }\n  | { type: \"LANGUAGE_CHANGE\";  payload: { language: \"en\"|\"ar\"; direction: \"ltr\"|\"rtl\" } }\n  | { type: \"TENANT_CONTEXT\";   payload: { tenantId: string; tenantName: string; features: string[] } }\n  | { type: \"NAVIGATE_CONFIRMED\"; payload: { path: string } }\n  | { type: \"PLUGIN_EVENT\";     payload: { eventType: string; data: unknown } };\n\n// Messages the PLUGIN sends TO the host\ntype PluginToHostMessage =\n  | { type: \"READY\" }\n  | { type: \"NAVIGATE_REQUEST\"; payload: { path: string } }\n  | { type: \"TOAST\";            payload: { variant: \"success\"|\"error\"|\"warning\"|\"info\"; title: string; message?: string } }\n  | { type: \"RESIZE\";           payload: { height: number } }\n  | { type: \"AUTH_TOKEN_REQUEST\" }\n  | { type: \"OPEN_DIALOG\";      payload: { title: string; content: string } }\n  | { type: \"CLOSE\";            payload?: { reason?: string } };",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_9_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "const iframeRef = useRef<HTMLIFrameElement>(null);\nconst bridge = new PluginBridge(\"https://plugin.example.com\", iframeRef);\n\nbridge.mount(); // starts listening to window messages\n\nconst unsub = bridge.onMessage((msg) => {\n  if (msg.type === \"READY\") console.log(\"Plugin loaded!\");\n  if (msg.type === \"TOAST\") showToast(msg.payload);\n});\n\nbridge.send({ type: \"THEME_UPDATE\", payload: { mode: \"dark\", accent: \"#6366f1\", direction: \"ltr\" } });\n\n// Cleanup\nbridge.unmount();\nunsub();",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_12_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_13_content"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "import { PluginFrame } from \"@core/plugins/plugin-sdk/PluginFrame\";\n\n<PluginFrame\n  pluginKey=\"my-tier2-plugin\"\n  frontendUrl=\"https://plugin.example.com/ui\"\n  installationId={installationId}\n  className=\"min-h-[500px]\"\n/>",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_16_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.plugins..sdk.section_17_hdr_0",
      "modules.plugins..sdk.section_17_hdr_1",
      "modules.plugins..sdk.section_17_hdr_2"
    ],
    "rows": [
      [
        "modules.plugins..sdk.section_17_cell_0_0",
        "modules.plugins..sdk.section_17_cell_0_1",
        "modules.plugins..sdk.section_17_cell_0_2"
      ],
      [
        "modules.plugins..sdk.section_17_cell_1_0",
        "modules.plugins..sdk.section_17_cell_1_1",
        "modules.plugins..sdk.section_17_cell_1_2"
      ],
      [
        "modules.plugins..sdk.section_17_cell_2_0",
        "modules.plugins..sdk.section_17_cell_2_1",
        "modules.plugins..sdk.section_17_cell_2_2"
      ],
      [
        "modules.plugins..sdk.section_17_cell_3_0",
        "modules.plugins..sdk.section_17_cell_3_1",
        "modules.plugins..sdk.section_17_cell_3_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_18_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "const navBridge   = new PluginNavigationBridge(bridge, (path) => router.push(path));\nconst toastBridge = new PluginToastBridge(bridge, { success, error, info, warning });\nconst authRelay   = new PluginAuthRelay(bridge, () => fetchScopedToken(installationId));\n\nnavBridge.mount();\ntoastBridge.mount();\nauthRelay.mount();\n\n// On unmount:\nreturn () => { navBridge.unmount(); toastBridge.unmount(); authRelay.unmount(); };",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_21_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_22_content"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "import { PluginHostProvider } from \"@core/plugins/plugin-host/PluginHostProvider\";\n\n// In your root layout or plugin page:\n<PluginHostProvider getPluginToken={(installationId) => fetchPluginToken(installationId)}>\n  <PluginFrame ... />\n</PluginHostProvider>\n\n// Inside a child component:\nconst { createBridgeFor, syncTheme, mountRelays } = usePluginHostContext();",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_25_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_26_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import { pluginEventBus } from \"@core/plugins/plugin-sdk/PluginEventBus\";\n\n// Subscribe anywhere\nconst unsub = pluginEventBus.on<{ installationId: string }>(\"plugin.activated\", (data) => {\n  console.log(\"Plugin activated:\", data.installationId);\n});\n\n// Emit from lifecycle handlers\npluginEventBus.emit(\"plugin.activated\", { installationId: \"abc-123\" });\n\n// Cleanup\nunsub();",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_29_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "modules.plugins..sdk.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Implement IPluginStartup in your plugin project\npublic class MyPluginStartup : IPluginStartup\n{\n    public void ConfigureServices(IServiceCollection services, IConfiguration config)\n    {\n        services.AddScoped<IMyService, MyService>();\n    }\n\n    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)\n    {\n        // optional middleware\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "modules.plugins..sdk.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "// Expose your component via Module Federation\nexport default function MyPlugin({ installationId }: { installationId: string }) {\n  return <div>Tier 1 Plugin — {installationId}</div>;\n}\n\n// webpack.config.js\nnew ModuleFederationPlugin({\n  name: \"my_plugin\",           // workspaceKey with underscores\n  filename: \"remoteEntry.js\",\n  exposes: { \"./Plugin\": \"./src/Plugin\" },\n  shared: { react: { singleton: true, requiredVersion: \"^19.0.0\" } },\n})",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "modules.plugins..sdk.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "import { ModuleFederationLoader } from \"@core/plugins/tier1/ModuleFederationLoader\";\n\n<ModuleFederationLoader\n  pluginKey=\"my-plugin\"\n  baseUrl=\"https://my-plugin.internal\"\n  installationId={installationId}\n/>",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_37_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_38_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// 1. Announce readiness (required — host shows skeleton until received)\nwindow.parent.postMessage({ type: \"READY\" }, \"*\");\n\n// 2. Request a scoped auth token\nwindow.parent.postMessage({ type: \"AUTH_TOKEN_REQUEST\" }, \"*\");\n\n// 3. Listen for host messages (ALWAYS validate origin)\nwindow.addEventListener(\"message\", (event) => {\n  if (event.origin !== \"https://your-scripe-host.com\") return;\n\n  const msg = event.data;\n  if (msg.type === \"AUTH_TOKEN\") {\n    myApiClient.setToken(msg.payload.accessToken);\n  }\n  if (msg.type === \"THEME_UPDATE\") {\n    document.documentElement.dataset.theme = msg.payload.mode;\n    document.dir = msg.payload.direction;\n  }\n});\n\n// 4. Trigger host notifications\nwindow.parent.postMessage({ type: \"TOAST\", payload: { variant: \"success\", title: \"Saved!\" } }, \"*\");\n\n// 5. Request internal navigation (only \"/\" prefix allowed)\nwindow.parent.postMessage({ type: \"NAVIGATE_REQUEST\", payload: { path: \"/plugins/installed\" } }, \"*\");\n\n// 6. Resize the container\nwindow.parent.postMessage({ type: \"RESIZE\", payload: { height: 800 } }, \"*\");",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_40_title",
    "id": "sec_40"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_41_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.plugins..sdk.section_42_title",
    "contentKey": "modules.plugins..sdk.section_42_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.plugins..sdk.section_43_content"
  },
  {
    "type": "code",
    "language": "http",
    "code": "# Upsert a key (max 64KB value)\nPUT /api/v1/plugin-api/v1/data/{installationId}/{namespace}/{key}\nX-Plugin-Api-Key: {your-api-key}\nContent-Type: application/json\nBody: { \"value\": \"{\\\"language\\\":\\\"en\\\"}\" }\n\n# Read all keys in namespace\nGET /api/v1/plugin-api/v1/data/{installationId}/{namespace}\n\n# Delete a key\nDELETE /api/v1/plugin-api/v1/data/{installationId}/{namespace}/{key}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_45_title",
    "id": "sec_45"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.plugins..sdk.section_46_item_0",
      "modules.plugins..sdk.section_46_item_1"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.plugins..sdk.section_47_title",
    "id": "sec_47"
  }
],
  relatedSlugs: [
  "modules/plugins-overview",
  "architecture/frontend"
],
  lastUpdated: "2026-06-09",
});
