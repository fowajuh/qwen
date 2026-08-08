import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/* ── AUTH CONTEXT (localStorage-backed session) ── */
type User = { name: string; email: string; avatar: string };

function getStoredUser(): User | null {
  try {
    const data = localStorage.getItem("nexa-session");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(getStoredUser);

  useEffect(() => {
    const handleStorage = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("nexa-auth-change", handleStorage);
    // Also listen to real storage events for cross-tab sync
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("nexa-auth-change", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const signIn = (u: User) => {
    localStorage.setItem("nexa-session", JSON.stringify(u));
    window.dispatchEvent(new Event("nexa-auth-change"));
  };

  const signOut = () => {
    localStorage.removeItem("nexa-session");
    window.dispatchEvent(new Event("nexa-auth-change"));
  };

  return { user, signIn, signOut };
}

/* ── SOCIAL ICONS ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function NexaLogo() {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      <div className="relative w-8 h-8">
        <motion.div className="absolute inset-0 rounded-full bg-foreground" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }} />
        <div className="absolute inset-[14%] rounded-full bg-background" />
        <motion.div className="absolute inset-[36%] rounded-full bg-primary" animate={{ scale: [0.9, 1.2, 0.9] }} transition={{ duration: 2, repeat: Infinity }} />
      </div>
      <span className="font-display text-xl tracking-tight">Nexa</span>
    </div>
  );
}

/* ── AUTH MODAL ── */
export function AuthModal({ open, onClose, mode: initialMode = "signin" }: {
  open: boolean;
  onClose: () => void;
  mode?: "signin" | "signup";
}) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "magic">(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setMode(initialMode); }, [initialMode, open]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    if (mode === "magic") {
      setSent(true);
      setLoading(false);
      return;
    }
    signIn({
      name: name || email.split("@")[0],
      email,
      avatar: (name || email)[0].toUpperCase(),
    });
    setLoading(false);
    onClose();
  };

  const handleSocial = async (provider: "google" | "apple") => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    signIn({
      name: provider === "google" ? "Google User" : "Apple User",
      email: `user@${provider}.com`,
      avatar: provider === "google" ? "G" : "A",
    });
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-[400px] bg-background rounded-3xl shadow-drama border border-hairline p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              <NexaLogo />

              {sent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="font-display text-2xl mb-2">Check your inbox</div>
                  <p className="text-sm text-muted-foreground">We sent a magic link to <strong>{email}</strong>. Click it to sign in instantly.</p>
                  <button onClick={() => setSent(false)} className="mt-6 text-sm text-primary hover:opacity-80 transition-opacity">
                    Try a different email
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl text-center mb-1">
                    {mode === "signup" ? "Create your account" : "Welcome back"}
                  </h2>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    {mode === "signup" ? "Join the future of local commerce." : "Sign in to continue to Nexa."}
                  </p>

                  {/* Social buttons */}
                  <div className="flex flex-col gap-3 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={() => handleSocial("google")}
                      disabled={loading}
                      className="flex items-center justify-center gap-3 h-12 rounded-full border border-hairline bg-card hover:bg-foreground/5 transition-colors text-sm font-medium"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={() => handleSocial("apple")}
                      disabled={loading}
                      className="flex items-center justify-center gap-3 h-12 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      <AppleIcon />
                      Continue with Apple
                    </motion.button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-hairline" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-hairline" />
                  </div>

                  {/* Email form */}
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    {mode === "signup" && (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full h-12 px-4 rounded-2xl border border-hairline bg-card text-sm outline-none focus:border-primary/50 transition-colors"
                      />
                    )}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full h-12 px-4 rounded-2xl border border-hairline bg-card text-sm outline-none focus:border-primary/50 transition-colors"
                    />
                    {mode !== "magic" && (
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full h-12 px-4 rounded-2xl border border-hairline bg-card text-sm outline-none focus:border-primary/50 transition-colors"
                      />
                    )}

                    {error && <p className="text-xs text-red-500 px-1">{error}</p>}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full h-12 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        mode === "signup" ? "Create account" : mode === "magic" ? "Send magic link" : "Sign in"
                      )}
                    </motion.button>
                  </form>

                  {/* Toggle mode links */}
                  <div className="mt-4 flex flex-col items-center gap-2">
                    {mode === "signin" && (
                      <button
                        onClick={() => setMode("magic")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sign in with magic link →
                      </button>
                    )}
                    {mode === "magic" && (
                      <button
                        onClick={() => setMode("signin")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Use password instead
                      </button>
                    )}
                    <button
                      onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {mode === "signup" ? "Already have an account? Sign in" : "New to Nexa? Create account"}
                    </button>
                  </div>

                  {/* Legal */}
                  <p className="mt-5 text-[10px] text-muted-foreground text-center leading-relaxed">
                    By continuing, you agree to Nexa's{" "}
                    <Link to="/" className="underline hover:text-foreground">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/" className="underline hover:text-foreground">Privacy Policy</Link>.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── USER AVATAR BUTTON (for TopNav) ── */
export function UserButton({ onSignIn }: { onSignIn: () => void }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors px-3 h-9"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-medium grid place-items-center hover:opacity-90 transition-opacity"
      >
        {user.avatar}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-background border border-hairline rounded-2xl shadow-drama z-50 p-2"
            >
              <div className="px-3 py-2 border-b border-hairline mb-2">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              {[
                { label: "My Bookings", to: "/payments" },
                { label: "Wallet", to: "/wallet" },
                { label: "Dashboard", to: "/dashboard" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-2 rounded-xl text-sm hover:bg-foreground/5 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-hairline mt-2 pt-2">
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="w-full flex items-center px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
