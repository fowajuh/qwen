/**
 * Premium Illustration Components for Billion-Dollar App Feel
 * Emotion-based illustration system using CSS + SVG + Motion
 */

import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";

// ============================================================================
// ONBOARDING ILLUSTRATIONS
// ============================================================================

export function WelcomeIllustration(props: HTMLMotionProps<"svg">) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id="welcomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Animated circles */}
      <motion.circle
        cx="200"
        cy="200"
        r="150"
        fill="url(#welcomeGrad)"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.circle
        cx="200"
        cy="200"
        r="100"
        fill="url(#welcomeGrad)"
        animate={{ scale: [1.05, 1, 1.05], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Central icon - abstract person discovering */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <circle cx="200" cy="180" r="40" fill="oklch(0.6 0.2 260)" opacity="0.9" />
        <ellipse cx="200" cy="240" rx="60" ry="30" fill="oklch(0.5 0.2 280)" opacity="0.8" />
        
        {/* Discovery sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            cx={200 + Math.cos(i * Math.PI / 3) * 90}
            cy={180 + Math.sin(i * Math.PI / 3) * 90}
            r="4"
            fill="#fbbf24"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </motion.g>
      
      {/* Floating elements */}
      <motion.path
        d="M120 140 Q140 120 160 140 T200 140"
        stroke="oklch(0.7 0.15 260)"
        strokeWidth="2"
        fill="none"
        animate={{ d: "M120 140 Q140 120 160 140 T200 140", opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.svg>
  );
}

export function DiscoverIllustration(props: HTMLMotionProps<"svg">) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="discoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Map background */}
      <motion.rect
        x="50"
        y="50"
        width="300"
        height="300"
        rx="20"
        fill="url(#discoverGrad)"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      
      {/* Map grid lines */}
      {[...Array(5)].map((_, i) => (
        <g key={i}>
          <line
            x1={80 + i * 60}
            y1="80"
            x2={80 + i * 60}
            y2="320"
            stroke="oklch(0.7 0.1 35)"
            strokeWidth="1"
            opacity="0.3"
          />
          <line
            x1="80"
            y1={80 + i * 60}
            x2="320"
            y2={80 + i * 60}
            stroke="oklch(0.7 0.1 35)"
            strokeWidth="1"
            opacity="0.3"
          />
        </g>
      ))}
      
      {/* Location pins */}
      {[...Array(5)].map((_, i) => {
        const x = 120 + (i % 3) * 80;
        const y = 120 + Math.floor(i / 3) * 100;
        return (
          <motion.g
            key={i}
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15, type: "spring", stiffness: 200 }}
          >
            <path
              d={`M${x} ${y - 15} Q${x + 12} ${y - 3} ${x} ${y + 12} Q${x - 12} ${y - 3} ${x} ${y - 15}`}
              fill="oklch(0.65 0.22 35)"
              opacity="0.9"
            />
            <circle cx={x} cy={y - 3} r="5" fill="white" />
            
            {/* Pulse effect */}
            <motion.circle
              cx={x}
              cy={y - 3}
              r="12"
              fill="oklch(0.65 0.22 35)"
              opacity="0.3"
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          </motion.g>
        );
      })}
      
      {/* Central magnifying glass */}
      <motion.g
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <circle cx="200" cy="200" r="50" stroke="oklch(0.6 0.2 260)" strokeWidth="4" fill="none" />
        <line x1="235" y1="235" x2="270" y2="270" stroke="oklch(0.6 0.2 260)" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
    </motion.svg>
  );
}

export function ConnectIllustration(props: HTMLMotionProps<"svg">) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="connectGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Background network */}
      <motion.rect
        x="50"
        y="50"
        width="300"
        height="300"
        rx="20"
        fill="url(#connectGrad)"
      />
      
      {/* Network nodes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = 200 + Math.cos(angle) * 100;
        const y = 200 + Math.sin(angle) * 100;
        return (
          <motion.g key={i}>
            <motion.circle
              cx={x}
              cy={y}
              r="12"
              fill={`oklch(0.6 ${0.15 + (i % 3) * 0.05} ${260 + i * 20})`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
            />
            
            {/* Connection lines */}
            {i > 0 && (
              <motion.line
                x1={200 + Math.cos(((i - 1) / 8) * Math.PI * 2) * 100}
                y1={200 + Math.sin(((i - 1) / 8) * Math.PI * 2) * 100}
                x2={x}
                y2={y}
                stroke="oklch(0.7 0.1 260)"
                strokeWidth="2"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              />
            )}
          </motion.g>
        );
      })}
      
      {/* Central hub */}
      <motion.circle
        cx="200"
        cy="200"
        r="30"
        fill="oklch(0.6 0.2 260)"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      {/* Message bubbles */}
      {[...Array(3)].map((_, i) => (
        <motion.g
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 + i * 0.2 }}
        >
          <rect
            x={140 + i * 60}
            y={280 + (i % 2) * 20}
            width="40"
            height="25"
            rx="12"
            fill="white"
            opacity="0.9"
          />
          <motion.circle
            cx={150 + i * 60}
            cy={292 + (i % 2) * 20}
            r="3"
            fill="oklch(0.6 0.2 260)"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
          />
        </motion.g>
      ))}
    </motion.svg>
  );
}

export function GrowIllustration(props: HTMLMotionProps<"svg">) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="growGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      <motion.rect
        x="50"
        y="50"
        width="300"
        height="300"
        rx="20"
        fill="url(#growGrad)"
      />
      
      {/* Growth chart */}
      <motion.path
        d="M100 300 L100 100 L300 100"
        stroke="oklch(0.7 0.15 150)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      />
      
      {/* Growing line */}
      <motion.path
        d="M100 280 Q150 250 180 200 T260 120"
        stroke="oklch(0.6 0.2 150)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 1.2 }}
      />
      
      {/* Data points */}
      {[
        { x: 100, y: 280, delay: 0.6 },
        { x: 150, y: 250, delay: 0.8 },
        { x: 180, y: 200, delay: 1 },
        { x: 260, y: 120, delay: 1.2 },
      ].map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="8"
          fill="oklch(0.6 0.2 150)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: point.delay, type: "spring", stiffness: 200 }}
        />
      ))}
      
      {/* Rising arrow */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <path
          d="M260 120 L280 100 M280 100 L260 80"
          stroke="oklch(0.6 0.2 150)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      
      {/* Floating coins/icons */}
      {[...Array(5)].map((_, i) => (
        <motion.circle
          key={i}
          cx={120 + i * 45}
          cy={140 + (i % 2) * 30}
          r="6"
          fill="#fbbf24"
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </motion.svg>
  );
}

export function TrustIllustration(props: HTMLMotionProps<"svg">) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      <motion.rect
        x="50"
        y="50"
        width="300"
        height="300"
        rx="20"
        fill="url(#trustGrad)"
      />
      
      {/* Shield base */}
      <motion.path
        d="M200 100 L280 130 V220 C280 280 200 320 200 320 C200 320 120 280 120 220 V130 L200 100Z"
        fill="oklch(0.6 0.2 220)"
        opacity="0.9"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.9 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      />
      
      {/* Check mark */}
      <motion.path
        d="M160 200 L195 235 L250 165"
        stroke="white"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
      
      {/* Verification badges */}
      {[...Array(4)].map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = 200 + Math.cos(angle) * 140;
        const y = 200 + Math.sin(angle) * 140;
        return (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.15, type: "spring", stiffness: 200 }}
          >
            <circle cx={x} cy={y} r="18" fill="white" opacity="0.95" />
            <path
              d={`M${x - 6} ${y} L${x} ${y + 6} L${x + 8} ${y - 8}`}
              stroke="oklch(0.6 0.2 150)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </motion.g>
        );
      })}
      
      {/* Sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.circle
          key={i}
          cx={200 + Math.cos(i * Math.PI / 3) * 110}
          cy={200 + Math.sin(i * Math.PI / 3) * 110}
          r="3"
          fill="#fbbf24"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// EMPTY STATE ILLUSTRATIONS
// ============================================================================

export function EmptyMessagesIllustration(props: HTMLMotionProps<"svg">) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.rect
        x="40"
        y="40"
        width="120"
        height="120"
        rx="20"
        fill="oklch(0.9 0.05 260)"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <motion.line
        x1="60"
        y1="80"
        x2="140"
        y2="80"
        stroke="oklch(0.7 0.1 260)"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />
      
      <motion.line
        x1="60"
        y1="100"
        x2="120"
        y2="100"
        stroke="oklch(0.7 0.1 260)"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
      
      <motion.line
        x1="60"
        y1="120"
        x2="100"
        y2="120"
        stroke="oklch(0.7 0.1 260)"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      />
    </motion.svg>
  );
}

export function EmptySearchIllustration(props: HTMLMotionProps<"svg">) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.circle
        cx="100"
        cy="90"
        r="40"
        stroke="oklch(0.7 0.1 260)"
        strokeWidth="6"
        fill="none"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <motion.line
        x1="128"
        y1="118"
        x2="160"
        y2="150"
        stroke="oklch(0.7 0.1 260)"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      
      <motion.text
        x="100"
        y="180"
        textAnchor="middle"
        fill="oklch(0.5 0.1 260)"
        fontSize="14"
        fontWeight="500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        No results found
      </motion.text>
    </motion.svg>
  );
}

// ============================================================================
// LOADING STATES
// ============================================================================

export function LoadingDots() {
  return (
    <div className="flex gap-2 justify-center items-center">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full bg-primary"
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export function ScanningAnimation() {
  return (
    <motion.div
      className="relative w-16 h-16"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
      <motion.div
        className="absolute inset-0 border-4 border-primary rounded-full"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// Export all illustrations
export const Illustrations = {
  Onboarding: {
    Welcome: WelcomeIllustration,
    Discover: DiscoverIllustration,
    Connect: ConnectIllustration,
    Grow: GrowIllustration,
    Trust: TrustIllustration,
  },
  EmptyStates: {
    Messages: EmptyMessagesIllustration,
    Search: EmptySearchIllustration,
  },
  Loading: {
    Dots: LoadingDots,
    Scanner: ScanningAnimation,
  },
};
