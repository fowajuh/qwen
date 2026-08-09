import type { ApiStop, ApiTrip } from "./api-client";
import type { Collaborator, Day, Stop, Trip } from "./mock-data";
import { auth } from "./auth";

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function toUiStop(s: ApiStop): Stop {
  return {
    id: s.id,
    name: s.name,
    city: s.city ?? "",
    country: s.country ?? "",
    time: fmtTime(s.startTime),
    duration:
      s.endTime && s.startTime
        ? `${Math.max(1, Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000))}m`
        : "—",
    cost: Number(s.cost),
    currency: s.currency,
    category: s.category,
    notes: s.notes ?? undefined,
    booked: s.booked,
  };
}

/** Groups the flat stops array the API returns into the Day[] shape the
 * manifest strip renders (§3.3) — dayIndex 0 -> trip.startDate, 1 -> +1 day, etc. */
export function toUiTrip(trip: ApiTrip): Trip {
  const stops = trip.stops ?? [];
  const byDay = new Map<number, ApiStop[]>();
  for (const s of stops) {
    if (!byDay.has(s.dayIndex)) byDay.set(s.dayIndex, []);
    byDay.get(s.dayIndex)!.push(s);
  }
  const start = new Date(trip.startDate);
  const days: Day[] = Array.from(byDay.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayIndex, dayStops]) => {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + dayIndex);
      const sorted = [...dayStops].sort((a, b) => a.orderIndex - b.orderIndex);
      return {
        index: dayIndex,
        date: date.toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
        city: sorted[0]?.city || trip.destinationCode || trip.name,
        stops: sorted.map(toUiStop),
      };
    });

  const spent = stops.reduce((sum, s) => sum + Number(s.cost), 0);

  const me = auth.currentUser();
  const isMeOwner = trip.ownerId === me?.id;
  const collaborators: Collaborator[] = [
    {
      userId: trip.ownerId,
      name: isMeOwner ? (me?.email.split("@")[0] ?? "You") : "Trip owner",
      avatarUrl: null,
      role: "owner",
    },
    ...(trip.collaborators ?? []).map((c) => ({
      userId: c.userId,
      name: c.user.name,
      avatarUrl: c.user.avatarUrl,
      role: c.role,
    })),
  ];

  return {
    id: trip.id,
    name: trip.name,
    subtitle: trip.subtitle ?? "",
    code: `GT${trip.id.slice(0, 3).toUpperCase()} · ${trip.destinationCode ?? ""}`,
    cover:
      trip.coverPhotoUrl ??
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80",
    origin: trip.originCode ?? "???",
    destination: trip.destinationCode ?? "???",
    startDate: trip.startDate,
    endDate: trip.endDate,
    budgetPlanned: Number(trip.budgetPlanned),
    budgetSpent: spent,
    currency: stops[0]?.currency ?? "USD",
    status: trip.status === "active" ? "upcoming" : (trip.status as Trip["status"]),
    travelers: 1 + (trip.collaborators?.length ?? 0),
    collaborators,
    days,
  };
}
