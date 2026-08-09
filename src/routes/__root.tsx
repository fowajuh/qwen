import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useUI } from "../lib/store";
import { RouteProgress } from "@/components/manifest/RouteProgress";

// Only enabled when a key is configured, so the app runs fine (email/password
// only, no Google/Apple buttons) without Clerk set up — same pattern as the
// "configure Google Maps" fallback on the /map route.
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-departure-navy px-5 text-cloud-white">
      <div className="w-full max-w-md">
        <div
          className="ticket-stub rounded-sm"
          style={{ ["--stub-bg" as string]: "var(--cloud-white)" }}
        >
          <p className="num text-[10px] uppercase tracking-[0.24em] text-ink-60">
            Boarding pass · GT404
          </p>
          <h1 className="font-display text-5xl text-departure-navy leading-[0.95] mt-2">
            Route not found
          </h1>
          <p className="text-sm text-ink-60 mt-2">
            This leg isn't on the manifest. The gate may have changed or the trip was archived.
          </p>
          <div className="perforation-divider my-5" />
          <div className="flex items-center justify-between">
            <span className="customs-stamp text-runway-red">Denied</span>
            <Link
              to="/"
              className="num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-2.5 rounded-sm"
            >
              Back to trips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#16223F" },
      { title: "GlobeTrotter · Flight Manifest" },
      {
        name: "description",
        content:
          "Plan multi-city trips like a boarding pass. Manifest itineraries, live budgets, and AI-picked stops.",
      },
      { property: "og:title", content: "GlobeTrotter" },
      { property: "og:description", content: "The trip planner that reads like a boarding pass." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function OnboardingGate({ children }: { children: ReactNode }) {
  const onboarded = useUI((s) => s.onboarded);
  const router = useRouter();
  const hasNavigated = useRef(false);

  const pathname = router.state.location.pathname;
  const isBypassRoute = ["/onboarding", "/login", "/sso-callback", "/auth/bridge"].includes(pathname);

  useEffect(() => {
    if (!onboarded && !hasNavigated.current && !isBypassRoute) {
      hasNavigated.current = true;
      router.navigate({ to: "/onboarding", replace: true });
    }
    if (isBypassRoute) {
      hasNavigated.current = false;
    }
  }, [onboarded, isBypassRoute, router]);

  if (!onboarded && !isBypassRoute) return null;

  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const app = (
    <QueryClientProvider client={queryClient}>
      <RouteProgress />
      <OnboardingGate>
        <Outlet />
      </OnboardingGate>
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast:
              "!bg-departure-navy !text-cloud-white !border !border-cloud-white/10 !rounded-sm !font-sans !shadow-[0_20px_50px_-15px_rgba(14,22,38,0.5)]",
            title: "!text-sm",
            description: "!text-cloud-white/70",
            actionButton: "!bg-beacon-amber !text-departure-navy",
          },
        }}
      />
    </QueryClientProvider>
  );

  if (!CLERK_PUBLISHABLE_KEY) return app;

  return <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>{app}</ClerkProvider>;
}