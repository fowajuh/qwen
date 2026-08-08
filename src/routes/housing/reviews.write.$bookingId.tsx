import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Star, Camera, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/housing/reviews/write/$bookingId")({
  component: WriteReview,
});

const CATEGORIES = ["Cleanliness", "Accuracy", "Communication", "Location", "Check-in", "Value"] as const;

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} aria-label={`${n} stars`}>
          <Star className={`w-6 h-6 ${n <= value ? "fill-foreground" : "fill-none text-muted-foreground"}`} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

function WriteReview() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  );
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const overall = Object.values(ratings).filter(Boolean).length
    ? Math.round((Object.values(ratings).reduce((a, b) => a + b, 0) / CATEGORIES.length) * 10) / 10
    : 0;

  const canSubmit = Object.values(ratings).every((v) => v > 0) && text.trim().length > 0;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Thanks for your review!</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">It'll be published once the host has a chance to respond, usually within 14 days.</p>
        <Link to="/housing/trips" className="font-semibold underline">Back to your trips</Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background pb-32 pt-safe">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-[17px] ml-2">Write a review</h1>
      </div>

      <div className="max-w-[600px] mx-auto px-5 py-8 space-y-8">
        <div>
          <h2 className="text-[20px] font-bold mb-1">How was your stay?</h2>
          <p className="text-[13px] text-muted-foreground">Booking #{bookingId} · Rate each part of your experience.</p>
        </div>

        <div className="space-y-5">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center justify-between">
              <span className="font-medium text-[14px]">{cat}</span>
              <StarRow value={ratings[cat]} onChange={(v) => setRatings((r) => ({ ...r, [cat]: v }))} />
            </div>
          ))}
        </div>

        {overall > 0 && (
          <div className="flex items-center gap-2 text-[14px] font-semibold border-t border-hairline pt-4">
            <Star className="w-4 h-4 fill-foreground" /> Overall: {overall} / 5
          </div>
        )}

        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground">Your review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Share details of your own experience at this place"
            className="w-full mt-2 border border-hairline rounded-xl px-4 py-3 text-[14px] outline-none focus:border-foreground resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Add photos (optional)</label>
          <button
            onClick={() => setPhotos((p) => [...p, "photo"])}
            className="w-full border-2 border-dashed border-hairline rounded-xl py-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-surface transition-colors"
          >
            <Camera className="w-6 h-6 mb-2" />
            <span className="text-sm font-semibold">{photos.length > 0 ? `${photos.length} photo(s) added` : "Upload photos"}</span>
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-hairline bg-background pb-safe z-40">
        <button
          disabled={!canSubmit}
          onClick={() => setSubmitted(true)}
          className="w-full max-w-[600px] mx-auto flex items-center justify-center bg-foreground text-background py-4 rounded-xl font-bold text-[16px] disabled:opacity-40 transition-opacity"
        >
          Submit review
        </button>
      </div>
    </div>
  );
}
