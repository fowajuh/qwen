import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Kicker, KineticHeading, Reveal } from "@/components/app-shell";
import { Home, Key, MapPin, Camera, DollarSign, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/housing/host")({
  head: () => ({
    meta: [{ title: "Become a Host — Nexa Housing" }],
  }),
  component: HostOnboarding,
});

const STEPS = [
  { id: 1, title: "Property type", desc: "What kind of place will you host?" },
  { id: 2, title: "Location", desc: "Where's your place located?" },
  { id: 3, title: "Photos", desc: "Add some photos of your place" },
  { id: 4, title: "Pricing", desc: "Set your nightly price" },
  { id: 5, title: "Review", desc: "Review and publish" },
];

function HostOnboarding() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: "",
    address: "",
    price: "150",
    photos: [] as string[]
  });

  const nextStep = () => {
    if (step < 6) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
  };

  if (step === 6) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
           <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
             <CheckCircle2 size={48} />
           </div>
           <KineticHeading text="You're a Host!" className="text-5xl md:text-7xl mb-4" />
           <p className="text-xl text-muted-foreground mb-10 max-w-md mx-auto">
             Your listing is now live. We'll notify you as soon as someone books your place.
           </p>
           <Link to="/housing/host/dashboard">
             <button className="bg-foreground text-background px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform">
               Go to your dashboard
             </button>
           </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── HEADER ── */}
      <div className="h-20 border-b border-hairline flex items-center justify-between px-6 lg:px-10 shrink-0">
        <Link to="/housing" className="font-display text-xl font-bold tracking-tight">Nexa Housing</Link>
        <div className="flex items-center gap-3">
          <Link to="/housing/host/dashboard" className="text-sm font-semibold underline underline-offset-2 hidden sm:inline">
            Already a host? Go to dashboard
          </Link>
          <button className="text-sm font-semibold bg-surface-2 px-4 py-2 rounded-full">Save & exit</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ── LEFT: INFO & PREVIEW ── */}
        <div className="lg:w-1/2 bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-hairline overflow-hidden relative">
           <AnimatePresence mode="wait" custom={direction}>
             <motion.div 
               key={step} 
               custom={direction}
               variants={slideVariants}
               initial="enter" animate="center" exit="exit"
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
             >
               <Kicker>Step {step}</Kicker>
               <h1 className="font-display text-4xl lg:text-6xl font-semibold mt-4 mb-4 leading-tight">
                 {STEPS[step-1]?.title}
               </h1>
               <p className="text-xl text-muted-foreground">
                 {STEPS[step-1]?.desc}
               </p>

               {/* Live Preview Card */}
               {step >= 2 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} delay={0.2}
                   className="mt-12 surface-card p-4 rounded-2xl shadow-xl max-w-sm transform rotate-[-2deg] bg-card"
                 >
                   <div className="aspect-[4/3] rounded-xl bg-foreground/5 overflow-hidden mb-4 flex items-center justify-center">
                     {formData.photos.length > 0 ? (
                       <div className="w-full h-full bg-primary/20" /> // Mock photo
                     ) : (
                       <Camera className="text-muted-foreground/50 w-12 h-12" />
                     )}
                   </div>
                   <div className="font-semibold">{formData.propertyType || "Your place"}</div>
                   <div className="text-sm text-muted-foreground">{formData.address || "Location"}</div>
                   <div className="mt-2 text-sm font-semibold underline decoration-2 decoration-primary underline-offset-4">
                     ${formData.price} <span className="font-normal text-muted-foreground no-underline">night</span>
                   </div>
                 </motion.div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* ── RIGHT: INPUT ── */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  {['Entire place', 'Private room', 'Shared room'].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setFormData({ ...formData, propertyType: type })}
                      className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${formData.propertyType === type ? 'border-primary bg-primary/5' : 'border-hairline hover:border-foreground/30'}`}
                    >
                      <div className="font-semibold text-lg">{type}</div>
                      <div className="text-sm text-muted-foreground mt-1">Guests have the whole place to themselves.</div>
                    </button>
                  ))}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                  <div className="relative">
                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                     <input 
                       type="text" 
                       value={formData.address}
                       onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                       placeholder="Enter your address"
                       className="w-full bg-foreground/[0.03] border border-hairline rounded-2xl pl-12 pr-4 py-5 text-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                     />
                  </div>
                  <div className="h-48 rounded-2xl bg-foreground/[0.02] border border-hairline flex items-center justify-center relative overflow-hidden">
                     {/* Google Map mock */}
                     <div className="absolute inset-0 opacity-50 saturate-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, black 1px, transparent 0)", backgroundSize: "20px 20px" }} />
                     <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center relative z-10">
                       <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(255,100,0,0.5)]" />
                     </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-foreground/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:bg-foreground/[0.02] transition-colors cursor-pointer"
                    onClick={() => setFormData({ ...formData, photos: ['photo1'] })}
                  >
                     <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                       <Camera size={32} />
                     </div>
                     <h3 className="font-semibold text-xl mb-2">Drag your photos here</h3>
                     <p className="text-muted-foreground mb-6">Choose at least 5 photos</p>
                     <span className="font-semibold underline">Upload from your device</span>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center py-10">
                  <div className="flex items-center text-7xl lg:text-9xl font-display font-semibold">
                    <span className="text-muted-foreground/50">$</span>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-transparent border-none outline-none w-[1.5em] text-center p-0 ml-2 text-foreground"
                    />
                  </div>
                  <div className="text-xl text-muted-foreground mt-4 font-medium">per night</div>
                  
                  <div className="mt-12 surface-card p-6 w-full max-w-sm mx-auto">
                    <div className="flex justify-between items-center mb-4 text-sm font-semibold">
                      <span>Similar places nearby</span>
                      <span>$120 - $180</span>
                    </div>
                    <div className="h-2 bg-foreground/10 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-primary/50 w-1/3 ml-1/3 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="s5" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
                  <div className="surface-card p-6 text-center rounded-3xl">
                     <div className="w-16 h-16 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                       <Key size={32} />
                     </div>
                     <h3 className="text-2xl font-display font-semibold mb-2">Ready to publish!</h3>
                     <p className="text-muted-foreground">Review your settings and you're good to go.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border-b border-hairline">
                      <span className="text-muted-foreground">Property</span>
                      <span className="font-semibold">{formData.propertyType || "Entire place"}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-hairline">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">${formData.price}/night</span>
                    </div>
                    <div className="flex justify-between items-center p-4">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-semibold truncate max-w-[200px]">{formData.address || "Brooklyn, NY"}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── FOOTER NAVIGATION ── */}
          <div className="mt-12 pt-6 border-t border-hairline flex justify-between items-center shrink-0">
             <div className="w-1/3">
               <button 
                 onClick={prevStep}
                 className={`font-semibold underline underline-offset-4 transition-opacity ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:text-muted-foreground'}`}
               >
                 Back
               </button>
             </div>
             
             <div className="w-1/3 flex justify-center gap-2">
               {STEPS.map(s => (
                 <div key={s.id} className={`h-1.5 rounded-full transition-all ${step === s.id ? 'w-6 bg-primary' : step > s.id ? 'w-2 bg-foreground/20' : 'w-2 bg-hairline'}`} />
               ))}
             </div>
             
             <div className="w-1/3 flex justify-end">
               <button 
                 onClick={nextStep}
                 className="bg-foreground text-background px-8 py-3.5 rounded-full font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
               >
                 {step === 5 ? "Publish" : "Next"}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
