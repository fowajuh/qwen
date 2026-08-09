import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Plane } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/manifest/Sheet";
import { TrustStrip } from "@/components/manifest/TrustStrip";
import { SocialAuthButtons } from "@/components/manifest/SocialAuthButtons";
import { login, signup } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in · GlobeTrotter" }],
  }),
  component: LoginPage,
});

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("demo@globetrotter.app");
  const [password, setPassword] = useState("globetrotter-demo");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({ email, password, name });
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-departure-navy flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div
          className="ticket-stub rounded-sm"
          style={{ ["--stub-bg" as string]: "var(--cloud-white)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Plane className="w-4 h-4 text-beacon-amber" />
            <p className="num text-[10px] uppercase tracking-[0.24em] text-ink-60">
              Boarding pass · Access
            </p>
          </div>

          {/* Mode pill */}
          <div className="relative flex mt-4 mb-1 rounded-sm border border-ink-30/30 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`relative flex-1 num text-[10px] uppercase tracking-[0.18em] py-2 rounded-sm transition-colors ${
                  mode === m ? "text-cloud-white" : "text-ink-60"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="loginmodepill"
                    className="absolute inset-0 bg-departure-navy rounded-sm -z-10"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-4xl text-departure-navy leading-[0.95] mt-4">
                {mode === "login" ? "Welcome back" : "Join the manifest"}
              </h1>
              <p className="text-sm text-ink-60 mt-2">
                {mode === "login"
                  ? "Sign in to see your trips."
                  : "Create an account to start planning."}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.input
                  key="name"
                  custom={0}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, height: 0 }}
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 outline-none focus:border-beacon-amber transition-colors"
                />
              )}
            </AnimatePresence>
            <motion.input
              custom={1}
              variants={fieldVariants}
              initial="hidden"
              animate="show"
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 outline-none focus:border-beacon-amber transition-colors"
            />
            <motion.input
              custom={2}
              variants={fieldVariants}
              initial="hidden"
              animate="show"
              required
              type="password"
              minLength={8}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 outline-none focus:border-beacon-amber transition-colors"
            />

            {mode === "login" && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-ink-60 hover:text-departure-navy transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-runway-red"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={busy}
              className="w-full num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-3 rounded-sm disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-ink-30/30" />
            <span className="num text-[10px] uppercase tracking-[0.18em] text-ink-60">
              or continue with
            </span>
            <div className="h-px flex-1 bg-ink-30/30" />
          </div>

          <SocialAuthButtons />

          <div className="perforation-divider my-5" />

          <div className="flex items-center justify-between gap-3">
            <button
              className="num text-[11px] uppercase tracking-[0.18em] text-ink-60 hover:text-departure-navy transition-colors"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-cloud-white/50 text-xs mt-4">
          Demo account is pre-filled — seed it with <code>npm run prisma:seed</code> in /backend.
        </p>
        <p className="text-center text-cloud-white/40 text-xs mt-2">
          By continuing you agree to our{" "}
          <button
            onClick={() => setTermsOpen(true)}
            className="underline hover:text-cloud-white/70 transition-colors"
          >
            terms &amp; privacy
          </button>
          .
        </p>

        <TrustStrip dark className="mt-6" />

        <p className="text-center text-cloud-white/50 text-xs mt-5">
          Free to start ·{" "}
          <Link to="/pricing" className="underline hover:text-cloud-white/80 transition-colors">
            see plans &amp; pricing
          </Link>
        </p>
      </motion.div>

      <Sheet
        open={forgotOpen}
        onClose={() => {
          setForgotOpen(false);
          setResetSent(false);
          setResetEmail("");
        }}
        title="Reset password"
      >
        {resetSent ? (
          <div className="pt-2 text-center py-6">
            <span className="customs-stamp text-horizon-teal">Check your inbox</span>
            <p className="font-display text-2xl text-departure-navy mt-4">Reset link sent.</p>
            <p className="text-sm text-ink-60 mt-1">
              If an account exists for <span className="num">{resetEmail}</span>, a reset link is on
              its way.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setResetSent(true);
              toast.success("Reset link requested");
            }}
            className="space-y-4 pt-1"
          >
            <p className="text-sm text-ink-60">
              Enter the email on your account and we'll send a link to reset your password.
            </p>
            <input
              required
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 outline-none focus:border-beacon-amber"
            />
            <button
              type="submit"
              className="w-full num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-3 rounded-sm"
            >
              Send reset link
            </button>
          </form>
        )}
      </Sheet>

      <Sheet open={termsOpen} onClose={() => setTermsOpen(false)} title="Terms & privacy">
        <div className="space-y-4 pt-1 text-sm text-ink-60">
          <p>
            GlobeTrotter stores your trips, stops, and preferences so we can sync them across your
            devices and any co-travelers you invite. We don't sell your data.
          </p>
          <p>
            Recommendations are generated from the interests and budget style you set in Discover —
            you can retune or clear that signal any time from the Tune sheet.
          </p>
          <p>
            This is a demo product; treat it accordingly and avoid storing sensitive personal
            information in trip notes.
          </p>
        </div>
      </Sheet>
    </div>
  );
}
