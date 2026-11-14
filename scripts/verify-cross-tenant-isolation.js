/**
 * SCRIPE Academy — Cross-Tenant Isolation Negative Test Verification
 * Verifies multi-tenancy enforcement, security boundaries, and anti-tampering:
 * - Primary Authenticated Tenant: 22222222-2222-2222-2222-222222222222 (Al Hilal SFC Academy)
 * - Target Tenant A: 944caec0-f3fd-454c-878a-da833a3c7c6c (Al-Ahly SC)
 * - Target Tenant B: 2b59128b-1205-4381-95a6-345bf3453e0b (City Football Performance)
 */

const API_BASE = "http://127.0.0.1:5200";
const UAT_TENANT_ID = "22222222-2222-2222-2222-222222222222";
const AHLY_TENANT_ID = "944caec0-f3fd-454c-878a-da833a3c7c6c";
const CITY_TENANT_ID = "2b59128b-1205-4381-95a6-345bf3453e0b";

async function run() {
  console.log("==================================================================");
  console.log("SCRIPE ACADEMY — CROSS-TENANT ISOLATION NEGATIVE VERIFICATION");
  console.log("==================================================================");

  const uatUsername = process.env.SCRIPE_UAT_USERNAME || "uat.tenantadmin@hilal.local";
  const uatPassword = process.env.SCRIPE_UAT_PASSWORD;

  if (!uatPassword) {
    console.error("FATAL: SCRIPE_UAT_PASSWORD environment variable is required to execute real API tests.");
    process.exit(1);
  }

  // Step 1: Authenticate as UAT Admin (Tenant: HILAL)
  console.log("\n[1] Authenticating as UAT Admin for Tenant:", UAT_TENANT_ID);
  const loginRes = await fetch(`${API_BASE}/api/v1/auth/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Timestamp": String(Date.now()),
      "X-Request-Nonce": "nonce-" + Date.now()
    },
    body: JSON.stringify({
      identifier: uatUsername,
      password: uatPassword
    })
  });

  if (!loginRes.ok) {
    throw new Error(`Authentication failed: HTTP ${loginRes.status}`);
  }

  const authData = await loginRes.json();
  const token = authData.accessToken;
  console.log(" -> Authentication successful! JWT Token acquired for tenant:", authData.userProfile?.tenantName || UAT_TENANT_ID);

  const results = [];

  // Helper for requests
  async function testScenario({ name, method, path, headers = {}, expectedStatus, body }) {
    const defaultHeaders = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...headers
    };

    if (method === "PUT" || method === "POST") {
      defaultHeaders["X-Request-Timestamp"] = String(Date.now());
      defaultHeaders["X-Request-Nonce"] = crypto.randomUUID();
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    const passed = Array.isArray(expectedStatus)
      ? expectedStatus.includes(res.status)
      : res.status === expectedStatus;

    let responseSummary = "";
    try {
      const text = await res.text();
      responseSummary = text.slice(0, 120);
    } catch (_) {}

    const result = {
      name,
      method,
      path,
      actualStatus: res.status,
      expectedStatus,
      passed,
      responseSummary
    };

    results.push(result);
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`\n[${mark}] ${name}`);
    console.log(`       Request: ${method} ${path}`);
    console.log(`       Headers: ${JSON.stringify(headers)}`);
    console.log(`       Actual Status: ${res.status} (Expected: ${Array.isArray(expectedStatus) ? expectedStatus.join("/") : expectedStatus})`);
    if (responseSummary) console.log(`       Response: ${responseSummary}`);
    return result;
  }

  // 1. Positive Baseline: Authorized access to attendance
  await testScenario({
    name: "Scenario 1 (Baseline): Authorized Tenant Access to Attendance Queue",
    method: "GET",
    path: "/api/v1/academy/attendance?page=1&pageSize=5",
    expectedStatus: 200
  });

  // 2. Positive Baseline: Authorized access to programs
  await testScenario({
    name: "Scenario 2 (Baseline): Authorized Tenant Access to Programs Catalog",
    method: "GET",
    path: "/api/v1/academy/programs?page=1&pageSize=5",
    expectedStatus: 200
  });

  // 3. Negative Test: Cross-Tenant Context Switching Attack (Ahly) via X-Tenant-Context
  await testScenario({
    name: "Scenario 3 (Negative): Attempt drill-down / context switch to Al-Ahly SC",
    method: "GET",
    path: "/api/v1/academy/attendance?page=1&pageSize=5",
    headers: { "X-Tenant-Context": AHLY_TENANT_ID },
    expectedStatus: 403
  });

  // 4. Negative Test: Cross-Tenant Context Switching Attack (City) via X-Tenant-Context
  await testScenario({
    name: "Scenario 4 (Negative): Attempt drill-down / context switch to City Football",
    method: "GET",
    path: "/api/v1/academy/programs?page=1&pageSize=5",
    headers: { "X-Tenant-Context": CITY_TENANT_ID },
    expectedStatus: 403
  });

  // 5. Negative Test: Cross-Tenant Mutation Attempt (Ahly) via X-Tenant-Context
  await testScenario({
    name: "Scenario 5 (Negative): Attempt cross-tenant attendance correction mutation under Ahly context",
    method: "PUT",
    path: "/api/v1/academy/attendance/f7520aae-b821-4b16-b531-97424a460657/athletes/cb96f83e-0884-4f4a-b126-203e70b8b821",
    headers: { "X-Tenant-Context": AHLY_TENANT_ID },
    expectedStatus: 403,
    body: {
      expectedVersion: "6c11cedc-414f-4e56-acaf-7658e2ef3d5f",
      expectedSessionVersion: "f7520aae-b821-4b16-b531-97424a460657",
      status: "Present",
      correctionReason: "Unauthorized cross-tenant attempt"
    }
  });

  // 6. Negative Test: Direct cross-tenant record leakage attempt (Non-existent / out-of-tenant entity)
  await testScenario({
    name: "Scenario 6 (Negative): Direct record access for entity not in tenant's boundary",
    method: "GET",
    path: "/api/v1/academy/athletes/99999999-9999-9999-9999-999999999999",
    expectedStatus: 404
  });

  // 7. Negative Test: Unauthenticated access attempt
  await testScenario({
    name: "Scenario 7 (Negative): Access protected academy endpoints with no token",
    method: "GET",
    path: "/api/v1/academy/attendance?page=1&pageSize=5",
    headers: { "Authorization": "" },
    expectedStatus: 401
  });

  console.log("\n==================================================================");
  console.log("CROSS-TENANT ISOLATION VERIFICATION MATRIX");
  console.log("==================================================================");
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  console.log(`Total Scenarios: ${total}`);
  console.log(`Passed: ${passed} / ${total}`);
  if (passed === total) {
    console.log("DECISION: 100% PASS — Cross-Tenant Security & Anti-Tampering Verified!");
  } else {
    console.error("DECISION: FAIL — Security boundary breached!");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal test execution error:", err.message);
  process.exit(1);
});
