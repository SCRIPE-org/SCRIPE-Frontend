/**
 * Docs page locale — EN
 */
export const en = {
  commercial: {
    observabilityMonitoring: {
      alertingContent:
        "Visual dashboards mean nothing if nobody is looking. Configure strict baseline thresholds—for instance, if 500 errors spike, or database CPU exceeds 80%—and automatically trigger incident response protocols across Slack or PagerDuty.",
      alertingTitle: "Threshold-Based Alerting",
      cacheMetrics: "Redis Cache Efficacy",
      cacheMetricsDesc:
        "Continuously monitor memory fragmentation, hit/miss ratios, and eviction metrics to tune performance.",
      dbMetrics: "Database Pool Exhaustion",
      dbMetricsDesc:
        "Track active connections, slow query executions, and command compilation times directly from EF Core.",
      description:
        "Forensic structured logging, zero-downtime health probes, Prometheus metrics, and OpenTelemetry distributed tracing.",
      healthContent:
        "Out-of-the-box Kubernetes-native liveness and readiness probes. The API continuously self-reports the operational status of the SQL database, Redis cache, and external dependencies. If a node fails, the orchestrator instantly drops it from the load balancer rotation.",
      healthTitle: "Kubernetes-Native Probes",
      intro:
        "You cannot manage what you cannot measure. SCRIPE integrates an elite observability stack, providing SREs and DevSecOps teams with forensic, real-time insights into the platform's distributed behavior.",
      loggingContent:
        "Traditional text logs are useless at scale. SCRIPE utilizes Serilog to generate deeply structured JSON event logs, automatically enriching them with Correlation IDs, Tenant Contexts, and Machine Names for immediate querying in Datadog or ELK.",
      loggingTitle: "Structured Forensic Logging",
      metricsIntro:
        "By integrating standard OpenTelemetry protocols, SCRIPE exposes thousands of internal platform metrics directly to your existing Prometheus and Grafana dashboards.",
      metricsTitle: "OpenTelemetry Integration",
      requestMetrics: "API Request Throughput",
      requestMetricsDesc:
        "Monitor latency percentiles (p95, p99), payload sizes, and precise execution durations per endpoint.",
      tip: "Executive Tip: Implement distributed tracing to track a single user request seamlessly across all deployed microservices.",
      title: "Observability & Telemetry",
      tracingContent:
        "In a microservice deployment, a single click might traverse five isolated services. Distributed tracing injects and propagates Correlation IDs through HTTP headers, allowing you to visually map complex request journeys and instantly identify the bottleneck service.",
      tracingTitle: "Cross-Service Distributed Tracing",
      userMetrics: "Authentication Velocity",
      userMetricsDesc:
        "Track login successes, brute-force attempts, and specific tenant activity in real-time.",
    },
    performanceBenchmarks: {
      apiIntro:
        "Our architecture prioritizes speed without sacrificing abstraction. Every layer of the API is rigorously benchmarked to ensure minimal allocation and maximal throughput.",
      apiTitle: "Sustained API Velocity",
      cachingContent:
        "We don't query the database unless legally required. SCRIPE implements a sophisticated, multi-tiered caching strategy. Short-lived L1 memory caches intercept identical concurrent requests, while the L2 distributed Redis cache provides massive cross-node read throughput.",
      cachingTitle: "Multi-Tiered Aggressive Caching",
      dbTitle: "Entity Framework Optimization",
      description:
        "Transparent, real-world performance metrics, optimization strategies, and horizontal scaling capabilities.",
      frontendTitle: "Next.js Rendering Engine",
      intro:
        "SCRIPE isn't just scalable; it is explosively fast. By utilizing .NET 9's latest performance improvements and aggressive distributed caching, the platform handles massive concurrent loads with hardware-level efficiency.",
      scaleTitle: "Infinite Horizontal Scale",
      tip: "Performance Note: The included multi-stage Dockerfiles guarantee the absolute smallest container footprints, allowing instance clusters to auto-scale in milliseconds.",
      title: "Performance Benchmarks",
    },
    realTimeCapabilities: {
      dashboardsContent:
        "Stop forcing your users to refresh the page. Operational dashboards dynamically re-render the exact millisecond underlying database metrics shift, providing a massive competitive advantage for dispatch, trading, and monitoring applications.",
      dashboardsTitle: "Sub-Second Live Dashboards",
      description:
        "State-of-the-art WebSockets integration enabling sub-second live dashboards, system-wide broadcasting, and collaborative presence tracking.",
      intro:
        "Modern enterprise applications must be alive. SCRIPE integrates a highly-optimized, distributed SignalR WebSocket backplane out-of-the-box, delivering real-time, bidirectional communication to millions of concurrent clients.",
      liveAudit: "Real-Time Forensic Streaming",
      liveAuditDesc:
        "Stream critical security and audit logs directly to administrator dashboards as they occur globally.",
      liveCharts: "Dynamic Telemetry Rendering",
      liveChartsDesc:
        "Chart data points animate onto the screen the moment a backend event is published.",
      notificationsContent:
        "The platform's unified notification hub can instantly push transactional alerts, approval requests, and system warnings directly into the React UI without polling the server, drastically reducing database load and battery consumption on mobile clients.",
      notificationsTitle: "Instantaneous Global Notifications",
      presenceTrack: "User Presence & Locking",
      presenceTrackDesc:
        "Visually indicate when a colleague is actively editing a specific entity to prevent logical overwrites.",
      scaleTitle: "Redis-Backed Global Scale",
      securityAlert: "Instant Threat Broadcasting",
      securityAlertDesc:
        "Broadcast critical security protocol changes forcing immediate client re-authentications.",
      signalrContent:
        "Running multiple API nodes? No problem. Our pre-configured Redis backplane transparently synchronizes WebSocket messages across your entire Kubernetes cluster, ensuring a user connected to Node A receives a message generated by Node B.",
      signalrTitle: "Distributed WebSocket Backplane",
      title: "Real-Time Reactivity",
    },
    resiliencePatterns: {
      circuitContent:
        "If a third-party payment gateway goes offline, SCRIPE's circuit breakers instantly ‘trip’ after a configured threshold of failures. This physically prevents your application from sending thousands of doomed requests, allowing the external service time to recover while your app fails fast.",
      circuitTitle: "Automated Circuit Breakers",
      configTitle: "Dynamic Policy Configuration",
      degradationContent:
        "When an external dependency fails, the system doesn't crash—it elegantly degrades. If the live shipping rate API is unreachable, SCRIPE automatically serves the last known cached rates, ensuring checkout flows remain uninterrupted.",
      degradationTitle: "Elegant Graceful Degradation",
      description:
        "Military-grade fault tolerance utilizing intelligent retry pipelines, automated circuit breakers, and graceful fallback strategies.",
      healthContent:
        "SCRIPE doesn't wait for a user to report a bug. The system continuously executes proactive health checks against databases, caches, and third-party APIs. If degradation is detected, it automatically attempts remediation or alerts DevOps immediately.",
      healthTitle: "Proactive Health Telemetry",
      intro:
        "In a distributed enterprise environment, network failures aren't a possibility; they are a mathematical certainty. SCRIPE is engineered to survive catastrophic external outages without compromising the core user experience.",
      retryTitle: "Jittered Exponential Backoff",
      tip: "Architectural Tip: Never write standard try/catch blocks for network calls. Always utilize the centralized Polly HTTP interceptors injected throughout the platform.",
      title: "Defensive Resilience Architecture",
    },
    storageBackends: {
      configTitle: "Dynamic Provider Configuration",
      description:
        "Abstracted, hyper-scalable binary storage arrays seamlessly supporting Local Disk, AWS S3, Azure Blob, and MinIO backends.",
      featuresTitle: "Storage Subsystem Features",
      handlingTitle: "Secure File Transmission",
      imageProcessing: "On-The-Fly Image Optimization",
      imageProcessingDesc:
        "Automatically compress, resize, and convert uploaded images to modern WebP formats.",
      intro:
        "Enterprise applications generate terabytes of binary data. SCRIPE abstracts the physical storage location entirely. You can start on local disk during incubation and migrate to global AWS S3 buckets in production via a single configuration string, without rewriting a single module.",
      mig1Content: "Develop at blazing speed using the local filesystem.",
      mig1Title: "1. Local Development",
      mig2Content: "Deploy seamlessly to staging using open-source MinIO containers.",
      mig2Title: "2. Staging Infrastructure",
      mig3Content: "Scale infinitely in production using AWS S3 or Azure Blob Storage.",
      mig3Title: "3. Infinite Production Scale",
      migrationContent:
        "The `IStorageService` interface absolutely decouples your business logic from the cloud provider. Changing vendors is strictly an infrastructure config operation, completely insulating you from vendor lock-in.",
      migrationTitle: "Absolute Vendor Independence",
      pluggable: "Provider Agnosticism",
      pluggableDesc:
        "Switch storage paradigms seamlessly via strictly standardized interface abstractions.",
      providersIntro:
        "The platform dynamically injects the appropriate storage provider via Dependency Injection based on environment variables.",
      providersTitle: "Supported Storage Backends",
      resumableDownload: "Multi-Part Uploads",
      resumableDownloadDesc:
        "Reliably stream massive gigabyte-scale files without crashing API nodes or exhausting memory.",
      tenantIsolation: "Cryptographic Path Isolation",
      tenantIsolationDesc:
        "Files are physically bucketed by `[TenantId]`, guaranteeing massive data security.",
      title: "Abstracted Storage Infrastructure",
    },
    testingStrategy: {
      ci1Content:
        'Absolute execution environment isolation. Upon every Pull Request, the CI pipeline deterministically restores compiler toolchains inside a hermetically sealed, sterile Linux container—ensuring "works on my machine" excuses are mathematically eradicated.',
      ci1Title: "1. Sterile Environment Initialization",
      ci2Content:
        "Execute the blistering-fast xUnit suite using intelligently mocked repositories. This guarantees pure Application-layer CQRS business logic is scrutinized and certified in milliseconds without establishing a physical database connection.",
      ci2Title: "2. Pure Logic Validation",
      ci3Content:
        "Inject ephemeral Docker databases using Testcontainers. This guarantees that EF Core LINQ projections, global query filters, and physical database migrations execute flawlessly against real SQL engines before they self-destruct.",
      ci3Title: "3. Ephemeral Integration Telemetry",
      ci4Content:
        "Trigger massive Playwright browser clusters. Headless Chromium workers relentlessly abuse the compiled Next.js UI, aggressively interacting with every React component to definitively certify the end-to-end user journey.",
      ci4Title: "4. Automated Cross-Browser Automation",
      ciContent:
        "Testing without absolute automation is a liability. The included repository natively ships with a massively parallelized GitHub Actions / GitLab CI pipeline. It actively barricades the `main` branch, physically rejecting any code that violates domain boundaries, fails mathematical assertions, or triggers regression.",
      ciTitle: "Continuous Security & Integrity Pipelines",
      description:
        "A profound analysis of the SCRIPE testing pyramid: Blazing-fast CQRS unit assertions, ephemeral Docker database integrations, and relentless Playwright UI automation.",
      e2eContent:
        "User Acceptance Testing must not rely on human error. We integrate Playwright to spin up headless Chromium execution clusters. These clusters simulate massive, highly-complex user interactions—executing complete multi-tenant onboarding flows, validating React component state, and ensuring the UI remains perfectly resilient under aggressive chaotic conditions before manual QA ever touches it.",
      e2eTitle: "Relentless End-To-End Browser Automation",
      integrationContent:
        "Mocking the database extensively leads to dangerous false positives. SCRIPE deploys Testcontainers to dynamically provision, execute, and destroy real physical instances of PostgreSQL and Redis specifically for each test suite. This ensures your EF Core schemas are tested against veritable infrastructure rather than fragile in-memory mocks.",
      integrationTitle: "Ephemeral Infrastructure Testing",
      intro:
        "A cascading enterprise bug costs hundreds of thousands of dollars in systemic downtime. SCRIPE enforces a ruthless, mathematically airtight testing strategy. From isolated Clean Architecture logic tests to destructive headless browser automation, every single byte of code is aggressively scrutinized and certified prior to merging.",
      lstIntI1: "WebApplicationFactory for realistic HTTP pipeline testing",
      lstIntI2: "TestContainers for disposable database instances",
      lstIntI3: "Automatic test data seeding and cleanup",
      lstIntI4: "Parallel test execution with isolated databases",
      lstIntI5: "Authentication simulation with test JWT tokens",
      pyramidLvl: "Certification Stratum",
      pyramidScope: "Validation Scope",
      pyramidTech: "Execution Engine",
      pyramidTitle: "The Stratified Code Certification Pyramid",
      pyrE2E: "End-To-End Simulation",
      pyrE2EScope: "Full Journey Validation (UI to DB)",
      pyrE2ETech: "Playwright / Chromium Workers",
      pyrInt: "Ephemeral Integration",
      pyrIntScope: "API Endpoints & Physical SQL",
      pyrIntTech: "WebApplicationFactory + Testcontainers",
      pyrStatic: "Static Code Analysis",
      pyrStaticScope: "Syntax, Rules & Types",
      pyrStaticTech: "TypeScript + ESLint + Roslyn",
      pyrUnit: "Pure Business Logic",
      pyrUnitScope: "Domain + Application Layers",
      pyrUnitTech: "xUnit + Moq + FluentAssertions",
      summaryTitle: "Mathematical Testing Certitude",
      tblSumHeader1: "Test Type",
      tblSumHeader2: "Framework",
      tblSumHeader3: "Coverage Target",
      tblSumHeader4: "Run Frequency",
      tblSumR1C1: "Unit (Backend)",
      tblSumR1C2: "xUnit + FluentAssertions",
      tblSumR1C3: "Domain + Application layers",
      tblSumR1C4: "Every commit",
      tblSumR2C1: "Unit (Frontend)",
      tblSumR2C2: "Vitest + Testing Library",
      tblSumR2C3: "ViewModels + utilities",
      tblSumR2C4: "Every commit",
      tblSumR3C1: "Integration",
      tblSumR3C2: "WebApplicationFactory",
      tblSumR3C3: "API endpoints + database",
      tblSumR3C4: "PR merges",
      tblSumR4C1: "E2E",
      tblSumR4C2: "Playwright",
      tblSumR4C3: "Critical user flows",
      tblSumR4C4: "Nightly / pre-release",
      tblSumR5C1: "Static Analysis",
      tblSumR5C2: "ESLint + TypeScript + Roslyn",
      tblSumR5C3: "100% of codebase",
      tblSumR5C4: "Every save",
      tblSumR6C1: "Performance",
      tblSumR6C2: "k6 / Artillery",
      tblSumR6C3: "Load testing endpoints",
      tblSumR6C4: "Pre-release",
      tip: "Architectural Directive: Do not aim for vanity metrics. Enforce an absolute 100% coverage baseline for core Domain Entities and CQRS Handlers, utilizing Playwright UI clusters to cover the Presentation surface.",
      title: "Automated Resiliency & Testing",
      unitContent:
        "By rigorously adhering to Clean Architecture principles, SCRIPE's business logic remains physically insulated from HTTP contexts and SQL schemas. Your engineering team can instantaneously execute thousands of xUnit testing suites against core Handlers and Domain Entities in mere milliseconds, maximizing developer velocity and deployment confidence.",
      unitTitle: "Blazing-Fast Isolated Unit Execution",
    },
  },
};
