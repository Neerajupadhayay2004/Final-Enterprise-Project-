'use client';

import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Globe, TrendingUp, Target, Server, Link2, Bug, Activity, BarChart3 } from 'lucide-react';
import { PageContainer, SectionTitle, StatCard } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats, useIOCs } from '@/hooks/use-data';
import type { IOC } from '@/lib/supabase';

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const countryData = [
  { country: 'United States', threats: 45, code: 'US' },
  { country: 'Russia', threats: 38, code: 'RU' },
  { country: 'China', threats: 32, code: 'CN' },
  { country: 'Netherlands', threats: 18, code: 'NL' },
  { country: 'Romania', threats: 12, code: 'RO' },
  { country: 'North Korea', threats: 10, code: 'KP' },
  { country: 'United Kingdom', threats: 8, code: 'GB' },
  { country: 'Germany', threats: 6, code: 'DE' },
];

const monthlyData = [
  { month: 'Jan', threats: 45, scams: 23, iocs: 120 },
  { month: 'Feb', threats: 52, scams: 28, iocs: 135 },
  { month: 'Mar', threats: 38, scams: 31, iocs: 142 },
  { month: 'Apr', threats: 61, scams: 35, iocs: 158 },
  { month: 'May', threats: 48, scams: 42, iocs: 167 },
  { month: 'Jun', threats: 73, scams: 38, iocs: 189 },
  { month: 'Jul', threats: 85, scams: 45, iocs: 201 },
];

const detectionData = [
  { metric: 'True Positives', value: 87, fill: 'hsl(var(--success))' },
  { metric: 'False Positives', value: 8, fill: 'hsl(var(--warning))' },
  { metric: 'False Negatives', value: 3, fill: 'hsl(var(--destructive))' },
  { metric: 'True Negatives', value: 95, fill: 'hsl(var(--primary))' },
];

const radarData = [
  { category: 'Phishing', current: 85, baseline: 60 },
  { category: 'Malware', current: 72, baseline: 55 },
  { category: 'Scam', current: 91, baseline: 70 },
  { category: 'Intrusion', current: 45, baseline: 40 },
  { category: 'DDoS', current: 30, baseline: 35 },
  { category: 'Botnet', current: 58, baseline: 50 },
];

export default function AnalyticsPage() {
  const { data: stats } = useDashboardStats();
  const { data: iocs }: { data: IOC[] | undefined } = useIOCs(100);

  const topIPs = (iocs || []).filter((i) => i.type === 'ip').slice(0, 5);
  const topDomains = (iocs || []).filter((i) => i.type === 'domain').slice(0, 5);
  const topMalware = ['LockBit 3.0', 'RedLine Stealer', 'BlackCat/ALPHV', 'Cobalt Strike', 'Emotet'].map((name, i) => ({
    name,
    detections: [12, 8, 6, 15, 4][i],
  }));

  return (
    <PageContainer>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Detection Accuracy" value="87%" icon={Target} accent="success" trend="3% improvement" trendUp delay={0} />
        <StatCard label="False Positives" value="8%" icon={Activity} accent="warning" trend="2% decrease" trendUp delay={0.05} />
        <StatCard label="Total Detections" value={stats?.totalThreats || 0} icon={BarChart3} accent="primary" delay={0.1} />
        <StatCard label="Avg Response Time" value="4.2m" icon={TrendingUp} accent="chart-5" trend="1.1m faster" trendUp delay={0.15} />
      </div>

      {/* Monthly trends */}
      <Card className="mb-6 border-border/60 p-5">
        <SectionTitle title="Monthly Threat Trends" description="Threats, scams, and IOCs over 7 months" />
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="scamsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="iocsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Area type="monotone" dataKey="threats" stroke="hsl(var(--chart-1))" fill="url(#threatsGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="scams" stroke="hsl(var(--chart-4))" fill="url(#scamsGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="iocs" stroke="hsl(var(--chart-2))" fill="url(#iocsGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Country map */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="Most Targeted Countries" description="Threat origin distribution" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="country" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
              <Bar dataKey="threats" radius={[0, 4, 4, 0]}>
                {countryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detection accuracy radar */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="Detection Performance" description="By threat category" />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Radar name="Current" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Baseline" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Detection accuracy pie */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="Detection Accuracy" description="True vs false rates" />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={detectionData} dataKey="value" nameKey="metric" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3}>
                {detectionData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top malware */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="Top Malware" description="Most detected families" />
          <div className="space-y-2">
            {topMalware.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                  <Bug className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(m.detections / 15) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="h-full rounded-full bg-destructive"
                    />
                  </div>
                </div>
                <span className="text-sm font-bold">{m.detections}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top IPs */}
        <Card className="border-border/60 p-5">
          <SectionTitle title="Top Malicious IPs" description="Most reported" />
          <div className="space-y-2">
            {topIPs.map((ip, i) => (
              <div key={ip.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Server className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-mono text-xs font-medium">{ip.value}</p>
                  <p className="text-[10px] text-muted-foreground">{ip.country} · {ip.asn}</p>
                </div>
                <Badge variant="outline" className="text-[9px]">{ip.confidence}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top domains */}
      <Card className="border-border/60 p-5">
        <SectionTitle title="Top Malicious Domains" description="Most reported domains" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topDomains.map((domain) => (
            <div key={domain.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                <Link2 className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-mono text-xs font-medium">{domain.value}</p>
                <p className="text-[10px] text-muted-foreground">{domain.source}</p>
              </div>
              <Badge variant="destructive" className="text-[9px]">{domain.severity}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
