'use client';

import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBar,
  RadialBarChart,
  Legend,
} from 'recharts';
import {
  Shield,
  ShieldAlert,
  Globe,
  Link2,
  Server,
  Activity,
  TrendingUp,
  AlertTriangle,
  FileWarning,
  Clock,
  Zap,
  Target,
  Bug,
} from 'lucide-react';
import { PageContainer, StatCard, SectionTitle, SeverityBadge, severityConfigFor } from '@/components/shared';
import { useDashboardStats, useActivityLogs } from '@/hooks/use-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function generateTrendData(threats: Array<{ detected_at: string; severity: string }>) {
  const days = 7;
  const data: Array<{ day: string; critical: number; high: number; medium: number; low: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const dayThreats = threats.filter((t) => new Date(t.detected_at).toDateString() === dayStr);
    data.push({
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      critical: dayThreats.filter((t) => t.severity === 'critical').length,
      high: dayThreats.filter((t) => t.severity === 'high').length,
      medium: dayThreats.filter((t) => t.severity === 'medium').length,
      low: dayThreats.filter((t) => t.severity === 'low').length,
    });
  }
  return data;
}

function generateHeatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const grid: Array<{ day: string; hour: number; value: number }> = [];
  days.forEach((day) => {
    hours.forEach((hour) => {
      const value = Math.floor(Math.random() * 5) + (hour >= 9 && hour <= 17 ? 2 : 0);
      grid.push({ day, hour, value });
    });
  });
  return grid;
}

const heatColors = ['hsl(var(--muted))', 'hsl(var(--primary)/0.3)', 'hsl(var(--primary)/0.5)', 'hsl(var(--primary)/0.7)', 'hsl(var(--primary))'];

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: logs } = useActivityLogs(8);

  if (isLoading || !stats) {
    return (
      <PageContainer>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const trendData = generateTrendData(stats.threats);
  const heatmap = generateHeatmap();

  const categoryData = ['malware', 'phishing', 'scam', 'intrusion', 'ddos', 'botnet', 'ransomware', 'data_breach'].map(
    (cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: stats.threats.filter((t) => t.category === cat).length,
    })
  ).filter((d) => d.value > 0);

  const severityData = [
    { name: 'Critical', value: stats.threats.filter((t) => t.severity === 'critical').length, fill: 'hsl(var(--destructive))' },
    { name: 'High', value: stats.threats.filter((t) => t.severity === 'high').length, fill: 'hsl(25 95% 53%)' },
    { name: 'Medium', value: stats.threats.filter((t) => t.severity === 'medium').length, fill: 'hsl(var(--warning))' },
    { name: 'Low', value: stats.threats.filter((t) => t.severity === 'low').length, fill: 'hsl(var(--success))' },
  ];

  const securityGauge = [
    { name: 'Score', value: stats.securityScore, fill: stats.securityScore >= 60 ? 'hsl(var(--success))' : 'hsl(var(--warning))' },
  ];

  return (
    <PageContainer>
      {/* Hero security score banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="relative overflow-hidden border-border/60">
          <div className="grid-bg absolute inset-0 opacity-30" />
          <div className="relative flex flex-col items-center gap-6 p-6 md:flex-row md:items-center">
            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={securityGauge} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{stats.securityScore}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</span>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Security Posture</h2>
                <Badge
                  variant="outline"
                  className={
                    stats.threatLevel === 'Low'
                      ? 'border-success/30 text-success'
                      : stats.threatLevel === 'Moderate'
                      ? 'border-primary/30 text-primary'
                      : stats.threatLevel === 'Elevated'
                      ? 'border-warning/30 text-warning'
                      : 'border-destructive/30 text-destructive'
                  }
                >
                  Threat Level: {stats.threatLevel}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Monitoring {stats.totalIOCs} indicators across {stats.activeFeeds} threat feeds. {stats.openThreats} open incidents require attention.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Activity className="h-3 w-3" /> {stats.totalThreats} Total Threats
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> {stats.criticalThreats} Critical
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <FileWarning className="h-3 w-3" /> {stats.totalScams} Scam Reports
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Target className="h-3 w-3" /> {stats.totalInvestigations} Investigations
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Today's Incidents" value={stats.todayIncidents} icon={Zap} accent="destructive" trend="vs yesterday" trendUp={false} delay={0} />
        <StatCard label="Scam Reports" value={stats.todayScamReports} icon={FileWarning} accent="warning" delay={0.05} />
        <StatCard label="Malicious URLs" value={stats.maliciousUrls} icon={Link2} accent="destructive" delay={0.1} />
        <StatCard label="Malicious Domains" value={stats.maliciousDomains} icon={Globe} accent="warning" delay={0.15} />
        <StatCard label="Malicious IPs" value={stats.maliciousIPs} icon={Server} accent="destructive" delay={0.2} />
        <StatCard label="Active IOCs" value={stats.totalIOCs} icon={Target} accent="primary" delay={0.25} />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Attack trends */}
        <Card className="border-border/60 p-5 lg:col-span-2">
          <SectionTitle title="Attack Trends" description="Threat detections over the past 7 days" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25 95% 53%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(25 95% 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" fill="url(#critGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="high" stroke="hsl(25 95% 53%)" fill="url(#highGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="medium" stroke="hsl(var(--warning))" fill="url(#medGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Severity distribution */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="Severity Distribution" description="By threat level" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category bar + Heatmap */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60 p-5 lg:col-span-2">
          <SectionTitle title="Threat Categories" description="Detections by attack type" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={50} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Heatmap */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="Activity Heatmap" description="Threat activity by hour" />
          <div className="space-y-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="flex items-center gap-1">
                <span className="w-8 text-[10px] text-muted-foreground">{day}</span>
                <div className="flex flex-1 gap-0.5">
                  {heatmap
                    .filter((h) => h.day === day)
                    .map((h, i) => (
                      <div
                        key={i}
                        className="h-3 flex-1 rounded-sm transition-colors hover:opacity-80"
                        style={{ background: heatColors[h.value] }}
                        title={`${day} ${h.hour}:00 — ${h.value} events`}
                      />
                    ))}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-end gap-1 pt-2">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {heatColors.map((c, i) => (
                <div key={i} className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Threat timeline + Recent activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60 p-5">
          <SectionTitle title="Threat Timeline" description="Recent detected incidents" />
          <div className="space-y-3">
            {stats.threats.slice(0, 6).map((threat, i) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${severityConfigFor(threat.severity).bg}`}>
                  {threat.category === 'ransomware' ? <Bug className={`h-4 w-4 ${severityConfigFor(threat.severity).text}`} /> : threat.category === 'phishing' ? <FileWarning className={`h-4 w-4 ${severityConfigFor(threat.severity).text}`} /> : <ShieldAlert className={`h-4 w-4 ${severityConfigFor(threat.severity).text}`} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{threat.title}</p>
                    <SeverityBadge severity={threat.severity} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {threat.category} · {threat.source} · {formatDistanceToNow(new Date(threat.detected_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                  {threat.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 p-5">
          <SectionTitle title="Recent Activity" description="System and analyst actions" />
          <div className="space-y-2">
            {(logs || []).map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/30"
              >
                <div className={`h-2 w-2 shrink-0 rounded-full ${log.severity === 'critical' ? 'bg-destructive' : log.severity === 'warning' ? 'bg-warning' : log.severity === 'error' ? 'bg-destructive' : 'bg-primary'}`} />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {log.module} · {log.user_email} · {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
