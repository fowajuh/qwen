import { motion } from "framer-motion";
import { Star, MessageSquare, MapPin, DollarSign, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewRadarChartProps {
  scores: {
    cleanliness: number;
    communication: number;
    location: number;
    value: number;
    accuracy: number;
  };
  size?: "sm" | "md" | "lg";
}

export function ReviewRadarChart({ scores, size = "md" }: ReviewRadarChartProps) {
  const dimensions = {
    sm: { width: 120, height: 120, center: 60, radius: 45 },
    md: { width: 200, height: 200, center: 100, radius: 75 },
    lg: { width: 280, height: 280, center: 140, radius: 110 },
  };

  const { width, height, center, radius } = dimensions[size];

  // Calculate points for the radar chart
  const categories = [
    { key: "cleanliness", label: "Cleanliness", icon: CheckCircle },
    { key: "communication", label: "Communication", icon: MessageSquare },
    { key: "location", label: "Location", icon: MapPin },
    { key: "value", label: "Value", icon: DollarSign },
    { key: "accuracy", label: "Accuracy", icon: Star },
  ];

  const angleStep = (Math.PI * 2) / categories.length;

  const getPoint = (index: number, score: number, offsetMultiplier = 1) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (score / 5) * radius * offsetMultiplier;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate path for the filled area
  const filledPath = categories
    .map((_, i) => {
      const score = scores[categories[i].key as keyof typeof scores];
      const point = getPoint(i, score);
      return `${i === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ") + " Z";

  // Generate outer grid polygons
  const grids = [1, 2, 3, 4, 5].map((level) =>
    categories
      .map((_, i) => {
        const point = getPoint(i, level);
        return `${i === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );

  return (
    <div className="relative">
      <svg width={width} height={height} className="mx-auto">
        {/* Background grids */}
        {grids.map((path, i) => (
          <motion.path
            key={i}
            d={path}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, i) => {
          const point = getPoint(i, 5);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled data area */}
        <motion.path
          d={filledPath}
          fill="url(#radarGradient)"
          stroke="#6366f1"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
          </linearGradient>
        </defs>

        {/* Data points */}
        {categories.map((cat, i) => {
          const score = scores[cat.key as keyof typeof scores];
          const point = getPoint(i, score);
          const Icon = cat.icon;

          return (
            <g key={cat.key}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={size === "lg" ? 6 : size === "md" ? 4 : 3}
                fill="#6366f1"
                stroke="#fff"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
              />
              
              {/* Category labels */}
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn(
                  "fill-slate-600 font-semibold",
                  size === "lg" ? "text-xs" : size === "md" ? "text-[8px]" : "text-[6px]"
                )}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                {score.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend below chart */}
      <div className={cn(
        "grid gap-2 mt-4",
        size === "lg" ? "grid-cols-5" : "grid-cols-3"
      )}>
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const score = scores[cat.key as keyof typeof scores];
          
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex flex-col items-center"
            >
              <Icon className={cn(
                "mb-0.5",
                size === "lg" ? "w-3 h-3" : "w-2.5 h-2.5"
              )} />
              <span className={cn(
                "font-medium text-slate-700",
                size === "lg" ? "text-xs" : "text-[9px]"
              )}>
                {cat.label}
              </span>
              <span className={cn(
                "font-bold text-indigo-600",
                size === "lg" ? "text-sm" : "text-xs"
              )}>
                {score.toFixed(1)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Enhanced review section component
interface ReviewSectionProps {
  overallRating: number;
  totalReviews: number;
  scores: {
    cleanliness: number;
    communication: number;
    location: number;
    value: number;
    accuracy: number;
  };
  recentReviews?: Array<{
    id: string;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
    helpful: number;
  }>;
}

export function ReviewSection({ overallRating, totalReviews, scores, recentReviews = [] }: ReviewSectionProps) {
  return (
    <div className="space-y-8">
      {/* Header with Overall Rating */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Reviews</h2>
          <p className="text-slate-500">{totalReviews.toLocaleString()} verified stays</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
            <span className="font-display text-4xl font-bold text-slate-900">{overallRating.toFixed(2)}</span>
          </div>
          <p className="text-sm text-slate-500">out of 5.0</p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="font-bold text-slate-700 mb-4 text-center">Rating Breakdown</h3>
        <ReviewRadarChart scores={scores} size="lg" />
      </div>

      {/* Recent Reviews */}
      {recentReviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Recent Reviews</h3>
          {recentReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-slate-900">{review.author}</p>
                    <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.floor(review.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{review.comment}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                <button className="text-xs text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Helpful ({review.helpful})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
