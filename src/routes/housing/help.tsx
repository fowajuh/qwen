import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { ChevronDown, MessageCircle, Phone, XCircle, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/housing/help")({
  head: () => ({ meta: [{ title: "Help Center — Nexa Housing" }] }),
  component: HelpCenter,
});

const FAQS = [
  { q: "How do I cancel a reservation?", a: "Go to Trips, select the reservation, and choose Cancel booking. Refund amounts depend on the listing's cancellation policy." },
  { q: "When will I be charged?", a: "For most stays, you're charged in full at booking. Some listings support pay-in-parts, shown at checkout." },
  { q: "What if my host doesn't respond?", a: "Message them from your trip details. If you don't hear back within 24 hours, contact support and we'll step in." },
  { q: "How do refunds work?", a: "Refunds follow the listing's cancellation policy and are issued to your original payment method within 5–10 business days." },
];

function HelpCenter() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[800px] mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Support</Kicker>
          <KineticHeading text="Help center" className="text-4xl md:text-6xl mt-4 mb-10" />
        </Reveal>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Link to="/messages" className="surface-card p-5 rounded-2xl text-center hover:border-foreground/30 transition-colors">
            <MessageCircle className="w-6 h-6 mx-auto mb-3 text-primary" />
            <div className="font-semibold text-sm">Chat with support</div>
          </Link>
          <a href="tel:+18005550123" className="surface-card p-5 rounded-2xl text-center hover:border-foreground/30 transition-colors">
            <Phone className="w-6 h-6 mx-auto mb-3 text-primary" />
            <div className="font-semibold text-sm">Call us</div>
          </a>
          <Link to="/housing/trips" className="surface-card p-5 rounded-2xl text-center hover:border-foreground/30 transition-colors">
            <XCircle className="w-6 h-6 mx-auto mb-3 text-primary" />
            <div className="font-semibold text-sm">Cancel a booking</div>
          </Link>
        </div>

        {/* Emergency assistance */}
        <div className="surface-card p-5 rounded-2xl flex items-start gap-4 mb-12 border-destructive/20">
          <ShieldAlert className="w-6 h-6 text-destructive shrink-0" />
          <div>
            <div className="font-semibold mb-1">Emergency during your stay?</div>
            <p className="text-sm text-muted-foreground">
              If you're in immediate danger, contact local emergency services first. For urgent safety issues, visit the{" "}
              <Link to="/housing/safety" className="underline font-semibold text-foreground">Safety Center</Link> for 24/7 assistance options.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <h2 className="text-xl font-bold mb-4">Frequently asked questions</h2>
        <div className="divide-y divide-hairline border-y border-hairline">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="font-medium text-[15px]">{f.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && <p className="text-sm text-muted-foreground pb-4 pr-8">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
