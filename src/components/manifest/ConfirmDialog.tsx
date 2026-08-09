import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  busy?: boolean;
  icon?: ReactNode;
};

/**
 * Boarding-pass-styled confirm dialog — replaces window.confirm() everywhere.
 * Built on Radix AlertDialog for focus trap / ESC / a11y, animated with the
 * house easing so it doesn't feel like a native browser prompt.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  busy,
  icon,
}: Props) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <AlertDialogPrimitive.Portal forceMount>
            <AlertDialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[70] bg-departure-navy/60 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AlertDialogPrimitive.Overlay>
            <AlertDialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className="ticket-stub rounded-sm"
                  style={{ ["--stub-bg" as string]: "var(--cloud-white)" }}
                >
                  {icon && (
                    <div
                      className={cn(
                        "mb-3 flex h-10 w-10 items-center justify-center rounded-full",
                        tone === "danger"
                          ? "bg-runway-red/10 text-runway-red"
                          : "bg-beacon-amber/15 text-beacon-amber",
                      )}
                    >
                      {icon}
                    </div>
                  )}
                  <AlertDialogPrimitive.Title className="font-display text-2xl text-departure-navy leading-[1.05]">
                    {title}
                  </AlertDialogPrimitive.Title>
                  {description && (
                    <AlertDialogPrimitive.Description className="text-sm text-ink-60 mt-2">
                      {description}
                    </AlertDialogPrimitive.Description>
                  )}
                  <div className="perforation-divider my-5" />
                  <div className="flex items-center justify-end gap-2">
                    <AlertDialogPrimitive.Cancel asChild>
                      <button className="num text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 rounded-sm border border-ink-30/40 text-ink-60 hover:text-departure-navy hover:border-ink-30 transition-colors">
                        {cancelLabel}
                      </button>
                    </AlertDialogPrimitive.Cancel>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onConfirm();
                      }}
                      disabled={busy}
                      className={cn(
                        "num text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 rounded-sm disabled:opacity-60",
                        tone === "danger"
                          ? "bg-runway-red text-cloud-white"
                          : "bg-beacon-amber text-departure-navy",
                      )}
                    >
                      {busy ? "Working…" : confirmLabel}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AlertDialogPrimitive.Content>
          </AlertDialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </AlertDialogPrimitive.Root>
  );
}
