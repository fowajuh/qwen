import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, X, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/housing/book/$id")({
  component: BookHousing,
});

const MOCK_ITEM = {
  id: "1",
  title: "Desert Dream Oasis",
  price: 782,
  rating: 4.97,
  reviews: 156,
  image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop",
};

export default function BookHousing() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [dates, setDates] = useState("Dec 11 – 14");
  const [guests, setGuests] = useState("1 guest");

  const nights = 3;
  const price = MOCK_ITEM.price;
  const total = price * nights;
  const fee = Math.floor(total * 0.12);
  const final = total + fee;

  return (
    <div className="w-full min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-hairline px-4 py-3 flex items-center pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-[18px] ml-2">Request to book</h1>
      </div>

      <div className="px-5 py-6 space-y-8">
        {/* Item preview */}
        <div className="flex gap-4 p-4 rounded-2xl border border-hairline bg-surface/50">
          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
            <img src={MOCK_ITEM.image} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[12px] text-muted-foreground mb-1">Entire home</div>
            <div className="font-semibold text-[15px] leading-tight line-clamp-2 mb-2">{MOCK_ITEM.title}</div>
            <div className="flex items-center gap-1 text-[13px] font-medium">
              <Star className="w-3.5 h-3.5 fill-foreground" />
              {MOCK_ITEM.rating} <span className="text-muted-foreground">({MOCK_ITEM.reviews})</span>
            </div>
          </div>
        </div>

        {/* Trip details */}
        <div>
          <h2 className="text-[22px] font-bold mb-4">Your trip</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-[15px]">Dates</div>
                <div className="text-[15px] text-muted-foreground">{dates}</div>
              </div>
              <button
                onClick={() => navigate({ to: "/housing/dates/$id", params: { id } })}
                className="font-semibold text-[15px] underline"
              >
                Edit
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-[15px]">Guests</div>
                <div className="text-[15px] text-muted-foreground">{guests}</div>
              </div>
              <button className="font-semibold text-[15px] underline">Edit</button>
            </div>
          </div>
        </div>

        <hr className="border-hairline" />

        {/* Price details */}
        <div>
          <h2 className="text-[22px] font-bold mb-4">Price details</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-[15px]">
              <span>${price} x {nights} nights</span>
              <span>${total}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="underline decoration-muted-foreground underline-offset-4">Nexa service fee</span>
              <span>${fee}</span>
            </div>
            <div className="flex justify-between font-bold text-[16px] pt-3 border-t border-hairline mt-3">
              <span>Total (USD)</span>
              <span>${final}</span>
            </div>
          </div>
        </div>

        <hr className="border-hairline" />

        {/* Rules */}
        <div>
          <h2 className="text-[22px] font-bold mb-4">Ground rules</h2>
          <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">
            We ask every guest to remember a few simple things about what makes a great guest.
          </p>
          <ul className="list-disc pl-5 text-[15px] space-y-2 text-muted-foreground">
            <li>Follow the house rules</li>
            <li>Treat your Host's home like your own</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-hairline bg-background pb-safe z-40">
        <button
          onClick={() => {
            navigate({ to: "/housing/checkout/$id", params: { id } });
          }}
          className="w-full bg-[#e11d48] text-white py-4 rounded-xl font-bold text-[16px] shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Confirm and pay
        </button>
      </div>
    </div>
  );
}
