import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Slim amber progress line that sweeps across the top of the viewport
 * while a route navigation or its loader is in flight. Purely cosmetic —
 * gives the app the "always responsive" feel of a fast native client.
 */
export function RouteProgress() {
  const status = useRouterState({ select: (s) => s.status });
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "pending") {
      if (timeout.current) clearTimeout(timeout.current);
      // Small delay so instant navigations don't flash the bar.
      timeout.current = setTimeout(() => setVisible(true), 120);
    } else {
      if (timeout.current) clearTimeout(timeout.current);
      setVisible(false);
    }
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [status]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="bar"
            className="h-full bg-beacon-amber shadow-[0_0_10px_rgba(242,160,61,0.7)]"
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "78%", opacity: 1 }}
            exit={{ width: "100%", opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
