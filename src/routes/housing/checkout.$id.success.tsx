import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Calendar, MapPin, MessageCircle, Download, Key, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/housing-data";

export const Route = createFileRoute("/housing/checkout/$id/success")({
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => api.getListing(id),
  });

  const confirmationCode = `NX${id.padStart(4, "0")}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  if (isLoading || !listing) {
    return <div className="h-screen bg-background animate-pulse" />;
  }

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

        <h1 className="text-3xl font-display font-bold leading-tight mb-2">You're all set!</h1>
        <p className="text-[16px] text-muted-foreground mb-8">
          Your reservation is confirmed. A receipt has been sent to your email.
        </p>

        <div className="border border-hairline rounded-2xl p-5 mb-6 bg-surface">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-hairline">
            <div className="w-16 h-16 rounded-xl bg-background overflow-hidden shrink-0">
              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-[15px] mb-1 line-clamp-1">{listing.title}</div>
              <div className="text-[13px] text-muted-foreground">Hosted by {listing.host}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[14px]">{listing.dates}</div>
                <div className="text-[13px] text-muted-foreground">Check-in details sent 24h before arrival</div>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[14px]">{listing.location}</div>
                <div className="text-[13px] text-muted-foreground">{listing.city}, {listing.country}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Key className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[14px]">Confirmation code</div>
                <div className="text-[13px] text-muted-foreground font-mono">{confirmationCode}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-hairline font-semibold text-[13px] hover:bg-surface transition-colors">
            <Calendar className="w-4 h-4" /> Add to calendar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-hairline font-semibold text-[13px] hover:bg-surface transition-colors">
            <Download className="w-4 h-4" /> Download receipt
          </button>
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
