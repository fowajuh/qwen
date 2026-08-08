import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import {
  User, Bell, Shield, CreditCard, Globe, Palette, Trash2,
  ChevronRight, Camera, Check, ExternalLink, Moon, Sun,
  Smartphone, Mail, Key, Download, LogOut
} from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [{ title: "Business Settings — Nexa" }],
  }),
  component: DashboardSettings,
});

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${value ? "bg-primary" : "bg-foreground/20"}`}
      role="switch"
      aria-checked={value}
    >
      <motion.div
        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

const NAV_ITEMS = [
  { id: "profile", icon: <User size={18} />, label: "Business Profile" },
  { id: "notifications", icon: <Bell size={18} />, label: "Notifications" },
  { id: "security", icon: <Shield size={18} />, label: "Security" },
  { id: "billing", icon: <CreditCard size={18} />, label: "Billing" },
  { id: "integrations", icon: <Globe size={18} />, label: "Integrations" },
  { id: "appearance", icon: <Palette size={18} />, label: "Appearance" },
];

function DashboardSettings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    newBooking: true,
    cancelation: true,
    aiActions: true,
    weeklyReport: true,
    marketing: false,
    smsAlerts: true,
  });
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (k: keyof typeof notifPrefs) => (v: boolean) =>
    setNotifPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        <Reveal>
          <Kicker>Business</Kicker>
          <KineticHeading text="Settings." className="text-4xl md:text-6xl mt-3 mb-10" />
        </Reveal>

        <div className="flex flex-col md:flex-row gap-8">
          {/* ── SIDEBAR NAV ── */}
          <aside className="md:w-60 shrink-0">
            <nav className="surface-card p-2 overflow-hidden">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                  }`}
                >
                  <span className={activeSection === item.id ? "text-primary" : "text-muted-foreground"}>
                    {item.icon}
                  </span>
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div layoutId="settingsNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
              <div className="border-t border-hairline mt-2 pt-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors">
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            </nav>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeSection === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <div className="surface-card p-6 md:p-8 mb-6">
                    <h2 className="font-display text-2xl font-semibold mb-6">Business Profile</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-5 mb-8 pb-8 border-b border-hairline">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-3xl relative shrink-0">
                        K
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center border-2 border-background hover:scale-110 transition-transform">
                          <Camera size={12} />
                        </button>
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Kori Hair Studio</div>
                        <div className="text-sm text-muted-foreground">JPG, GIF or PNG. Max 2MB</div>
                        <button className="text-sm font-semibold text-primary mt-2 hover:underline">Update photo</button>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: "Business Name", value: "Kori Hair Studio", type: "text" },
                        { label: "Handle", value: "@korihair", type: "text" },
                        { label: "Category", value: "Hair Salon", type: "select" },
                        { label: "Phone", value: "+1 (718) 555-0182", type: "tel" },
                        { label: "Email", value: "hello@korihair.com", type: "email" },
                        { label: "Website", value: "korihair.com", type: "text" },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{f.label}</label>
                          {f.type === "select" ? (
                            <select className="w-full bg-foreground/[0.03] border border-hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all appearance-none">
                              <option>Hair Salon</option>
                              <option>Barbershop</option>
                              <option>Cafe</option>
                            </select>
                          ) : (
                            <input
                              type={f.type}
                              defaultValue={f.value}
                              className="w-full bg-foreground/[0.03] border border-hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                          )}
                        </div>
                      ))}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bio</label>
                        <textarea
                          defaultValue="Editorial cuts & warm tones. Family-owned since 2018."
                          rows={3}
                          className="w-full bg-foreground/[0.03] border border-hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all resize-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Address</label>
                        <input
                          type="text"
                          defaultValue="123 Bedford Ave, Williamsburg, Brooklyn NY 11211"
                          className="w-full bg-foreground/[0.03] border border-hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button className="px-6 py-3 rounded-full border border-hairline font-semibold text-sm hover:bg-surface transition-colors">Cancel</button>
                    <button
                      onClick={handleSave}
                      className={`px-8 py-3 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                        saved ? "bg-green-500 text-white" : "bg-foreground text-background hover:scale-105"
                      }`}
                    >
                      {saved ? <><Check size={16} /> Saved!</> : "Save Changes"}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeSection === "notifications" && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <div className="surface-card overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-hairline">
                      <h2 className="font-display text-2xl font-semibold">Notification Preferences</h2>
                      <p className="text-muted-foreground text-sm mt-1">Control exactly what Nexa alerts you about.</p>
                    </div>
                    <div className="divide-y divide-hairline">
                      {[
                        { key: "newBooking", label: "New Bookings", desc: "Get notified every time a booking is confirmed." },
                        { key: "cancelation", label: "Cancellations", desc: "Alert when a customer cancels or reschedules." },
                        { key: "aiActions", label: "AI Activity", desc: "Summary of actions your AI employee took." },
                        { key: "weeklyReport", label: "Weekly Business Report", desc: "AI-generated report every Monday morning." },
                        { key: "marketing", label: "Marketing Tips", desc: "Occasional tips on growing your business." },
                        { key: "smsAlerts", label: "SMS Alerts", desc: "Critical alerts via text message." },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-4 p-6">
                          <div>
                            <div className="font-semibold text-sm">{item.label}</div>
                            <div className="text-sm text-muted-foreground mt-0.5">{item.desc}</div>
                          </div>
                          <Toggle value={(notifPrefs as any)[item.key]} onChange={set(item.key as keyof typeof notifPrefs)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "security" && (
                <motion.div key="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <div className="surface-card divide-y divide-hairline overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-hairline">
                      <h2 className="font-display text-2xl font-semibold">Security</h2>
                      <p className="text-muted-foreground text-sm mt-1">Manage your password, 2FA, and active sessions.</p>
                    </div>
                    {[
                      { icon: <Key size={18} />, label: "Change Password", desc: "Last changed 3 months ago" },
                      { icon: <Smartphone size={18} />, label: "Two-Factor Authentication", desc: "Enabled via Authenticator App", badge: "Enabled" },
                      { icon: <Mail size={18} />, label: "Recovery Email", desc: "hello@korihair.com (verified)" },
                      { icon: <Download size={18} />, label: "Download Account Data", desc: "Export all your business data in JSON format" },
                    ].map((item) => (
                      <button key={item.label} className="w-full flex items-center gap-4 p-5 hover:bg-foreground/[0.02] transition-colors text-left group">
                        <div className="w-9 h-9 rounded-xl bg-foreground/[0.06] flex items-center justify-center text-muted-foreground shrink-0">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                        </div>
                        {(item as any).badge && (
                          <span className="bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{(item as any).badge}</span>
                        )}
                        <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>

                  <div className="surface-card p-6 border-red-500/20 bg-red-500/[0.02]">
                    <h3 className="font-semibold text-red-500 mb-4 text-sm uppercase tracking-wider">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="flex items-center gap-2 text-red-500 font-semibold text-sm hover:underline">
                      <Trash2 size={16} /> Delete Business Account
                    </button>
                  </div>
                </motion.div>
              )}

              {activeSection === "billing" && (
                <motion.div key="billing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <div className="surface-card p-6 md:p-8 mb-6">
                    <h2 className="font-display text-2xl font-semibold mb-6">Billing</h2>
                    <p className="text-muted-foreground mb-6">Manage your plan, payment methods, and invoices from the dedicated billing page.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/membership/billing">
                        <button className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform">
                          <CreditCard size={16} /> Manage Billing
                        </button>
                      </Link>
                      <Link to="/membership/upgrade">
                        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                          Upgrade Plan
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "integrations" && (
                <motion.div key="integrations" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <div className="surface-card overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-hairline">
                      <h2 className="font-display text-2xl font-semibold">Integrations</h2>
                      <p className="text-muted-foreground text-sm mt-1">Connect Nexa to the tools you already use.</p>
                    </div>
                    <div className="divide-y divide-hairline">
                      {[
                        { name: "Google Calendar", desc: "Sync bookings to your Google Calendar automatically.", connected: true },
                        { name: "Instagram", desc: "Post AI-generated content directly to Instagram.", connected: true },
                        { name: "Stripe", desc: "Accept payments and manage payouts.", connected: false },
                        { name: "Square", desc: "Sync with your Square POS system.", connected: false },
                        { name: "Mailchimp", desc: "Sync customer list for email marketing.", connected: false },
                        { name: "Zapier", desc: "Connect Nexa to 5,000+ apps with no code.", connected: false },
                      ].map((int) => (
                        <div key={int.name} className="flex items-center justify-between gap-4 p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] flex items-center justify-center font-display font-bold text-sm shrink-0">
                              {int.name[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{int.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{int.desc}</div>
                            </div>
                          </div>
                          <button
                            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                              int.connected
                                ? "bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-600"
                                : "bg-foreground/5 text-foreground hover:bg-primary/10 hover:text-primary"
                            }`}
                          >
                            {int.connected ? "Connected" : "Connect"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "appearance" && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <div className="surface-card p-6 md:p-8">
                    <h2 className="font-display text-2xl font-semibold mb-6">Appearance</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold mb-4">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "light", label: "Light", icon: <Sun size={20} /> },
                            { id: "dark", label: "Dark", icon: <Moon size={20} /> },
                            { id: "system", label: "System", icon: <Smartphone size={20} /> },
                          ].map((t) => (
                            <button key={t.id} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${t.id === "light" ? "border-primary bg-primary/5" : "border-hairline hover:border-foreground/20"}`}>
                              {t.icon}
                              <span className="text-sm font-medium">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-hairline pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-sm">Reduce motion</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Minimise animations and transitions</div>
                          </div>
                          <Toggle value={false} onChange={() => {}} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
