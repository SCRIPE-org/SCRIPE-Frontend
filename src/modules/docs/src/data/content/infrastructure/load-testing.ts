import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/load-testing",
  titleKey: "infrastructure.loadTesting.title",
  category: "infrastructure",
  order: 10,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.loadTesting.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.loadTesting.section_4_hdr_0",
      "infrastructure.loadTesting.section_4_hdr_1",
      "infrastructure.loadTesting.section_4_hdr_2",
      "infrastructure.loadTesting.section_4_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.loadTesting.section_4_cell_0_0",
        "infrastructure.loadTesting.section_4_cell_0_1",
        "infrastructure.loadTesting.section_4_cell_0_2",
        "infrastructure.loadTesting.section_4_cell_0_3"
      ],
      [
        "infrastructure.loadTesting.section_4_cell_1_0",
        "infrastructure.loadTesting.section_4_cell_1_1",
        "infrastructure.loadTesting.section_4_cell_1_2",
        "infrastructure.loadTesting.section_4_cell_1_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.loadTesting.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.loadTesting.section_6_hdr_0",
      "infrastructure.loadTesting.section_6_hdr_1",
      "infrastructure.loadTesting.section_6_hdr_2",
      "infrastructure.loadTesting.section_6_hdr_3"
    ],
    "rows": [
      [
        "infrastructure.loadTesting.section_6_cell_0_0",
        "infrastructure.loadTesting.section_6_cell_0_1",
        "infrastructure.loadTesting.section_6_cell_0_2",
        "infrastructure.loadTesting.section_6_cell_0_3"
      ],
      [
        "infrastructure.loadTesting.section_6_cell_1_0",
        "infrastructure.loadTesting.section_6_cell_1_1",
        "infrastructure.loadTesting.section_6_cell_1_2",
        "infrastructure.loadTesting.section_6_cell_1_3"
      ],
      [
        "infrastructure.loadTesting.section_6_cell_2_0",
        "infrastructure.loadTesting.section_6_cell_2_1",
        "infrastructure.loadTesting.section_6_cell_2_2",
        "infrastructure.loadTesting.section_6_cell_2_3"
      ],
      [
        "infrastructure.loadTesting.section_6_cell_3_0",
        "infrastructure.loadTesting.section_6_cell_3_1",
        "infrastructure.loadTesting.section_6_cell_3_2",
        "infrastructure.loadTesting.section_6_cell_3_3"
      ],
      [
        "infrastructure.loadTesting.section_6_cell_4_0",
        "infrastructure.loadTesting.section_6_cell_4_1",
        "infrastructure.loadTesting.section_6_cell_4_2",
        "infrastructure.loadTesting.section_6_cell_4_3"
      ],
      [
        "infrastructure.loadTesting.section_6_cell_5_0",
        "infrastructure.loadTesting.section_6_cell_5_1",
        "infrastructure.loadTesting.section_6_cell_5_2",
        "infrastructure.loadTesting.section_6_cell_5_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.loadTesting.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_8_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_9_content"
  },
  {
    "type": "code",
    "language": "javascript",
    "code": "import http from 'k6/http';\nimport { check, sleep, group } from 'k6';\nimport { Rate, Trend } from 'k6/metrics';\n\n// ── Custom Metrics (visible in k6 output + Grafana) ──\nconst loginDuration = new Trend('scr_login_duration', true);\nconst loginFailRate = new Rate('scr_login_fail_rate');\nconst tokenRefreshDuration = new Trend('scr_token_refresh_duration', true);\n\n// ── Environment Configuration ──\nconst BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';\nconst ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'superadmin@scripe.com';\nconst ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'P@ssw0rd';\n\nexport const options = {\n  stages: [\n    { duration: '2m', target: 50 },   // Ramp up to 50 concurrent users\n    { duration: '5m', target: 50 },   // Sustain load for 5 minutes\n    { duration: '1m', target: 0 },    // Ramp down gracefully\n  ],\n  thresholds: {\n    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],\n    'scr_login_duration': ['p(95)<3000'],\n    'scr_login_fail_rate': ['rate<0.05'],\n    'http_req_failed': ['rate<0.01'],\n  },\n};\n\n// Test Flow: Login → Protected Endpoint → Health Check\nexport default function () {\n  group('1. Login', () => { /* POST /api/auth/login */ });\n  group('2. Access Protected Endpoint', () => { /* GET /api/admins/current */ });\n  group('3. Health Check', () => { /* GET /health/ready */ });\n  sleep(Math.random() * 2 + 1); // Random 1-3s think time\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.loadTesting.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_12_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# ═══════════════════════════════════════════════════════════\n# INSTALL k6\n# ═══════════════════════════════════════════════════════════\n# Windows:  winget install k6  (or choco install k6)\n# macOS:    brew install k6\n# Linux:    sudo apt install k6\n# Docker:   docker run --rm -i grafana/k6 run - <script.js\n\n# ═══════════════════════════════════════════════════════════\n# DEVELOPMENT (local backend)\n# ═══════════════════════════════════════════════════════════\n# Start your backend first: dotnet run (or scripe dev backend)\nk6 run tests/load/auth-flow.js\nk6 run tests/load/crud-operations.js\n\n# ═══════════════════════════════════════════════════════════\n# DOCKER COMPOSE (containerized backend)\n# ═══════════════════════════════════════════════════════════\nk6 run tests/load/auth-flow.js \\\n  --env BASE_URL=http://host.docker.internal:5001\n\n# ═══════════════════════════════════════════════════════════\n# STAGING / PRODUCTION (remote server)\n# ═══════════════════════════════════════════════════════════\nk6 run tests/load/auth-flow.js \\\n  --env BASE_URL=https://api.staging.scripe.com \\\n  --env ADMIN_EMAIL=staging-admin@scripe.com \\\n  --env ADMIN_PASSWORD=StrongP@ss123\n\n# ═══════════════════════════════════════════════════════════\n# CUSTOM PARAMETERS\n# ═══════════════════════════════════════════════════════════\n# Override VUs and duration for quick smoke tests\nk6 run tests/load/auth-flow.js -u 10 --duration 30s\n\n# Heavy load test (100 concurrent users, 10 minutes)\nk6 run tests/load/auth-flow.js -u 100 --duration 10m\n\n# Output to JSON for CI/CD analysis\nk6 run tests/load/auth-flow.js --out json=results.json\n\n# Output to Prometheus for Grafana dashboards\nk6 run tests/load/auth-flow.js \\\n  --out experimental-prometheus-rw \\\n  --env K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.loadTesting.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_16_content"
  },
  {
    "type": "code",
    "language": "yaml",
    "code": "name: Load Tests\non:\n  schedule:\n    - cron: '0 3 * * 1'    # Every Monday at 3 AM\n  workflow_dispatch:         # Manual trigger\n\njobs:\n  load-test:\n    runs-on: ubuntu-latest\n    services:\n      api:\n        image: scripe-api:latest\n        ports: ['5001:5001']\n        env:\n          ASPNETCORE_ENVIRONMENT: Staging\n          Database__Provider: SqlServer\n          Database__ConnectionString: ${{ secrets.TEST_DB_CONNECTION }}\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Wait for API readiness\n        run: |\n          for i in {1..30}; do\n            curl -sf http://localhost:5001/health/ready && break\n            sleep 5\n          done\n\n      - name: Run Auth Flow Test\n        uses: grafana/k6-action@v0.3.1\n        with:\n          filename: tests/load/auth-flow.js\n          flags: >-\n            --env BASE_URL=http://localhost:5001\n            --env ADMIN_EMAIL=${{ secrets.TEST_ADMIN_EMAIL }}\n            --env ADMIN_PASSWORD=${{ secrets.TEST_ADMIN_PASSWORD }}\n            --out json=auth-results.json\n\n      - name: Run CRUD Operations Test\n        uses: grafana/k6-action@v0.3.1\n        with:\n          filename: tests/load/crud-operations.js\n          flags: >-\n            --env BASE_URL=http://localhost:5001\n            --env ADMIN_EMAIL=${{ secrets.TEST_ADMIN_EMAIL }}\n            --env ADMIN_PASSWORD=${{ secrets.TEST_ADMIN_PASSWORD }}\n\n      - name: Upload Results\n        uses: actions/upload-artifact@v4\n        if: always()\n        with:\n          name: k6-results\n          path: auth-results.json",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.loadTesting.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_19_content"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.loadTesting.section_20_hdr_0",
      "infrastructure.loadTesting.section_20_hdr_1",
      "infrastructure.loadTesting.section_20_hdr_2",
      "infrastructure.loadTesting.section_20_hdr_3",
      "infrastructure.loadTesting.section_20_hdr_4"
    ],
    "rows": [
      [
        "infrastructure.loadTesting.section_20_cell_0_0",
        "infrastructure.loadTesting.section_20_cell_0_1",
        "infrastructure.loadTesting.section_20_cell_0_2",
        "infrastructure.loadTesting.section_20_cell_0_3",
        "infrastructure.loadTesting.section_20_cell_0_4"
      ],
      [
        "infrastructure.loadTesting.section_20_cell_1_0",
        "infrastructure.loadTesting.section_20_cell_1_1",
        "infrastructure.loadTesting.section_20_cell_1_2",
        "infrastructure.loadTesting.section_20_cell_1_3",
        "infrastructure.loadTesting.section_20_cell_1_4"
      ],
      [
        "infrastructure.loadTesting.section_20_cell_2_0",
        "infrastructure.loadTesting.section_20_cell_2_1",
        "infrastructure.loadTesting.section_20_cell_2_2",
        "infrastructure.loadTesting.section_20_cell_2_3",
        "infrastructure.loadTesting.section_20_cell_2_4"
      ],
      [
        "infrastructure.loadTesting.section_20_cell_3_0",
        "infrastructure.loadTesting.section_20_cell_3_1",
        "infrastructure.loadTesting.section_20_cell_3_2",
        "infrastructure.loadTesting.section_20_cell_3_3",
        "infrastructure.loadTesting.section_20_cell_3_4"
      ],
      [
        "infrastructure.loadTesting.section_20_cell_4_0",
        "infrastructure.loadTesting.section_20_cell_4_1",
        "infrastructure.loadTesting.section_20_cell_4_2",
        "infrastructure.loadTesting.section_20_cell_4_3",
        "infrastructure.loadTesting.section_20_cell_4_4"
      ],
      [
        "infrastructure.loadTesting.section_20_cell_5_0",
        "infrastructure.loadTesting.section_20_cell_5_1",
        "infrastructure.loadTesting.section_20_cell_5_2",
        "infrastructure.loadTesting.section_20_cell_5_3",
        "infrastructure.loadTesting.section_20_cell_5_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.loadTesting.section_21_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# ═══════════════════════════════════════════════════════════\n# SQL SERVER BACKUP (Windows / Docker)\n# ═══════════════════════════════════════════════════════════\n# Full backup\nsqlcmd -S localhost -U sa -P 'YourPassword' -Q \\\n  \"BACKUP DATABASE Scripe TO DISK='/backups/scr_full.bak'\"\n\n# Point-in-time restore\nsqlcmd -S localhost -U sa -P 'YourPassword' -Q \\\n  \"RESTORE DATABASE Scripe FROM DISK='/backups/scr_full.bak' \\\n   WITH STOPAT='2026-04-06T20:00:00'\"\n\n# ═══════════════════════════════════════════════════════════\n# POSTGRESQL BACKUP (Linux / Docker)\n# ═══════════════════════════════════════════════════════════\n# Full dump\npg_dump -h localhost -U scripe -d scr_db -F c > scr_backup.dump\n\n# Restore\npg_restore -h localhost -U scripe -d scr_db scr_backup.dump\n\n# ═══════════════════════════════════════════════════════════\n# REDIS BACKUP\n# ═══════════════════════════════════════════════════════════\n# Trigger RDB snapshot\nredis-cli BGSAVE\n\n# Copy RDB file\ncp /var/lib/redis/dump.rdb /backups/redis_$(date +%Y%m%d).rdb",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "infrastructure.loadTesting.section_23_title",
    "contentKey": "infrastructure.loadTesting.section_23_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.loadTesting.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.loadTesting.section_25_item_0",
      "infrastructure.loadTesting.section_25_item_1",
      "infrastructure.loadTesting.section_25_item_2"
    ]
  }
],
  relatedSlugs: [
  "infrastructure/observability",
  "infrastructure/resilience",
  "infrastructure/health-checks"
],
  lastUpdated: "2026-06-09",
});
