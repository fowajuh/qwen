import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Star, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/housing/booking")({
  component: BookingPage,
});

function BookingPage() {
  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+2rem)]">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center border-b border-hairline">
        <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold mx-auto pr-8">Confirm and pay</h1>
      </div>

      <div className="p-4 max-w-[600px] mx-auto">
        {/* Listing Summary */}
        <div className="flex gap-4 mb-8 pb-6 border-b border-hairline">
          <div className="w-28 h-24 rounded-xl bg-surface overflow-hidden shrink-0">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80" alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-[12px] text-muted-foreground mb-1">Entire apartment</div>
            <div className="font-bold text-[14px] leading-tight mb-2">Architectural loft in downtown</div>
            <div className="flex items-center gap-1 text-[12px]">
              <Star className="w-3.5 h-3.5 fill-foreground" />
              <span className="font-bold">4.96</span>
              <span className="text-muted-foreground">(124 reviews)</span>
            </div>
          </div>
        </div>

        {/* Price Details */}
        <h2 className="text-[20px] font-bold mb-4">Price details</h2>
        <div className="space-y-3 mb-6 pb-6 border-b border-hairline text-[15px]">
          <div className="flex justify-between">
            <span>$120 x 4 nights</span>
            <span>$480</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>$50</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Service fee</span>
            <span>$75</span>
          </div>
          <div className="flex justify-between font-bold pt-4 border-t border-hairline">
            <span>Total (USD)</span>
            <span>$605</span>
          </div>
        </div>

        {/* Pay with */}
        <h2 className="text-[20px] font-bold mb-4">Pay with</h2>
        <div className="border border-hairline rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-6 bg-[#1A1F71] text-white rounded text-[10px] font-bold italic flex items-center justify-center">VISA</div>
            <span className="font-medium text-[15px]">•••• 4242</span>
          </div>
          <button className="underline font-bold text-[14px]">Edit</button>
        </div>

        {/* Disclaimer */}
        <div className="flex gap-3 mb-8">
          <ShieldCheck className="w-6 h-6 text-[#E61E4D] shrink-0" />
          <div className="text-[12px] text-muted-foreground">
            By selecting the button below, I agree to the <span className="underline font-bold text-foreground">House Rules</span>, <span className="underline font-bold text-foreground">Safety Disclosures</span>, and the <span className="underline font-bold text-foreground">Guest Refund Policy</span>.
          </div>
        </div>

        <Link 
          to="/housing/confirmation"
          className="w-full bg-[#E61E4D] text-white font-bold py-4 rounded-xl flex items-center justify-center text-[16px]"
        >
          Confirm and pay
        </Link>
      </div>
    </div>
  );
}
