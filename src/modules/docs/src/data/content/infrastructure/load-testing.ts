// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "infrastructure.loadTesting.intro" },

  // ─── k6 Overview ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.loadTesting.overviewTitle",
    id: "overview",
  },
  { type: "paragraph", contentKey: "infrastructure.loadTesting.overviewIntro" },
  {
    type: "table",
    headers: ["Test Suite", "File", "Stages", "What It Tests"],
    rows: [
      [
        "Auth Flow",
        "tests/load/auth-flow.js",
        "2m ramp → 50 VUs × 5m → 1m ramp-down",
        "Login → JWT retrieval → protected endpoints → health check → concurrent sessions",
      ],
      [
        "CRUD Operations",
        "tests/load/crud-operations.js",
        "2m ramp → 30 VUs × 5m → 1m ramp-down",
        "Create → Read (paginated) → Update → Delete with spike scenarios",
      ],
    ],
  },

  // ─── SLA Thresholds ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.loadTesting.thresholdsTitle",
    id: "thresholds",
  },
  {
    type: "table",
    headers: ["Metric", "Threshold", "Description", "SLA Impact"],
    rows: [
      [
        "http_req_duration (P95)",
        "< 2000ms",
        "95% of requests must complete within 2 seconds",
        "Pipeline FAILS if breached",
      ],
      [
        "http_req_duration (P99)",
        "< 5000ms",
        "99% of requests must complete within 5 seconds",
        "Pipeline FAILS if breached",
      ],
      [
        "http_req_failed",
        "< 1%",
        "Less than 1% of requests may return errors",
        "Pipeline FAILS if breached",
      ],
      [
        "http_req_duration (avg)",
        "< 500ms",
        "Average response time under 500ms",
        "Pipeline FAILS if breached",
      ],
      [
        "uis_login_duration (P95)",
        "< 3000ms",
        "95% of login requests complete in 3 seconds",
        "Auth-specific SLA",
      ],
      [
        "uis_login_fail_rate",
        "< 5%",
        "Less than 5% of login attempts may fail",
        "Auth reliability SLA",
      ],
    ],
  },

  // ─── Auth Flow Script ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.loadTesting.authFlowTitle",
    id: "auth-flow",
  },
  { type: "paragraph", contentKey: "infrastructure.loadTesting.authFlowIntro" },
  {
    type: "code",
    language: "javascript",
    filename: "tests/load/auth-flow.js — Key Sections",
    code: `import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Custom Metrics (visible in k6 output + Grafana) ──
const loginDuration = new Trend('uis_login_duration', true);
const loginFailRate = new Rate('uis_login_fail_rate');
const tokenRefreshDuration = new Trend('uis_token_refresh_duration', true);

// ── Environment Configuration ──
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'superadmin@scripe.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@123';

/**
 * Exported constant defining parameters and fields for options configurations.
 */
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 concurrent users
    { duration: '5m', target: 50 },   // Sustain load for 5 minutes
    { duration: '1m', target: 0 },    // Ramp down gracefully
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],
    'uis_login_duration': ['p(95)<3000'],
    'uis_login_fail_rate': ['rate<0.05'],
    'http_req_failed': ['rate<0.01'],
  },
};

// Test Flow: Login → Protected Endpoint → Health Check
/**
 * Exported function in the docs module.
 */
export default function () {
  group('1. Login', () => { /* POST /api/auth/login */ });
  group('2. Access Protected Endpoint', () => { /* GET /api/admins/current */ });
  group('3. Health Check', () => { /* GET /health/ready */ });
  sleep(Math.random() * 2 + 1); // Random 1-3s think time
}`,
  },

  // ─── Running Tests ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.loadTesting.runningTitle",
    id: "running",
  },
  {
    type: "code",
    language: "bash",
    filename: "Running k6 Load Tests",
    code: `# ═══════════════════════════════════════════════════════════
# INSTALL k6
# ═══════════════════════════════════════════════════════════
# Windows:  winget install k6  (or choco install k6)
# macOS:    brew install k6
# Linux:    sudo apt install k6
# Docker:   docker run --rm -i grafana/k6 run - <script.js

# ═══════════════════════════════════════════════════════════
# DEVELOPMENT (local backend)
# ═══════════════════════════════════════════════════════════
# Start your backend first: dotnet run (or scripe dev backend)
k6 run tests/load/auth-flow.js
k6 run tests/load/crud-operations.js

# ═══════════════════════════════════════════════════════════
# DOCKER COMPOSE (containerized backend)
# ═══════════════════════════════════════════════════════════
k6 run tests/load/auth-flow.js \\
  --env BASE_URL=http://host.docker.internal:5001

# ═══════════════════════════════════════════════════════════
# STAGING / PRODUCTION (remote server)
# ═══════════════════════════════════════════════════════════
k6 run tests/load/auth-flow.js \\
  --env BASE_URL=https://api.staging.scripe.com \\
  --env ADMIN_EMAIL=staging-admin@scripe.com \\
  --env ADMIN_PASSWORD=StrongP@ss123

# ═══════════════════════════════════════════════════════════
# CUSTOM PARAMETERS
# ═══════════════════════════════════════════════════════════
# Override VUs and duration for quick smoke tests
k6 run tests/load/auth-flow.js -u 10 --duration 30s

# Heavy load test (100 concurrent users, 10 minutes)
k6 run tests/load/auth-flow.js -u 100 --duration 10m

# Output to JSON for CI/CD analysis
k6 run tests/load/auth-flow.js --out json=results.json

# Output to Prometheus for Grafana dashboards
k6 run tests/load/auth-flow.js \\
  --out experimental-prometheus-rw \\
  --env K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write`,
  },

  // ─── CI/CD Integration ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.loadTesting.cicdTitle",
    id: "cicd",
  },
  { type: "paragraph", contentKey: "infrastructure.loadTesting.cicdIntro" },
  {
    type: "code",
    language: "yaml",
    filename: "GitHub Actions — Load Test Job",
    code: `name: Load Tests
on:
  schedule:
    - cron: '0 3 * * 1'    # Every Monday at 3 AM
  workflow_dispatch:         # Manual trigger

jobs:
  load-test:
    runs-on: ubuntu-latest
    services:
      api:
        image: scripe-api:latest
        ports: ['5001:5001']
        env:
          ASPNETCORE_ENVIRONMENT: Staging
          Database__Provider: SqlServer
          Database__ConnectionString: \${{ secrets.TEST_DB_CONNECTION }}
    steps:
      - uses: actions/checkout@v4

      - name: Wait for API readiness
        run: |
          for i in {1..30}; do
            curl -sf http://localhost:5001/health/ready && break
            sleep 5
          done

      - name: Run Auth Flow Test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/auth-flow.js
          flags: >-
            --env BASE_URL=http://localhost:5001
            --env ADMIN_EMAIL=\${{ secrets.TEST_ADMIN_EMAIL }}
            --env ADMIN_PASSWORD=\${{ secrets.TEST_ADMIN_PASSWORD }}
            --out json=auth-results.json

      - name: Run CRUD Operations Test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/crud-operations.js
          flags: >-
            --env BASE_URL=http://localhost:5001
            --env ADMIN_EMAIL=\${{ secrets.TEST_ADMIN_EMAIL }}
            --env ADMIN_PASSWORD=\${{ secrets.TEST_ADMIN_PASSWORD }}

      - name: Upload Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: k6-results
          path: auth-results.json`,
  },

  // ─── Backup & DR ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.loadTesting.backupTitle",
    id: "backup-dr",
  },
  { type: "paragraph", contentKey: "infrastructure.loadTesting.backupIntro" },
  {
    type: "table",
    headers: ["Component", "Strategy", "Frequency", "Retention", "Recovery Tool"],
    rows: [
      [
        "SQL Server",
        "Full + Differential + Transaction Log",
        "Daily / Hourly / 15min",
        "30 days",
        "SSMS Restore or T-SQL RESTORE DATABASE",
      ],
      [
        "Oracle",
        "RMAN Full + Incremental + Archive Log",
        "Weekly / Daily / Continuous",
        "30 days",
        "RMAN RECOVER + RESTORE",
      ],
      [
        "PostgreSQL",
        "pg_dump + WAL archiving",
        "Daily + Continuous",
        "30 days",
        "pg_restore + Point-in-Time Recovery",
      ],
      [
        "Redis",
        "RDB snapshots + AOF persistence",
        "Hourly + Real-time",
        "7 days",
        "redis-cli --rdb / AOF replay",
      ],
      [
        "File Storage",
        "Cloud provider snapshots or rsync",
        "Daily",
        "90 days",
        "Cloud console restore or rsync reverse",
      ],
      [
        "Audit Logs",
        "Separate backup (compliance requirement)",
        "Daily",
        "1 year minimum",
        "SQL restore to read-only replica",
      ],
    ],
  },
  {
    type: "code",
    language: "bash",
    filename: "Backup & Recovery Commands",
    code: `# ═══════════════════════════════════════════════════════════
# SQL SERVER BACKUP (Windows / Docker)
# ═══════════════════════════════════════════════════════════
# Full backup
sqlcmd -S localhost -U sa -P 'YourPassword' -Q \\
  "BACKUP DATABASE SCRIPE TO DISK='/backups/uis_full.bak'"

# Point-in-time restore
sqlcmd -S localhost -U sa -P 'YourPassword' -Q \\
  "RESTORE DATABASE SCRIPE FROM DISK='/backups/uis_full.bak' \\
   WITH STOPAT='2026-04-06T20:00:00'"

# ═══════════════════════════════════════════════════════════
# POSTGRESQL BACKUP (Linux / Docker)
# ═══════════════════════════════════════════════════════════
# Full dump
pg_dump -h localhost -U scripe -d uis_db -F c > uis_backup.dump

# Restore
pg_restore -h localhost -U scripe -d uis_db uis_backup.dump

# ═══════════════════════════════════════════════════════════
# REDIS BACKUP
# ═══════════════════════════════════════════════════════════
# Trigger RDB snapshot
redis-cli BGSAVE

# Copy RDB file
cp /var/lib/redis/dump.rdb /backups/redis_$(date +%Y%m%d).rdb`,
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "infrastructure.loadTesting.drWarning",
  },
];

registerPage({
  slug: "infrastructure/load-testing",
  titleKey: "infrastructure.loadTesting.title",
  descriptionKey: "infrastructure.loadTesting.description",
  category: "infrastructure",
  order: 10,
  sections,
  relatedSlugs: [
    "infrastructure/observability",
    "infrastructure/resilience",
    "infrastructure/health-checks",
  ],
  lastUpdated: "2026-04-06",
});
