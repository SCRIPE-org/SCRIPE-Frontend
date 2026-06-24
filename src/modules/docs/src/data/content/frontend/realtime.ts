import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "frontend.realtime.intro" },

  // ─── Architecture ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.realtime.architectureTitle",
    id: "architecture",
  },
  {
    type: "flowchart",
    title: "Real-Time Communication Architecture",
    direction: "horizontal",
    nodes: [
      { id: "backend", label: "ASP.NET Core", type: "primary" },
      { id: "signalr", label: "SignalR Hubs", type: "info", description: "WebSocket + fallback" },
      { id: "provider", label: "SignalRProvider", type: "success", description: "React Context" },
      { id: "hooks", label: "Custom Hooks", type: "warning" },
      { id: "audit", label: "AuditHub", type: "info" },
      { id: "notif", label: "NotificationHub", type: "info" },
    ],
    connections: [
      { from: "backend", to: "signalr" },
      { from: "signalr", to: "audit" },
      { from: "signalr", to: "notif" },
      { from: "provider", to: "signalr", label: "connects" },
      { from: "hooks", to: "provider", label: "uses context" },
    ],
  },

  // ─── SignalR Hubs ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.realtime.hubsTitle",
    id: "hubs",
  },
  {
    type: "table",
    headers: ["Hub", "Path", "Purpose", "Events"],
    rows: [
      ["AuditHub", "/hubs/audit", "Real-time audit log streaming", "AuditLogCreated"],
      [
        "NotificationHub",
        "/hubs/notification",
        "Push notifications",
        "NotificationReceived, UnreadCountChanged",
      ],
    ],
  },

  // ─── SignalRProvider ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.realtime.providerTitle",
    id: "provider",
  },
  {
    type: "code",
    language: "typescript",
    filename: "SignalRProvider — Connection Management",
    code: `// Manages SignalR connections with automatic reconnection
/**
 * Utility function executing operational rules for signal r provider.
 */
export function SignalRProvider({ children }: { children: ReactNode }) {
  const { token } = useAuthStore();
  const [auditConnection, setAuditConnection] = useState<HubConnection | null>(null);
  const [notifConnection, setNotifConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    if (!token) return;

    // Create connection with auto-reconnect
    const audit = new HubConnectionBuilder()
      .withUrl(\`\${API_URL}/hubs/audit\`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    const notif = new HubConnectionBuilder()
      .withUrl(\`\${API_URL}/hubs/notification\`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    audit.start().catch(console.error);
    notif.start().catch(console.error);

    setAuditConnection(audit);
    setNotifConnection(notif);

    return () => {
      audit.stop();
      notif.stop();
    };
  }, [token]);

  return (
    <SignalRContext.Provider value={{ auditConnection, notifConnection }}>
      {children}
    </SignalRContext.Provider>
  );
}`,
    highlightLines: [14, 15, 16, 26, 27],
  },

  // ─── Custom Hooks ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.realtime.hooksTitle",
    id: "hooks",
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Audit Stream",
        language: "typescript",
        filename: "useAuditStream.ts",
        code: `export function useAuditStream(maxItems = 100) {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const { auditConnection } = useSignalR();

  useEffect(() => {
    if (!auditConnection) return;

    const handler = (log: AuditLogDto) => {
      setLogs(prev => [log, ...prev].slice(0, maxItems));
    };

    auditConnection.on("AuditLogCreated", handler);
    return () => auditConnection.off("AuditLogCreated", handler);
  }, [auditConnection, maxItems]);

  return { logs, clearLogs: () => setLogs([]) };
}`,
      },
      {
        label: "Notifications",
        language: "typescript",
        filename: "useNotifications.ts",
        code: `export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { notifConnection } = useSignalR();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!notifConnection) return;

    notifConnection.on("NotificationReceived", (notif) => {
      // Invalidate notifications query to show new ones
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.info(notif.title);
    });

    notifConnection.on("UnreadCountChanged", (count: number) => {
      setUnreadCount(count);
    });

    return () => {
      notifConnection.off("NotificationReceived");
      notifConnection.off("UnreadCountChanged");
    };
  }, [notifConnection, queryClient]);

  return { unreadCount };
}`,
      },
    ],
  },

  // ─── Connection States ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.realtime.connectionStatesTitle",
    id: "connection-states",
  },
  {
    type: "table",
    headers: ["State", "Description", "Retry Timing"],
    rows: [
      ["Connected", "Active WebSocket connection", "—"],
      ["Reconnecting", "Lost connection, attempting reconnect", "0s → 2s → 5s → 10s → 30s"],
      ["Disconnected", "All retry attempts exhausted", "Manual reconnect required"],
      ["Connecting", "Initial connection in progress", "—"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "frontend.realtime.tenantGroupNote",
  },
];

registerPage({
  slug: "frontend/realtime",
  titleKey: "frontend.realtime.title",
  descriptionKey: "frontend.realtime.description",
  category: "frontend",
  order: 7,
  sections,
  relatedSlugs: [
    "security/audit-compliance",
    "frontend/state-management",
    "api-reference/webhook-email-api",
  ],
  lastUpdated: "2026-02-20",
});
