import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGamificationStore } from '@/lib/gamification-store';

interface HostDashboardProps {
  revenue?: number;
  occupancyRate?: number;
  avgNightlyRate?: number;
  responseRate?: number;
  cancellationRate?: number;
  averageRating?: number;
  totalStays?: number;
  policyViolations?: number;
  timeRange?: '7D' | '30D' | '90D' | '1Y';
  onTimeRangeChange?: (range: '7D' | '30D' | '90D' | '1Y') => void;
}

export function HostDashboard({
  revenue = 0,
  occupancyRate = 0,
  avgNightlyRate = 0,
  responseRate = 0,
  cancellationRate = 0,
  averageRating = 0,
  totalStays = 0,
  policyViolations = 0,
  timeRange = '30D',
  onTimeRangeChange
}: HostDashboardProps) {
  const { unlockBadge } = useGamificationStore();

  // Calculate Superhost progress
  const superhostRequirements = [
    { label: 'Response rate ≥90%', met: responseRate >= 90 },
    { label: 'Cancellation rate ≤1%', met: cancellationRate <= 1 },
    { label: '4.8+ average rating', met: averageRating >= 4.8 },
    { label: '10+ stays', met: totalStays >= 10 },
    { label: 'Zero policy violations', met: policyViolations === 0 }
  ];

  const superhostProgress = superhostRequirements.filter(r => r.met).length;
  const isSuperhost = superhostProgress === 5;

  // Check for Rising Star badge
  React.useEffect(() => {
    if (totalStays >= 5) {
      unlockBadge('rising_star');
    }
  }, [totalStays, unlockBadge]);

  return (
    <div className="space-y-6">
      {/* Header with Superhost Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Host Dashboard</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Track your performance and earnings</p>
        </div>
        {isSuperhost ? (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg shadow-amber-500/25">
            <Award className="w-4 h-4 mr-2" fill="currentColor" />
            Superhost
          </Badge>
        ) : (
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {superhostProgress}/5 Superhost requirements
            </p>
            <p className="text-xs text-slate-500">{5 - superhostProgress} remaining</p>
          </div>
        )}
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7D', '30D', '90D', '1Y'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeRangeChange?.(range)}
            className={`rounded-xl font-semibold ${
              timeRange === range 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                : ''
            }`}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={DollarSign}
          label="Revenue"
          value={`$${revenue.toLocaleString()}`}
          trend={12}
          color="emerald"
        />
        <MetricCard
          icon={Calendar}
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          trend={5}
          color="indigo"
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg Nightly Rate"
          value={`$${avgNightlyRate}`}
          trend={-3}
          color="amber"
        />
        <MetricCard
          icon={MessageSquare}
          label="Total Stays"
          value={totalStays.toString()}
          trend={18}
          color="purple"
        />
      </div>

      {/* Superhost Progress */}
      {!isSuperhost && (
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <Award className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 dark:text-amber-100 text-lg">
                Become a Superhost
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                Complete all requirements to unlock exclusive benefits
              </p>
              
              <div className="space-y-3">
                {superhostRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {req.met ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    <span className={`text-sm ${
                      req.met 
                        ? 'text-emerald-700 dark:text-emerald-400 line-through' 
                        : 'text-amber-800 dark:text-amber-200'
                    }`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(superhostProgress / 5) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                  {superhostProgress} of 5 requirements complete
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Coaching Nudges */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white">Performance Tips</h3>
        
        {responseRate < 90 && (
          <CoachingCard
            icon={Zap}
            title="Improve Response Time"
            description={`Your response rate is ${responseRate}%. Respond faster to maintain Superhost status.`}
            action="Enable instant replies"
            color="amber"
          />
        )}
        
        {averageRating < 4.8 && (
          <CoachingCard
            icon={Award}
            title="Boost Your Rating"
            description={`Current rating: ${averageRating}. Aim for 4.8+ to become a Superhost.`}
            action="Review guest feedback"
            color="indigo"
          />
        )}

        {cancellationRate > 1 && (
          <CoachingCard
            icon={AlertCircle}
            title="Reduce Cancellations"
            description={`Your cancellation rate is ${cancellationRate}%. Keep it under 1% for Superhost.`}
            action="Update calendar availability"
            color="rose"
          />
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: number;
  color: 'emerald' | 'indigo' | 'amber' | 'purple' | 'rose';
}) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-500',
    indigo: 'from-indigo-500 to-purple-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
    rose: 'from-rose-500 to-red-500'
  };

  return (
    <Card className="p-4 border-0 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend > 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </Card>
  );
}

function CoachingCard({
  icon: Icon,
  title,
  description,
  action,
  color
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  color: 'amber' | 'indigo' | 'rose';
}) {
  const colorClasses = {
    amber: 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
    indigo: 'border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20',
    rose: 'border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20'
  };

  return (
    <Card className={`p-4 border-2 ${colorClasses[color]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 ${
          color === 'amber' ? 'text-amber-600' :
          color === 'indigo' ? 'text-indigo-600' : 'text-rose-600'
        }`} />
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{description}</p>
          <Button variant="ghost" size="sm" className="mt-2 h-8 text-xs font-semibold">
            {action}
          </Button>
        </div>
      </div>
    </Card>
  );
}
