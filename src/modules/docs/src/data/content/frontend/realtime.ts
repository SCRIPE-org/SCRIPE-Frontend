import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "frontend/realtime",
  titleKey: "frontend.realtime.title",
  category: "frontend",
  order: 7,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "frontend.realtime.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.realtime.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.realtime.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    backend([\"ASP.NET Core\"])\n    signalr([\"SignalR Hubs\"])\n    %% signalr: WebSocket + fallback\n    provider([\"SignalRProvider\"])\n    %% provider: React Context\n    hooks{{\"Custom Hooks\"}}\n    audit([\"AuditHub\"])\n    notif([\"NotificationHub\"])\n    backend --> signalr\n    signalr --> audit\n    signalr --> notif\n    provider -->|\"connects\"| signalr\n    hooks -->|\"uses context\"| provider",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.realtime.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "table",
    "headers": [
      "frontend.realtime.section_5_hdr_0",
      "frontend.realtime.section_5_hdr_1",
      "frontend.realtime.section_5_hdr_2",
      "frontend.realtime.section_5_hdr_3"
    ],
    "rows": [
      [
        "frontend.realtime.section_5_cell_0_0",
        "frontend.realtime.section_5_cell_0_1",
        "frontend.realtime.section_5_cell_0_2",
        "frontend.realtime.section_5_cell_0_3"
      ],
      [
        "frontend.realtime.section_5_cell_1_0",
        "frontend.realtime.section_5_cell_1_1",
        "frontend.realtime.section_5_cell_1_2",
        "frontend.realtime.section_5_cell_1_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.realtime.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.realtime.section_7_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// Manages SignalR connections with automatic reconnection\nexport function SignalRProvider({ children }: { children: ReactNode }) {\n  const { token } = useAuthStore();\n  const [auditConnection, setAuditConnection] = useState<HubConnection | null>(null);\n  const [notifConnection, setNotifConnection] = useState<HubConnection | null>(null);\n\n  useEffect(() => {\n    if (!token) return;\n\n    // Create connection with auto-reconnect\n    const audit = new HubConnectionBuilder()\n      .withUrl(`${API_URL}/hubs/audit`, {\n        accessTokenFactory: () => token,\n      })\n      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])\n      .configureLogging(LogLevel.Warning)\n      .build();\n\n    const notif = new HubConnectionBuilder()\n      .withUrl(`${API_URL}/hubs/notification`, {\n        accessTokenFactory: () => token,\n      })\n      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])\n      .build();\n\n    audit.start().catch(console.error);\n    notif.start().catch(console.error);\n\n    setAuditConnection(audit);\n    setNotifConnection(notif);\n\n    return () => {\n      audit.stop();\n      notif.stop();\n    };\n  }, [token]);\n\n  return (\n    <SignalRContext.Provider value={{ auditConnection, notifConnection }}>\n      {children}\n    </SignalRContext.Provider>\n  );\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.realtime.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "frontend.realtime.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.realtime.section_11_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export function useAuditStream(maxItems = 100) {\n  const [logs, setLogs] = useState<AuditLogDto[]>([]);\n  const { auditConnection } = useSignalR();\n\n  useEffect(() => {\n    if (!auditConnection) return;\n\n    const handler = (log: AuditLogDto) => {\n      setLogs(prev => [log, ...prev].slice(0, maxItems));\n    };\n\n    auditConnection.on(\"AuditLogCreated\", handler);\n    return () => auditConnection.off(\"AuditLogCreated\", handler);\n  }, [auditConnection, maxItems]);\n\n  return { logs, clearLogs: () => setLogs([]) };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "frontend.realtime.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.realtime.section_14_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export function useNotifications() {\n  const [unreadCount, setUnreadCount] = useState(0);\n  const { notifConnection } = useSignalR();\n  const queryClient = useQueryClient();\n\n  useEffect(() => {\n    if (!notifConnection) return;\n\n    notifConnection.on(\"NotificationReceived\", (notif) => {\n      // Invalidate notifications query to show new ones\n      queryClient.invalidateQueries({ queryKey: [\"notifications\"] });\n      toast.info(notif.title);\n    });\n\n    notifConnection.on(\"UnreadCountChanged\", (count: number) => {\n      setUnreadCount(count);\n    });\n\n    return () => {\n      notifConnection.off(\"NotificationReceived\");\n      notifConnection.off(\"UnreadCountChanged\");\n    };\n  }, [notifConnection, queryClient]);\n\n  return { unreadCount };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.realtime.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "table",
    "headers": [
      "frontend.realtime.section_17_hdr_0",
      "frontend.realtime.section_17_hdr_1",
      "frontend.realtime.section_17_hdr_2"
    ],
    "rows": [
      [
        "frontend.realtime.section_17_cell_0_0",
        "frontend.realtime.section_17_cell_0_1",
        "frontend.realtime.section_17_cell_0_2"
      ],
      [
        "frontend.realtime.section_17_cell_1_0",
        "frontend.realtime.section_17_cell_1_1",
        "frontend.realtime.section_17_cell_1_2"
      ],
      [
        "frontend.realtime.section_17_cell_2_0",
        "frontend.realtime.section_17_cell_2_1",
        "frontend.realtime.section_17_cell_2_2"
      ],
      [
        "frontend.realtime.section_17_cell_3_0",
        "frontend.realtime.section_17_cell_3_1",
        "frontend.realtime.section_17_cell_3_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "frontend.realtime.section_18_title",
    "contentKey": "frontend.realtime.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.realtime.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "frontend.realtime.section_20_item_0",
      "frontend.realtime.section_20_item_1",
      "frontend.realtime.section_20_item_2"
    ]
  }
],
  relatedSlugs: [
  "security/audit-compliance",
  "frontend/state-management",
  "api-reference/webhook-email-api"
],
  lastUpdated: "2026-06-09",
});
