import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, Tag, Users, CreditCard, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/housing-data";

export const Route = createFileRoute("/housing/checkout/$id")({
  component: HousingCheckout,
});

const PAYMENT_METHODS = [
  { id: "visa", label: "Visa •••• 4242", icon: "VISA" },
  { id: "paypal", label: "PayPal", icon: "PP" },
  { id: "venmo", label: "Venmo", icon: "V" },
];

function HousingCheckout() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => api.getListing(id),
  });

  const [method, setMethod] = useState("visa");
  const [splitPay, setSplitPay] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [paying, setPaying] = useState(false);

  if (isLoading || !listing) {
    return <div className="h-screen bg-background animate-pulse" />;
  }

  const nights = 3;
  const subtotal = listing.price * nights;
  const cleaningFee = Math.round(listing.price * 0.3);
  const serviceFee = Math.round(subtotal * 0.12);
  const insuranceFee = insurance ? 39 : 0;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + cleaningFee + serviceFee + insuranceFee - discount;
  const splitAmount = Math.round(total / 2);

  const handlePay = async () => {
    setPaying(true);
    try {
      await api.createBooking(listing.id, { nights, guests: 1 });
    } finally {
      setPaying(false);
      navigate({ to: "/housing/checkout/$id/success", params: { id } });
    }
  };

  return (
    <div className="w-full min-h-screen bg-background pb-32 pt-safe">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-[17px] ml-2">Confirm and pay</h1>
      </div>

      <div className="px-5 py-6 max-w-[600px] mx-auto space-y-8">
        {/* Listing summary */}
        <div className="flex gap-4 pb-6 border-b border-hairline">
          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-[12px] text-muted-foreground mb-1">Entire place · {listing.city}</div>
            <div className="font-bold text-[15px] leading-tight mb-2 line-clamp-2">{listing.title}</div>
            <div className="text-[13px] text-muted-foreground">Hosted by {listing.host}</div>
          </div>
        </div>

        {/* Payment method */}
        <div>
          <h2 className="text-[18px] font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pay with
          </h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center justify-between border rounded-xl p-4 transition-colors ${
                  method === m.id ? "border-foreground" : "border-hairline hover:border-foreground/40"
                }`}
              >
                <span className="font-medium text-[14px]">{m.label}</span>
                {method === m.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Split payment */}
        <div className="border border-hairline rounded-xl p-4 flex items-start gap-3">
          <Users className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[14px]">Split payment with a guest</span>
              <button
                role="switch"
                aria-checked={splitPay}
                onClick={() => setSplitPay((s) => !s)}
                className={`w-10 h-6 rounded-full relative transition-colors ${splitPay ? "bg-foreground" : "bg-hairline"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${splitPay ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">
              {splitPay ? `You'll each be charged $${splitAmount}. We'll send them a request.` : "Divide the total evenly between two payment methods."}
            </p>
          </div>
        </div>

        {/* Travel insurance upsell */}
        <div className="border border-hairline rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[14px]">Add trip protection — $39</span>
              <button
                role="switch"
                aria-checked={insurance}
                onClick={() => setInsurance((s) => !s)}
                className={`w-10 h-6 rounded-full relative transition-colors ${insurance ? "bg-foreground" : "bg-hairline"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${insurance ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">Covers trip cancellation, delays, and medical emergencies. Terms apply.</p>
          </div>
        </div>

        {/* Promo code */}
        <div>
          <h2 className="text-[18px] font-bold mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Promo code
          </h2>
          <div className="flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Enter code"
              className="flex-1 border border-hairline rounded-lg px-4 py-3 text-[14px] outline-none focus:border-foreground"
            />
            <button
              onClick={() => setPromoApplied(promo.trim().length > 0)}
              className="px-5 rounded-lg border border-foreground font-semibold text-[14px] hover:bg-surface transition-colors"
            >
              Apply
            </button>
          </div>
          {promoApplied && <p className="text-[13px] text-green-600 font-medium mt-2">Code applied — 10% off</p>}
        </div>

        <hr className="border-hairline" />

        {/* Price breakdown */}
        <div>
          <h2 className="text-[18px] font-bold mb-4">Price details</h2>
          <div className="space-y-3 text-[14px]">
            <div className="flex justify-between"><span>${listing.price} x {nights} nights</span><span>${subtotal}</span></div>
            <div className="flex justify-between"><span className="underline">Cleaning fee</span><span>${cleaningFee}</span></div>
            <div className="flex justify-between"><span className="underline">Nexa service fee</span><span>${serviceFee}</span></div>
            {insurance && <div className="flex justify-between"><span className="underline">Trip protection</span><span>${insuranceFee}</span></div>}
            {promoApplied && <div className="flex justify-between text-green-600"><span>Promo discount</span><span>-${discount}</span></div>}
            <div className="flex justify-between font-bold text-[16px] pt-3 border-t border-hairline">
              <span>Total (USD)</span>
              <span>${total}</span>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-muted-foreground">
          By selecting the button below, I agree to the House Rules, Safety Disclosures, and the{" "}
          <Link to="/housing/safety" className="underline font-semibold text-foreground">Guest Refund Policy</Link>.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-hairline bg-background pb-safe z-40">
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full max-w-[600px] mx-auto flex items-center justify-center bg-[#E61E4D] text-white py-4 rounded-xl font-bold text-[16px] shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm and pay"}
        </button>
      </div>
    </div>
  );
}
