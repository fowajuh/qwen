import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TravelStyle = "Shoestring" | "Comfort" | "Luxury";
export type Plan = "explorer" | "voyager" | "crew";

export const PLAN_LABEL: Record<Plan, string> = {
  explorer: "Explorer",
  voyager: "Voyager",
  crew: "Crew",
};

/** Free-tier limits that actually gate the product — not just pricing-page copy. */
export const FREE_TRIP_LIMIT = 1;
export const FREE_DISCOVER_SWIPES = 3;

type Preferences = {
  homeCurrency: string;
  language: string;
  travelStyle: TravelStyle;
  pushNotifications: boolean;
  emailNotifications: boolean;
};

type UIState = {
  theme: "light" | "dark";
  onboarded: boolean;
  commandPaletteOpen: boolean;
  preferences: Preferences;
  plan: Plan;
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  setOnboarded: (v: boolean) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setPreferences: (p: Partial<Preferences>) => void;
  setPlan: (p: Plan) => void;
};

const defaultPreferences: Preferences = {
  homeCurrency: "USD",
  language: "English (US)",
  travelStyle: "Comfort",
  pushNotifications: true,
  emailNotifications: true,
};

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "light",
      onboarded: false,
      commandPaletteOpen: false,
      preferences: defaultPreferences,
      plan: "explorer",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setPreferences: (p) => set({ preferences: { ...get().preferences, ...p } }),
      setPlan: (plan) => set({ plan }),
    }),
    { name: "globetrotter-ui" },
  ),
);