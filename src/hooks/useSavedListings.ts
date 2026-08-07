import { useEffect, useState } from "react";

const STORAGE_KEY = "nexa-saved-listings";

export function useSavedListings() {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids = JSON.parse(raw) as string[];
        setSaved(new Set(ids));
      }
    } catch {
      setSaved(new Set());
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(saved)));
  }, [saved]);

  const toggle = (id: string) => {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isSaved = (id: string) => saved.has(id);

  return { isSaved, toggle };
}
