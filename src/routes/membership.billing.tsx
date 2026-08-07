import { createFileRoute, Link } from "@tanstack/react-router";
import { KineticHeading, Reveal, Kicker } from "@/components/app-shell";
import { CreditCard, Download, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/membership/billing")({
  head: () => ({
    meta: [{ title: "Billing & Payments — Nexa" }],
  }),
  component: Billing,
});

const INVOICES = [
  { id: "INV-2026-004", date: "Jul 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-003", date: "Jun 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-002", date: "May 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-001", date: "Apr 1, 2026", amount: "$49.00", status: "Paid" },
];

function Billing() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Membership</Kicker>
          <KineticHeading text="Billing." className="text-4xl md:text-6xl mt-4 mb-12" />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
             <Reveal delay={0.1}>
               <div className="surface-card p-6 md:p-8">
                 <h2 className="text-xl font-display font-semibold mb-6">Current Plan</h2>
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <h3 className="text-2xl font-bold">Growth</h3>
                       <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
                     </div>
                     <p className="text-muted-foreground">$49.00 / month</p>
                   </div>
                   <Link to="/membership/upgrade">
                     <button className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                       Change Plan
                     </button>
                   </Link>
                 </div>
                 <div className="bg-surface-2 rounded-xl p-4 flex gap-3 text-sm">
                   <ShieldCheck className="text-primary shrink-0" />
                   <p className="text-muted-foreground leading-relaxed">
                     Your next billing date is <strong className="text-foreground">August 1, 2026</strong>. You are currently on the monthly billing cycle.
                   </p>
                 </div>
               </div>
             </Reveal>

             <Reveal delay={0.2}>
               <div className="surface-card p-6 md:p-8">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-display font-semibold">Payment Method</h2>
                   <button className="text-primary text-sm font-semibold">Update</button>
                 </div>
                 <div className="flex items-center gap-4 p-4 border border-hairline rounded-xl">
                   <div className="w-12 h-8 bg-[#1a1f36] rounded flex items-center justify-center">
                     <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <circle cx="10.5" cy="10" r="6" fill="#EA001B"/>
                       <circle cx="21.5" cy="10" r="6" fill="#F79E1B" fillOpacity="0.8"/>
                     </svg>
                   </div>
                   <div>
                     <div className="font-semibold">Mastercard ending in 4242</div>
                     <div className="text-sm text-muted-foreground">Expires 12/28</div>
                   </div>
                   <div className="ml-auto">
                     <span className="bg-foreground/5 text-foreground px-2.5 py-1 rounded-md text-xs font-semibold">Default</span>
                   </div>
                 </div>
               </div>
             </Reveal>

             <Reveal delay={0.3}>
               <div className="surface-card p-6 md:p-8">
                 <h2 className="text-xl font-display font-semibold mb-6">Billing History</h2>
                 <div className="divide-y divide-hairline">
                   {INVOICES.map((inv) => (
                     <div key={inv.id} className="py-4 flex justify-between items-center group">
                       <div>
                         <div className="font-semibold mb-1">{inv.amount} <span className="text-muted-foreground font-normal ml-2">{inv.id}</span></div>
                         <div className="text-sm text-muted-foreground flex items-center gap-2">
                           <CheckCircle2 size={14} className="text-green-500" /> {inv.status} on {inv.date}
                         </div>
                       </div>
                       <button className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center text-muted-foreground hover:bg-surface hover:text-foreground transition-colors">
                         <Download size={16} />
                       </button>
                     </div>
                   ))}
                 </div>
                 <button className="w-full mt-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors">
                   View All Invoices
                 </button>
               </div>
             </Reveal>
          </div>

          <div className="md:col-span-1">
             <Reveal delay={0.4} className="sticky top-24">
               <div className="surface-card p-6 bg-primary/5 border-primary/20">
                  <h3 className="font-semibold mb-2">Need help?</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Have questions about your billing, tax invoices, or want to switch to annual billing for a 20% discount?
                  </p>
                  <button className="w-full bg-background border border-hairline py-3 rounded-xl font-semibold text-sm hover:border-foreground/30 transition-colors flex justify-center items-center gap-2">
                    Contact Support <ExternalLink size={16} />
                  </button>
               </div>
             </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
