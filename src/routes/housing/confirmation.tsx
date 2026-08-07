import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Calendar, MapPin, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/housing/confirmation")({
  component: ConfirmationPage,
});

function ConfirmationPage() {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col pt-safe">
      <div className="flex-1 px-6 pt-16 flex flex-col max-w-[600px] mx-auto w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>
        
        <h1 className="text-3xl font-display font-bold leading-tight mb-2">
          You're all set!
        </h1>
        <p className="text-[16px] text-muted-foreground mb-10">
          Your reservation is confirmed. A receipt has been sent to your email.
        </p>

        <div className="border border-hairline rounded-2xl p-5 mb-8 bg-surface">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-hairline">
            <div className="w-16 h-16 rounded-xl bg-background overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-[15px] mb-1">Architectural loft</div>
              <div className="text-[13px] text-muted-foreground">Hosted by Sarah</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[14px]">Aug 12 - 16, 2026</div>
                <div className="text-[13px] text-muted-foreground">Check-in at 3:00 PM</div>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[14px]">124 Downtown Ave</div>
                <div className="text-[13px] text-muted-foreground">Brooklyn, NY 11201</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto pb-[calc(var(--bottom-nav-height)+2rem)]">
          <Link 
            to="/housing"
            className="w-full py-4 rounded-xl font-bold text-[15px] bg-surface text-center flex items-center justify-center"
          >
            Explore more
          </Link>
          <Link
            to="/messages"
            className="w-full py-4 rounded-xl font-bold text-[15px] bg-foreground text-background text-center flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Message host
          </Link>
        </div>
      </div>
    </div>
  );
}
