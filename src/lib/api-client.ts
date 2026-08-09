// Thin fetch wrapper around /api/v1/* — every call goes through
// TanStack Query so caching/retries/optimistic updates are free.
// Swaps zero code when the backend moves from monolith to gateway (§7).
import { auth, refreshSession } from "./auth";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api/v1";
export const WS_BASE = import.meta.env.VITE_WS_BASE ?? "ws://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
  retry?: boolean;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = auth.getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401 && opts.retry !== false && token) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, { ...opts, retry: false });
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Types mirroring the Prisma models the backend actually returns ----
export type ApiStop = {
  id: string;
  tripId: string;
  dayIndex: number;
  orderIndex: number;
  name: string;
  category: "flight" | "stay" | "eat" | "see" | "move";
  city: string | null;
  country: string | null;
  booked: boolean;
  lat: number | null;
  lng: number | null;
  startTime: string | null;
  endTime: string | null;
  cost: string | number;
  currency: string;
  notes: string | null;
};

export type ApiCollaborator = {
  tripId: string;
  userId: string;
  role: "owner" | "editor" | "viewer";
  user: { id: string; name: string; avatarUrl: string | null };
};

export type ApiTrip = {
  id: string;
  ownerId: string;
  name: string;
  subtitle: string | null;
  coverPhotoUrl: string | null;
  originCode: string | null;
  destinationCode: string | null;
  startDate: string;
  endDate: string;
  budgetPlanned: string | number;
  status: "draft" | "upcoming" | "active" | "past";
  stops?: ApiStop[];
  collaborators?: ApiCollaborator[];
};

export type ApiComment = {
  id: string;
  stopId: string;
  userId: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

export type ApiRecommendation = {
  title: string;
  category: string;
  blurb: string;
  estCost: number;
  currency: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  rating?: number;
  reviewCount?: number;
};

export type BudgetSummary = {
  tripId: string;
  currency: string;
  planned: number;
  spent: number;
  remaining: number;
  overBudget: boolean;
  byDay: { dayIndex: number; total: number }[];
  byCategory: { category: string; total: number }[];
};

export type ApiSubscription = {
  id?: string;
  plan: 'explorer' | 'voyager' | 'crew';
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  canceledAt?: string | null;
};

export const api = {
  // Trips
  listTrips: (cursor?: string) =>
    request<{ items: ApiTrip[]; nextCursor: string | null }>(
      `/trips${cursor ? `?cursor=${cursor}` : ""}`,
    ),
  getTrip: (id: string) => request<ApiTrip>(`/trips/${id}`),
  createTrip: (input: Partial<ApiTrip> & { name: string; startDate: string; endDate: string }) =>
    request<ApiTrip>(`/trips`, { method: "POST", body: input, idempotencyKey: crypto.randomUUID() }),
  updateTrip: (id: string, input: Partial<ApiTrip>) =>
    request<ApiTrip>(`/trips/${id}`, { method: "PATCH", body: input }),
  deleteTrip: (id: string) => request<{ ok: true }>(`/trips/${id}`, { method: "DELETE" }),
  duplicateTrip: (id: string) =>
    request<ApiTrip>(`/trips/${id}/duplicate`, { method: "POST", idempotencyKey: crypto.randomUUID() }),
  addCollaborator: (id: string, input: { email: string; role: "editor" | "viewer" }) =>
    request(`/trips/${id}/collaborators`, { method: "POST", body: input }),

  // Stops
  createStop: (tripId: string, input: Partial<ApiStop> & { dayIndex: number; orderIndex: number; name: string }) =>
    request<ApiStop>(`/trips/${tripId}/stops`, { method: "POST", body: input, idempotencyKey: crypto.randomUUID() }),
  patchStop: (id: string, input: Partial<ApiStop>) =>
    request<ApiStop>(`/stops/${id}`, { method: "PATCH", body: input }),
  deleteStop: (id: string) => request<{ ok: true }>(`/stops/${id}`, { method: "DELETE" }),
  reorderStops: (id: string, order: { id: string; orderIndex: number }[]) =>
    request<{ ok: true }>(`/stops/${id}/reorder`, { method: "PATCH", body: { order } }),

  // Comments
  listComments: (stopId: string) => request<ApiComment[]>(`/stops/${stopId}/comments`),
  addComment: (stopId: string, body: string) =>
    request<ApiComment>(`/stops/${stopId}/comments`, { method: "POST", body: { body } }),

  // Recommendations
  getRecommendations: (tripId: string, interests: string[], budgetStyle: string) =>
    request<ApiRecommendation[]>(
      `/trips/${tripId}/recommendations?interests=${encodeURIComponent(interests.join(","))}&budgetStyle=${budgetStyle}`,
    ),
  dismissRecommendation: (id: string) =>
    request<{ ok: true; dismissed: string }>(`/recommendations/${id}/dismiss`, { method: "POST" }),

  // Budget
  getBudgetSummary: (tripId: string) => request<BudgetSummary>(`/trips/${tripId}/budget-summary`),

  // Subscription
  getSubscription: () => request<ApiSubscription>(`/users/me/subscription`),
  updateSubscription: (plan: 'explorer' | 'voyager' | 'crew', billingCycle: 'monthly' | 'annual') =>
    request<ApiSubscription>(`/users/me/subscription`, { method: "PATCH", body: { plan, billingCycle } }),
  cancelSubscription: () =>
    request<{ ok: true }>(`/users/me/subscription`, { method: "DELETE" }),
};
