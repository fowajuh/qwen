import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Kicker, MagneticButton } from "@/components/app-shell";

export const Route = createFileRoute("/manifesto")({
  head: () => ({
    meta: [
      { title: "Manifesto — Nexa" },
      { name: "description", content: "The user never searches. They describe. Nexa understands. Nexa books. Nexa pays." },
    ],
  }),
  component: Manifesto,
});

const LINES = [
  ["The user never searches.", "They describe."],
  ["Nexa understands.", "Nexa compares."],
  ["Nexa explains.", "Nexa books."],
  ["Nexa pays.", "Nexa follows up."],
  ["Every interaction feels", "inevitable."],
  ["Every transition feels", "alive."],
  ["Every screen feels", "crafted."],
];

function Manifesto() {
  return (
    <div className="pt-32 pb-40">
      <section className="mx-auto max-w-[1200px] px-6 md:px-10">
        <Kicker>The Nexa manifesto</Kicker>

        <div className="mt-20 space-y-6 md:space-y-10">
          {LINES.map(([a, b], i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: i * 0.08, ease: [0.19, 1, 0.22, 1] }}
              className="font-display text-4xl md:text-7xl leading-[1.02]"
            >
              {a}{" "}
              <span className="text-muted-foreground">{b}</span>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
            className="pt-16 font-display text-5xl md:text-8xl leading-[1] text-primary"
          >
            Open Nexa.
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-24 flex gap-4"
        >
          <MagneticButton>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 h-12 text-sm font-medium">
              Enter Nexa
            </Link>
          </MagneticButton>
          <Link to="/discover" className="link-underline text-muted-foreground hover:text-foreground text-sm inline-flex items-center h-12">
            Or begin discovering →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
