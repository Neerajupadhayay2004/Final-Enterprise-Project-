'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type Severity = 'low' | 'medium' | 'high' | 'critical';

const severityConfig: Record<Severity, { bg: string; text: string; border: string; label: string }> = {
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', label: 'Low' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', label: 'Medium' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30', label: 'High' },
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', label: 'Critical' },
};

export function severityConfigFor(s: string) {
  return severityConfig[s as Severity] || severityConfig.medium;
}

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  const cfg = severityConfigFor(severity);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        cfg.bg,
        cfg.text,
        cfg.border,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  accent = 'primary',
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  accent?: 'primary' | 'destructive' | 'warning' | 'success' | 'chart-5';
  delay?: number;
}) {
  const accentMap: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    destructive: 'from-destructive/20 to-destructive/5 text-destructive',
    warning: 'from-warning/20 to-warning/5 text-warning',
    success: 'from-success/20 to-success/5 text-success',
    'chart-5': 'from-chart-5/20 to-chart-5/5 text-chart-5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="relative overflow-hidden border-border/60 p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <span className="mt-2 text-2xl font-bold tracking-tight">{value}</span>
            {trend && (
              <span
                className={cn(
                  'mt-1 text-xs font-medium',
                  trendUp ? 'text-success' : 'text-destructive'
                )}
              >
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br',
              accentMap[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8', className)}>{children}</div>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
