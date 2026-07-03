'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  Users,
  Radar,
  Key,
  FileText,
  Shield,
  CreditCard,
  BarChart3,
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { PageContainer, SectionTitle, StatCard } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardStats, useActivityLogs, useThreatFeeds } from '@/hooks/use-data';
import type { ActivityLog } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const systemServices = [
  { name: 'API Gateway', status: 'operational', uptime: '99.98%', icon: Network },
  { name: 'Database (PostgreSQL)', status: 'operational', uptime: '99.99%', icon: Database },
  { name: 'Redis Cache', status: 'operational', uptime: '99.97%', icon: Cpu },
  { name: 'Celery Workers', status: 'operational', uptime: '99.95%', icon: Activity },
  { name: 'AI Engine', status: 'operational', uptime: '99.92%', icon: Cpu },
  { name: 'Threat Feeds', status: 'degraded', uptime: '98.50%', icon: Radar },
];

const adminModules = [
  { name: 'User Management', icon: Users, href: '/users', count: '26 users' },
  { name: 'Threat Feeds', icon: Radar, href: '/threat-intelligence', count: '7 sources' },
  { name: 'API Keys', icon: Key, href: '/users', count: '3 active' },
  { name: 'Reports', icon: FileText, href: '/reports', count: '12 reports' },
  { name: 'Permissions', icon: Shield, href: '/users', count: '4 roles' },
  { name: 'Subscriptions', icon: CreditCard, href: '/admin', count: 'Enterprise' },
];

export default function AdminPage() {
  const { data: stats } = useDashboardStats();
  const { data: logs }: { data: ActivityLog[] | undefined } = useActivityLogs(6);
  const { data: feeds } = useThreatFeeds(20);

  const feedUsage: Record<string, number> = {};
  (feeds || []).forEach((f: { source_name: string }) => {
    feedUsage[f.source_name] = (feedUsage[f.source_name] || 0) + 1;
  });

  return (
    <PageContainer>
      {/* System stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Users" value={26} icon={Users} accent="primary" delay={0} />
        <StatCard label="API Calls Today" value="14.2K" icon={Activity} accent="chart-5" trend="12% increase" trendUp delay={0.05} />
        <StatCard label="Storage Used" value="4.2 GB" icon={HardDrive} accent="warning" delay={0.1} />
        <StatCard label="Uptime" value="99.98%" icon={Server} accent="success" delay={0.15} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* System health */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 p-5">
            <SectionTitle title="System Health" description="Real-time service status" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {systemServices.map((service, i) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      service.status === 'operational' ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      <Icon className={`h-4 w-4 ${service.status === 'operational' ? 'text-success' : 'text-warning'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        service.status === 'operational'
                          ? 'border-success/30 text-success text-[10px]'
                          : 'border-warning/30 text-warning text-[10px]'
                      }
                    >
                      {service.status === 'operational' ? (
                        <><CheckCircle2 className="mr-1 h-2.5 w-2.5" /> Operational</>
                      ) : (
                        <><AlertTriangle className="mr-1 h-2.5 w-2.5" /> Degraded</>
                      )}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Admin modules */}
        <div>
          <Card className="border-border/60 p-5">
            <SectionTitle title="Admin Modules" description="Quick access" />
            <div className="space-y-2">
              {adminModules.map((module) => {
                const Icon = module.icon;
                return (
                  <a
                    key={module.name}
                    href={module.href}
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{module.name}</p>
                      <p className="text-xs text-muted-foreground">{module.count}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Usage analytics */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="Usage Analytics" description="Threat feed consumption" />
          <div className="space-y-3">
            {Object.entries(feedUsage).map(([source, count]) => (
              <div key={source}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{source}</span>
                  <span className="text-xs text-muted-foreground">{count} IOCs</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / Math.max(...Object.values(feedUsage))) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Total IOCs</p>
              <p className="text-lg font-bold">{stats?.totalIOCs || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Feeds</p>
              <p className="text-lg font-bold">{stats?.activeFeeds || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">API Rate</p>
              <p className="text-lg font-bold">85%</p>
            </div>
          </div>
        </Card>

        {/* Recent system logs */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="System Logs" description="Recent administrative events" />
          <div className="space-y-2">
            {(logs || []).map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <div className={`h-2 w-2 shrink-0 rounded-full ${
                  log.severity === 'critical' ? 'bg-destructive' :
                  log.severity === 'warning' ? 'bg-warning' : 'bg-primary'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{log.user_email} · {log.module}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Security configuration */}
      <Card className="mt-6 border-border/60 p-5">
        <SectionTitle title="Security Configuration" description="Platform security settings" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Helmet', status: true },
            { label: 'CORS', status: true },
            { label: 'Rate Limiting', status: true },
            { label: 'Input Validation', status: true },
            { label: 'CSRF Protection', status: true },
            { label: 'XSS Protection', status: true },
            { label: 'SQL Injection Prevention', status: true },
            { label: 'Audit Logs', status: true },
            { label: 'Encryption', status: true },
            { label: 'Secrets Management', status: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center gap-2 rounded-lg border border-border/50 p-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-xs font-medium">{setting.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
