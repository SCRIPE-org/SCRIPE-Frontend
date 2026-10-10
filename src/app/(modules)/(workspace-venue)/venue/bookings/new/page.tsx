import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
  const params = new URLSearchParams();
  params.set("newBooking", "true");

  const facilityId = first(values.facilityId);
  if (facilityId) params.set("facilityId", facilityId);

  const resourceId = first(values.resourceId);
  if (resourceId) params.set("resourceId", resourceId);

  const date = first(values.date);
  if (date) params.set("date", date);

  const startTime = first(values.startTime);
  if (startTime) params.set("startTime", startTime);

  const duration = Number(first(values.durationMinutes));
  if (Number.isInteger(duration) && duration >= 15 && duration <= 1440) {
    params.set("durationMinutes", duration.toString());
  }

  redirect(`/venue/calendar?${params.toString()}`);
}
