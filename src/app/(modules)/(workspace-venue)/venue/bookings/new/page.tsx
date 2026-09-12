import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { BookingWorkspaceView } from "@modules/venue/booking/src/presentation/views/BookingWorkspaceView";

export const metadata: Metadata = {
  title: "New Venue Booking",
  description: "Create, hold, and confirm an operator-assisted venue booking.",
};

type BookingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewBookingPage({ searchParams }: BookingPageProps) {
  const values = await searchParams;
  const duration = Number(first(values.durationMinutes));
  const prefill = {
    facilityId: first(values.facilityId),
    resourceId: first(values.resourceId),
    date: first(values.date),
    startTime: first(values.startTime),
    durationMinutes: Number.isInteger(duration) && duration >= 15 && duration <= 1440 ? duration : undefined,
  };
  return (
    <ModuleErrorBoundary moduleName="booking.title">
      <BookingWorkspaceView prefill={prefill} />
    </ModuleErrorBoundary>
  );
}
