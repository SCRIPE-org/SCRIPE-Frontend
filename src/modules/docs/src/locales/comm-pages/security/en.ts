/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  commercial: {
    securityOverview: {
      complianceTitle: "Foundation for Compliance",
      description:
        "A comprehensive breakdown of NEXORA’s multi-layered, defense-in-depth security perimeter, protecting everything from the routing layer to the persistence layer.",
      gdpr: "GDPR Let-To-Forget",
      gdprDesc: "Out-of-the-box support for strict PII anonymization and hard-deletion protocols.",
      headersTitle: "Defensive HTTP Headers",
      intro:
        "We don't trust the network, we don't trust the client, and we don't trust the payload. NEXORA is built on a Zero-Trust architectural methodology, enforcing aggressive security protocols at every single boundary of the application matrix.",
      modelContent:
        "Every single API request is immediately evaluated against the FluentValidation engine. If a payload violates domain constraints (e.g., invalid email formats, out-of-bounds numbers), the pipeline instantly rejects the payload with a 400 Bad Request before a controller is ever instantiated.",
      modelTitle: "Strict Pipeline Validation",
      soc2: "SOC 2 Type II Readiness",
      soc2Desc:
        "Built-in forensic audit trailing and strict data isolation accelerates successful SOC 2 audits.",
      sox: "SOX Compliance Triggers",
      soxDesc:
        "Mathematical immutability in financial audit logs to support highly regulated environments.",
      summaryTitle: "Defense-In-Depth Matrix",
      title: "Zero-Trust Security Posture",
    },
    authSecurity: {
      apiTitle: "API Key Management",
      description:
        "Advanced JWT authentication, brute-force protection, multi-factor security, and hardened password policies.",
      intro:
        "Security is baked into NEXORA's DNA. Our zero-trust identity architecture leverages industry-leading cryptography, highly configurable password policies, and strict JWT validation to defend your application from modern vectors.",
      jwtContent:
        "We utilize fast, stateless JSON Web Tokens (JWT) signed using asymmetric RSA keys. Access tokens have short lifespans while secure, HTTP-only refresh tokens ensure frictionless user experiences without compromising security.",
      jwtTitle: "Asymmetric JWT Protocol",
      passwordContent:
        "Enforce NIST-compliant password complexity. Dictate required lengths, specialized character combinations, and prevent reuse of historical passwords over configurable timeframes.",
      passwordTitle: "Adaptive Password Policies",
      sessionTitle: "Concurrent Session Control",
      title: "Authentication & Security",
      twoFa1Content:
        "Seamlessly integrate standard TOTP applications like Google Authenticator or Authy using standard QR-code provisioning.",
      twoFa1Title: "Time-Based OTP (TOTP)",
      twoFa2Content:
        "Fall back to secure SMS verification handled through robust third-party integrators (Twilio, Nexmo).",
      twoFa2Title: "SMS Verification",
      twoFa3Content:
        "Dispatch one-time challenge codes via integrated SMTP email solutions with customizable Scriban templates.",
      twoFa3Title: "Email OTP",
      twoFa4Content:
        "Provide printable, cryptographically secure recovery codes for disaster recovery scenarios.",
      twoFa4Title: "Secure Recovery Codes",
      twoFaContent:
        "Passwords alone are insufficient. NEXORA natively requires dynamic secondary verification barriers, protecting your users even in the event of credential stuffing or phishing.",
      twoFaTitle: "Multi-Factor Authentication",
    },
    dataProtection: {
      csrfContent:
        "All mutable API endpoints require cryptographic antiforgery tokens. By automatically tying CSRF assertions to the user's JWT and secure, SameSite cookies, NEXORA completely eliminates cross-site request forgery vectors.",
      csrfTitle: "Impenetrable CSRF Defense",
      description:
        "Cryptographic safeguards, at-rest encryption strategies, and comprehensive privacy controls.",
      encryptionTitle: "End-to-End Encryption Architecture",
      fieldProjectionContent:
        "Stop over-fetching. Our dynamic projection mapping ensures that APIs only query and serialize the exact columns requested by the frontend, preventing accidental exposure of sensitive backend fields like password hashes or salary data.",
      fieldProjectionTitle: "Strict Data Projection",
      idEncContent:
        "We utilize robust, sequential UUIDs (v7) and Hashids to prevent easily guessable sequential integers from exposing business velocity. Object IDs are inherently obscure and decoupled from the physical database identity.",
      idEncTitle: "Opaque ID Generation",
      intro:
        "Protecting user data is paramount. NEXORA employs defense-in-depth strategies, utilizing military-grade cryptography and logical barriers to ensure that unauthorized data access is mathematically impossible.",
      replayContent:
        "By enforcing strict JWT nonce validation, token expiration, and cryptographically signed timestamps, our API gateway rejects intercepted or duplicated request payloads automatically.",
      replayTitle: "Replay Attack Prevention",
      title: "Data Protection & Privacy",
    },
    infraSecurity: {
      corsContent:
        "Stop cross-origin bleeding dead in its tracks. NEXORA's default CORS policies are locked down with a strict whitelist paradigm, instantly rejecting any unauthorized browser pre-flight requests from rogue domains.",
      corsTitle: "Strict Cross-Origin Policies",
      cspContent:
        "Our pre-configured Content Security Policy (CSP) headers mathematically eliminate massive classes of XSS vulnerabilities by dictating exactly which external scripts, fonts, and stylesheets the browser is legally allowed to execute.",
      cspTitle: "Impenetrable CSP Headers",
      description:
        "Deep dive into the outer defensive perimeter: Rate limiting, CORS, input validation, and physical infrastructure hardening.",
      intro:
        "Security cannot be an afterthought bolted onto the application layer. NEXORA hardens the perimeter at the infrastructure level, establishing a formidable shield against volumetric DDoS assaults, cross-site scripting, and unauthorized network traversal.",
      ipFiltering: "Layer 4 IP Whitelisting",
      ipFilteringDesc:
        "Restrict highly sensitive administrative endpoints to traffic originating strictly from your corporate VPN or physical office subnets.",
      networkSegment: "Micro-Segmentation",
      networkSegmentDesc:
        "Isolate databases and background workers into private, unroutable subnets completely disconnected from the public internet.",
      networkTitle: "Topological Shielding",
      rateLimitContent:
        "Survive sudden traffic spikes and brute-force sweeps. NEXORA includes distributed, Redis-backed rate limiting that dynamically throttles abusive IP addresses or specific JWTs before they can exhaust database connection pools.",
      rateLimitTitle: "Distributed Throttling",
      reverseProxy: "Proxy Header Validation",
      reverseProxyDesc:
        "Securely resolve original client IPs behind load balancers using rigidly validated X-Forwarded-For headers, preventing IP spoofing.",
      secretsContent:
        "Hardcoded passwords are a catastrophic vulnerability. The NEXORA configuration pipeline natively intercepts and injects secure strings dynamically at boot-time directly from enterprise secret managers.",
      secretsTitle: "Zero-Trust Secret Management",
      title: "Perimeter & Infrastructure Security",
      tlsInspection: "Mandatory TLS 1.3",
      tlsInspectionDesc:
        "Enforce the highest cryptographic cipher suites while aggressively rejecting deprecated, insecure protocols like TLS 1.1 or SSLv3.",
      warningNote:
        "Warning: Disabling these default defensive mechanisms without consulting your CISO dramatically increases your organizational attack surface.",
    },
    complianceReadiness: {
      auditReadyContent:
        "Auditors don't want promises; they want evidence. NEXORA provides exportable, tamper-evident logs of every API invocation, privilege escalation, and data mutation, transforming a 6-month SOC 2 preparation into a 2-week formality.",
      auditReadyTitle: "Instant Evidentiary Artifacts",
      checklistTitle: "The Compliance Fast-Track",
      consentMgmt: "Advanced Consent Management",
      consentMgmtDesc:
        "Programmatically track, version, and enforce user consent across multiple privacy policies and terms of service iterations.",
      dataMinimization: "Intelligent Data Minimization",
      dataMinimizationDesc:
        "Automatically expire or redact PII (Personally Identifiable Information) from your databases when retention policies are met.",
      dataPortability: "Instant Data Portability",
      dataPortabilityDesc:
        "Allow users to securely download a cryptographic archive of their complete data footprint in machine-readable JSON formats.",
      description:
        "Pre-configured technical controls enabling extremely rapid certification for ISO 27001, SOC 2, and GDPR.",
      disclaimer:
        "Disclaimer: NEXORA provides the technical foundation; consult legal counsel for procedural compliance.",
      frameworkIntro:
        "Achieving compliance usually derails engineering roadmaps for months. NEXORA dramatically shortens this curve by baking the most difficult technical controls directly into the foundational framework.",
      frameworkTitle: "Accelerated Framework Support",
      gdprTitle: "GDPR & CCPA Native",
      intro:
        "Regulatory frameworks demand rigorous data governance. NEXORA accelerates your path to certification by embedding military-grade audit, encryption, and privacy controls deep within the application architecture.",
      rightToErasure: "Orchestrated Right To Erasure",
      rightToErasureDesc:
        "Execute platform-wide soft or hard deletes that automatically cascade across all relational tables.",
      securityControlsTitle: "Mapped Security Controls",
      title: "Compliance Readiness",
    },
    auditCompliance: {
      alerting: "Real-Time Alerting",
      alertingDesc:
        "Automate security alerts via webhooks or Slack when specific high-privilege audit thresholds are breached.",
      complianceContent:
        "NEXORA provides a turnkey path to ISO 27001, SOC 2, HIPAA, and GDPR compliance. With immutable event capture, guaranteed attribution, and strict isolation, auditors can instantly verify the integrity of your tenant's data.",
      complianceTitle: "Built for Compliance",
      dashboard: "Visual Dashboard",
      dashboardDesc:
        "Instantly drill down into gigabytes of audit data using our high-performance Vue/Next.js reporting dashboards.",
      description:
        "A forensic-grade audit pipeline capturing HTTP requests, entity snapshots, and security operations with zero data loss.",
      exportContent:
        "Export massive audit datasets directly to encrypted CSV or Excel formats, or stream them securely into your existing SIEM solutions like Splunk or Datadog.",
      exportTitle: "Forensic Export & SIEM",
      intro:
        "Data governance is non-negotiable. NEXORA features a background-threaded, military-grade audit log system that captures every mutation, authentication attempt, and critical read across the entire monolith without degrading API performance.",
      liveStream: "Live SignalR Stream",
      liveStreamDesc:
        "Watch administrative and security events flow in real-time across the platform via protected WebSockets.",
      pipelineContent:
        "Built on Entity Framework Core's interceptors constraint model, the audit pipeline takes a temporal snapshot of your entites before and after mutation. Changes are serialized to JSON and stored immutably.",
      pipelineTitle: "Asynchronous Capture Pipeline",
      realTimeContent:
        "Watch your system operate with transparent observability. Webhook integration and SignalR streams deliver forensic insights instantly, empowering your DevSecOps teams to respond proactively rather than reactively.",
      realTimeTitle: "Real-Time Observability",
      retention: "Adaptive Retention",
      retentionDesc:
        "Configure cold-storage policies that automatically archive or purge audit logs based on your specific compliance temporal limits.",
      sourcesTitle: "Four Pillars of Capture",
      title: "Audit & Compliance Engine",
    },
  },
};
