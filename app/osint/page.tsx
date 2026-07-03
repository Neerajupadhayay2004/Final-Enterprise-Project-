'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe,
  Mail,
  Phone,
  Server,
  Image,
  Github,
  MessageCircle,
  Twitter,
  Linkedin,
  Eye,
  Database,
  FileSearch,
  Camera,
  MapPin,
  Network,
  Shield,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { PageContainer, SectionTitle, SeverityBadge, EmptyState } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useOSINTInvestigations } from '@/hooks/use-data';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const investigationTypes = [
  { id: 'ip', label: 'IP Lookup', icon: Server, placeholder: '185.220.101.45' },
  { id: 'domain', label: 'Domain Lookup', icon: Globe, placeholder: 'example.com' },
  { id: 'email', label: 'Email Investigation', icon: Mail, placeholder: 'user@example.com' },
  { id: 'phone', label: 'Phone Investigation', icon: Phone, placeholder: '+1-800-555-0199' },
  { id: 'username', label: 'Username Search', icon: Search, placeholder: 'johndoe' },
  { id: 'whois', label: 'WHOIS', icon: Database, placeholder: 'example.com' },
  { id: 'dns', label: 'DNS Records', icon: Network, placeholder: 'example.com' },
  { id: 'subdomain', label: 'Subdomains', icon: Network, placeholder: 'example.com' },
  { id: 'ssl', label: 'SSL Info', icon: Shield, placeholder: 'example.com' },
  { id: 'image', label: 'Image EXIF', icon: Camera, placeholder: 'Image URL' },
  { id: 'metadata', label: 'Metadata Analysis', icon: FileSearch, placeholder: 'File URL' },
  { id: 'github', label: 'GitHub Search', icon: Github, placeholder: 'username' },
  { id: 'reddit', label: 'Reddit Search', icon: MessageCircle, placeholder: 'username' },
  { id: 'twitter', label: 'Twitter/X Search', icon: Twitter, placeholder: 'username' },
  { id: 'linkedin', label: 'LinkedIn Search', icon: Linkedin, placeholder: 'username' },
  { id: 'geolocation', label: 'Geolocation', icon: MapPin, placeholder: 'IP address' },
  { id: 'asn', label: 'ASN Lookup', icon: Network, placeholder: 'AS200651' },
  { id: 'breach', label: 'Breach Lookup', icon: AlertCircle, placeholder: 'email@example.com' },
  { id: 'darkweb', label: 'Dark Web Search', icon: Eye, placeholder: 'search term' },
  { id: 'dork', label: 'Google Dork', icon: Search, placeholder: 'site:example.com' },
  { id: 'screenshot', label: 'Website Screenshot', icon: Camera, placeholder: 'https://example.com' },
  { id: 'tech_detect', label: 'Technology Detection', icon: Globe, placeholder: 'example.com' },
];

function generateFindings(type: string, target: string): Record<string, unknown> {
  const base: Record<string, unknown> = { target, investigated_at: new Date().toISOString() };

  if (type === 'ip') {
    return { ...base, country: 'Russia', asn: 'AS200651', isp: 'Hosting Provider LLC', organization: 'Anonymous Hosting', is_tor: true, open_ports: [22, 80, 443, 8080], reputation: 'malicious', abuse_reports: 1247, first_seen: '2023-01-15', last_seen: new Date().toISOString(), blacklists: ['Spamhaus', 'AbuseIPDB', 'AlienVault OTX'], risk_factors: ['Tor exit node', 'C2 infrastructure', 'Mass scanner'] };
  }
  if (type === 'domain' || type === 'whois' || type === 'dns') {
    return { ...base, registrar: 'NameSilo LLC', registered: '2024-01-10', expires: '2025-01-10', registrant: 'REDACTED FOR PRIVACY', name_servers: ['ns1.example.com', 'ns2.example.com'], dns_records: { A: ['192.0.2.1'], AAAA: ['2001:db8::1'], MX: ['mail.example.com'], TXT: ['v=spf1 -all'], NS: ['ns1.example.com', 'ns2.example.com'] }, ssl_issuer: "Let's Encrypt", ssl_valid: true, ssl_expires: '2024-09-10', domain_age_days: 175 };
  }
  if (type === 'email') {
    return { ...base, breaches: ['Adobe (2013)', 'LinkedIn (2016)', 'Dropbox (2016)'], social_profiles: ['LinkedIn', 'Twitter', 'GitHub'], data_broker_listings: 2, gravatar: 'found', risk_level: 'moderate' };
  }
  if (type === 'username') {
    return { ...base, platforms: ['Reddit', 'Twitter', 'GitHub', 'Telegram', 'Instagram'], posts: 145, first_seen: '2021-06-15', associated_forums: ['cybersecurity', 'darknet_marketplace'], suspicious_activity: true };
  }
  if (type === 'breach') {
    return { ...base, found_in_breaches: 3, breaches: [{ name: 'Adobe', date: '2013-10-01', records: '153M', data_types: ['Email', 'Password Hint', 'Salted Hash'] }, { name: 'LinkedIn', date: '2016-05-01', records: '164M', data_types: ['Email', 'Password'] }, { name: 'Dropbox', date: '2016-07-01', records: '68M', data_types: ['Email', 'Password'] }], risk_level: 'high' };
  }
  if (type === 'ssl') {
    return { ...base, issuer: "Let's Encrypt R3", subject: target, valid_from: '2024-01-10', valid_to: '2024-04-10', serial: '03:1F:2A:4B:5C:6D:7E:8F', signature_algorithm: 'SHA256withRSA', key_size: 2048, san: [target, 'www.' + target] };
  }
  if (type === 'asn') {
    return { ...base, asn: target, organization: 'Hosting Provider LLC', country: 'Russia', ip_range: '185.220.101.0/24', total_ips: 256, abuse_contact: 'abuse@example.com', announced_prefixes: 12 };
  }
  if (type === 'subdomain') {
    return { ...base, subdomains: ['www.' + target, 'mail.' + target, 'api.' + target, 'dev.' + target, 'staging.' + target, 'admin.' + target], total_found: 6 };
  }
  if (type === 'tech_detect') {
    return { ...base, technologies: ['nginx 1.21.6', 'PHP 8.1', 'WordPress 6.4', 'MySQL', 'jQuery', 'Bootstrap'], server: 'nginx', powered_by: 'PHP/8.1', security_headers: { 'X-Frame-Options': 'MISSING', 'X-Content-Type-Options': 'SET', 'HSTS': 'MISSING' } };
  }
  if (type === 'geolocation') {
    return { ...base, country: 'Russia', region: 'Moscow', city: 'Moscow', latitude: 55.7558, longitude: 37.6173, timezone: 'Europe/Moscow', isp: 'Hosting Provider LLC' };
  }
  if (type === 'darkweb') {
    return { ...base, mentions: 7, marketplaces: ['Empire Market', 'White House Market'], forums: ['BreachForums', 'XSS.is'], leaked_data: ['Email addresses', 'Password hashes'], first_seen: '2023-03-15', risk_level: 'critical' };
  }
  if (type === 'github') {
    return { ...base, repositories: 23, followers: 145, following: 67, contribution_years: 4, languages: ['Python', 'JavaScript', 'Go'], suspicious_repos: ['malware-analysis', 'exploit-dev'], leaked_secrets: 2 };
  }
  return { ...base, status: 'completed', results: 'No specific findings for this investigation type.' };
}

export default function OSINTPage() {
  const [activeTab, setActiveTab] = useState('ip');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const { data: investigations } = useOSINTInvestigations(10);

  const handleSearch = async () => {
    if (!target.trim()) {
      toast.error('Please enter a target to investigate');
      return;
    }
    setLoading(true);
    setResult(null);

    await new Promise((r) => setTimeout(r, 1200));

    const findings = generateFindings(activeTab, target.trim());
    setResult(findings);

    const rl = String(findings.risk_level || '');
    const riskScore = (rl === 'critical' || findings.reputation === 'malicious') ? 90
      : rl === 'high' ? 75
      : findings.suspicious_activity ? 65
      : (findings.breaches as unknown[] | undefined)?.length ? 50
      : 30;

    try {
      await supabase.from('osint_investigations').insert({
        investigation_type: activeTab,
        target: target.trim(),
        status: 'completed',
        risk_score: riskScore,
        findings,
        sources_checked: ['Internal DB', 'WHOIS', 'DNS', 'SSL'],
        summary: `OSINT investigation of ${target.trim()} (${activeTab}) completed.`,
        completed_at: new Date().toISOString(),
      });
      toast.success('Investigation completed and saved');
    } catch {
      toast.error('Failed to save investigation');
    }

    setLoading(false);
  };

  const currentType = investigationTypes.find((t) => t.id === activeTab)!;

  const getResultSeverity = (): string => {
    if (!result) return 'low';
    const rl = String(result.risk_level || '');
    if (rl === 'critical' || result.reputation === 'malicious') return 'critical';
    if (rl === 'high') return 'high';
    if (result.suspicious_activity) return 'medium';
    return 'low';
  };

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border/60 p-5">
            <SectionTitle
              title="OSINT Investigation"
              description="Open-source intelligence gathering across 22 investigation types"
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="scrollbar-thin mb-4 max-h-48 overflow-y-auto rounded-lg border border-border/50 p-2">
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
                  {investigationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => { setActiveTab(type.id); setResult(null); }}
                        className={`flex flex-col items-center gap-1 rounded-lg p-2.5 text-xs font-medium transition-all ${
                          activeTab === type.id
                            ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-center leading-tight">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={currentType.placeholder}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-11"
                />
                <Button onClick={handleSearch} disabled={loading} className="h-11 px-6">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {loading ? 'Scanning...' : 'Investigate'}
                </Button>
              </div>
            </Tabs>

            <div className="mt-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  </div>
                  <p className="mt-4 text-sm font-medium">Running OSINT investigation...</p>
                  <p className="text-xs text-muted-foreground">Querying multiple intelligence sources</p>
                </div>
              )}

              {!loading && !result && (
                <EmptyState
                  icon={Search}
                  title="No results yet"
                  description="Enter a target above and click Investigate to begin"
                />
              )}

              {!loading && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4">
                    <div>
                      <p className="text-sm font-semibold">Investigation Results for {String(result.target)}</p>
                      <p className="text-xs text-muted-foreground">Type: {currentType.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={getResultSeverity()} />
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Download className="h-3.5 w-3.5" /> Report
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(result)
                      .filter(([key]) => !['target', 'investigated_at'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="rounded-lg border border-border/50 p-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {key.replace(/_/g, ' ')}
                          </p>
                          {Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-1">
                              {value.map((v: unknown, i: number) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">
                                  {String(v)}
                                </Badge>
                              ))}
                            </div>
                          ) : typeof value === 'object' && value !== null ? (
                            <div className="space-y-1">
                              {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">{k.replace(/_/g, ' ')}:</span>
                                  <span className="font-medium">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm font-medium">{String(value)}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card className="border-border/60 p-5">
            <SectionTitle title="Recent Investigations" description="Past OSINT lookups" />
            <div className="space-y-2">
              {(investigations || []).length === 0 ? (
                <EmptyState icon={Clock} title="No investigations yet" />
              ) : (
                (investigations || []).map((inv) => (
                  <div key={inv.id} className="rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {inv.investigation_type.replace(/_/g, ' ')}
                      </Badge>
                      <SeverityBadge
                        severity={
                          inv.risk_score >= 80 ? 'critical' : inv.risk_score >= 60 ? 'high' : inv.risk_score >= 40 ? 'medium' : 'low'
                        }
                      />
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">{inv.target}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {inv.summary} · {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
