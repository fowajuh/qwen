import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { loginWithClerk } from "@/lib/auth";
import { useUI } from "@/lib/store";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/auth/bridge")({
  head: () => ({
    meta: [{ title: "Signing in… · GlobeTrotter" }],
  }),
  component: AuthBridge,
});

/**
 * Landing spot after Clerk finishes a Google/Apple sign-in. Takes the fresh
 * Clerk session token and exchanges it for GlobeTrotter's own access/refresh
 * tokens (via loginWithClerk -> POST /auth/oauth/clerk), so everything
 * downstream — useRequireAuth, the api client, refresh-on-401 — keeps working
 * exactly as it does for email/password logins.
 */
function AuthBridge() {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate({ to: "/login" });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Missing Clerk session token.");
        await loginWithClerk(token);

        // Sync subscription plan from onboarding if necessary
        const savedPlan = useUI.getState().plan;
        if (savedPlan && savedPlan !== "explorer") {
          try {
            await api.updateSubscription(savedPlan, "monthly");
          } catch (e) {
            console.error("Failed to sync plan during onboarding bridge", e);
          }
        }

        if (!cancelled) navigate({ to: "/" });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't finish sign-in. Please try again.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-departure-navy flex items-center justify-center px-5">
      <div className="text-center max-w-xs">
        <Plane className="w-6 h-6 text-beacon-amber mx-auto mb-3 animate-pulse" />
        {error ? (
          <>
            <p className="text-cloud-white text-sm">{error}</p>
            <button
              onClick={() => {
                signOut();
                navigate({ to: "/login" });
              }}
              className="mt-4 num text-[11px] uppercase tracking-[0.2em] text-cloud-white/70 underline"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <p className="text-cloud-white/70 text-sm num uppercase tracking-[0.2em]">
            Finishing sign-in…
          </p>
        )}
      </div>
    </div>
  );
}
