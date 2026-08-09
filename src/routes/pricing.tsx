import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Minus, Plane, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PerforatedDivider } from "@/components/manifest/PerforatedDivider";
import { RatingBadge, TrustStrip } from "@/components/manifest/TrustStrip";
import { auth } from "@/lib/auth";
import { useUI, type Plan } from "@/lib/store";
import { useSubscription, useUpdateSubscription } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plans & pricing · GlobeTrotter" },
      {
        name: "description",
        content: "Pick a fare class. Every plan starts free — upgrade when a trip needs more.",
      },
      { property: "og:title", content: "Plans & pricing · GlobeTrotter" },
      {
        property: "og:description",
        content: "Simple, honest pricing for however you travel.",
      },
    ],
  }),
  component: PricingPage,
});

type PlanDef = {
  key: Plan;
  code: string;
  name: string;
  tagline: string;
  monthly: number;
  annualMonthly: number;
  cta: string;
  popular?: boolean;
  features: string[];
};

const PLANS: PlanDef[] = [
  {
    key: "explorer",
    code: "GT-ECO",
    name: "Explorer",
    tagline: "For the once-or-twice-a-year trip.",
    monthly: 0,
    annualMonthly: 0,
    cta: "Get started free",
    features: [
      "1 active trip manifest",
      "Manual budget tracking",
      "Stop-by-stop itinerary builder",
      "Community trip templates",
    ],
  },
  {
    key: "voyager",
    code: "GT-BIZ",
    name: "Voyager",
    tagline: "For anyone who travels like it's a hobby.",
    monthly: 9,
    annualMonthly: 7,
    cta: "Start free trial",
    popular: true,
    features: [
      "Unlimited trip manifests",
      "AI-picked recommendations (Discover)",
      "Live budget sync + overspend alerts",
      "Offline manifest access",
      "Priority support (avg. 2hr reply)",
    ],
  },
  {
    key: "crew",
    code: "GT-1ST",
    name: "Crew",
    tagline: "For families and friend groups who plan together.",
    monthly: 19,
    annualMonthly: 15,
    cta: "Start free trial",
    features: [
      "Everything in Voyager",
      "Shared manifests, up to 6 travelers",
      "Group budget splitting",
      "Real-time collaborator presence",
      "Dedicated onboarding call",
    ],
  },
];

const MATRIX: { label: string; values: (string | boolean)[] }[] = [
  { label: "Active trip manifests", values: ["1", "Unlimited", "Unlimited"] },
  { label: "AI recommendations (Discover)", values: [false, true, true] },
  { label: "Live budget sync", values: [false, true, true] },
  { label: "Offline access", values: [false, true, true] },
  { label: "Shared trips & collaborators", values: [false, "View only", "Up to 6"] },
  { label: "Data export (PDF / CSV)", values: [false, true, true] },
  { label: "Support", values: ["Community", "Priority", "Priority + calls"] },
];

const FAQS = [
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrade, downgrade, or cancel from Profile → Membership at any time. Changes take effect immediately and we prorate the difference.",
  },
  {
    q: "What happens to my trips if I downgrade?",
    a: "Nothing is deleted. If you go back to Explorer with more than one active trip, the rest are simply archived and read-only until you upgrade again.",
  },
  {
    q: "Is annual billing really 20% cheaper?",
    a: "Yes. Voyager is $9/mo billed monthly or $7/mo billed annually ($84/yr) — the same discount applies to Crew. No coupon needed.",
  },
  {
    q: "Do you offer refunds?",
    a: "If a paid plan isn't working out, contact us within 14 days of any charge and we'll refund it in full — no forms, no retention pitch.",
  },
  {
    q: "Is my payment information secure?",
    a: "We never see or store your card number. Billing runs through a PCI-compliant processor, and all account data is encrypted in transit and at rest.",
  },
];

function PriceDisplay({ plan, annual }: { plan: PlanDef; annual: boolean }) {
  const price = annual ? plan.annualMonthly : plan.monthly;
  if (price === 0) {
    return <span className="font-display text-5xl text-departure-navy">Free</span>;
  }
  return (
    <div className="flex items-baseline gap-1">
      <span className="num text-lg text-ink-60 self-start mt-1">$</span>
      <span className="font-display text-5xl text-departure-navy leading-none">{price}</span>
      <span className="num text-sm text-ink-60">/mo</span>
    </div>
  );
}

function PlanCard({
  plan,
  annual,
  index,
  currentPlan,
  onSelect,
  isLoading,
}: {
  plan: PlanDef;
  annual: boolean;
  index: number;
  currentPlan: Plan;
  onSelect: (key: Plan) => void;
  isLoading: boolean;
}) {
  const isCurrent = plan.key === currentPlan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.06 * index }}
      className={cn(
        "relative ticket-stub rounded-sm flex flex-col",
        plan.popular ? "md:-mt-3 md:mb-3 ring-2 ring-beacon-amber" : "",
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 num text-[10px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-3 py-1 rounded-sm shadow-[0_6px_16px_-6px_rgba(242,160,61,0.6)]">
          Most popular
        </span>
      )}
      <p className="num text-[10px] uppercase tracking-[0.22em] text-ink-60">{plan.code}</p>
      <h3 className="font-display text-2xl text-departure-navy mt-1">{plan.name}</h3>
      <p className="text-sm text-ink-60 mt-1 min-h-[2.5rem]">{plan.tagline}</p>

      <div className="mt-4">
        <PriceDisplay plan={plan} annual={annual} />
        {plan.monthly > 0 && (
          <p className="num text-[11px] text-ink-60 mt-1">
            {annual ? `billed annually · $${plan.annualMonthly * 12}/yr` : "billed monthly"}
          </p>
        )}
      </div>

      <div className="perforation-divider my-5" />

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink-90">
            <Check className="w-4 h-4 text-horizon-teal shrink-0 mt-0.5" strokeWidth={2.25} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.key)}
        disabled={isCurrent || isLoading}
        className={cn(
          "mt-6 w-full text-center num text-[11px] uppercase tracking-[0.2em] px-4 py-3 rounded-sm transition-colors",
          isCurrent
            ? "bg-runway-sand text-ink-60 cursor-default"
            : isLoading
              ? "bg-ink-30/40 text-ink-60 cursor-wait"
              : plan.popular
                ? "bg-beacon-amber text-departure-navy hover:bg-beacon-amber/90"
                : "bg-departure-navy text-cloud-white hover:bg-departure-navy/90",
        )}
      >
        {isLoading ? "Updating..." : isCurrent ? "Current plan" : plan.cta}
      </button>
      {plan.monthly > 0 && !isCurrent && (
        <p className="text-center text-[11px] text-ink-60 mt-2">
          14-day free trial · no card required
        </p>
      )}
    </motion.div>
  );
}

function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const plan = useUI((s) => s.plan);
  const setPlan = useUI((s) => s.setPlan);
  const navigate = useNavigate();
  const { data: subscription, isLoading: isLoadingSubscription } = useSubscription();
  const updateSubscription = useUpdateSubscription();

  const currentPlan = (subscription?.plan ?? "explorer") as Plan;
  const billingCycle = (subscription?.billingCycle ?? "monthly") as "monthly" | "annual";
  
  // Sync annual toggle with subscription
  const showAnnual = billingCycle === "annual";

  const selectPlan = async (key: Plan) => {
    setPlan(key);
    const def = PLANS.find((p) => p.key === key)!;
    
    if (!auth.isAuthenticated()) {
      toast.success(`${def.name} selected`, {
        description: "Sign in (or create an account) to activate it.",
      });
      navigate({ to: "/login" });
      return;
    }

    try {
      const cycle = annual ? "annual" : "monthly";
      await updateSubscription.mutateAsync({ plan: key, billingCycle: cycle });
      
      toast.success(
        key === "explorer" ? "Switched to Explorer" : `Welcome to ${def.name}`,
        key === "explorer"
          ? { description: "Paid features are locked again — your trips are untouched." }
          : { description: "Every gated feature just unlocked. Subscription activated." },
      );
      navigate({ to: "/" });
    } catch (error) {
      toast.error("Failed to update subscription", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Minimal top bar — public page, no auth chrome */}
      <header className="border-b border-ink-90/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-beacon-amber" strokeWidth={2.25} />
            <span className="font-display text-xl tracking-tight text-departure-navy">
              GlobeTrotter
            </span>
          </Link>
          <Link
            to="/login"
            className="num text-[11px] uppercase tracking-[0.18em] text-ink-60 hover:text-departure-navy transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10 text-center">
        <span className="customs-stamp text-horizon-teal">Fare classes</span>
        <h1 className="font-display text-5xl md:text-6xl text-departure-navy leading-[0.95] mt-5">
          Plan trips like a pro, for less than a checked bag.
        </h1>
        <p className="text-base text-ink-60 mt-4 max-w-xl mx-auto">
          Start free. Upgrade only when a trip actually needs live budgets, offline access, or a
          co-traveler along for the ride.
        </p>
        <div className="mt-6 flex justify-center">
          <RatingBadge />
        </div>
      </section>

      {/* Billing toggle */}
      <div className="flex justify-center mb-10 px-5">
        <div className="relative inline-flex items-center rounded-sm border border-ink-30/30 p-1">
          {(["monthly", "annual"] as const).map((mode) => {
            const active = (mode === "annual") === annual;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setAnnual(mode === "annual")}
                className={cn(
                  "relative num text-[11px] uppercase tracking-[0.18em] px-4 py-2 rounded-sm transition-colors flex items-center gap-2",
                  active ? "text-cloud-white" : "text-ink-60",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="billingpill"
                    className="absolute inset-0 bg-departure-navy rounded-sm -z-10"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {mode === "monthly" ? "Monthly" : "Annual"}
                {mode === "annual" && (
                  <span
                    className={cn(
                      "num text-[9px] px-1.5 py-0.5 rounded-sm",
                      active ? "bg-beacon-amber text-departure-navy" : "bg-runway-sand text-ink-60",
                    )}
                  >
                    −20%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan cards */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.code}
              plan={plan}
              annual={annual}
              index={i}
              currentPlan={currentPlan}
              onSelect={selectPlan}
              isLoading={updateSubscription.isPending}
            />
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5">
        <PerforatedDivider label="Compare in detail" />
      </div>

      {/* Comparison matrix */}
      <section className="max-w-5xl mx-auto px-5 py-12 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th className="text-left py-3 text-sm font-medium text-ink-60 w-2/5">Feature</th>
              {PLANS.map((p) => (
                <th
                  key={p.code}
                  className="text-center py-3 font-display text-lg text-departure-navy"
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row) => (
              <tr key={row.label} className="border-t border-ink-90/8">
                <td className="py-3.5 text-sm text-ink-90">{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="py-3.5 text-center">
                    {v === true ? (
                      <Check className="w-4 h-4 text-horizon-teal mx-auto" strokeWidth={2.25} />
                    ) : v === false ? (
                      <Minus className="w-4 h-4 text-ink-30 mx-auto" strokeWidth={2} />
                    ) : (
                      <span className="num text-sm text-ink-90">{v}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <div className="text-center mb-8">
          <span className="customs-stamp text-ink-60">Fine print</span>
          <h2 className="font-display text-3xl text-departure-navy mt-4">
            Questions before you board
          </h2>
        </div>
        <Accordion type="single" collapsible className="border-t border-ink-90/8">
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-ink-90/8">
              <AccordionTrigger className="text-left font-medium text-ink-90 hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-ink-60">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Closing CTA */}
      <section className="bg-departure-navy text-cloud-white">
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <Sparkles className="w-6 h-6 text-beacon-amber mx-auto" strokeWidth={1.75} />
          <h2 className="font-display text-4xl mt-4 leading-[0.95]">
            Your next trip deserves a real plan.
          </h2>
          <p className="text-cloud-white/70 text-sm mt-3 max-w-md mx-auto">
            Open your first manifest free — no card, no commitment. Upgrade the moment a trip
            outgrows it.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-6 py-3.5 rounded-sm hover:bg-beacon-amber/90 transition-colors"
          >
            Start free trial
          </Link>
          <TrustStrip dark className="mt-8" />
        </div>
      </section>
    </div>
  );
}