import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Calendar, Users, Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/housing/reservation")({
  component: ReservationPage,
});

function ReservationPage() {
  const [guests, setGuests] = useState(1);

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+2rem)]">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center border-b border-hairline">
        <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold mx-auto pr-8">Request to book</h1>
      </div>

      <div className="p-4 max-w-[600px] mx-auto">
        <h2 className="text-[22px] font-bold mb-6">Your trip</h2>
        
        {/* Dates */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-hairline">
          <div>
            <div className="font-bold text-[16px] mb-1">Dates</div>
            <div className="text-[14px] text-muted-foreground">Aug 12 - 16</div>
          </div>
          <button className="font-bold underline text-[14px]">Edit</button>
        </div>

        {/* Guests */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-hairline">
          <div>
            <div className="font-bold text-[16px] mb-1">Guests</div>
            <div className="text-[14px] text-muted-foreground">{guests} guest</div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center font-bold"
            >-</button>
            <span className="font-bold w-4 text-center">{guests}</span>
            <button 
              onClick={() => setGuests(guests + 1)}
              className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center font-bold"
            >+</button>
          </div>
        </div>

        <Link 
          to="/housing/booking"
          className="w-full bg-[#E61E4D] text-white font-bold py-4 rounded-xl flex items-center justify-center text-[16px] mt-8"
        >
          Continue to payment
        </Link>
      </div>
    </div>
  );
}
