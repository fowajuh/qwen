import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal, MagneticButton } from "@/components/app-shell";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Nexa" },
      { name: "description", content: "Every transaction, protected inside Nexa. Escrow-backed payments, digital receipts, and 30-day warranties." },
    ],
  }),
  component: PaymentsPage,
});

const HISTORY = [
  { id: "NX-8821", business: "Kori Hair Studio", service: "Signature cut & finish", amount: "$85", date: "Today 2:30pm", status: "confirmed" },
  { id: "NX-8819", business: "Ostro Coffee Bar", service: "Pour-over flight", amount: "$18", date: "Yesterday 9:15am", status: "completed" },
  { id: "NX-8814", business: "Mira Yoga", service: "Single class", amount: "$22", date: "Mon 6:30am", status: "completed" },
  { id: "NX-8801", business: "Atelier Fleur", service: "Daily bouquet", amount: "$45", date: "Sat 3pm", status: "completed" },
  { id: "NX-8798", business: "Swift Lock & Key", service: "Emergency lockout", amount: "$95", date: "Fri 11pm", status: "refunded" },
];

const STATUS_STEPS = ["Booked", "Confirmed", "In Progress", "Complete"];

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-primary/15 text-primary",
  completed: "bg-green-500/15 text-green-400",
  refunded: "bg-amber-500/15 text-amber-400",
  pending: "bg-foreground/10 text-muted-foreground",
};

function PaymentsPage() {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [activeStep] = useState(1); // Confirmed
  const [selectedRefundReason, setSelectedRefundReason] = useState("");

  return (
    <div className="pt-28 pb-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        {/* Header */}
        <Kicker>Payment OS</Kicker>
        <div className="mt-5">
          <KineticHeading text="Every transaction," className="text-5xl md:text-8xl" />
          <div className="text-5xl md:text-8xl font-display text-muted-foreground overflow-hidden">
            <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.35, duration: 1, ease: [0.19, 1, 0.22, 1] }} className="inline-block">
              inside Nexa.
            </motion.span>
          </div>
        </div>
        <Reveal delay={0.6}>
          <p className="mt-8 text-muted-foreground max-w-lg text-lg">
            Escrow-protected payments. Digital receipts. 30-day workmanship warranties. All in one place.
          </p>
        </Reveal>

        {/* Main grid */}
        <div className="mt-20 grid lg:grid-cols-12 gap-8">
          {/* Left: Active booking */}
          <div className="lg:col-span-5 space-y-6">
            {/* Apple Pass-style booking card */}
            <Reveal>
              <div className="surface-card rounded-[2rem] overflow-hidden">
                {/* Card header */}
                <div className="p-6 bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.02] border-b border-hairline">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-foreground" />
                      <span className="font-display text-sm">Nexa Booking</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">#NX-8821</span>
                  </div>
                  <div className="font-display text-4xl md:text-5xl">Kori Hair Studio</div>
                  <div className="text-muted-foreground mt-2">Signature cut & finish</div>
                </div>

                {/* Booking details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Date & Time</div>
                      <div className="font-display text-lg mt-1">Today, 2:30pm</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Duration</div>
                      <div className="font-display text-lg mt-1">60 minutes</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Provider</div>
                      <div className="font-display text-lg mt-1">Jordan K.</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Amount</div>
                      <div className="font-display text-lg mt-1 text-primary">$85</div>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="mb-6">
                    <div className="flex items-center gap-0">
                      {STATUS_STEPS.map((s, i) => {
                        const done = i < activeStep;
                        const active = i === activeStep;
                        return (
                          <div key={s} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-medium transition-colors ${
                                done || active ? "bg-primary text-white" : "bg-foreground/10 text-muted-foreground"
                              }`}>
                                {done ? "✓" : i + 1}
                              </div>
                              <div className={`text-[9px] mt-1.5 text-center w-14 ${active ? "text-primary" : done ? "text-primary/60" : "text-muted-foreground"}`}>
                                {s}
                              </div>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`flex-1 h-[2px] mx-1 mb-5 rounded-full ${done ? "bg-primary" : "bg-foreground/10"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* QR placeholder */}
                  <div className="flex flex-col items-center py-4 border border-dashed border-hairline rounded-2xl mb-4">
                    <div className="grid grid-cols-8 gap-0.5 w-20 h-20 mb-2">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-sm"
                          style={{
                            background: Math.random() > 0.4 ? "currentColor" : "transparent",
                            opacity: Math.random() > 0.4 ? 1 : 0,
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Show to business on arrival</div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setReceiptOpen(true)}
                      className="flex-1 rounded-full hairline h-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Receipt
                    </button>
                    <button
                      onClick={() => setRefundOpen(true)}
                      className="flex-1 rounded-full hairline h-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Escrow card */}
            <Reveal delay={0.1}>
              <div className="surface-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 grid place-items-center text-primary text-lg">🔒</div>
                  <div>
                    <div className="font-display text-lg">Funds Protected</div>
                    <div className="text-xs text-muted-foreground">Nexa Escrow · NX-8821</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  $85 is held in escrow and will be released to Kori Hair Studio only when you confirm the service is complete.
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">In escrow</span>
                  <span className="font-display text-2xl text-primary">$85.00</span>
                </div>
                <div className="h-px bg-hairline my-3" />
                <button className="text-xs text-muted-foreground hover:text-foreground link-underline">
                  Open a dispute
                </button>
              </div>
            </Reveal>

            {/* Warranty card */}
            <Reveal delay={0.2}>
              <div className="surface-card p-5 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🛡</span>
                  <div className="font-display text-lg">Service Warranty</div>
                  <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">30 days</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  All services on Nexa are covered by a 30-day workmanship guarantee. Not satisfied? We'll make it right.
                </p>
                <button className="rounded-full bg-primary/10 text-primary px-4 h-9 text-sm hover:bg-primary/20 transition-colors">
                  View warranty terms →
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right: History */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Payment history</div>
              <div className="space-y-3">
                {HISTORY.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="surface-card p-5 flex items-center gap-4 group hover:shadow-lift transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 grid place-items-center text-muted-foreground shrink-0 font-mono text-xs">
                      {item.id.replace("NX-", "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base">{item.business}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.service} · {item.date}</div>
                    </div>
                    <div className="font-display text-xl shrink-0">{item.amount}</div>
                  </motion.div>
                ))}
              </div>
            </Reveal>

            {/* Quick actions */}
            <Reveal delay={0.3} className="mt-10">
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/wallet" className="surface-card p-5 hover:shadow-lift transition-shadow group">
                  <div className="font-display text-lg mb-1">Nexa Wallet</div>
                  <div className="text-sm text-muted-foreground mb-4">All your bookings, receipts, and warranties in one place.</div>
                  <span className="text-primary text-sm group-hover:underline">Open wallet →</span>
                </Link>
                <Link to="/discover" className="surface-card p-5 hover:shadow-lift transition-shadow group">
                  <div className="font-display text-lg mb-1">Book another</div>
                  <div className="text-sm text-muted-foreground mb-4">Discover more local businesses and book with confidence.</div>
                  <span className="text-primary text-sm group-hover:underline">Browse businesses →</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Receipt modal */}
      <AnimatePresence>
        {receiptOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-foreground/30 backdrop-blur-sm"
              onClick={() => setReceiptOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] surface-card p-8 w-[min(480px,calc(100vw-2rem))]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="font-display text-2xl">Receipt</div>
                <button onClick={() => setReceiptOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
              </div>
              <div className="text-xs text-muted-foreground font-mono mb-6">#NX-8821 · Today at 2:30pm</div>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Signature cut & finish", amount: "$80.00" },
                  { label: "Nexa service fee", amount: "$5.00" },
                  { label: "Tax (8.875%)", amount: "$0.00" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{l.label}</span>
                    <span>{l.amount}</span>
                  </div>
                ))}
                <div className="h-px bg-hairline" />
                <div className="flex items-center justify-between font-display text-xl">
                  <span>Total</span>
                  <span>$85.00</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-6">Paid via Visa ••42 · Escrow released on service completion</div>
              <button className="w-full rounded-full bg-foreground text-background h-11 text-sm font-medium hover:opacity-90 transition-opacity">
                Download PDF
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Refund modal */}
      <AnimatePresence>
        {refundOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-foreground/30 backdrop-blur-sm"
              onClick={() => setRefundOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] surface-card p-8 w-[min(480px,calc(100vw-2rem))]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="font-display text-2xl">Cancel booking</div>
                <button onClick={() => setRefundOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Cancelling more than 2 hours before receives a full refund. Within 2 hours, the business keeps 50%.</p>
              <div className="space-y-2 mb-6">
                {["Change of plans", "Found another option", "Emergency came up", "Other"].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedRefundReason(reason)}
                    className={`w-full text-left px-4 h-11 rounded-2xl text-sm transition-colors ${
                      selectedRefundReason === reason ? "bg-primary/10 text-primary hairline" : "bg-foreground/5 hover:bg-foreground/8"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRefundOpen(false)} className="flex-1 rounded-full hairline h-11 text-sm text-muted-foreground">
                  Keep booking
                </button>
                <button className="flex-1 rounded-full bg-red-500 text-white h-11 text-sm font-medium hover:bg-red-600 transition-colors" disabled={!selectedRefundReason}>
                  Confirm cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
