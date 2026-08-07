import { createFileRoute, redirect } from "@tanstack/react-router";

// The standalone mock map (fake pins, no real listing data) has been retired
// in favor of the fully wired map + bottom-sheet explore screen at
// /housing/search, which uses real listings, real filters, and a real
// pin-tap → preview → detail flow. This route stays as a redirect so any
// existing links (nav, bookmarks, command palette) keep working.
export const Route = createFileRoute("/housing/map")({
  beforeLoad: () => {
    throw redirect({ to: "/housing/search" });
  },
});
