import { createFileRoute, Link } from "@tanstack/react-router";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { ShieldCheck, BadgeCheck, Flag, LifeBuoy, FileWarning, Info, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/housing/safety")({
  head: () => ({ meta: [{ title: "Trust & Safety — Nexa Housing" }] }),
  component: SafetyCenter,
});

const SECTIONS = [
  {
    icon: BadgeCheck,
    title: "Identity verification",
    desc: "How we verify hosts and guests before a booking is confirmed.",
  },
  {
    icon: Flag,
    title: "Report a listing or user",
    desc: "Flag content that violates our community standards.",
  },
  {
    icon: FileWarning,
    title: "Dispute resolution",
    desc: "Guest reports issue → host responds → mediation → resolution, with documentation upload.",
  },
  {
    icon: ShieldCheck,
    title: "Guest protection & insurance",
    desc: "Coverage details for cancellations, damages, and emergencies.",
  },
];

function SafetyCenter() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Trust</Kicker>
          <KineticHeading text="Safety center" className="text-4xl md:text-6xl mt-4" />
          <p className="text-lg text-muted-foreground max-w-2xl mt-4">
            Every stay on Nexa is backed by verification, transparent policies, and a team ready to help if something goes wrong.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTIONS.map((s) => (
            <button key={s.title} className="surface-card p-5 rounded-2xl flex items-start gap-4 text-left hover:border-foreground/30 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px] mb-1">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            </button>
          ))}
        </div>

        <div className="mt-10 surface-card p-6 rounded-2xl flex items-start gap-4">
          <LifeBuoy className="w-6 h-6 text-primary shrink-0" />
          <div>
            <div className="font-semibold mb-1">Need help right now?</div>
            <p className="text-sm text-muted-foreground mb-3">Our support team is available around the clock for urgent safety concerns during an active stay.</p>
            <Link to="/housing/help" className="font-semibold text-sm underline">Go to Help Center</Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8 flex items-start gap-1.5 max-w-2xl">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Insurance terms, dispute mediation workflows, and identity-verification policy language require legal review before this center goes live.
        </p>
      </div>
    </div>
  );
}
