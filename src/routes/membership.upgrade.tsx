import { createFileRoute, Link } from "@tanstack/react-router";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { Check, ShieldCheck, Zap, Sparkles, Building2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/membership/upgrade")({
  head: () => ({
    meta: [{ title: "Upgrade Plan — Nexa" }],
  }),
  component: Upgrade,
});

const PLANS = [
  {
    id: "growth",
    name: "Growth",
    price: 49,
    period: "/mo",
    desc: "For growing businesses that need AI automation.",
    icon: <Zap size={24} />,
    features: [
      "Unlimited bookings",
      "AI replies & follow-ups",
      "Smart scheduling",
      "Revenue insights",
      "Marketing tools",
      "Priority support"
    ],
    color: "primary"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    period: "/mo",
    desc: "For established businesses with multiple locations.",
    icon: <Building2 size={24} />,
    features: [
      "Everything in Growth",
      "Multi-location management",
      "API access",
      "Dedicated success manager",
      "Custom integrations",
      "Advanced forecasting"
    ],
    color: "purple-500"
  }
];

function Upgrade() {
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [isAnnual, setIsAnnual] = useState(true);
  const [step, setStep] = useState(1); // 1: Select Plan, 2: Checkout, 3: Success

  const activePlan = PLANS.find(p => p.id === selectedPlan);
  const price = isAnnual ? Math.floor((activePlan?.price || 0) * 0.8) : (activePlan?.price || 0);

  if (step === 3) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
           <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8 relative">
             <Sparkles size={48} />
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 rounded-full border-2 border-dashed border-primary"
             />
           </div>
           <KineticHeading text="Welcome to Growth!" className="text-5xl md:text-7xl mb-4" />
           <p className="text-xl text-muted-foreground mb-10 max-w-md mx-auto">
             Your account has been upgraded. You now have access to the full suite of Nexa AI tools.
           </p>
           <Link to="/ai/studio">
             <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/30">
               Go to AI Studio
             </button>
           </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Upgrade</Kicker>
          <KineticHeading text="Unlock your potential." className="text-4xl md:text-6xl mt-4 mb-2" />
          <p className="text-muted-foreground text-lg mb-12">Upgrade to get the full power of the Nexa ecosystem.</p>
        </Reveal>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {/* Billing Toggle */}
              <div className="flex justify-center mb-12">
                <div className="bg-surface-2 p-1.5 rounded-full inline-flex items-center relative">
                  <motion.div 
                    className="absolute inset-y-1.5 rounded-full bg-background shadow-sm"
                    initial={false}
                    animate={{ 
                      left: isAnnual ? "4px" : "50%",
                      width: isAnnual ? "48%" : "48%" 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  <button 
                    onClick={() => setIsAnnual(true)}
                    className={`relative z-10 px-6 py-2.5 text-sm font-semibold transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    Annually <span className="text-[10px] uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full ml-1">Save 20%</span>
                  </button>
                  <button 
                    onClick={() => setIsAnnual(false)}
                    className={`relative z-10 px-6 py-2.5 text-sm font-semibold transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                 {PLANS.map((plan) => (
                   <div 
                     key={plan.id}
                     onClick={() => setSelectedPlan(plan.id)}
                     className={`surface-card p-8 rounded-3xl cursor-pointer transition-all border-2 ${selectedPlan === plan.id ? `border-${plan.color} shadow-[0_0_40px_rgba(255,100,0,0.1)] scale-[1.02]` : 'border-transparent hover:border-foreground/10'}`}
                   >
                     <div className={`w-12 h-12 rounded-xl bg-${plan.color}/10 text-${plan.color} flex items-center justify-center mb-6`}>
                       {plan.icon}
                     </div>
                     <h3 className="font-display text-3xl font-semibold mb-2">{plan.name}</h3>
                     <p className="text-muted-foreground text-sm mb-6 h-10">{plan.desc}</p>
                     
                     <div className="flex items-baseline gap-1 mb-8">
                       <span className="font-display text-5xl font-bold">${isAnnual ? Math.floor(plan.price * 0.8) : plan.price}</span>
                       <span className="text-muted-foreground">{plan.period}</span>
                     </div>
                     
                     <div className="space-y-4 mb-8 flex-1">
                       {plan.features.map(f => (
                         <div key={f} className="flex items-start gap-3">
                           <div className={`mt-0.5 w-5 h-5 rounded-full bg-${plan.color}/10 text-${plan.color} flex items-center justify-center shrink-0`}>
                             <Check size={12} strokeWidth={3} />
                           </div>
                           <span className="text-sm font-medium">{f}</span>
                         </div>
                       ))}
                     </div>
                     
                     <div className={`w-full py-4 rounded-full text-center font-semibold text-sm transition-colors ${selectedPlan === plan.id ? `bg-${plan.color} text-white` : 'bg-foreground/5 text-foreground'}`}>
                       {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                     </div>
                   </div>
                 ))}
              </div>

              <div className="flex justify-end">
                 <button 
                   onClick={() => setStep(2)}
                   className="bg-foreground text-background px-10 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform"
                 >
                   Continue to Payment
                 </button>
              </div>
            </motion.div>
          ) : step === 2 && activePlan ? (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="grid md:grid-cols-2 gap-12"
            >
              {/* Payment Form */}
              <div>
                 <button onClick={() => setStep(1)} className="text-muted-foreground text-sm font-medium flex items-center gap-1 mb-8 hover:text-foreground transition-colors">
                   ← Back to plans
                 </button>
                 <h2 className="text-2xl font-display font-semibold mb-8">Payment Details</h2>
                 
                 <div className="space-y-5">
                   <div>
                     <label className="block text-sm font-medium mb-2">Card Information</label>
                     <div className="bg-foreground/[0.03] border border-hairline rounded-xl overflow-hidden">
                       <input type="text" placeholder="Card number" className="w-full px-4 py-3 bg-transparent outline-none border-b border-hairline font-mono" />
                       <div className="flex">
                         <input type="text" placeholder="MM / YY" className="w-1/2 px-4 py-3 bg-transparent outline-none border-r border-hairline font-mono" />
                         <input type="text" placeholder="CVC" className="w-1/2 px-4 py-3 bg-transparent outline-none font-mono" />
                       </div>
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium mb-2">Name on card</label>
                     <input type="text" className="w-full bg-foreground/[0.03] border border-hairline rounded-xl px-4 py-3 outline-none focus:border-primary" />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium mb-2">Country or region</label>
                     <select className="w-full bg-foreground/[0.03] border border-hairline rounded-xl px-4 py-3 outline-none focus:border-primary appearance-none">
                       <option>United States</option>
                       <option>Canada</option>
                       <option>United Kingdom</option>
                     </select>
                   </div>
                   
                   <button 
                     onClick={() => setStep(3)}
                     className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors mt-8 shadow-lg shadow-primary/20"
                   >
                     Pay ${isAnnual ? price * 12 : price}
                   </button>
                   
                   <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                     <ShieldCheck size={14} /> Payments are secure and encrypted
                   </div>
                 </div>
              </div>

              {/* Order Summary */}
              <div>
                 <div className="surface-card p-8 rounded-3xl sticky top-24">
                   <h3 className="font-semibold mb-6">Order Summary</h3>
                   
                   <div className="flex items-center gap-4 mb-6 pb-6 border-b border-hairline">
                     <div className={`w-12 h-12 rounded-xl bg-${activePlan.color}/10 text-${activePlan.color} flex items-center justify-center`}>
                       {activePlan.icon}
                     </div>
                     <div>
                       <div className="font-semibold text-lg">{activePlan.name} Plan</div>
                       <div className="text-sm text-muted-foreground">{isAnnual ? 'Billed annually' : 'Billed monthly'}</div>
                     </div>
                   </div>
                   
                   <div className="space-y-4 mb-6 pb-6 border-b border-hairline text-sm">
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Subtotal</span>
                       <span className="font-medium">${isAnnual ? price * 12 : price}.00</span>
                     </div>
                     {isAnnual && (
                       <div className="flex justify-between text-green-500 font-medium">
                         <span>Annual discount (20%)</span>
                         <span>-${Math.floor(activePlan.price * 12 * 0.2)}.00</span>
                       </div>
                     )}
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Tax</span>
                       <span className="font-medium">$0.00</span>
                     </div>
                   </div>
                   
                   <div className="flex justify-between items-end">
                     <div>
                       <div className="font-semibold text-xl">Total due today</div>
                       <div className="text-xs text-muted-foreground mt-1">Includes applicable taxes</div>
                     </div>
                     <div className="font-display text-3xl font-bold">${isAnnual ? price * 12 : price}</div>
                   </div>
                 </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
