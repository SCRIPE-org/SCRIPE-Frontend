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
  for (const [key, val] of Object.entries(values)) {
    const stringVal = first(val);
    if (stringVal && key !== "newBooking") {
      params.set(key, stringVal);
    }
  }
  redirect(`/venue/calendar?${params.toString()}`);
}
