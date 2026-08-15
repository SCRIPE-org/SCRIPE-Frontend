/**
 * AnalyticsEvent Entity
 *
 * Domain entity representing an analytics event.
 */

export interface AnalyticsEventData {
  id: string;
  eventName: string;
  sourceModule: string;
  occurredAt: string;
  subjectEntityTypeKey?: string | null;
  subjectEntityId?: string | null;
  value?: number | null;
  tenantId?: string | null;
}

export class AnalyticsEvent {
  constructor(public readonly data: AnalyticsEventData) {}

  get id(): string {
    return this.data.id;
  }

  get eventName(): string {
    return this.data.eventName;
  }

  get sourceModule(): string {
    return this.data.sourceModule;
  }

  get occurredAt(): string {
    return this.data.occurredAt;
  }

  get subjectEntityTypeKey(): string | null | undefined {
    return this.data.subjectEntityTypeKey;
  }

  get subjectEntityId(): string | null | undefined {
    return this.data.subjectEntityId;
  }

  get value(): number | null | undefined {
    return this.data.value;
  }

  get tenantId(): string | null | undefined {
    return this.data.tenantId;
  }

  copyWith(updates: Partial<AnalyticsEventData>): AnalyticsEvent {
    return new AnalyticsEvent({ ...this.data, ...updates });
  }
}
