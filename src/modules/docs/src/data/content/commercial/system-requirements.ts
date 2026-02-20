import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.systemRequirements.intro" },

      // ─── Development Environment ────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.devTitle", id: "development" },
      {
            type: "table",
            headers: ["Component", "Minimum", "Recommended"],
            rows: [
                  ["CPU", "4-core (Intel i5 / AMD Ryzen 5)", "8-core (Intel i7+ / AMD Ryzen 7+)"],
                  ["RAM", "8 GB", "16 GB+"],
                  ["Disk", "20 GB free (SSD)", "50 GB free (NVMe SSD)"],
                  ["OS", "Windows 10/11, macOS 13+, Ubuntu 22.04+", "Windows 11, macOS 14+"],
                  [".NET SDK", "10.0+", "Latest 10.x"],
                  ["Node.js", "20 LTS", "22 LTS"],
                  ["Docker", "24+ (optional)", "Latest stable"],
                  ["IDE", "VS Code + extensions", "Rider / VS 2022 + VS Code"],
            ],
      },

      // ─── Production — Monolith ──────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.prodMonoTitle", id: "production-monolith" },
      {
            type: "table",
            headers: ["Component", "Minimum", "Recommended (100+ users)"],
            rows: [
                  ["CPU", "2 vCPUs", "4+ vCPUs"],
                  ["RAM", "4 GB", "8-16 GB"],
                  ["Disk", "40 GB SSD", "100 GB SSD"],
                  ["Database", "Same server (small)", "Dedicated DB server"],
                  ["Network", "100 Mbps", "1 Gbps"],
                  ["OS", "Windows Server 2022 / Ubuntu 22.04", "Same"],
                  ["SSL Certificate", "Required (Let's Encrypt)", "CA-signed certificate"],
            ],
      },

      // ─── Production — Microservices ─────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.prodMicroTitle", id: "production-micro" },
      {
            type: "table",
            headers: ["Component", "Per Service", "Shared Services"],
            rows: [
                  ["CPU per container", "1-2 vCPUs", "N/A"],
                  ["RAM per container", "512 MB - 2 GB", "N/A"],
                  ["Database", "Shared or dedicated", "Clustered (HA)"],
                  ["Redis", "N/A", "2+ GB RAM, clustered"],
                  ["Load Balancer", "N/A", "Application LB (YARP / Nginx)"],
                  ["Container Orchestration", "N/A", "Docker Compose / Kubernetes"],
                  ["Monitoring", "N/A", "Prometheus + Grafana / Application Insights"],
            ],
      },

      // ─── Database Server ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.dbTitle", id: "database" },
      {
            type: "table",
            headers: ["Database", "Min RAM", "Min Disk", "Notes"],
            rows: [
                  ["SQL Server 2022", "4 GB", "50 GB", "Express edition free for < 10 GB data"],
                  ["PostgreSQL 16", "2 GB", "30 GB", "Open-source, best cost-performance"],
                  ["Oracle 21c", "8 GB", "100 GB", "Enterprise licensing required"],
                  ["SQLite", "N/A", "1 GB", "Dev/test only, file-based"],
            ],
      },

      // ─── Network Requirements ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.networkTitle", id: "network" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "Port 443 (HTTPS) — Required for all production deployments",
                  "Port 80 (HTTP) — Redirect to HTTPS only",
                  "Port 5000/5001 — Kestrel backend (behind reverse proxy)",
                  "Port 3000 — Next.js frontend (behind reverse proxy)",
                  "Port 6379 — Redis (internal network only)",
                  "Port 1433/5432/1521 — Database (internal network only)",
                  "WebSocket support — Required for SignalR real-time features",
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.systemRequirements.cloudTip" },
];

registerPage({
      slug: "commercial/system-requirements",
      titleKey: "commercial.systemRequirements.title",
      descriptionKey: "commercial.systemRequirements.description",
      category: "commercial-platform",
      order: 5,
      sections,
      relatedSlugs: ["commercial/deployment-modes", "commercial/technology-stack"],
      lastUpdated: "2026-02-20",
});
