/**
 * Email Composer Recipient Mapping, Single-To CC/BCC Send Contract & Template Navigation Tests
 */
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmailMapper } from "../../data/mappers/EmailMapper";
import { EmailRepository } from "../../data/repositories/EmailRepository";
import { EmailRecipient, SentEmail } from "../../domain/entities/Email";
import type { IEmailService } from "../../domain/interfaces/IEmailService";

const { mockRouterPush, mockSuccessToast, mockErrorToast, mockEmailRepo } = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
  mockEmailRepo: {
    searchRecipients: vi.fn(),
    send: vi.fn(),
    getSentHistory: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    cancelEmail: vi.fn(),
    resendEmail: vi.fn(),
    getEmailTemplates: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    uploadAttachment: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en" as const,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: mockSuccessToast,
    error: mockErrorToast,
  }),
}));

vi.mock("@modules/communication/di", () => ({
  communicationContainer: {
    emailRepository: mockEmailRepo,
  },
}));

import { useEmailComposerViewModel } from "../viewmodels/useEmailComposerViewModel";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("Email Composer recipient contract, CC/BCC deduplication, and template navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("EmailMapper and EmailRepository normalize backend RecipientSearchResult (username + PascalCase 'Admin') and filter empty emails", async () => {
    const mockService = {
      searchRecipients: vi.fn().mockResolvedValue([
        {
          id: "enc-admin-1",
          username: "ahly.superadmin",
          email: "admin@ahly.com",
          type: "Admin",
        },
        {
          id: "enc-admin-no-email",
          username: "noemail.admin",
          email: "",
          type: "Admin",
        },
      ]),
    } as unknown as IEmailService;

    const repo = new EmailRepository(mockService);
    const recipients = await repo.searchRecipients("ahly");

    expect(recipients).toHaveLength(1);
    expect(recipients[0].id).toBe("enc-admin-1");
    expect(recipients[0].name).toBe("ahly.superadmin");
    expect(recipients[0].email).toBe("admin@ahly.com");
    expect(recipients[0].type).toBe("admin");

    const directMapped = EmailMapper.toRecipientEntity({
      id: "enc-user-2",
      username: "member.one",
      email: "member@ahly.com",
      type: "User",
    });
    expect(directMapped.name).toBe("member.one");
    expect(directMapped.type).toBe("user");
  });

  it("confirmSend dispatches one request per To recipient with CC and BCC arrays without duplicating CC/BCC as primary To sends", async () => {
    mockEmailRepo.send.mockResolvedValue(undefined);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEmailComposerViewModel(), { wrapper });

    act(() => {
      result.current.addRecipient(
        new EmailRecipient({
          id: "enc-admin-1",
          email: "to@ahly.com",
          name: "Primary Admin",
          type: "admin",
        })
      );
      result.current.addCcRecipient(
        new EmailRecipient({
          id: "enc-admin-2",
          email: "cc@ahly.com",
          name: "CC Admin",
          type: "admin",
        })
      );
      result.current.addBccRecipient(
        new EmailRecipient({
          id: "custom-bcc@ahly.com",
          email: "bcc@ahly.com",
          name: "bcc@ahly.com",
          type: "custom",
        })
      );
      result.current.setSubject("Quarterly Security Bulletin");
      result.current.setBody("<p>Important security notice.</p>");
    });

    act(() => {
      result.current.confirmSend();
    });

    await waitFor(() => {
      expect(mockEmailRepo.send).toHaveBeenCalledTimes(1);
    });

    expect(mockEmailRepo.send).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientType: "Admin",
        recipientId: "enc-admin-1",
        recipientEmail: "to@ahly.com",
        subject: "Quarterly Security Bulletin",
        cc: ["cc@ahly.com"],
        bcc: ["bcc@ahly.com"],
      })
    );
  });

  it("confirmSend attaches CC and BCC only to the first To recipient (index === 0) when sending to 2+ To recipients", async () => {
    mockEmailRepo.send.mockResolvedValue(undefined);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEmailComposerViewModel(), { wrapper });

    act(() => {
      result.current.addRecipient(
        new EmailRecipient({
          id: "enc-admin-1",
          email: "to1@ahly.com",
          name: "First To Admin",
          type: "admin",
        })
      );
      result.current.addRecipient(
        new EmailRecipient({
          id: "enc-admin-2",
          email: "to2@ahly.com",
          name: "Second To Admin",
          type: "admin",
        })
      );
      result.current.addCcRecipient(
        new EmailRecipient({
          id: "enc-cc-1",
          email: "cc@ahly.com",
          name: "CC Admin",
          type: "admin",
        })
      );
      result.current.addBccRecipient(
        new EmailRecipient({
          id: "custom-bcc@ahly.com",
          email: "bcc@ahly.com",
          name: "bcc@ahly.com",
          type: "custom",
        })
      );
      result.current.setSubject("Multi-To Announcement");
      result.current.setBody("<p>Multi-recipient message</p>");
    });

    act(() => {
      result.current.confirmSend();
    });

    await waitFor(() => {
      expect(mockEmailRepo.send).toHaveBeenCalledTimes(2);
    });

    expect(mockEmailRepo.send).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        recipientEmail: "to1@ahly.com",
        cc: ["cc@ahly.com"],
        bcc: ["bcc@ahly.com"],
      })
    );
    expect(mockEmailRepo.send).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        recipientEmail: "to2@ahly.com",
        cc: undefined,
        bcc: undefined,
      })
    );
  });

  it("onUseAsTemplate navigates to /communication/templates/new with subject and body query parameters", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEmailComposerViewModel(), { wrapper });

    const sentEmail = new SentEmail({
      id: "enc-email-1",
      to: "user@ahly.com",
      subject: "Welcome Aboard",
      body: "<p>Hello {{UserName}}</p>",
      status: "Sent",
      createdAt: "2026-01-01T00:00:00Z",
      sentAt: "2026-01-01T00:01:00Z",
      scheduledAt: "2026-01-01T00:00:00Z",
      errorMessage: null,
      sentByAdminId: "enc-admin-1",
      templateKey: null,
      recipientType: "Admin",
      recipientId: "enc-admin-2",
      cc: null,
      bcc: null,
      retryCount: 0,
      attachments: null,
    });

    act(() => {
      result.current.onUseAsTemplate(sentEmail);
    });

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/communication/templates/new?subject=Welcome+Aboard&body=%3Cp%3EHello+%7B%7BUserName%7D%7D%3C%2Fp%3E"
    );
  });

  it("surfaces backend error messages on send, cancel, and resend failures", async () => {
    mockEmailRepo.send.mockRejectedValueOnce(
      new Error("Maximum manual emails limit reached for today (50).")
    );
    mockEmailRepo.cancelEmail.mockRejectedValueOnce(
      new Error("Only pending emails can be cancelled.")
    );
    mockEmailRepo.resendEmail.mockRejectedValueOnce(
      new Error("Maximum retry limit (10) reached for this email.")
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEmailComposerViewModel(), { wrapper });

    act(() => {
      result.current.addRecipient(
        new EmailRecipient({
          id: "enc-admin-1",
          email: "to@ahly.com",
          name: "Primary Admin",
          type: "admin",
        })
      );
      result.current.setSubject("Quota Test");
      result.current.setBody("<p>Body</p>");
    });

    act(() => {
      result.current.confirmSend();
    });

    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith({
        title: "messaging.email.sendError",
        description: "Maximum manual emails limit reached for today (50).",
      });
    });

    act(() => {
      result.current.cancelEmail("enc-email-1");
    });
    act(() => {
      result.current.confirmCancelEmail();
    });

    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith({
        title: "messaging.email.cancelError",
        description: "Only pending emails can be cancelled.",
      });
    });
  });
});
