import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Reveal, MagneticButton, Kicker } from "@/components/app-shell";

/* ── DATA ── */
const DATA: Record<string, {
  name: string; tag: string; city: string; trust: number; response: string;
  jobs: number; retention: number; tone: string; blurb: string; image: string;
  services: { name: string; price: string; dur: string }[];
  slots: string[]; timeline: { t: string; e: string }[];
  tags?: string[];
}> = {
  kori: {
    name: "Kori Hair Studio", tag: "Salon", city: "Williamsburg, Brooklyn",
    trust: 98, response: "4 min", jobs: 1412, retention: 72, tone: "warm",
    blurb: "Six-chair studio specializing in editorial cuts, warm tones, and slow, quiet mornings. Family-owned since 2018.",
    image: "https://images.unsplash.com/photo-1521590832167-7bfc17454f51?q=80&w=2000&auto=format&fit=crop",
    tags: ["Quiet", "On-time", "Warm palette", "Editorial"],
    services: [
      { name: "Signature cut & finish", price: "$85", dur: "60 min" },
      { name: "Full color session", price: "$180", dur: "2h 30m" },
      { name: "Balayage refresh", price: "$220", dur: "3h" },
      { name: "Beard sculpt", price: "$45", dur: "30 min" },
    ],
    slots: ["Today 2:30", "Today 4:00", "Tue 10:15", "Wed 6:45", "Thu 11:00"],
    timeline: [
      { t: "12 min ago", e: "Confirmed Emma's 4pm cut" },
      { t: "36 min ago", e: "Refunded Jaden — reschedule requested" },
      { t: "1h ago", e: "Published new autumn palette story" },
      { t: "3h ago", e: "Booked out Tuesday evening" },
    ],
  },
  halden: {
    name: "Halden Dental", tag: "Dental", city: "Park Slope, Brooklyn",
    trust: 96, response: "8 min", jobs: 2240, retention: 68, tone: "cool",
    blurb: "Family dental practice with 23 years of gentle care. Same-day emergencies. Digital X-rays. In-network with most major providers.",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2000&auto=format&fit=crop",
    tags: ["In-network", "Same-day", "Gentle", "Family"],
    services: [
      { name: "New patient exam", price: "$0", dur: "60 min" },
      { name: "Deep cleaning", price: "$180", dur: "90 min" },
      { name: "Tooth-colored filling", price: "$220", dur: "45 min" },
      { name: "Teeth whitening", price: "$350", dur: "2h" },
    ],
    slots: ["Today 1:00", "Today 3:30", "Wed 9:00", "Thu 2:15", "Fri 11:00"],
    timeline: [
      { t: "20 min ago", e: "Confirmed Marco's emergency slot" },
      { t: "1h ago", e: "Posted new patient welcome offer" },
      { t: "2h ago", e: "Completed 3 cleanings" },
      { t: "Yesterday", e: "New 5-star review from Emma K." },
    ],
  },
  "north-fork": {
    name: "North Fork Plumbing", tag: "Emergency", city: "Greenpoint, Brooklyn",
    trust: 94, response: "6 min", jobs: 3108, retention: 55, tone: "ember",
    blurb: "Licensed emergency plumbers available 24/7. Transparent pricing before we start. No surprise charges — ever.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2000&auto=format&fit=crop",
    tags: ["24/7", "Transparent", "Licensed", "Emergency"],
    services: [
      { name: "Emergency call-out", price: "$95", dur: "1h" },
      { name: "Leak repair", price: "$145", dur: "2h" },
      { name: "Drain clearing", price: "$175", dur: "1h 30m" },
      { name: "Full inspection", price: "$260", dur: "3h" },
    ],
    slots: ["Now", "In 90 min", "Tomorrow 8am", "Tomorrow 11am", "Thu AM"],
    timeline: [
      { t: "8 min ago", e: "En route to Flatbush emergency" },
      { t: "45 min ago", e: "Completed Clinton Hill leak repair" },
      { t: "2h ago", e: "Booked out Thursday morning" },
      { t: "4h ago", e: "Flash offer: 30% off before 8pm" },
    ],
  },
  mira: {
    name: "Mira Yoga", tag: "Wellness", city: "Cobble Hill, Brooklyn",
    trust: 92, response: "12 min", jobs: 847, retention: 81, tone: "sand",
    blurb: "Intimate yoga studio with rooftop classes, meditation, and breathwork. Maximum 12 students per session. Community-owned since 2020.",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2000&auto=format&fit=crop",
    tags: ["Rooftop", "Intimate", "Breathwork", "Community"],
    services: [
      { name: "Single class", price: "$22", dur: "60 min" },
      { name: "Monthly unlimited", price: "$110", dur: "ongoing" },
      { name: "Private session", price: "$95", dur: "75 min" },
      { name: "Couples breathwork", price: "$160", dur: "90 min" },
    ],
    slots: ["Today 6:30am", "Today 7pm", "Tue 6am", "Wed 12pm", "Sat 8am"],
    timeline: [
      { t: "2h ago", e: "Saturday rooftop sold out" },
      { t: "5h ago", e: "New video: morning flow routine" },
      { t: "Yesterday", e: "Community meditation event posted" },
      { t: "2 days ago", e: "81% rebook rate milestone" },
    ],
  },
  atelier: {
    name: "Atelier Fleur", tag: "Florist", city: "DUMBO, Brooklyn",
    trust: 95, response: "5 min", jobs: 1893, retention: 63, tone: "warm",
    blurb: "Bespoke floral studio specializing in editorial arrangements, event design, and daily subscriptions. Every stem sourced from Hudson Valley farms.",
    tags: ["Same-day", "Editorial", "Hudson Valley", "Bespoke"],
    services: [
      { name: "Daily bouquet", price: "$45", dur: "same day" },
      { name: "Event centerpiece", price: "$280", dur: "1 week lead" },
      { name: "Wedding package", price: "$2,400+", dur: "3 months lead" },
      { name: "Monthly subscription", price: "$160/mo", dur: "ongoing" },
    ],
    slots: ["Today by noon", "Today by 5pm", "Tomorrow 10am", "Wed", "Thu"],
    timeline: [
      { t: "30 min ago", e: "Delivered anniversary arrangement to Fort Greene" },
      { t: "2h ago", e: "New peony season story published" },
      { t: "Yesterday", e: "Wedding consultation — June 14" },
      { t: "3 days ago", e: "Hudson Valley farm partnership renewed" },
    ],
  },
  ostro: {
    name: "Ostro Coffee Bar", tag: "Cafe", city: "Carroll Gardens, Brooklyn",
    trust: 93, response: "3 min", jobs: 12480, retention: 74, tone: "sand",
    blurb: "Slow bar, natural light, and no ambient music. A place to actually think. Sourcing from three rotating single-origin roasters.",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop",
    tags: ["Quiet", "Slow bar", "Single-origin", "Natural light"],
    services: [
      { name: "Filter coffee", price: "$5", dur: "5 min" },
      { name: "Pour-over flight", price: "$18", dur: "20 min" },
      { name: "Private tasting", price: "$85", dur: "90 min" },
      { name: "Monthly bag subscription", price: "$38/mo", dur: "ongoing" },
    ],
    slots: ["Open now", "Closes 6pm", "Tomorrow 7am", "All week"],
    timeline: [
      { t: "5 min ago", e: "New Ethiopian Yirgacheffe on the bar" },
      { t: "1h ago", e: "Behind the counter story posted" },
      { t: "Yesterday", e: "Private tasting — 6 guests" },
      { t: "3 days ago", e: "Featured in Brooklyn Magazine" },
    ],
  },
  union: {
    name: "Union Bike Co.", tag: "Repair", city: "Williamsburg, Brooklyn",
    trust: 91, response: "9 min", jobs: 4217, retention: 58, tone: "cool",
    blurb: "Bike mechanics who care about the ride. Wheel builds, full overhauls, and commuter tune-ups. Carbon and steel welcome.",
    tags: ["Carbon", "Steel", "Fast turnaround", "Certified"],
    services: [
      { name: "Basic tune-up", price: "$65", dur: "45 min" },
      { name: "Full overhaul", price: "$190", dur: "3h" },
      { name: "Wheel build", price: "$145", dur: "2h" },
      { name: "Custom fit session", price: "$120", dur: "90 min" },
    ],
    slots: ["Today 2pm", "Today 5pm", "Tue 10am", "Wed 1pm", "Thu all day"],
    timeline: [
      { t: "1h ago", e: "Retensioned 4 wheels" },
      { t: "3h ago", e: "Published: How to survive Brooklyn potholes" },
      { t: "Yesterday", e: "247 bikes tuned this week milestone" },
      { t: "2 days ago", e: "New carbon service bay opened" },
    ],
  },
  sabor: {
    name: "Sabor Bakery", tag: "Bakery", city: "Red Hook, Brooklyn",
    trust: 97, response: "2 min", jobs: 8920, retention: 79, tone: "ember",
    blurb: "Colombian-inspired bakery. Everything baked from 4am. No preservatives, no shortcuts. The croissant queue forms at 6:45.",
    tags: ["No preservatives", "Colombian", "Fresh daily", "Community"],
    services: [
      { name: "Croissant (per)", price: "$4.50", dur: "while supply lasts" },
      { name: "Custom birthday cake", price: "$85+", dur: "48h lead" },
      { name: "Catering box", price: "$120", dur: "24h lead" },
      { name: "Bread subscription", price: "$32/wk", dur: "ongoing" },
    ],
    slots: ["Opens 7am daily", "Pre-order by 8pm", "Custom orders: 48h"],
    timeline: [
      { t: "2h ago", e: "Morning sell-out: croissants gone by 9am" },
      { t: "5h ago", e: "5am proofing story published" },
      { t: "Yesterday", e: "Wedding catering confirmed — 200 guests" },
      { t: "3 days ago", e: "New seasonal: dulce de leche danish" },
    ],
  },
  fold: {
    name: "Fold & Steam", tag: "Laundry", city: "Bed-Stuy, Brooklyn",
    trust: 90, response: "15 min", jobs: 3340, retention: 71, tone: "warm",
    blurb: "Premium laundry and dry cleaning. Free pickup and delivery. Garment bags, plant-based detergents, and 24h turnaround.",
    tags: ["Eco detergent", "Free pickup", "24h turnaround", "Garment bags"],
    services: [
      { name: "Wash & fold", price: "$2.20/lb", dur: "24h" },
      { name: "Dry cleaning", price: "$18+", dur: "48h" },
      { name: "Express same-day", price: "+$15", dur: "8h" },
      { name: "Monthly plan", price: "$89/mo", dur: "ongoing" },
    ],
    slots: ["Pickup today before 2pm", "Pickup tomorrow 9am", "Express today"],
    timeline: [
      { t: "45 min ago", e: "Completed 14 garments for express order" },
      { t: "2h ago", e: "New eco detergent range launched" },
      { t: "Yesterday", e: "71% monthly plan subscription rate milestone" },
      { t: "4 days ago", e: "Expanded to Prospect Heights" },
    ],
  },
  vista: {
    name: "Vista Opticians", tag: "Optician", city: "Park Slope, Brooklyn",
    trust: 93, response: "10 min", jobs: 1560, retention: 66, tone: "cool",
    blurb: "Independent optical boutique with 800+ frame styles. On-site lens cutting, same-day fittings. Eye exams Tuesday through Saturday.",
    tags: ["800+ frames", "Same-day", "Independent", "On-site lab"],
    services: [
      { name: "Eye exam", price: "$95", dur: "45 min" },
      { name: "Lens fitting", price: "$0", dur: "same day" },
      { name: "Frame + lens package", price: "from $280", dur: "1–3 days" },
      { name: "Contact lens fitting", price: "$75", dur: "30 min" },
    ],
    slots: ["Today 11am", "Today 3pm", "Tue 10am", "Thu 2pm", "Sat 9am"],
    timeline: [
      { t: "1h ago", e: "New Lindberg titanium collection arrived" },
      { t: "Yesterday", e: "Same-day fitting for Maya — wedding tomorrow" },
      { t: "3 days ago", e: "Insurance processing: now accepting VSP" },
      { t: "1 week ago", e: "Staff training: new AR lens tech" },
    ],
  },
  paws: {
    name: "Paws & Claws Vet", tag: "Veterinary", city: "Prospect Heights, Brooklyn",
    trust: 96, response: "7 min", jobs: 6780, retention: 83, tone: "sand",
    blurb: "Full-service veterinary clinic with urgent care walk-in slots every morning. Cat-only rooms available. Senior pet specialist on staff.",
    tags: ["Walk-ins", "Cat rooms", "Senior specialist", "Urgent care"],
    services: [
      { name: "Wellness exam", price: "$85", dur: "30 min" },
      { name: "Vaccinations", price: "$45+", dur: "20 min" },
      { name: "Dental cleaning", price: "$320", dur: "3h" },
      { name: "Urgent care walk-in", price: "$120", dur: "varies" },
    ],
    slots: ["Walk-in now", "Today 2pm", "Tue 10am", "Wed 3pm", "Thu 9am"],
    timeline: [
      { t: "30 min ago", e: "Walk-in: Bella the Labrador — all clear" },
      { t: "3h ago", e: "Published: summer flea prevention guide" },
      { t: "Yesterday", e: "6 dental procedures completed" },
      { t: "5 days ago", e: "Senior pet clinic expanded to Tuesdays" },
    ],
  },
  swift: {
    name: "Swift Lock & Key", tag: "Locksmith", city: "Bay Ridge, Brooklyn",
    trust: 99, response: "4 min", jobs: 5520, retention: 42, tone: "ember",
    blurb: "Licensed, bonded, and insured. 24/7 emergency lockout service. Smart lock installation and rekeying specialists. 12-minute average arrival.",
    tags: ["24/7", "Licensed", "Smart locks", "12-min ETA"],
    services: [
      { name: "Emergency lockout", price: "$95", dur: "12–20 min" },
      { name: "Lock rekeying", price: "$75", dur: "30 min" },
      { name: "Smart lock install", price: "$145+", dur: "1h" },
      { name: "Full security audit", price: "$190", dur: "2h" },
    ],
    slots: ["Available now", "Available 24/7", "12 min average ETA"],
    timeline: [
      { t: "12 min ago", e: "En route to Sunset Park lockout" },
      { t: "1h ago", e: "Smart lock installed — Fort Hamilton" },
      { t: "3h ago", e: "Emergency rekeying after lost keys" },
      { t: "Yesterday", e: "99 trust score maintained — no disputes ever" },
    ],
  },
};

export const Route = createFileRoute("/business/$slug")({
  loader: async ({ params }) => {
    const b = DATA[params.slug];
    if (!b) throw notFound();
    return { business: b, slug: params.slug };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.business.name} — Nexa` },
          { name: "description", content: loaderData.business.blurb },
          { property: "og:title", content: `${loaderData.business.name} — Nexa` },
          { property: "og:description", content: loaderData.business.blurb },
        ]
      : [{ title: "Business — Nexa" }, { name: "robots", content: "noindex" }],
  }),
  component: Business,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="text-center max-w-md">
        <div className="font-display text-7xl mb-4">404</div>
        <p className="text-muted-foreground mb-8">This business isn&rsquo;t in Nexa yet.</p>
        <Link to="/discover" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 h-12 text-sm font-medium">
          Browse businesses →
        </Link>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  warm: "from-[oklch(0.4_0.08_45)] via-[oklch(0.25_0.05_40)] to-[oklch(0.14_0.02_60)]",
  cool: "from-[oklch(0.3_0.07_230)] via-[oklch(0.2_0.04_220)] to-[oklch(0.13_0.02_240)]",
  ember: "from-[oklch(0.35_0.14_25)] via-[oklch(0.22_0.09_30)] to-[oklch(0.14_0.03_40)]",
  sand: "from-[oklch(0.4_0.04_80)] via-[oklch(0.28_0.03_75)] to-[oklch(0.15_0.01_80)]",
};

/* ── FAQS ── */
const FAQS = [
  { q: "How do I book?", a: "Tap any available time slot and confirm with Nexa Pay. No cards required upfront — escrow holds funds until the service is complete." },
  { q: "What if I need to cancel?", a: "Cancel up to 2 hours before and receive a full refund to your Nexa Wallet. Within 2 hours, the business keeps 50%." },
  { q: "Is this business verified?", a: "Yes. We've verified their business registration, identity documents, insurance, and work history. The Trust Score updates in real time." },
  { q: "Can I see work samples?", a: "Scroll up to the Before & After section. All images are AI-verified originals, not stock photography." },
];

/* ── REVIEWS ── */
const REVIEWS = [
  { initials: "EK", name: "Emma K.", service: "Signature cut & finish", date: "3 days ago", quote: "Honestly the best haircut I've had in years. The studio is so calm and the attention to detail is remarkable. Already booked again." },
  { initials: "ML", name: "Marco L.", service: "Full color session", date: "1 week ago", quote: "Incredibly precise. They matched my reference photos perfectly and explained every step. Nexa made the whole experience seamless." },
  { initials: "ST", name: "Sophia T.", service: "Balayage refresh", date: "2 weeks ago", quote: "The result speaks for itself — natural, lived-in, and exactly what I asked for. The booking and payment through Nexa was effortless." },
];

function Business() {
  const { business: b, slug } = Route.useLoaderData();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.4, 0.9]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const gradient = TONES[b.tone] ?? TONES.warm;

  // Related: pick 3 other businesses
  const related = Object.entries(DATA)
    .filter(([k]) => k !== slug)
    .slice(0, 3)
    .map(([k, v]) => ({ slug: k, name: v.name, tag: v.tag, trust: v.trust, tone: v.tone }));

  return (
    <div className="pb-32">
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-[92vh] overflow-hidden bg-black">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <img src={b.image || "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2000&auto=format&fit=crop"} alt={b.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-multiply opacity-60`} />
          <div className="absolute inset-0 grain-overlay opacity-30" />
        </motion.div>
        <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Back link */}
        <div className="absolute top-24 left-6 md:left-10 z-10">
          <Link to="/discover" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            ← Discover
          </Link>
        </div>

        <div className="relative h-full mx-auto max-w-[1440px] px-6 md:px-10 pt-32 pb-10 flex flex-col justify-end text-white">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-xs uppercase tracking-[0.18em] opacity-80">
            {b.tag} · {b.city}
          </motion.div>
          <div className="mt-4 overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }} animate={{ y: 0 }}
              transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
              className="font-display text-5xl md:text-[9vw] leading-[0.92]"
            >
              {b.name}
            </motion.h1>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="rounded-full bg-white/15 backdrop-blur px-4 h-10 inline-flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Open now
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="rounded-full bg-white/15 backdrop-blur px-4 h-10 inline-flex items-center gap-2 text-sm">
              Trust {b.trust}/100
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
              className="rounded-full bg-white/15 backdrop-blur px-4 h-10 inline-flex items-center gap-2 text-sm">
              {b.response} response
            </motion.span>
            <MagneticButton>
              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
                className="rounded-full bg-white text-black px-6 h-12 text-sm font-medium hover:scale-105 transition-transform"
              >
                Book instantly
              </motion.button>
            </MagneticButton>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs uppercase tracking-[0.2em]"
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          scroll
        </motion.div>
      </section>

      {/* ── STATS RIBBON ── */}
      <section className="relative border-y border-hairline bg-background">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ["Trust score", b.trust.toString(), "Verified · 3 yrs"],
            ["Response", b.response, "Median this week"],
            ["Completed jobs", b.jobs.toLocaleString(), "All time"],
            ["Return rate", `${b.retention}%`, "Within 60 days"],
          ].map(([l, v, f], i) => (
            <Reveal key={l} delay={i * 0.08}>
              <div>
                <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{l}</div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="font-display text-5xl md:text-6xl mt-2 tabular-nums"
                >{v}</motion.div>
                <div className="text-xs text-muted-foreground mt-1">{f}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-7">
          <Kicker>About</Kicker>
          <Reveal delay={0.05}>
            <p className="mt-6 font-display text-3xl md:text-5xl leading-[1.05]">{b.blurb}</p>
          </Reveal>
        </div>
        <div className="md:col-span-5">
          <Reveal delay={0.1}>
            <div className="surface-card p-6 md:p-8">
              <div className="text-xs uppercase tracking-[0.14em] text-primary mb-1">✦ Nexa AI summary</div>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Consistently high demand on Tuesday and Friday evenings. Clients wait an average of 40 seconds between arrival and service start. {b.retention}% rebook within 8 weeks — well above the neighborhood average of 41%.
              </p>
              <div className="mt-6 flex gap-2 flex-wrap text-xs">
                {(b.tags ?? []).map((t) => (
                  <span key={t} className="rounded-full hairline px-3 h-7 inline-flex items-center text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Live signals */}
          <Reveal delay={0.2} className="mt-4">
            <div className="surface-card p-5 space-y-3">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Live signals</div>
              {[
                { icon: "🟢", label: "Last booking", value: "8 min ago" },
                { icon: "💬", label: "Currently responding", value: "Active" },
                { icon: "✅", label: "Open disputes", value: "None" },
                { icon: "📸", label: "Photo verified", value: "Today" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">{s.icon} {s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TRUST SCORE BREAKDOWN ── */}
      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Kicker>The Nexa Trust Score</Kicker>
            <Reveal delay={0.05}>
              <h2 className="font-display text-5xl md:text-7xl mt-5 mb-6">{b.trust}<span className="text-muted-foreground">/100</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We don't use 5-star reviews. This score is generated from real operational data, verified identity, and on-platform transaction history.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Identity & Registration", val: "Verified", desc: "Government ID and business license checked by Nexa." },
                { label: "Completed Jobs", val: b.jobs.toLocaleString(), desc: "Total transactions processed successfully on platform." },
                { label: "Response Speed", val: b.response, desc: "Median time to reply to inquiries this week." },
                { label: "Cancellation Rate", val: "< 1%", desc: "Business-initiated cancellations in the last 90 days." },
                { label: "Return Rate", val: `${b.retention}%`, desc: "Customers who booked again within 60 days." },
                { label: "Dispute History", val: "0", desc: "Unresolved payment or service disputes." },
              ].map((t, i) => (
                <Reveal key={t.label} delay={0.1 + i * 0.05}>
                  <div className="surface-card p-5 h-full border border-hairline hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-medium text-sm">{t.label}</div>
                      <div className="text-primary font-display text-lg">{t.val}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
          <Kicker>Services</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl">Every price,<br />in plain view.</h2></Reveal>
          <div className="mt-14 divide-y divide-hairline">
            {b.services.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.07, ease: [0.19, 1, 0.22, 1] }}
                className="group grid grid-cols-12 items-center py-6 md:py-8 gap-4 halo cursor-pointer"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
              >
                <div className="col-span-1 font-mono text-xs text-muted-foreground tabular-nums">0{i + 1}</div>
                <div className="col-span-6 font-display text-2xl md:text-4xl">{s.name}</div>
                <div className="col-span-2 text-sm text-muted-foreground">{s.dur}</div>
                <div className="col-span-2 font-display text-2xl md:text-3xl tabular-nums">{s.price}</div>
                <div className="col-span-1 text-right">
                  <motion.span whileHover={{ x: 6 }} className="inline-block text-muted-foreground group-hover:text-foreground transition-colors">→</motion.span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVAILABILITY ── */}
      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Kicker>Availability</Kicker>
            <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl">Book<br />in one tap.</h2></Reveal>
            <p className="mt-6 text-muted-foreground max-w-sm">Confirmation, escrow, receipts, and warranty — all inside Nexa. Pay only when service is complete.</p>
          </div>
          <div className="md:col-span-7">
            <div className="surface-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs text-muted-foreground">Next available</div>
                <div className="text-xs text-muted-foreground font-mono">this week</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {b.slots.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedSlot(s)}
                    className={`rounded-2xl h-16 text-left px-4 transition-all ${
                      selectedSlot === s
                        ? "bg-primary text-primary-foreground"
                        : i === 0
                        ? "bg-foreground text-background"
                        : "bg-card hairline hover:bg-foreground/5"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em] opacity-70">Slot</div>
                    <div className="font-display text-xl mt-0.5">{s}</div>
                  </motion.button>
                ))}
              </div>
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-primary">{b.services[0]?.name}</div>
                  <div className="font-display text-3xl mt-1">{b.services[0]?.price}</div>
                  {selectedSlot && <div className="text-xs text-muted-foreground mt-1">Selected: {selectedSlot}</div>}
                </div>
                <Link to="/payments" className="rounded-full bg-primary text-primary-foreground px-6 h-12 text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                  Book & pay
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
          <Kicker>Business timeline</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl">Every action,<br />visible.</h2></Reveal>
          <div className="mt-14 relative pl-8 md:pl-16">
            <motion.div
              initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
              style={{ transformOrigin: "top" }}
              className="absolute left-2 md:left-6 top-2 bottom-2 w-px bg-hairline"
            />
            {b.timeline.map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.15, ease: [0.19, 1, 0.22, 1] }}
                className="relative py-6"
              >
                <span className="absolute -left-8 md:-left-16 top-8 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="text-xs text-muted-foreground font-mono">{it.t}</div>
                <div className="mt-1 font-display text-2xl md:text-3xl">{it.e}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE & AFTER ── */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
          <Kicker>Portfolio</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl">Before & after.<br /><span className="text-muted-foreground">Real results.</span></h2></Reveal>
          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <Reveal key={n} delay={n * 0.1}>
                <div className="surface-card overflow-hidden">
                  <div className="grid grid-cols-2 h-[260px] relative">
                    <div className="relative bg-foreground/5 flex flex-col justify-end p-5 group">
                      <div className="absolute inset-0 grain-overlay" />
                      <span className="relative text-xs uppercase tracking-widest text-muted-foreground">Before</span>
                    </div>
                    <div className={`relative flex flex-col justify-end p-5 bg-gradient-to-br ${TONES[b.tone]}`}>
                      <div className="absolute inset-0 grain-overlay" />
                      <span className="relative text-xs uppercase tracking-widest text-primary">After</span>
                    </div>
                    {/* Divider line */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/30 z-10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass z-10 grid place-items-center text-xs text-white">⟷</div>
                  </div>
                  <div className="p-5 border-t border-hairline flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Client result #{n}</span>
                    <span className="text-xs text-primary">AI-verified original</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
          <Kicker>Reviews</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl">What clients say.</h2></Reveal>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.1}>
                <div className="surface-card p-6 md:p-8 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center text-primary font-display shrink-0">
                      {r.initials}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.service} · {r.date}</div>
                    </div>
                    <div className="ml-auto text-amber-400 text-xs">★★★★★</div>
                  </div>
                  <p className="text-[15px] leading-relaxed text-muted-foreground flex-1">"{r.quote}"</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32 max-w-3xl">
          <Kicker>FAQ</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl mb-14">Common questions.</h2></Reveal>
          <div className="divide-y divide-hairline">
            {FAQS.map((faq, i) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-6 flex items-center justify-between gap-4 group"
                >
                  <span className="font-display text-xl md:text-2xl group-hover:text-primary transition-colors">{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} className="text-2xl text-muted-foreground shrink-0">+</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATED ── */}
      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
          <Kicker>Also on Nexa</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl mb-14">Similar businesses.</h2></Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {related.map((r, i) => {
              const bg: Record<string, string> = {
                warm: "from-[oklch(0.85_0.06_60)] to-[oklch(0.93_0.02_75)]",
                cool: "from-[oklch(0.82_0.05_230)] to-[oklch(0.93_0.02_230)]",
                ember: "from-[oklch(0.7_0.15_35)] to-[oklch(0.87_0.06_50)]",
                sand: "from-[oklch(0.9_0.03_85)] to-[oklch(0.96_0.01_85)]",
              };
              return (
                <Reveal key={r.slug} delay={i * 0.1}>
                  <Link to="/business/$slug" params={{ slug: r.slug }} className="block group">
                    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      className={`relative rounded-3xl overflow-hidden aspect-[4/5] bg-gradient-to-br ${bg[r.tone]}`}>
                      <div className="absolute inset-0 grain-overlay" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{r.tag}</div>
                        <div className="font-display text-2xl">{r.name}</div>
                        <div className="text-sm opacity-80 mt-1">Trust {r.trust}/100</div>
                      </div>
                    </motion.div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
