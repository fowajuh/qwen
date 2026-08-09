import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiStop, type ApiTrip, type ApiSubscription } from "./api-client";
import { toUiTrip } from "./adapters";
import type { Trip } from "./mock-data";

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async (): Promise<Trip[]> => {
      const { items } = await api.listTrips();
      return items.map(toUiTrip);
    },
    staleTime: 30_000,
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: async (): Promise<Trip> => {
      const trip = await api.getTrip(id);
      return toUiTrip(trip);
    },
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ApiTrip> & { name: string; startDate: string; endDate: string }) =>
      api.createTrip(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ApiTrip> }) =>
      api.updateTrip(id, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["trip", vars.id] });
    },
  });
}

export function useDuplicateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.duplicateTrip(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTrip(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useCreateStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Partial<ApiStop> & { dayIndex: number; orderIndex: number; name: string },
    ) => api.createStop(tripId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip", tripId] }),
  });
}

export function usePatchStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ApiStop> }) =>
      api.patchStop(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip", tripId] }),
  });
}

export function useDeleteStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteStop(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip", tripId] }),
  });
}

export function useAddCollaborator(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: "editor" | "viewer" }) =>
      api.addCollaborator(tripId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trip", tripId] });
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useReorderStops(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      stopId,
      order,
    }: {
      stopId: string;
      order: { id: string; orderIndex: number }[];
    }) => api.reorderStops(stopId, order),
    // Optimistic: the drag already updated the UI; only roll back on error.
    onError: () => qc.invalidateQueries({ queryKey: ["trip", tripId] }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["trip", tripId] }),
  });
}

export function useComments(stopId: string | null) {
  return useQuery({
    queryKey: ["comments", stopId],
    queryFn: () => api.listComments(stopId as string),
    enabled: !!stopId,
  });
}

export function useAddComment(stopId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.addComment(stopId as string, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", stopId] }),
  });
}

export function useRecommendations(tripId: string, interests: string[], budgetStyle: string) {
  return useQuery({
    queryKey: ["recommendations", tripId, interests.join(","), budgetStyle],
    queryFn: () => api.getRecommendations(tripId, interests, budgetStyle),
    enabled: !!tripId,
    staleTime: 5 * 60_000,
  });
}

export function useBudgetSummary(tripId: string) {
  return useQuery({
    queryKey: ["budget", tripId],
    queryFn: () => api.getBudgetSummary(tripId),
    enabled: !!tripId,
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.getSubscription(),
    staleTime: 60_000,
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, billingCycle }: { plan: 'explorer' | 'voyager' | 'crew'; billingCycle: 'monthly' | 'annual' }) =>
      api.updateSubscription(plan, billingCycle),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription"] }),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.cancelSubscription(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription"] }),
  });
}
