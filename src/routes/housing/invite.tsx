import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { Copy, Check, Gift, Users, Info } from "lucide-react";

export const Route = createFileRoute("/housing/invite")({
  head: () => ({ meta: [{ title: "Invite Friends — Nexa Housing" }] }),
  component: InvitePage,
});

const INVITES = [
  { name: "Priya N.", status: "Booked", credit: 25 },
  { name: "Diego R.", status: "Signed up", credit: 0 },
  { name: "Hana M.", status: "Booked", credit: 25 },
];

function InvitePage() {
  const referralLink = "nexa.co/r/YOU2026";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${referralLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const totalCredit = INVITES.reduce((sum, i) => sum + i.credit, 0);

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[800px] mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Referrals</Kicker>
          <KineticHeading text="Give $25, get $25" className="text-4xl md:text-6xl mt-4" />
          <p className="text-lg text-muted-foreground max-w-xl mt-4">
            Invite friends to Nexa. When they book their first stay, you both get travel credit.
          </p>
        </Reveal>

        {/* Share card */}
        <div className="mt-10 surface-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-5 h-5 text-primary" />
            <span className="font-semibold">Your referral link</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 border border-hairline rounded-lg px-4 py-3 font-mono text-[14px] truncate">{referralLink}</div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="surface-card p-5 rounded-2xl">
            <Users className="w-5 h-5 text-muted-foreground mb-3" />
            <div className="text-2xl font-bold font-display">{INVITES.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Friends invited</div>
          </div>
          <div className="surface-card p-5 rounded-2xl">
            <Gift className="w-5 h-5 text-muted-foreground mb-3" />
            <div className="text-2xl font-bold font-display">${totalCredit}</div>
            <div className="text-xs text-muted-foreground mt-1">Credit earned</div>
          </div>
        </div>

        {/* Invite list */}
        <div className="mt-8">
          <h2 className="font-bold mb-4">Your invites</h2>
          <div className="surface-card rounded-2xl overflow-hidden divide-y divide-hairline">
            {INVITES.map((i) => (
              <div key={i.name} className="flex items-center justify-between p-4">
                <span className="font-medium text-[14px]">{i.name}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${i.status === "Booked" ? "bg-green-100 text-green-700" : "bg-surface-2 text-muted-foreground"}`}>
                    {i.status}
                  </span>
                  <span className="font-semibold text-[14px] w-12 text-right">{i.credit > 0 ? `+$${i.credit}` : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8 flex items-start gap-1.5 max-w-xl">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Referral reward amounts and eligibility rules shown here are placeholders — confirm the live program terms before launch.
        </p>

        <Link to="/housing" className="inline-block mt-8 text-sm font-semibold underline">Back to housing</Link>
      </div>
    </div>
  );
}
