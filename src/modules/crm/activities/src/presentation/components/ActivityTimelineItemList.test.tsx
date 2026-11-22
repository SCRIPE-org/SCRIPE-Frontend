import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActivityTimelineItemList } from "./ActivityTimelineItemList";
import type { CrmActivity } from "../../domain/entities/CrmActivityEntity";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        "crmActivities.kinds.note": "Note",
        "crmActivities.kinds.call": "Phone Call",
        "crmActivities.kinds.meeting": "Meeting Log",
        "crmActivities.kinds.followup": "Follow-up Task",
        "crmActivities.kinds.communication": "Outbound Communication",
        "crmActivities.kinds.fulfillment": "Commercial Order Provisioning",
        "crmActivities.timeline.deliveryPrefix": "Delivery",
        "crmActivities.timeline.deliveryStatuses.sent": "Sent",
        "crmActivities.timeline.taskPrefix": "Task",
        "crmActivities.timeline.taskStatuses.active": "Active",
        "crmActivities.timeline.taskStatuses.completed": "Completed",
        "crmActivities.timeline.addFollowUp": "Schedule Follow-up",
        "crmActivities.timeline.markDone": "Mark Done",
        "crmActivities.timeline.piiMasked": "Confidential interaction details are restricted.",
      };
      return dictionary[key] ?? key;
    },
    language: "en",
  }),
}));

describe("ActivityTimelineItemList Component", () => {
  const sampleActivities: CrmActivity[] = [
    {
      activityId: "act-1",
      leadId: "lead-1",
      activityKind: "Note",
      summary: "Executive discussion on stadium naming rights",
      bodyText: "Discussed multi-year commercial terms and activation schedule.",
      actorDisplaySnapshot: "Ahmed El-Shenawy",
      occurredAtUtc: "2026-11-04T10:00:00Z",
      maskedFieldKeys: [],
    },
    {
      activityId: "act-2",
      opportunityId: "opp-1",
      activityKind: "CommunicationSent",
      summary: "Email: Sent pricing schedule to procurement",
      bodyText: "Formal quote attached with payment milestones.",
      communicationRefId: "comm-1",
      communicationDeliveryStatus: "Sent",
      actorDisplaySnapshot: "Sarah Jenkins",
      occurredAtUtc: "2026-11-04T11:30:00Z",
      maskedFieldKeys: [],
    },
    {
      activityId: "act-3",
      accountId: "acc-1",
      activityKind: "FollowUpLinked",
      summary: "Follow-up task scheduled with legal counsel",
      workItemRefId: "work-1",
      workItemStatus: "Active",
      actorDisplaySnapshot: "Tariq Mansour",
      occurredAtUtc: "2026-11-04T14:15:00Z",
      maskedFieldKeys: [],
    },
    {
      activityId: "act-4",
      accountId: "acc-1",
      activityKind: "Note",
      summary: "Restricted board minutes",
      bodyText: "Masked private details",
      actorDisplaySnapshot: "Compliance Officer",
      occurredAtUtc: "2026-11-04T16:00:00Z",
      maskedFieldKeys: ["bodyText"],
    },
  ];

  it("renders chronological activity cards with localized kinds and actor snapshots", () => {
    const handleFollowUp = vi.fn();
    render(
      <ActivityTimelineItemList
        items={sampleActivities}
        canFollowUp={true}
        onSelectForFollowUp={handleFollowUp}
      />
    );

    expect(screen.getByText("Executive discussion on stadium naming rights")).toBeInTheDocument();
    expect(screen.getByText("Ahmed El-Shenawy")).toBeInTheDocument();
    expect(screen.getAllByText("Note").length).toBe(2);
    expect(screen.getByText("Outbound Communication")).toBeInTheDocument();
  });

  it("renders communication delivery receipt badge and work item status badge cleanly", () => {
    render(
      <ActivityTimelineItemList
        items={sampleActivities}
        canFollowUp={false}
        onSelectForFollowUp={vi.fn()}
      />
    );

    expect(screen.getByTestId("communication-delivery-badge")).toHaveTextContent("Delivery: Sent");
    expect(screen.getByText("Task: Active")).toBeInTheDocument();
  });

  it("renders masked notice when activity contains confidential PII", () => {
    render(
      <ActivityTimelineItemList
        items={sampleActivities}
        canFollowUp={true}
        onSelectForFollowUp={vi.fn()}
      />
    );

    expect(screen.getByText("Confidential interaction details are restricted.")).toBeInTheDocument();
    expect(screen.queryByText("Masked private details")).not.toBeInTheDocument();
  });

  it("invokes onSelectForFollowUp callback when clicking follow-up button or Mark Done button", () => {
    const handleFollowUp = vi.fn();
    render(
      <ActivityTimelineItemList
        items={sampleActivities}
        canFollowUp={true}
        onSelectForFollowUp={handleFollowUp}
      />
    );

    const followUpButtons = screen.getAllByRole("button", { name: /Schedule Follow-up/i });
    expect(followUpButtons.length).toBeGreaterThan(0);
    fireEvent.click(followUpButtons[0]);
    expect(handleFollowUp).toHaveBeenCalledWith(sampleActivities[0]);

    const markDoneBtn = screen.getByTestId("mark-activity-done-btn");
    fireEvent.click(markDoneBtn);
    expect(handleFollowUp).toHaveBeenCalledWith(sampleActivities[2]);
    expect(screen.getByText("Task: Completed")).toBeInTheDocument();
  });
});
