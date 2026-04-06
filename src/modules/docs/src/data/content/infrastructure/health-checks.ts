import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "infrastructure.healthChecks.intro" },

      // ─── Health Check Architecture ──────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.healthChecks.architectureTitle", id: "architecture",
      },
      {
            type: "flowchart",
            title: "Health Check Endpoint Architecture",
            direction: "horizontal",
            nodes: [
                  { id: "lb", label: "Load Balancer / K8s", type: "primary" },
                  { id: "live", label: "/health/live", type: "success", description: "Always 200" },
                  { id: "startup", label: "/health/startup", type: "info", description: "DB migration + seed" },
                  { id: "ready", label: "/health/ready", type: "warning", description: "DB + Redis + Modules" },
                  { id: "health", label: "/health", type: "danger", description: "All checks (auth)" },
                  { id: "deep", label: "/health/deep", type: "danger", description: "Full diagnostic (auth)" },
            ],
            connections: [
                  { from: "lb", to: "live" },
                  { from: "lb", to: "startup" },
                  { from: "lb", to: "ready" },
                  { from: "lb", to: "health" },
                  { from: "lb", to: "deep" },
            ],
      },

      // ─── Endpoints ──────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.healthChecks.endpointsTitle", id: "endpoints",
      },
      {
            type: "table",
            headers: ["Endpoint", "Auth", "Tag Filter", "Checks Included", "Use Case"],
            rows: [
                  ["/health/live", "None", "Predicate = false (no checks)", "None — always 200 if process is alive", "K8s liveness probe — if this fails, K8s kills and restarts the pod"],
                  ["/health/startup", "None", "startup", "Database (migrated?), Startup seed verification", "K8s startup probe — has the app finished initializing? Allows up to 5 minutes"],
                  ["/health/ready", "None", "ready", "Database, Redis, Module health (in-process or HTTP)", "K8s readiness probe — if this fails, K8s removes pod from load balancer endpoints"],
                  ["/health", "Bearer JWT", "All (Predicate = true)", "Database, Redis, SMTP, Storage, Startup, Modules", "Admin health dashboard — detailed JSON response with durations and exceptions"],
                  ["/health/deep", "Bearer JWT", "deep", "Database, Redis, SMTP, Storage, Modules", "Full diagnostic for operations teams — includes exception details and data payloads"],
            ],
      },

      // ─── Individual Health Checks ────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.healthChecks.checksTitle", id: "checks",
      },
      { type: "paragraph", contentKey: "infrastructure.healthChecks.checksIntro" },
      {
            type: "table",
            headers: ["Check", "Tags", "Failure Status", "What It Validates", "Failure Behavior"],
            rows: [
                  ["DatabaseHealthCheck", "db, ready, startup, deep", "Unhealthy", "SQL connectivity via SELECT 1 query (supports SqlServer, Oracle, PostgreSql)", "Returns Unhealthy — no traffic is routed to this instance"],
                  ["RedisHealthCheck", "cache, ready, deep", "Degraded", "Redis PING/PONG roundtrip (skips if Redis is not configured)", "Returns Degraded — app falls back to in-memory cache automatically"],
                  ["SmtpHealthCheck", "smtp, deep", "Degraded", "TCP socket connection to configured SMTP server and port", "Returns Degraded — email sending disabled but app continues"],
                  ["StorageHealthCheck", "storage, deep", "Degraded", "Blob storage provider write/read test file cycle", "Returns Degraded — file uploads disabled but app continues"],
                  ["StartupHealthCheck", "startup", "Unhealthy", "Verifies EF migrations are applied + seed data (SuperAdmin, default roles) exists", "Returns Unhealthy during startup, Healthy once migration + seed complete"],
                  ["ModuleHealthCheck", "modules, ready, deep", "Degraded", "Monolith: checks in-process module registration. Microservices: HTTP call to each service health endpoint", "Returns Degraded if one or more modules are unreachable"],
            ],
      },

      // ─── Registration Code ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.healthChecks.registrationTitle", id: "registration",
      },
      { type: "paragraph", contentKey: "infrastructure.healthChecks.registrationIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "HealthCheckExtensions.cs — Check Registration",
            code: `services.AddHealthChecks()
    // Database (primary dependency — Unhealthy = kill pod)
    .AddCheck<DatabaseHealthCheck>("database",
        HealthStatus.Unhealthy,
        tags: ["db", "ready", "startup", "deep"])
    // Redis (conditional — Degraded = keep pod, use fallback)
    .AddCheck<RedisHealthCheck>("redis",
        HealthStatus.Degraded,
        tags: ["cache", "ready", "deep"])
    // SMTP (email sending)
    .AddCheck<SmtpHealthCheck>("smtp",
        HealthStatus.Degraded,
        tags: ["smtp", "deep"])
    // Blob Storage (file uploads)
    .AddCheck<StorageHealthCheck>("storage",
        HealthStatus.Degraded,
        tags: ["storage", "deep"])
    // Startup (DB migrated + seed data present)
    .AddCheck<StartupHealthCheck>("startup",
        HealthStatus.Unhealthy,
        tags: ["startup"])
    // Module Health (monolith: in-process / microservice: HTTP)
    .AddCheck<ModuleHealthCheck>("modules",
        HealthStatus.Degraded,
        tags: ["modules", "ready", "deep"]);`,
      },

      // ─── K8s Probe Configuration ──────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.healthChecks.k8sTitle", id: "kubernetes",
      },
      { type: "paragraph", contentKey: "infrastructure.healthChecks.k8sIntro" },
      {
            type: "code",
            language: "yaml",
            filename: "Kubernetes Deployment — Health Probes",
            code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexora-api
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: nexora
          image: nexora-api:latest
          ports:
            - containerPort: 5001
          # STARTUP: Allow up to 5 minutes for DB migration on first deploy
          startupProbe:
            httpGet:
              path: /health/startup
              port: 5001
            failureThreshold: 30    # 30 × 10s = 5 minutes max
            periodSeconds: 10
          # LIVENESS: Is the process alive? If not, K8s kills the pod
          livenessProbe:
            httpGet:
              path: /health/live
              port: 5001
            initialDelaySeconds: 5
            periodSeconds: 15
            timeoutSeconds: 3
            failureThreshold: 3
          # READINESS: Can this pod handle traffic? If not, remove from LB
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 5001
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3`,
      },

      // ─── Docker Compose Health Check ───────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.healthChecks.dockerTitle", id: "docker",
      },
      { type: "paragraph", contentKey: "infrastructure.healthChecks.dockerIntro" },
      {
            type: "code",
            language: "yaml",
            filename: "docker-compose.yml — Health Check Configuration",
            code: `services:
  nexora-api:
    image: nexora-api:latest
    ports:
      - "5001:5001"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5001/health/live || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s    # Wait for DB migration before checking
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  # Monolith mode: single service with all modules
  # Microservice mode: one service per module with MODULE_NAME env var
  nexora-identity:
    image: nexora-api:latest
    environment:
      - MODULE_NAME=Identity
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5001/health/ready || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3`,
      },

      // ─── Response Format ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.healthChecks.responseTitle", id: "response-format",
      },
      { type: "paragraph", contentKey: "infrastructure.healthChecks.responseIntro" },
      {
            type: "code",
            language: "json",
            filename: "Minimal Response — /health/live, /health/startup, /health/ready",
            code: `{
  "status": "Healthy",
  "duration": 23.4567,
  "checks": [
    {
      "name": "database",
      "status": "Healthy",
      "description": null
    },
    {
      "name": "redis",
      "status": "Healthy",
      "description": "Redis not configured (using in-memory cache)"
    }
  ]
}`,
      },
      {
            type: "code",
            language: "json",
            filename: "Detailed Response — /health, /health/deep (authenticated)",
            code: `{
  "status": "Healthy",
  "duration_ms": 45.789,
  "timestamp": "2026-04-06T21:00:00Z",
  "checks": [
    {
      "name": "database",
      "status": "Healthy",
      "description": "SQL Server connected",
      "duration_ms": 12.34,
      "tags": ["db", "ready", "startup", "deep"],
      "data": null,
      "exception": null
    },
    {
      "name": "smtp",
      "status": "Degraded",
      "description": "SMTP server unreachable",
      "duration_ms": 5000.0,
      "tags": ["smtp", "deep"],
      "data": { "host": "smtp.example.com", "port": "587" },
      "exception": {
        "type": "SocketException",
        "message": "Connection refused"
      }
    }
  ]
}`,
      },

      // ─── Environment-Specific Guide ────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.healthChecks.environmentsTitle", id: "environments",
      },
      {
            type: "table",
            headers: ["Environment", "Recommended Endpoints", "Configuration Notes"],
            rows: [
                  ["Development (local)", "/health/live, /health/ready", "Run without Redis/SMTP — checks return Degraded but app works. Use in-memory cache fallback."],
                  ["Docker Compose", "/health/live (healthcheck), /health/ready", "Set start_period: 60s to allow migrations. Use depends_on with service_healthy condition."],
                  ["Kubernetes", "/health/live, /health/startup, /health/ready", "Use all 3 probes. startupProbe with 30 × 10s = 5 min for migration. readinessProbe gates traffic."],
                  ["IIS (Windows Server)", "/health, /health/deep", "No K8s probes needed. Use /health for load balancer health check and /health/deep for SCOM/monitoring."],
                  ["Production (any)", "All 5 endpoints", "Wire /health and /health/deep to Grafana for monitoring dashboards. Set up alerts on Unhealthy status."],
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "infrastructure.healthChecks.dockerTip",
      },
];

registerPage({
      slug: "infrastructure/health-checks",
      titleKey: "infrastructure.healthChecks.title",
      descriptionKey: "infrastructure.healthChecks.description",
      category: "infrastructure",
      order: 7,
      sections,
      relatedSlugs: ["infrastructure/resilience", "infrastructure/gateway-deployment", "infrastructure/observability"],
      lastUpdated: "2026-04-06",
});
