'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Server,
  Link2,
  Globe,
  Hash,
  Mail,
  ShieldAlert,
  FileWarning,
  Target,
  Loader2,
} from 'lucide-react';
import { PageContainer, SectionTitle, SeverityBadge, EmptyState } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useIOCs, useScamReports, useOSINTInvestigations, useDashboardStats } from '@/hooks/use-data';
import { formatDistanceToNow } from 'date-fns';

const iocIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ip: Server,
  url: Link2,
  domain: Globe,
  hash: Hash,
  email: Mail,
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: iocs } = useIOCs(200);
  const { data: scams } = useScamReports(100);
  const { data: investigations } = useOSINTInvestigations(100);
  const { data: stats } = useDashboardStats();

  const q = query.toLowerCase().trim();

  const matchedIOCs = q ? (iocs || []).filter((i) => i.value.toLowerCase().includes(q) || i.type.includes(q) || (i.country || '').toLowerCase().includes(q)) : [];
  const matchedScams = q ? (scams || []).filter((s) => s.input_value.toLowerCase().includes(q) || (s.scam_type || '').includes(q)) : [];
  const matchedThreats = q ? (stats?.threats || []).filter((t) => t.title.toLowerCase().includes(q) || t.category.includes(q) || (t.description || '').toLowerCase().includes(q)) : [];
  const matchedInvestigations = q ? (investigations || []).filter((inv) => inv.target.toLowerCase().includes(q) || inv.investigation_type.includes(q)) : [];

  const totalResults = matchedIOCs.length + matchedScams.length + matchedThreats.length + matchedInvestigations.length;

  return (
    <PageContainer>
      <Card className="mb-6 border-border/60 p-5">
        <SectionTitle title="Global Search" description="Search across IOCs, threats, scams, and investigations" />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for IPs, domains, URLs, hashes, emails, threats..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="h-12 pl-11 text-base"
          />
        </div>
        {q && (
          <p className="mt-3 text-sm text-muted-foreground">
            {totalResults} results for &ldquo;{query}&rdquo;
          </p>
        )}
      </Card>

      {!q && (
        <EmptyState icon={Search} title="Start searching" description="Enter a query to search across all threat intelligence data" />
      )}

      {q && totalResults === 0 && (
        <EmptyState icon={Search} title="No results found" description={`No matches for "${query}"`} />
      )}

      {q && totalResults > 0 && (
        <div className="space-y-6">
          {/* IOC results */}
          {matchedIOCs.length > 0 && (
            <Card className="border-border/60 p-5">
              <SectionTitle title={`IOCs (${matchedIOCs.length})`} />
              <div className="space-y-2">
                {matchedIOCs.slice(0, 10).map((ioc) => {
                  const Icon = iocIcons[ioc.type] || Hash;
                  return (
                    <div key={ioc.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 font-mono text-sm">{ioc.value}</span>
                      <Badge variant="outline" className="text-[10px]">{ioc.type}</Badge>
                      <SeverityBadge severity={ioc.severity} />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Threat results */}
          {matchedThreats.length > 0 && (
            <Card className="border-border/60 p-5">
              <SectionTitle title={`Threats (${matchedThreats.length})`} />
              <div className="space-y-2">
                {matchedThreats.slice(0, 10).map((threat) => (
                  <div key={threat.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{threat.title}</p>
                      <p className="text-xs text-muted-foreground">{threat.category} · {formatDistanceToNow(new Date(threat.detected_at), { addSuffix: true })}</p>
                    </div>
                    <SeverityBadge severity={threat.severity} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Scam results */}
          {matchedScams.length > 0 && (
            <Card className="border-border/60 p-5">
              <SectionTitle title={`Scam Reports (${matchedScams.length})`} />
              <div className="space-y-2">
                {matchedScams.slice(0, 10).map((scam) => (
                  <div key={scam.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                    <FileWarning className="h-4 w-4 text-warning" />
                    <div className="flex-1">
                      <p className="truncate font-mono text-sm">{scam.input_value}</p>
                      <p className="text-xs text-muted-foreground">{scam.scam_type} · Score: {scam.risk_score}</p>
                    </div>
                    {scam.is_scam ? <SeverityBadge severity="high" /> : <Badge variant="outline" className="border-success/30 text-success text-[10px]">Safe</Badge>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Investigation results */}
          {matchedInvestigations.length > 0 && (
            <Card className="border-border/60 p-5">
              <SectionTitle title={`Investigations (${matchedInvestigations.length})`} />
              <div className="space-y-2">
                {matchedInvestigations.slice(0, 10).map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                    <Target className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{inv.target}</p>
                      <p className="text-xs text-muted-foreground">{inv.investigation_type} · {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}</p>
                    </div>
                    <SeverityBadge severity={inv.risk_score >= 80 ? 'critical' : inv.risk_score >= 60 ? 'high' : inv.risk_score >= 40 ? 'medium' : 'low'} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </PageContainer>
  );
}
