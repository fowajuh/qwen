import { useState } from "react";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="w-4 h-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.91v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.91a9 9 0 0 0 0 8.08l3.04-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .91 4.96l3.04 2.33C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 384 512" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

/**
 * "Continue with Google / Apple" — sits alongside the existing email/password
 * form on the login route. Uses Clerk's headless `useSignIn` so it can live
 * inside the app's own boarding-pass styled card instead of Clerk's default UI.
 *
 * Requires:
 *  - VITE_CLERK_PUBLISHABLE_KEY set (falls back to a setup notice otherwise)
 *  - Google and Apple enabled as SSO connections in the Clerk dashboard
 *  - A /sso-callback and /auth/bridge route (already added) to complete the
 *    redirect and exchange the Clerk session for this app's own JWT pair.
 */
export function SocialAuthButtons() {
  if (!CLERK_ENABLED) {
    return (
      <div className="text-center border border-dashed border-ink-30/40 rounded-sm py-3 px-3">
        <p className="text-xs text-ink-60">
          Add <code className="bg-ink-90/5 px-1.5 py-0.5 rounded text-[11px]">VITE_CLERK_PUBLISHABLE_KEY</code>{" "}
          to enable Google &amp; Apple sign-in.
        </p>
      </div>
    );
  }
  return <ClerkSocialButtons />;
}

function ClerkSocialButtons() {
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<"google" | "apple" | null>(null);

  async function continueWith(strategy: "oauth_google" | "oauth_apple", provider: "google" | "apple") {
    if (isSignedIn) {
      navigate({ to: "/auth/bridge" });
      return;
    }
    if (!isLoaded || !signIn || pending) return;
    setPending(provider);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/auth/bridge",
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : `Couldn't start ${provider} sign-in.`);
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={!isLoaded || pending !== null}
        onClick={() => continueWith("oauth_google", "google")}
        className="flex items-center justify-center gap-2 rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 hover:border-ink-30 transition-colors disabled:opacity-60"
      >
        <GoogleGlyph />
        {pending === "google" ? "Redirecting…" : "Google"}
      </button>
      <button
        type="button"
        disabled={!isLoaded || pending !== null}
        onClick={() => continueWith("oauth_apple", "apple")}
        className="flex items-center justify-center gap-2 rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 hover:border-ink-30 transition-colors disabled:opacity-60"
      >
        <AppleGlyph />
        {pending === "apple" ? "Redirecting…" : "Apple"}
      </button>
    </div>
  );
}
