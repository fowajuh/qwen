import { createFileRoute } from "@tanstack/react-router";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Plane } from "lucide-react";

export const Route = createFileRoute("/sso-callback")({
  head: () => ({
    meta: [{ title: "Signing in… · GlobeTrotter" }],
  }),
  component: SsoCallback,
});

/**
 * Clerk redirects here after the Google/Apple OAuth hop. This just finishes
 * the Clerk session — the actual "log in to GlobeTrotter" step (exchanging
 * the Clerk token for this app's own JWT pair) happens on /auth/bridge,
 * which Clerk redirects to next.
 */
function SsoCallback() {
  return (
    <div className="min-h-screen bg-departure-navy flex items-center justify-center px-5">
      <div className="text-center">
        <Plane className="w-6 h-6 text-beacon-amber mx-auto mb-3 animate-pulse" />
        <p className="text-cloud-white/70 text-sm num uppercase tracking-[0.2em]">
          Completing sign-in…
        </p>
      </div>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/auth/bridge"
        signUpFallbackRedirectUrl="/auth/bridge"
      />
    </div>
  );
}
