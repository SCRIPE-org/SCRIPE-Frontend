import { describe, it, expect, beforeEach } from "vitest";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import {
  DATA_EXCHANGE_JOBS_STORAGE_PREFIX,
  getDataExchangeJobsScopeKey,
  purgeDataExchangeJobsStorage,
  useDataExchangeJobsStore,
} from "../useDataExchangeJobsStore";
import type { DataTransferJobDto } from "../../../domain/types";

function makeJob(id: string): DataTransferJobDto {
  return {
    id,
    kind: "Import",
    entityKey: "crm.lead",
    isMultiSheet: false,
    importMode: "Upsert",
    onboardingMode: "StagedPendingInvite",
    fileFormat: "xlsx",
    originalFileName: "leads.xlsx",
    status: "Running",
    totalRows: 10,
    processedRows: 2,
    progressPercent: 20,
    validRows: 10,
    committedRows: 0,
    createdRows: 0,
    updatedRows: 0,
    rejectedRows: 0,
    errorSummary: null,
    hasRejectedWorkbook: false,
    hasExportWorkbook: false,
    createdAt: new Date().toISOString(),
    startedAtUtc: new Date().toISOString(),
    completedAtUtc: null,
    expiresAtUtc: new Date(Date.now() + 86_400_000).toISOString(),
  };
}

describe("useDataExchangeJobsStore tenant+user scoping & logout hygiene", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useDataExchangeJobsStore.setState({ jobs: [], isCollapsed: false });
    useAppStore.setState({ user: { id: "user-1", tenantId: "tenant-a" } as never });
  });

  it("partitions sessionStorage keys by active tenant context and user id, and preserves sibling scopes on syncScope()", async () => {
    window.sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "tenant-drilldown" })
    );
    expect(getDataExchangeJobsScopeKey()).toBe("tenant-drilldown:user-1");

    useDataExchangeJobsStore.getState().trackJob(makeJob("job-a"));
    const keyA = `${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:tenant-drilldown:user-1`;
    expect(window.sessionStorage.getItem(keyA)).toContain("job-a");

    // Switch tenant and call syncScope() -> Tenant B starts isolated while Tenant A key remains intact
    window.sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "tenant-other" })
    );
    useDataExchangeJobsStore.getState().syncScope();
    expect(useDataExchangeJobsStore.getState().jobs).toHaveLength(0);
    expect(window.sessionStorage.getItem(keyA)).toContain("job-a");

    // Switch back to Tenant A -> syncScope() restores Tenant A's tracked background job
    window.sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "tenant-drilldown" })
    );
    useDataExchangeJobsStore.getState().syncScope();
    expect(useDataExchangeJobsStore.getState().jobs.map((j) => j.id)).toEqual(["job-a"]);

    // Calling reset() scrubs in-memory state FIRST and purges ALL persisted job keys without re-writing (#342 #4)
    useDataExchangeJobsStore.getState().reset();
    expect(useDataExchangeJobsStore.getState().jobs).toHaveLength(0);
    expect(window.sessionStorage.getItem(keyA)).toBeNull();
    expect(
      window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:tenant-drilldown:user-1`)
    ).toBeNull();
    expect(
      window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:platform:anon`)
    ).toBeNull();
  });

  it("never writes scripe_data_exchange_jobs_store:platform:anon when unauthenticated (F12-F17)", () => {
    useAppStore.setState({ user: null, isAuthenticated: false });
    window.sessionStorage.setItem(
      `${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:platform:anon`,
      '{"state":{"jobs":[],"isCollapsed":false},"version":0}'
    );

    useDataExchangeJobsStore.getState().reset();
    useDataExchangeJobsStore.getState().setCollapsed(true);
    useDataExchangeJobsStore.getState().setCollapsed(false);

    expect(
      window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:platform:anon`)
    ).toBeNull();
    for (let i = 0; i < window.sessionStorage.length; i++) {
      expect(window.sessionStorage.key(i)).not.toContain(DATA_EXCHANGE_JOBS_STORAGE_PREFIX);
    }
  });

  it("purges legacy unscoped and all scoped keys on useAppStore.logout() and purgeDataExchangeJobsStorage()", () => {
    useDataExchangeJobsStore.getState().trackJob(makeJob("job-live"));
    window.sessionStorage.setItem(DATA_EXCHANGE_JOBS_STORAGE_PREFIX, "legacy");
    window.sessionStorage.setItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t1:u1`, "s1");
    window.sessionStorage.setItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t2:u2`, "s2");
    window.sessionStorage.setItem("unrelated_key", "keep-me");

    useAppStore.getState().logout();

    expect(useDataExchangeJobsStore.getState().jobs).toHaveLength(0);
    expect(window.sessionStorage.getItem(DATA_EXCHANGE_JOBS_STORAGE_PREFIX)).toBeNull();
    expect(window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t1:u1`)).toBeNull();
    expect(window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t2:u2`)).toBeNull();
    expect(
      window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:platform:anon`)
    ).toBeNull();
    expect(window.sessionStorage.getItem("unrelated_key")).toBe("keep-me");

    window.sessionStorage.setItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t3:u3`, "s3");
    purgeDataExchangeJobsStorage();
    expect(window.sessionStorage.getItem(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:t3:u3`)).toBeNull();
  });
});
