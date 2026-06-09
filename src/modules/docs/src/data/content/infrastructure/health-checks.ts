import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/health-checks",
  titleKey: "infrastructure.healthChecks.title",
  category: "infrastructure",
  order: 7,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    lb([\"Load Balancer / K8s\"])\n    live([\"/health/live\"])\n    %% live: Always 200\n    startup([\"/health/startup\"])\n    %% startup: DB migration + seed\n    ready{{\"/health/ready\"}}\n    %% ready: DB + Redis + Modules\n    health[\"/health\"]\n    %% health: All checks (auth)\n    deep[\"/health/deep\"]\n    %% deep: Full diagnostic (auth)\n    lb --> live\n    lb --> startup\n    lb --> ready\n    lb --> health\n    lb --> deep",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.healthChecks.section_5_hdr_0",
      "infrastructure.healthChecks.section_5_hdr_1",
      "infrastructure.healthChecks.section_5_hdr_2",
      "infrastructure.healthChecks.section_5_hdr_3",
      "infrastructure.healthChecks.section_5_hdr_4"
    ],
    "rows": [
      [
        "infrastructure.healthChecks.section_5_cell_0_0",
        "infrastructure.healthChecks.section_5_cell_0_1",
        "infrastructure.healthChecks.section_5_cell_0_2",
        "infrastructure.healthChecks.section_5_cell_0_3",
        "infrastructure.healthChecks.section_5_cell_0_4"
      ],
      [
        "infrastructure.healthChecks.section_5_cell_1_0",
        "infrastructure.healthChecks.section_5_cell_1_1",
        "infrastructure.healthChecks.section_5_cell_1_2",
        "infrastructure.healthChecks.section_5_cell_1_3",
        "infrastructure.healthChecks.section_5_cell_1_4"
      ],
      [
        "infrastructure.healthChecks.section_5_cell_2_0",
        "infrastructure.healthChecks.section_5_cell_2_1",
        "infrastructure.healthChecks.section_5_cell_2_2",
        "infrastructure.healthChecks.section_5_cell_2_3",
        "infrastructure.healthChecks.section_5_cell_2_4"
      ],
      [
        "infrastructure.healthChecks.section_5_cell_3_0",
        "infrastructure.healthChecks.section_5_cell_3_1",
        "infrastructure.healthChecks.section_5_cell_3_2",
        "infrastructure.healthChecks.section_5_cell_3_3",
        "infrastructure.healthChecks.section_5_cell_3_4"
      ],
      [
        "infrastructure.healthChecks.section_5_cell_4_0",
        "infrastructure.healthChecks.section_5_cell_4_1",
        "infrastructure.healthChecks.section_5_cell_4_2",
        "infrastructure.healthChecks.section_5_cell_4_3",
        "infrastructure.healthChecks.section_5_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_7_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.healthChecks.section_8_hdr_0",
      "infrastructure.healthChecks.section_8_hdr_1",
      "infrastructure.healthChecks.section_8_hdr_2",
      "infrastructure.healthChecks.section_8_hdr_3",
      "infrastructure.healthChecks.section_8_hdr_4"
    ],
    "rows": [
      [
        "infrastructure.healthChecks.section_8_cell_0_0",
        "infrastructure.healthChecks.section_8_cell_0_1",
        "infrastructure.healthChecks.section_8_cell_0_2",
        "infrastructure.healthChecks.section_8_cell_0_3",
        "infrastructure.healthChecks.section_8_cell_0_4"
      ],
      [
        "infrastructure.healthChecks.section_8_cell_1_0",
        "infrastructure.healthChecks.section_8_cell_1_1",
        "infrastructure.healthChecks.section_8_cell_1_2",
        "infrastructure.healthChecks.section_8_cell_1_3",
        "infrastructure.healthChecks.section_8_cell_1_4"
      ],
      [
        "infrastructure.healthChecks.section_8_cell_2_0",
        "infrastructure.healthChecks.section_8_cell_2_1",
        "infrastructure.healthChecks.section_8_cell_2_2",
        "infrastructure.healthChecks.section_8_cell_2_3",
        "infrastructure.healthChecks.section_8_cell_2_4"
      ],
      [
        "infrastructure.healthChecks.section_8_cell_3_0",
        "infrastructure.healthChecks.section_8_cell_3_1",
        "infrastructure.healthChecks.section_8_cell_3_2",
        "infrastructure.healthChecks.section_8_cell_3_3",
        "infrastructure.healthChecks.section_8_cell_3_4"
      ],
      [
        "infrastructure.healthChecks.section_8_cell_4_0",
        "infrastructure.healthChecks.section_8_cell_4_1",
        "infrastructure.healthChecks.section_8_cell_4_2",
        "infrastructure.healthChecks.section_8_cell_4_3",
        "infrastructure.healthChecks.section_8_cell_4_4"
      ],
      [
        "infrastructure.healthChecks.section_8_cell_5_0",
        "infrastructure.healthChecks.section_8_cell_5_1",
        "infrastructure.healthChecks.section_8_cell_5_2",
        "infrastructure.healthChecks.section_8_cell_5_3",
        "infrastructure.healthChecks.section_8_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_10_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_11_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "services.AddHealthChecks()\n    // Database (primary dependency — Unhealthy = kill pod)\n    .AddCheck<DatabaseHealthCheck>(\"database\",\n        HealthStatus.Unhealthy,\n        tags: [\"db\", \"ready\", \"startup\", \"deep\"])\n    // Redis (conditional — Degraded = keep pod, use fallback)\n    .AddCheck<RedisHealthCheck>(\"redis\",\n        HealthStatus.Degraded,\n        tags: [\"cache\", \"ready\", \"deep\"])\n    // SMTP (email sending)\n    .AddCheck<SmtpHealthCheck>(\"smtp\",\n        HealthStatus.Degraded,\n        tags: [\"smtp\", \"deep\"])\n    // Blob Storage (file uploads)\n    .AddCheck<StorageHealthCheck>(\"storage\",\n        HealthStatus.Degraded,\n        tags: [\"storage\", \"deep\"])\n    // Startup (DB migrated + seed data present)\n    .AddCheck<StartupHealthCheck>(\"startup\",\n        HealthStatus.Unhealthy,\n        tags: [\"startup\"])\n    // Module Health (monolith: in-process / microservice: HTTP)\n    .AddCheck<ModuleHealthCheck>(\"modules\",\n        HealthStatus.Degraded,\n        tags: [\"modules\", \"ready\", \"deep\"]);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_14_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_15_content"
  },
  {
    "type": "code",
    "language": "yaml",
    "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: scripe-api\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n        - name: scripe\n          image: scripe-api:latest\n          ports:\n            - containerPort: 5001\n          # STARTUP: Allow up to 5 minutes for DB migration on first deploy\n          startupProbe:\n            httpGet:\n              path: /health/startup\n              port: 5001\n            failureThreshold: 30    # 30 × 10s = 5 minutes max\n            periodSeconds: 10\n          # LIVENESS: Is the process alive? If not, K8s kills the pod\n          livenessProbe:\n            httpGet:\n              path: /health/live\n              port: 5001\n            initialDelaySeconds: 5\n            periodSeconds: 15\n            timeoutSeconds: 3\n            failureThreshold: 3\n          # READINESS: Can this pod handle traffic? If not, remove from LB\n          readinessProbe:\n            httpGet:\n              path: /health/ready\n              port: 5001\n            initialDelaySeconds: 10\n            periodSeconds: 10\n            timeoutSeconds: 5\n            failureThreshold: 3",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_18_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_19_content"
  },
  {
    "type": "code",
    "language": "yaml",
    "code": "services:\n  scripe-api:\n    image: scripe-api:latest\n    ports:\n      - \"5001:5001\"\n    healthcheck:\n      test: [\"CMD-SHELL\", \"curl -f http://localhost:5001/health/live || exit 1\"]\n      interval: 30s\n      timeout: 5s\n      retries: 3\n      start_period: 60s    # Wait for DB migration before checking\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_started\n\n  # Monolith mode: single service with all modules\n  # Microservice mode: one service per module with MODULE_NAME env var\n  scripe-identity:\n    image: scripe-api:latest\n    environment:\n      - MODULE_NAME=Identity\n    healthcheck:\n      test: [\"CMD-SHELL\", \"curl -f http://localhost:5001/health/ready || exit 1\"]\n      interval: 30s\n      timeout: 5s\n      retries: 3",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_22_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_23_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"status\": \"Healthy\",\n  \"duration\": 23.4567,\n  \"checks\": [\n    {\n      \"name\": \"database\",\n      \"status\": \"Healthy\",\n      \"description\": null\n    },\n    {\n      \"name\": \"redis\",\n      \"status\": \"Healthy\",\n      \"description\": \"Redis not configured (using in-memory cache)\"\n    }\n  ]\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.healthChecks.section_25_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"status\": \"Healthy\",\n  \"duration_ms\": 45.789,\n  \"timestamp\": \"2026-04-06T21:00:00Z\",\n  \"checks\": [\n    {\n      \"name\": \"database\",\n      \"status\": \"Healthy\",\n      \"description\": \"SQL Server connected\",\n      \"duration_ms\": 12.34,\n      \"tags\": [\"db\", \"ready\", \"startup\", \"deep\"],\n      \"data\": null,\n      \"exception\": null\n    },\n    {\n      \"name\": \"smtp\",\n      \"status\": \"Degraded\",\n      \"description\": \"SMTP server unreachable\",\n      \"duration_ms\": 5000.0,\n      \"tags\": [\"smtp\", \"deep\"],\n      \"data\": { \"host\": \"smtp.example.com\", \"port\": \"587\" },\n      \"exception\": {\n        \"type\": \"SocketException\",\n        \"message\": \"Connection refused\"\n      }\n    }\n  ]\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.healthChecks.section_28_hdr_0",
      "infrastructure.healthChecks.section_28_hdr_1",
      "infrastructure.healthChecks.section_28_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.healthChecks.section_28_cell_0_0",
        "infrastructure.healthChecks.section_28_cell_0_1",
        "infrastructure.healthChecks.section_28_cell_0_2"
      ],
      [
        "infrastructure.healthChecks.section_28_cell_1_0",
        "infrastructure.healthChecks.section_28_cell_1_1",
        "infrastructure.healthChecks.section_28_cell_1_2"
      ],
      [
        "infrastructure.healthChecks.section_28_cell_2_0",
        "infrastructure.healthChecks.section_28_cell_2_1",
        "infrastructure.healthChecks.section_28_cell_2_2"
      ],
      [
        "infrastructure.healthChecks.section_28_cell_3_0",
        "infrastructure.healthChecks.section_28_cell_3_1",
        "infrastructure.healthChecks.section_28_cell_3_2"
      ],
      [
        "infrastructure.healthChecks.section_28_cell_4_0",
        "infrastructure.healthChecks.section_28_cell_4_1",
        "infrastructure.healthChecks.section_28_cell_4_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "infrastructure.healthChecks.section_29_title",
    "contentKey": "infrastructure.healthChecks.section_29_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.healthChecks.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.healthChecks.section_31_item_0",
      "infrastructure.healthChecks.section_31_item_1",
      "infrastructure.healthChecks.section_31_item_2"
    ]
  }
],
  relatedSlugs: [
  "infrastructure/resilience",
  "infrastructure/gateway-deployment",
  "infrastructure/observability"
],
  lastUpdated: "2026-06-09",
});
