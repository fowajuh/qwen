"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

import { cn } from "@/lib/utils";
import type { IllustrationName } from "./premium-illustration";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> & { illustration?: IllustrationName }
>(({ className, illustration, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      illustration ? "" : "bg-black/80",
      className,
    )}
    style={illustration ? {
      backgroundImage: `url(/onboarding_illustrations/office_welcome.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : undefined}
    {...props}
    ref={ref}
  >
    {illustration && (
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/50" />
    )}
  </SheetPrimitive.Overlay>
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 shadow-lg transition-all duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b rounded-b-[2rem] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t rounded-t-[2rem] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-full sm:w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-full sm:w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
      variant: {
        default: "bg-[oklch(0.08_0.02_260)]",
        illustrated: "bg-transparent",
      },
    },
    defaultVariants: {
      side: "right",
      variant: "default",
    },
  },
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  illustration?: IllustrationName;
  illustrationBg?: string;
  dragToExpand?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "bottom", variant = "default", className, illustration, illustrationBg, dragToExpand, children, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [initialHeight, setInitialHeight] = React.useState("70%");

  React.useEffect(() => {
    if (dragToExpand && contentRef.current && side === "bottom") {
      const element = contentRef.current;
      const initialH = element.offsetHeight;
      
      const handleDragEnd = (_: any, info: any) => {
        if (info.offset.y < -100 && !isExpanded) {
          setIsExpanded(true);
          animate(y, 0, { type: "spring", stiffness: 200, damping: 25 });
        } else if (info.offset.y > 100 && isExpanded) {
          setIsExpanded(false);
          animate(y, initialH - window.innerHeight * 0.7, { type: "spring", stiffness: 200, damping: 25 });
        }
      };

      element.addEventListener("dragend", handleDragEnd as any);
      return () => element.removeEventListener("dragend", handleDragEnd as any);
    }
  }, [dragToExpand, isExpanded, side, y]);

  const backgroundStyle = illustrationBg || (illustration ? `url(/onboarding_illustrations/${getIllustrationPath(illustration)})` : undefined);

  return (
    <SheetPortal>
      <SheetOverlay illustration={illustration} />
      <SheetPrimitive.Content
        ref={(node) => {
          (contentRef as any).current = node;
          if (ref) {
            if (typeof ref === "function") ref(node);
            else ref.current = node;
          }
        }}
        className={cn(
          sheetVariants({ side, variant }),
          illustration || variant === "illustrated" ? "backdrop-blur-xl" : "",
          className
        )}
        style={{
          ...(side === "bottom" && dragToExpand ? { y, height: isExpanded ? "95%" : initialHeight } : {}),
          ...(backgroundStyle ? {
            backgroundImage: backgroundStyle,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}),
        }}
        {...(side === "bottom" && dragToExpand ? {
          drag: "y",
          dragConstraints: { top: -window.innerHeight * 0.25, bottom: 0 },
          dragElastic: 0.1,
        } : {})}
        {...props}
      >
        <div className={cn(illustration || variant === "illustrated" ? "" : "")}>
          {illustration && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.02_260)] via-[oklch(0.08_0.02_260)]/95 to-transparent pointer-events-none" />
              {(side === "bottom" || side === "top") && dragToExpand && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/30 rounded-full z-50 cursor-grab active:cursor-grabbing" />
              )}
            </>
          )}
          {!variant?.includes("illustrated") && !illustration && (side === "bottom" || side === "top") && dragToExpand && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-50 cursor-grab active:cursor-grabbing" />
          )}
          <div className="relative z-10 h-full">
            {children}
          </div>
        </div>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

function getIllustrationPath(name: IllustrationName): string {
  const paths: Record<IllustrationName, string> = {
    "welcome-hero": "office_welcome.jpg",
    "role-selection": "office_planning.jpg",
    location: "office_mobile.jpg",
    interests: "notion_discover.jpg",
    success: "office_success.jpg",
    notifications: "office_secure.jpg",
    "consumer-journey": "notion_explore.jpg",
    "business-growth": "growth_chart.jpg",
    community: "community_connect.jpg",
    analytics: "office_analytics.jpg",
    "empty-state": "office_focus.jpg",
    loading: "office_collab.jpg",
    error: "office_secure.jpg",
    celebration: "office_celebration.jpg",
    discover: "notion_discover.jpg",
    explore: "notion_explore.jpg",
    planning: "office_planning.jpg",
    collab: "office_collab.jpg",
    focus: "office_focus.jpg",
    mobile: "office_mobile.jpg",
    secure: "office_secure.jpg",
    "growth-chart": "growth_chart.jpg",
    premium: "premium_badge.jpg",
    doodle: "doodle_growth.jpg",
  };
  return paths[name];
}

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
